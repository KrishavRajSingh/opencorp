"use server";

import { z } from "zod";
import { mastra } from "@/mastra";
import {
  showHNDraftInputSchema,
  buildShowHNDraftPrompt,
} from "@/mastra/agents/show-hn-drafter";
import { fetchPageTool } from "@/mastra/tools/fetch-page";

const CORPUS_FETCH_LIMIT = 8000;

async function fetchCorpus(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tool = fetchPageTool as any;
    const result = (await tool.execute({
      url: `https://bestofshowhn.com/${year}`,
    } as never)) as { content?: string };
    const content = (result.content ?? "")
      .replace(/[—–]/g, "-")
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');
    return `\nWINNING-PATTERN CORPUS (top Show HN posts of ${year} from bestofshowhn.com):\n${content.slice(0, CORPUS_FETCH_LIMIT)}\n`;
  } catch {
    return "";
  }
}

export type ShowHNDraftResult =
  | {
      ok: true;
      title: string;
      body: string;
      runId: string;
      generatedAt: string;
    }
  | { ok: false; error: string };

export async function runShowHNDraft(
  raw: z.infer<typeof showHNDraftInputSchema>,
): Promise<ShowHNDraftResult> {
  const agent = mastra.getAgent("showHNDrafterAgent");
  if (!agent) return { ok: false, error: "showHNDrafterAgent not registered" };

  let input: z.infer<typeof showHNDraftInputSchema>;
  try {
    input = showHNDraftInputSchema.parse(raw);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid input",
    };
  }

  try {
    const corpus = await fetchCorpus();
    const userQ = buildShowHNDraftPrompt(input, corpus);
    const result = await agent.generate([{ role: "user", content: userQ }]);

    let parsed: { title?: string; body?: string } = {};
    for (const tc of result.toolCalls ?? []) {
      if (tc.payload?.toolName === "submitShowHNDraft") {
        parsed = (tc.payload.args ?? {}) as { title?: string; body?: string };
        break;
      }
    }
    if (!parsed.title || !parsed.body) {
      const text = (result.text ?? "").trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          /* keep what we have */
        }
      }
    }

    const coerce = (v: unknown): string | undefined =>
      typeof v === "string"
        ? v
        : v && typeof v === "object" && typeof (v as Record<string, unknown>).text === "string"
          ? (v as Record<string, unknown>).text as string
          : v !== undefined
            ? JSON.stringify(v)
            : undefined;
    const title = coerce(parsed.title);
    const body = coerce(parsed.body);

    if (!title || !body) {
      return { ok: false, error: "model produced no draft" };
    }

    return {
      ok: true,
      title,
      body,
      runId: `showhn_${Date.now().toString(36)}`,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to run agent",
    };
  }
}
