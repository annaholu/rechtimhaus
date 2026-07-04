import type { Bundesland, Citation, SituationTag } from "./types";

/**
 * Demo content only — illustrative statute references, not a live legal
 * database. Real § numbers, but not verified against the current text
 * on every request (see PRD §5: scheduled refresh, not real-time lookup).
 */

export interface Topic {
  tag: SituationTag;
  keywords: string[];
  /** Groups of words that may all appear anywhere in the text (not as one exact phrase) to count as a match. */
  wordGroups?: string[][];
  citations: Citation[];
  kurzbegruendung: string;
  vorsicht: string;
  isLandesrecht?: boolean;
}

export const TOPICS: Record<SituationTag, Topic> = {
  Sichtschutz: {
    tag: "Sichtschutz",
    keywords: [
      "sichtschutz",
      "einsehbar",
      "sichtblende",
      "blickschutz",
      "grenzabstand",
      "einfriedung",
      "hecke",
      "zaun",
    ],
    citations: [],
    kurzbegruendung:
      "Sichtschutz, Grenzabstände und Einfriedungen sind nicht bundeseinheitlich geregelt, sondern Landesnachbarrecht — die konkrete Vorschrift hängt vom Bundesland ab.",
    vorsicht:
      "Ohne das genaue Landesnachbarrechtsgesetz zu prüfen, lässt sich keine verlässliche Aussage treffen — hier lohnt sich Rückfrage bei einer lokalen Stelle.",
    isLandesrecht: true,
  },
  Lärm: {
    tag: "Lärm",
    keywords: ["lärm", "laut", "ruhezeit", "krach", "geräusch"],
    citations: [
      {
        label: "§ 906 BGB",
        href: "https://www.gesetze-im-internet.de/bgb/__906.html",
      },
    ],
    kurzbegruendung:
      "§ 906 BGB regelt, welche Einwirkungen (auch Lärm) von einem Nachbargrundstück hingenommen werden müssen, sofern sie ortsüblich sind und nur unwesentlich stören. Ruhezeiten sind oft zusätzlich in der Hausordnung oder kommunalen Ordnungen geregelt.",
    vorsicht:
      "Ob eine Störung noch 'ortsüblich und unwesentlich' ist, ist stark einzelfallabhängig — pauschale Behauptungen ('das ist immer verboten') sind mit Vorsicht zu genießen.",
  },
  Sondernutzungsrecht: {
    tag: "Sondernutzungsrecht",
    keywords: ["sondernutzung", "stellplatz", "garten", "terrasse", "keller"],
    citations: [
      {
        label: "§ 13 WEG",
        href: "https://www.gesetze-im-internet.de/weg/__13.html",
      },
      {
        label: "§ 10 WEG",
        href: "https://www.gesetze-im-internet.de/weg/__10.html",
      },
    ],
    kurzbegruendung:
      "Sondernutzungsrechte entstehen meist durch Vereinbarung der Eigentümer (§ 10 WEG) und regeln, wer welche Gemeinschaftsfläche exklusiv nutzen darf (§ 13 WEG). Ohne eine solche Vereinbarung gilt die allgemeine Mitgebrauchsregel.",
    vorsicht:
      "Ob ein Sondernutzungsrecht tatsächlich besteht, steht meist in der Teilungserklärung oder einem Beschluss — ohne diesen Beleg bleibt eine Behauptung dazu unbestätigt.",
  },
  Instandhaltung: {
    tag: "Instandhaltung",
    keywords: ["instandhaltung", "instandsetzung", "reparatur", "sanierung", "schaden"],
    citations: [
      {
        label: "§ 14 WEG",
        href: "https://www.gesetze-im-internet.de/weg/__14.html",
      },
      {
        label: "§ 535 BGB",
        href: "https://www.gesetze-im-internet.de/bgb/__535.html",
      },
    ],
    kurzbegruendung:
      "§ 14 WEG regelt Pflichten und Rücksichtnahme unter Wohnungseigentümern; Instandhaltung des Gemeinschaftseigentums ist grundsätzlich Sache der Gemeinschaft. Im Mietverhältnis trifft die Instandhaltungspflicht nach § 535 BGB in erster Linie den Vermieter.",
    vorsicht:
      "Wer konkret zuständig ist (Gemeinschaft, einzelner Eigentümer, Vermieter), hängt oft von der genauen Schadensursache und ggf. der Teilungserklärung ab.",
  },
  Mieterhöhung: {
    tag: "Mieterhöhung",
    keywords: ["mieterhöhung", "vergleichsmiete", "staffelmiete", "kappungsgrenze"],
    wordGroups: [
      ["miete", "erhöh"],
      ["miete", "steig"],
    ],
    citations: [
      {
        label: "§ 558 BGB",
        href: "https://www.gesetze-im-internet.de/bgb/__558.html",
      },
      {
        label: "§ 559 BGB",
        href: "https://www.gesetze-im-internet.de/bgb/__559.html",
      },
    ],
    kurzbegruendung:
      "§ 558 BGB erlaubt Mieterhöhungen bis zur ortsüblichen Vergleichsmiete unter bestimmten Fristen und Kappungsgrenzen; § 559 BGB betrifft Erhöhungen nach Modernisierung. Beide folgen festen Form- und Fristvorgaben.",
    vorsicht:
      "Eine Mieterhöhung ohne Bezug auf Vergleichsmiete, Kappungsgrenze oder Modernisierungsumlage ist formal angreifbar — das prüft man am besten konkret anhand des Erhöhungsschreibens.",
  },
  Hausordnung: {
    tag: "Hausordnung",
    keywords: ["hausordnung", "gemeinschaftsordnung", "hausregel"],
    citations: [],
    kurzbegruendung:
      "Die Hausordnung ist vertraglicher/vereinbarter Natur, kein Gesetz. Sie kann Verhalten im Haus regeln, aber keine zwingenden gesetzlichen Rechte (z. B. aus WEG oder Mietrecht) wirksam einschränken.",
    vorsicht:
      "Eine Klausel in der Hausordnung ist nicht automatisch gültig, nur weil sie dort steht — bei Widerspruch zu zwingendem Recht kann sie unwirksam sein.",
  },
  Nachbarstreit: {
    tag: "Nachbarstreit",
    keywords: ["streit", "konflikt", "drohung", "anwalt", "eskalation"],
    citations: [],
    kurzbegruendung:
      "Bei einem andauernden Konflikt (statt einer einzelnen Sachfrage) geht es meist nicht mehr nur um die Rechtslage, sondern um Kommunikation und Eskalationsdynamik.",
    vorsicht:
      "Bei wiederholtem Druck, Drohungen oder einem ungelösten Streit ist eine echte Beratung (Eigentümerverein, Mieterverein, Fachanwalt) der richtige nächste Schritt.",
  },
  Sonstiges: {
    tag: "Sonstiges",
    keywords: [],
    citations: [],
    kurzbegruendung:
      "Für diese Frage lässt sich kein spezifisches Rechtsgebiet aus den genannten Stichworten ableiten.",
    vorsicht:
      "Je konkreter die Situationsbeschreibung, desto gezielter lässt sich die passende Vorschrift finden.",
  },
};

interface LandesrechtEntry {
  gesetz: string;
  lowConfidence?: boolean;
}

export const LANDESNACHBARRECHT: Record<Bundesland, LandesrechtEntry> = {
  "Baden-Württemberg": { gesetz: "Nachbarrechtsgesetz Baden-Württemberg (NRG)" },
  Bayern: { gesetz: "Bayerisches Ausführungsgesetz zum BGB (AGBGB), Art. 47 ff." },
  Berlin: { gesetz: "Nachbarrechtsgesetz Berlin (NachbG Bln)" },
  Brandenburg: { gesetz: "Brandenburgisches Nachbarrechtsgesetz (NachbG Bbg)" },
  Bremen: {
    gesetz: "kein eigenständiges Landesnachbarrechtsgesetz bekannt — vermutlich allgemeines BGB-Nachbarrecht",
    lowConfidence: true,
  },
  Hamburg: { gesetz: "Hamburgisches Nachbarrechtsgesetz (HmbNRG)" },
  Hessen: { gesetz: "Hessisches Nachbarrechtsgesetz (NachbRG)" },
  "Mecklenburg-Vorpommern": { gesetz: "Nachbarrechtsgesetz Mecklenburg-Vorpommern (NachbG M-V)" },
  Niedersachsen: { gesetz: "Niedersächsisches Nachbarrechtsgesetz (NNachbG)" },
  "Nordrhein-Westfalen": { gesetz: "Nachbarrechtsgesetz Nordrhein-Westfalen (NachbG NRW)" },
  "Rheinland-Pfalz": { gesetz: "Landesnachbarrechtsgesetz Rheinland-Pfalz (LNRG)" },
  Saarland: { gesetz: "Nachbarrechtsgesetz Saarland (NachbG Saarland)" },
  Sachsen: { gesetz: "Sächsisches Nachbarrechtsgesetz (SächsNRG)" },
  "Sachsen-Anhalt": {
    gesetz: "aktueller Stand des Landesnachbarrechts nicht zuverlässig abrufbar",
    lowConfidence: true,
  },
  "Schleswig-Holstein": { gesetz: "Nachbarrechtsgesetz Schleswig-Holstein (NachbG SH)" },
  Thüringen: { gesetz: "Thüringer Nachbarrechtsgesetz (ThürNRG)" },
};
