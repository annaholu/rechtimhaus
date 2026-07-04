export type Role = "Eigentümer" | "Mieter" | "Vermieter" | "Unsicher";

export type Bundesland =
  | "Baden-Württemberg"
  | "Bayern"
  | "Berlin"
  | "Brandenburg"
  | "Bremen"
  | "Hamburg"
  | "Hessen"
  | "Mecklenburg-Vorpommern"
  | "Niedersachsen"
  | "Nordrhein-Westfalen"
  | "Rheinland-Pfalz"
  | "Saarland"
  | "Sachsen"
  | "Sachsen-Anhalt"
  | "Schleswig-Holstein"
  | "Thüringen";

export type SituationTag =
  | "Sichtschutz"
  | "Lärm"
  | "Sondernutzungsrecht"
  | "Instandhaltung"
  | "Mieterhöhung"
  | "Hausordnung"
  | "Nachbarstreit"
  | "Sonstiges";

export type Aktion = "Fact-check" | "Frage stellen";

export type Einschaetzung =
  | "zutreffend"
  | "teilweise zutreffend"
  | "unklar – hängt vom Fall ab"
  | "nicht belegt";

export interface Citation {
  label: string;
  href?: string;
  lowConfidence?: boolean;
}

export interface FactCheckRow {
  behauptung: string;
  rechtsgrundlage: Citation;
  einschaetzung: Einschaetzung;
  kurzbegruendung: string;
  vorsicht: string;
}

export interface FreeAnswer {
  text: string;
  citation?: Citation;
  hinweis?: string;
}

export interface FactCheckRequest {
  text: string;
  role?: Role;
  bundesland?: Bundesland;
  tags: SituationTag[];
  hausordnungFileName?: string;
}

export interface FactCheckResponse {
  rows: FactCheckRow[];
  escalation: string | null;
  usedFallback: boolean;
}

export interface SessionContext {
  role?: Role;
  bundesland?: Bundesland;
  situation?: string;
  hausordnungFileName?: string;
}

export type ChipOption = { label: string; value: string };

export type ChatMessage =
  | {
      id: string;
      sender: "assistant";
      kind: "text";
      text: string;
      chips?: ChipOption[];
      chipsDisabled?: boolean;
    }
  | { id: string; sender: "user"; kind: "text"; text: string }
  | {
      id: string;
      sender: "assistant";
      kind: "upload-ack";
      fileName: string;
      note: string;
    }
  | {
      id: string;
      sender: "assistant";
      kind: "factcheck";
      rows: FactCheckRow[];
      escalation?: string;
    }
  | {
      id: string;
      sender: "assistant";
      kind: "answer";
      answer: FreeAnswer;
      escalation?: string;
    };
