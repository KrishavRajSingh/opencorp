import { z } from 'zod';
import { mastra } from '@/mastra';
import { showHNDraftInputSchema, showHNDraftOutputSchema, buildShowHNDraftPrompt } from '@/mastra/agents/show-hn-drafter';
import { fetchPageTool } from '@/mastra/tools/fetch-page';

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
    const content = (result.content ?? '')
      .replace(/[—–]/g, '-')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');
    return `\nWINNING-PATTERN CORPUS (top Show HN posts of ${year} from bestofshowhn.com):\n${content.slice(0, CORPUS_FETCH_LIMIT)}\n`;
  } catch (err) {
    console.warn('[api/show-hn-draft] corpus fetch failed, continuing without:', err);
    return '';
  }
}

export async function POST(request: Request) {
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

    let parsed: { title?: string; body?: string } = {};
    for (const tc of result.toolCalls ?? []) {
      if (tc.payload?.toolName === 'submitShowHNDraft') {
        parsed = (tc.payload.args ?? {}) as { title?: string; body?: string };
        break;
      }
    }
    if (!parsed.title || !parsed.body) {
      const text = (result.text ?? '').trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* keep what we have */ }
      }
    }

    // DeepSeek sometimes wraps tool call args in objects instead of strings.
    const coerce = (v: unknown): string | undefined =>
      typeof v === 'string' ? v
        : v && typeof v === 'object' && typeof (v as Record<string, unknown>).text === 'string'
          ? (v as Record<string, unknown>).text as string
          : v !== undefined ? JSON.stringify(v) : undefined;
    const title = coerce(parsed.title);
    const body = coerce(parsed.body);

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'model produced no draft', raw: parsed }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        title,
        body,
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
