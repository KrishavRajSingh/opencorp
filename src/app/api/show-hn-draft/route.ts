import { z } from 'zod';
import { mastra } from '@/mastra';
import { showHNDraftInputSchema, showHNDraftOutputSchema } from '@/mastra/agents/show-hn-drafter';
import { fetchPageTool } from '@/mastra/tools/fetch-page';
import { getAuthedUser } from '@/lib/supabase/auth';

const requestSchema = showHNDraftInputSchema;

const CORPUS_FETCH_LIMIT = 8000;

async function fetchCorpus(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tool = fetchPageTool as any;
    const result = (await tool.execute({
      url: `https://bestofshowhn.com/${year}`,
    } as never)) as { content?: string };
    const content = result.content ?? '';
    return `\nWINNING-PATTERN CORPUS (top Show HN posts of ${year} from bestofshowhn.com):\n${content.slice(0, CORPUS_FETCH_LIMIT)}\n`;
  } catch (err) {
    console.warn('[api/show-hn-draft] corpus fetch failed, continuing without:', err);
    return '';
  }
}

export async function POST(request: Request) {
  await getAuthedUser();

  let input: z.infer<typeof requestSchema>;
  try {
    const body = await request.json();
    input = requestSchema.parse(body);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? `Invalid body: ${err.message}` : 'Invalid body — product context required',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const agent = mastra.getAgent('showHNDrafterAgent');
  if (!agent) {
    return new Response(JSON.stringify({ error: 'showHNDrafterAgent not registered' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const [corpus] = await Promise.all([fetchCorpus()]);

    const motivationLine = input.buildMotivation
      ? input.buildMotivation
      : '[not provided — use [TODO: the moment that started it] in body opener]';
    const stackLine =
      input.techStack && input.techStack.length > 0
        ? input.techStack.join(', ')
        : '[not provided — use [TODO: your real stack] in first comment]';
    const hardLine = input.hardChallenge
      ? input.hardChallenge
      : '[not provided — use [TODO: the one hard part]]';
    const tradeoffsLine = input.tradeoffs
      ? input.tradeoffs
      : '[not provided — use [TODO: the tradeoffs you made]]';
    const learnedLine = input.lessonLearned
      ? input.lessonLearned
      : '[not provided — use [TODO: what you learned]]';
    const metricLine = input.keyMetric
      ? input.keyMetric
      : '[not provided — skip the metric-led title pattern]';
    const ossLine =
      input.openSource === true
        ? `yes${input.openSourceUrl ? ` (${input.openSourceUrl})` : ''}`
        : input.openSource === false
          ? 'no'
          : '[not provided — skip open source mentions]';

    const userQ = `PRODUCT CONTEXT
- name: ${input.productName}
- description: ${input.description}
- features: ${input.keyFeatures.join(', ') || '(none)'}
- target audience: ${input.targetAudience}
- demo url: ${input.demoUrl ?? '(none — call this out in body)'}
- build motivation: ${motivationLine}
- tech stack: ${stackLine}
- hard challenge: ${hardLine}
- tradeoffs: ${tradeoffsLine}
- lesson learned: ${learnedLine}
- key metric: ${metricLine}
- open source: ${ossLine}
${corpus}
Draft the Show HN post. Call submit_show_hn_draft with the complete draft.`;

    const result = await agent.generate(
      [{ role: 'user', content: userQ }],
      { abortSignal: request.signal },
    );

    let parsed: z.infer<typeof showHNDraftOutputSchema> | null = null;
    for (const tc of result.toolCalls ?? []) {
      if (tc.payload?.toolName === 'submitShowHNDraft') {
        parsed = (tc.payload.args ?? {}) as z.infer<typeof showHNDraftOutputSchema>;
        break;
      }
    }
    if (!parsed) {
      const text = (result.text ?? '').trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('showHNDrafter did not call submit tool or return JSON');
      parsed = JSON.parse(match[0]);
    }

    const draft = showHNDraftOutputSchema.parse(parsed);

    return new Response(
      JSON.stringify({
        title: draft.title,
        body: draft.body,
        run_id: `showhn_${Date.now().toString(36)}`,
        generated_at: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to run workflow';
    console.error('[api/show-hn-draft] failed:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
