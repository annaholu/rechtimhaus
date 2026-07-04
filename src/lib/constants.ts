import type { Bundesland, Role, SituationTag } from "./types";

export const ROLES: Role[] = ["Eigentümer", "Mieter", "Vermieter", "Unsicher"];

export const BUNDESLAENDER: Bundesland[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export const SITUATION_TAGS: SituationTag[] = [
  "Sichtschutz",
  "Lärm",
  "Sondernutzungsrecht",
  "Instandhaltung",
  "Mieterhöhung",
  "Hausordnung",
  "Nachbarstreit",
  "Sonstiges",
];
