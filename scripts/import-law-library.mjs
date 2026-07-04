#!/usr/bin/env node
// Developer tool: import/update statute text into data/lawLibrary.json.
//
// Usage:
//   node scripts/import-law-library.mjs <path-to-upload.json>
//
// The upload file can be either:
//   - a bare array of entries:      [{ "id": "bgb-535", "gesetz": "BGB", "paragraph": "§ 535", "text": "...", "href": "...", "tags": ["Instandhaltung"] }, ...]
//   - or a full library object:      { "entries": [ ... ] }
//
// Entries are upserted by "id" into data/lawLibrary.json — existing entries
// not mentioned in the upload are left untouched. Run this yourself after
// verifying the statute text is accurate; the app trusts whatever is in
// this file and will quote it directly in the fact-check prompt.

import { readFileSync } from "fs";
import { readLibrary, writeLibrary, upsertEntries } from "./lib/lawLibraryStore.mjs";

const KNOWN_TAGS = [
  "Sichtschutz",
  "Lärm",
  "Sondernutzungsrecht",
  "Instandhaltung",
  "Mieterhöhung",
  "Hausordnung",
  "Nachbarstreit",
  "Sonstiges",
];

const REQUIRED_FIELDS = ["id", "gesetz", "paragraph", "href"];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function validateEntry(entry, index) {
  for (const field of REQUIRED_FIELDS) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      fail(`Eintrag #${index}: Feld "${field}" fehlt oder ist leer.`);
    }
  }
  if (entry.text !== undefined && entry.text !== null && typeof entry.text !== "string") {
    fail(`Eintrag #${index} (${entry.id}): "text" muss ein String oder null sein.`);
  }
  if (entry.tags !== undefined) {
    if (!Array.isArray(entry.tags)) {
      fail(`Eintrag #${index} (${entry.id}): "tags" muss ein Array sein.`);
    }
    for (const tag of entry.tags) {
      if (!KNOWN_TAGS.includes(tag)) {
        console.warn(
          `⚠ Eintrag ${entry.id}: unbekanntes Tag "${tag}" (bekannt: ${KNOWN_TAGS.join(", ")}) — wird trotzdem übernommen.`
        );
      }
    }
  }
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    fail("Bitte Pfad zur Upload-Datei angeben: node scripts/import-law-library.mjs <datei.json>");
  }

  let uploaded;
  try {
    uploaded = JSON.parse(readFileSync(inputPath, "utf-8"));
  } catch (err) {
    fail(`Konnte "${inputPath}" nicht als JSON lesen: ${err.message}`);
  }

  const incomingEntries = Array.isArray(uploaded) ? uploaded : uploaded.entries;
  if (!Array.isArray(incomingEntries)) {
    fail('Upload muss ein Array von Einträgen sein, oder ein Objekt mit einem "entries"-Array.');
  }
  incomingEntries.forEach(validateEntry);

  const library = readLibrary();
  const { entries, added, updated } = upsertEntries(library.entries, incomingEntries);

  writeLibrary({ updatedAt: new Date().toISOString(), source: "manual", entries });
  console.log(`✓ data/lawLibrary.json aktualisiert: ${added} neu, ${updated} aktualisiert.`);
  console.log("Bitte den importierten Wortlaut selbst gegenprüfen — die App zitiert ihn direkt.");
}

main();
