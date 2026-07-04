import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/anthropicClient";
import { buildFactCheckSystemPrompt, FACTCHECK_TOOL } from "@/lib/factcheckPrompt";
import { buildFactCheckRows, detectEscalation } from "@/lib/mockEngine";
import type {
  Bundesland,
  Citation,
  Einschaetzung,
  FactCheckRequest,
  FactCheckResponse,
  FactCheckRow,
  Role,
  SituationTag,
} from "@/lib/types";
import { BUNDESLAENDER, ROLES, SITUATION_TAGS } from "@/lib/constants";

export const runtime = "nodejs";

const EINSCHAETZUNGEN: Einschaetzung[] = [
  "zutreffend",
  "teilweise zutreffend",
  "unklar – hängt vom Fall ab",
  "nicht belegt",
];

interface ToolRow {
  behauptung: string;
  rechtsgrundlage_label: string;
  rechtsgrundlage_href: string | null;
  rechtsgrundlage_unsicher: boolean;
  einschaetzung: string;
  kurzbegruendung: string;
  vorsicht: string;
}

function isToolRow(v: unknown): v is ToolRow {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.behauptung === "string" &&
    typeof r.rechtsgrundlage_label === "string" &&
    (r.rechtsgrundlage_href === null || typeof r.rechtsgrundlage_href === "string") &&
    typeof r.rechtsgrundlage_unsicher === "boolean" &&
    typeof r.einschaetzung === "string" &&
    typeof r.kurzbegruendung === "string" &&
    typeof r.vorsicht === "string"
  );
}

function toFactCheckRow(row: ToolRow): FactCheckRow {
  const einschaetzung = EINSCHAETZUNGEN.includes(row.einschaetzung as Einschaetzung)
    ? (row.einschaetzung as Einschaetzung)
    : "unklar – hängt vom Fall ab";
  const rechtsgrundlage: Citation = {
    label: row.rechtsgrundlage_label,
    href: row.rechtsgrundlage_href ?? undefined,
    lowConfidence: row.rechtsgrundlage_unsicher || undefined,
  };
  return {
    behauptung: row.behauptung,
    rechtsgrundlage,
    einschaetzung,
    kurzbegruendung: row.kurzbegruendung,
    vorsicht: row.vorsicht,
  };
}

function parseRequest(body: unknown): FactCheckRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.text !== "string" || b.text.trim().length === 0) return null;
  const role = ROLES.includes(b.role as Role) ? (b.role as Role) : undefined;
  const bundesland = BUNDESLAENDER.includes(b.bundesland as Bundesland)
    ? (b.bundesland as Bundesland)
    : undefined;
  const tags = Array.isArray(b.tags)
    ? b.tags.filter((t): t is SituationTag => SITUATION_TAGS.includes(t as SituationTag))
    : [];
  const hausordnungFileName =
    typeof b.hausordnungFileName === "string" ? b.hausordnungFileName : undefined;
  return { text: b.text, role, bundesland, tags, hausordnungFileName };
}

function fallback(req: FactCheckRequest): FactCheckResponse {
  return {
    rows: buildFactCheckRows(req.text, req.tags, req.bundesland),
    escalation: detectEscalation(req.text, req.tags) ?? null,
    usedFallback: true,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const req = parseRequest(body);
  if (!req) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(fallback(req));
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: buildFactCheckSystemPrompt(req.role, req.bundesland, req.tags, req.hausordnungFileName),
      tools: [{ ...FACTCHECK_TOOL, strict: true }],
      tool_choice: { type: "tool", name: "report_factcheck" },
      messages: [{ role: "user", content: req.text }],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "report_factcheck"
    );
    if (!toolUse) {
      return NextResponse.json(fallback(req));
    }

    const input = toolUse.input as { rows?: unknown; escalation?: unknown };
    const rawRows = Array.isArray(input.rows) ? input.rows : [];
    const rows = rawRows.filter(isToolRow).map(toFactCheckRow);
    if (rows.length === 0) {
      return NextResponse.json(fallback(req));
    }

    const result: FactCheckResponse = {
      rows,
      escalation: typeof input.escalation === "string" ? input.escalation : null,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error("factcheck: rate limited", err.message);
    } else if (err instanceof Anthropic.APIConnectionError) {
      console.error("factcheck: connection error", err.message);
    } else if (err instanceof Anthropic.APIError) {
      console.error("factcheck: API error", err.status, err.message);
    } else {
      console.error("factcheck: unexpected error", err);
    }
    return NextResponse.json(fallback(req));
  }
}
