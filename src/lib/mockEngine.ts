import { LANDESNACHBARRECHT, TOPICS } from "./legalData";
import type {
  Bundesland,
  Citation,
  Einschaetzung,
  FactCheckRow,
  FreeAnswer,
  SituationTag,
} from "./types";

const ABSOLUTE_WORDS = [
  "muss",
  "müssen",
  "verboten",
  "nicht erlaubt",
  "illegal",
  "pflicht",
  "sofort",
  "immer",
];

const ESCALATION_WORDS = [
  "droh",
  "anwalt",
  "wiederholt",
  "immer wieder",
  "schon mehrfach",
  "einschüchter",
  "eskalier",
];

function topicMatches(topic: (typeof TOPICS)[SituationTag], lower: string): boolean {
  if (topic.keywords.some((k) => lower.includes(k))) return true;
  if (topic.wordGroups?.some((group) => group.every((w) => lower.includes(w)))) return true;
  return false;
}

function matchTopic(text: string, hintTags: SituationTag[]) {
  const lower = text.toLowerCase();
  for (const tag of hintTags) {
    const topic = TOPICS[tag];
    if (topicMatches(topic, lower)) return topic;
  }
  for (const topic of Object.values(TOPICS)) {
    if (topicMatches(topic, lower)) return topic;
  }
  return TOPICS.Sonstiges;
}

function assess(claim: string, topic: (typeof TOPICS)[SituationTag]): Einschaetzung {
  if (topic.tag === "Sonstiges") return "nicht belegt";
  if (topic.isLandesrecht) return "unklar – hängt vom Fall ab";
  const lower = claim.toLowerCase();
  const hasAbsolute = ABSOLUTE_WORDS.some((w) => lower.includes(w));
  if (hasAbsolute) return "teilweise zutreffend";
  return topic.citations.length > 0 ? "zutreffend" : "unklar – hängt vom Fall ab";
}

function resolveCitation(
  topic: (typeof TOPICS)[SituationTag],
  bundesland?: Bundesland
): { citation: Citation; vorsicht: string } {
  if (topic.isLandesrecht && bundesland) {
    const entry = LANDESNACHBARRECHT[bundesland];
    if (entry.lowConfidence) {
      return {
        citation: { label: entry.gesetz, lowConfidence: true },
        vorsicht: `Für ${bundesland} lässt sich der genaue Stand des Landesnachbarrechts hier nicht zuverlässig bestätigen — das gehört vor eine Fachstelle vor Ort, nicht in eine Vermutung.`,
      };
    }
    return {
      citation: { label: entry.gesetz },
      vorsicht: `${topic.vorsicht} (${bundesland}: ${entry.gesetz})`,
    };
  }
  if (topic.citations.length > 0) {
    return { citation: topic.citations[0], vorsicht: topic.vorsicht };
  }
  return { citation: { label: "kein konkreter Bezug genannt" }, vorsicht: topic.vorsicht };
}

export function extractClaims(text: string): string[] {
  const fragments = text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 8);
  if (fragments.length === 0) return [text.trim()].filter(Boolean);
  return fragments.slice(0, 6);
}

export function detectEscalation(text: string, tags: SituationTag[]): string | undefined {
  const lower = text.toLowerCase();
  const flagged =
    tags.includes("Nachbarstreit") || ESCALATION_WORDS.some((w) => lower.includes(w));
  if (!flagged) return undefined;
  return "Das klingt nach mehr als einer einmaligen Sachfrage — bei wiederholtem Druck oder einem ungelösten Streit ist eine echte Beratung (Eigentümerverein, Mieterverein oder Fachanwalt) der sinnvolle nächste Schritt, nicht nur eine erste Einschätzung hier.";
}

export function buildFactCheckRows(
  text: string,
  tags: SituationTag[],
  bundesland?: Bundesland
): FactCheckRow[] {
  const claims = extractClaims(text);
  return claims.map((claim) => {
    const topic = matchTopic(claim, tags);
    const { citation, vorsicht } = resolveCitation(topic, bundesland);
    return {
      behauptung: claim,
      rechtsgrundlage: citation,
      einschaetzung: assess(claim, topic),
      kurzbegruendung: topic.kurzbegruendung,
      vorsicht,
    };
  });
}

export function buildFreeAnswer(
  question: string,
  tags: SituationTag[],
  bundesland?: Bundesland,
  hausordnungFileName?: string
): FreeAnswer {
  const topic = matchTopic(question, tags);
  const { citation, vorsicht } = resolveCitation(topic, bundesland);
  let text = topic.kurzbegruendung;
  if (topic.tag === "Hausordnung" && hausordnungFileName) {
    text += ` Da du "${hausordnungFileName}" hochgeladen hast: In dieser Demo wird der Inhalt nicht wirklich ausgelesen — im fertigen Produkt würde hier die konkrete Klausel aus deiner Hausordnung zitiert.`;
  } else if (topic.tag === "Hausordnung") {
    text +=
      " Ohne eine hochgeladene Hausordnung kann nur allgemein geantwortet werden, nicht zur konkreten Klausel in deinem Haus.";
  }
  return { text, citation, hinweis: vorsicht };
}
