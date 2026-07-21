import { z } from 'zod';
import { mastra } from '@/mastra';
import { showHNDraftInputSchema, showHNDraftOutputSchema, buildShowHNDraftPrompt } from '@/mastra/agents/show-hn-drafter';
import { fetchPageTool } from '@/mastra/tools/fetch-page';
import { getAuthedUser } from '@/lib/supabase/auth';
import { ANON_BUCKET_USER_ID } from '@/lib/supabase/server';

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
  const { user } = await getAuthedUser();
  if (user.id === ANON_BUCKET_USER_ID) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

    const userQ = buildShowHNDraftPrompt(input, corpus);

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
