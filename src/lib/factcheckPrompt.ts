import { LANDESNACHBARRECHT, TOPICS } from "./legalData";
import type { Bundesland, Role, SituationTag } from "./types";

const KNOWN_CITATIONS = Object.values(TOPICS)
  .flatMap((t) => t.citations)
  .map((c) => c.label);

export function buildFactCheckSystemPrompt(
  role: Role | undefined,
  bundesland: Bundesland | undefined,
  tags: SituationTag[],
  hausordnungFileName: string | undefined
): string {
  const landesrecht = bundesland ? LANDESNACHBARRECHT[bundesland] : undefined;

  return `Du bist der Analyse-Assistent von "Recht im Haus", einem Klarheits-Tool für WEG-Recht, Mietrecht (BGB) und Nachbarrecht in Deutschland.

Aufgabe: Zerlege die vom Nutzer eingefügte Nachricht in einzelne, prüfbare Behauptungen und ordne jede rechtlich ein.

Nutzerkontext:
- Rolle: ${role ?? "unbekannt"}
- Bundesland: ${bundesland ?? "unbekannt"}
- Angegebene Themen-Stichworte: ${tags.length > 0 ? tags.join(", ") : "keine"}
- Hausordnung hochgeladen: ${hausordnungFileName ? `ja ("${hausordnungFileName}", Inhalt in dieser Demo nicht ausgelesen)` : "nein"}

Bekannte, verlässliche Referenzen, die du bevorzugt nutzen sollst:
${KNOWN_CITATIONS.map((c) => `- ${c}`).join("\n")}
${
  landesrecht
    ? `- Landesnachbarrecht für ${bundesland}: ${landesrecht.gesetz}${landesrecht.lowConfidence ? " (Stand nicht zuverlässig bestätigt)" : ""}`
    : "- Landesnachbarrecht: nur nennen, wenn ein Bundesland bekannt ist; sonst allgemein auf Landesnachbarrecht als Rechtsgebiet hinweisen, ohne ein konkretes Gesetz zu erfinden."
}

Strikte Regeln:
1. Erfinde niemals eine §-Nummer oder ein Gesetz. Wenn du unsicher bist oder keine passende reale Vorschrift kennst, setze rechtsgrundlage_label auf "kein konkreter Bezug genannt" und rechtsgrundlage_href auf null.
2. Zitiere nur echte, existierende Vorschriften aus WEG oder BGB (Mietrecht, §§535–580a) oder das genannte Landesnachbarrechtsgesetz. Erfinde keine Urteile.
3. Nie ein Urteil ("das ist illegal", "du hast recht") — nur vorsichtige Einschätzung ("das erscheint vereinbar mit...", "dafür fehlt ein konkreter Anhaltspunkt").
4. Unterscheide klar zwischen Gesetz, Vertrag/Hausordnung und bloßer Hausgewohnheit ohne rechtliche Wirkung.
5. Wenn die Situation nach wiederholtem Druck, Drohungen oder einem andauernden Streit klingt (nicht nur einer einzelnen Sachfrage), setze das escalation-Feld mit einem Hinweis, dass eine echte Beratung (Eigentümerverein, Mieterverein, Fachanwalt) der sinnvolle nächste Schritt ist. Sonst setze escalation auf null.
6. Bei Landesnachbarrecht (Sichtschutz, Grenzabstand, Einfriedung): wenn du dir über die genaue aktuelle Vorschrift für das genannte Bundesland nicht sicher bist, sag das explizit statt zu raten.
7. Antworte ausschließlich über das Tool report_factcheck.`;
}

export const FACTCHECK_TOOL = {
  name: "report_factcheck",
  description:
    "Meldet die claim-by-claim Analyse einer Nachricht als strukturierte Tabelle.",
  input_schema: {
    type: "object" as const,
    properties: {
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            behauptung: {
              type: "string",
              description: "Die wörtliche oder paraphrasierte Behauptung aus der Nachricht.",
            },
            rechtsgrundlage_label: {
              type: "string",
              description:
                "z.B. '§14 WEG', 'Nachbarrechtsgesetz Bayern (AGBGB), Art. 47 ff.' oder 'kein konkreter Bezug genannt'.",
            },
            rechtsgrundlage_href: {
              type: ["string", "null"],
              description:
                "Link zur Vorschrift (z.B. gesetze-im-internet.de) falls bekannt, sonst null.",
            },
            rechtsgrundlage_unsicher: {
              type: "boolean",
              description: "true, wenn der genaue Stand/die genaue Vorschrift nicht zuverlässig bestätigt ist.",
            },
            einschaetzung: {
              type: "string",
              enum: ["zutreffend", "teilweise zutreffend", "unklar – hängt vom Fall ab", "nicht belegt"],
            },
            kurzbegruendung: {
              type: "string",
              description: "1-2 Sätze, allgemeinverständlich.",
            },
            vorsicht: {
              type: "string",
              description: "Wo Vorsicht geboten ist / was ein Fachmensch zusätzlich prüfen würde.",
            },
          },
          required: [
            "behauptung",
            "rechtsgrundlage_label",
            "rechtsgrundlage_href",
            "rechtsgrundlage_unsicher",
            "einschaetzung",
            "kurzbegruendung",
            "vorsicht",
          ],
          additionalProperties: false,
        },
      },
      escalation: {
        type: ["string", "null"],
        description: "Eskalationshinweis, oder null wenn nicht zutreffend.",
      },
    },
    required: ["rows", "escalation"],
    additionalProperties: false,
  },
};
