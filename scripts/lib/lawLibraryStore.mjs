import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LIBRARY_PATH = path.join(__dirname, "..", "..", "data", "lawLibrary.json");

export function readLibrary() {
  return JSON.parse(readFileSync(LIBRARY_PATH, "utf-8"));
}

export function writeLibrary(library) {
  writeFileSync(LIBRARY_PATH, JSON.stringify(library, null, 2) + "\n");
}

/**
 * Upserts `incoming` entries by id into `existingEntries`. Fields present on
 * an incoming entry overwrite the existing ones; fields omitted are kept.
 * Returns { entries, added, updated }.
 */
export function upsertEntries(existingEntries, incoming) {
  const byId = new Map(existingEntries.map((e) => [e.id, e]));
  let added = 0;
  let updated = 0;
  for (const entry of incoming) {
    const existing = byId.get(entry.id);
    if (existing) {
      byId.set(entry.id, { ...existing, ...entry });
      updated += 1;
    } else {
      byId.set(entry.id, { title: undefined, text: null, tags: [], ...entry });
      added += 1;
    }
  }
  return { entries: Array.from(byId.values()), added, updated };
}
