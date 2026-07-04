import "server-only";
import fs from "fs";
import path from "path";
import type { LawEntry, LawLibrary, SituationTag } from "./types";

const LIBRARY_PATH = path.join(process.cwd(), "data", "lawLibrary.json");

export function getLawLibrary(): LawLibrary {
  const raw = fs.readFileSync(LIBRARY_PATH, "utf-8");
  return JSON.parse(raw) as LawLibrary;
}

export function getEntriesForTags(tags: SituationTag[]): LawEntry[] {
  const library = getLawLibrary();
  if (tags.length === 0) return library.entries;
  return library.entries.filter((e) => e.tags.some((t) => tags.includes(t)));
}
