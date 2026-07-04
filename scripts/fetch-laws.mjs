#!/usr/bin/env node
// Developer tool: fetch real statute text from gesetze-im-internet.de (the
// official BMJ source) and merge it into data/lawLibrary.json.
//
// ⚠ NOT VERIFIED AGAINST THE LIVE SOURCE. This script was written and
// unit-tested for its parsing logic, but the sandbox this project was
// built in blocks outbound requests to gesetze-im-internet.de at the
// network level, so the live download + real-schema parsing could not be
// exercised end-to-end. Run with --dry-run first and inspect the output
// before trusting it — if gesetze-im-internet.de's XML schema differs from
// what's assumed here, this will fail loudly (not silently produce wrong
// legal text), but please double-check regardless.
//
// Requires the `unzip` CLI to be on PATH (used to extract the .xml from the
// zip bundle gesetze-im-internet.de publishes per statute).
//
// Usage:
//   node scripts/fetch-laws.mjs [--dry-run]

import { execFileSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import path from "path";
import os from "os";
import { XMLParser } from "fast-xml-parser";
import { readLibrary, writeLibrary, upsertEntries } from "./lib/lawLibraryStore.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

const TARGETS = [
  { slug: "weg", gesetz: "WEG", paragraphs: ["§ 10", "§ 13", "§ 14"] },
  { slug: "bgb", gesetz: "BGB", paragraphs: ["§ 535", "§ 558", "§ 559", "§ 906"] },
];

function normalizeParagraph(label) {
  return String(label ?? "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphNumber(label) {
  const normalized = normalizeParagraph(label);
  // Anchor on the § sign specifically — a bare digit search would also match
  // unrelated numbers (e.g. an undecoded "&#167;" entity, or "Art. 47 ff.").
  const match = normalized.match(/§\s*(\d+)/);
  return match ? match[1] : null;
}

/** Recursively finds all objects that look like a <norm> node (have metadaten.enbez). */
function findNorms(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) findNorms(item, out);
  } else if (node && typeof node === "object") {
    if (node.metadaten?.enbez) out.push(node);
    for (const value of Object.values(node)) findNorms(value, out);
  }
  return out;
}

/** Recursively joins every string leaf under a node into one text blob. */
function extractText(node) {
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) return node.map(extractText).filter(Boolean).join("\n");
  if (node && typeof node === "object") {
    return Object.entries(node)
      .filter(([key]) => key !== "@_") // skip attribute-only keys
      .map(([, value]) => extractText(value))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

async function fetchZipBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download fehlgeschlagen (${res.status} ${res.statusText}): ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function extractXmlFromZip(zipBuffer, tmpDir) {
  const zipPath = path.join(tmpDir, "law.zip");
  writeFileSync(zipPath, zipBuffer);

  let listing;
  try {
    listing = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf-8" });
  } catch (err) {
    throw new Error(
      `"unzip" konnte das Archiv nicht lesen (ist unzip installiert?): ${err.message}`
    );
  }
  const xmlName = listing.split("\n").map((l) => l.trim()).find((l) => l.endsWith(".xml"));
  if (!xmlName) {
    throw new Error("Kein .xml im heruntergeladenen Archiv gefunden — Format hat sich evtl. geändert.");
  }
  return execFileSync("unzip", ["-p", zipPath, xmlName], { encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
}

async function fetchLaw(target, tmpDir) {
  const url = `https://www.gesetze-im-internet.de/${target.slug}/xml.zip`;
  console.log(`→ ${target.gesetz}: lade ${url}`);
  const zipBuffer = await fetchZipBuffer(url);
  const xml = extractXmlFromZip(zipBuffer, tmpDir);

  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "#text" });
  const parsed = parser.parse(xml);
  const norms = findNorms(parsed);
  if (norms.length === 0) {
    throw new Error(
      `Keine <norm>-Elemente im XML für ${target.gesetz} gefunden — Schema weicht vermutlich vom erwarteten ab. Breche ohne Schreiben ab.`
    );
  }

  const found = [];
  for (const wanted of target.paragraphs) {
    const wantedNum = paragraphNumber(wanted);
    const norm = norms.find((n) => paragraphNumber(n.metadaten.enbez) === wantedNum);
    if (!norm) {
      console.warn(`  ⚠ ${wanted} nicht im XML gefunden — übersprungen.`);
      continue;
    }
    const title = typeof norm.metadaten.titel === "string" ? norm.metadaten.titel : undefined;
    const text = extractText(norm.textdaten).trim();
    if (!text) {
      console.warn(`  ⚠ ${wanted} gefunden, aber kein Volltext extrahierbar — übersprungen.`);
      continue;
    }
    found.push({
      id: `${target.slug}-${wantedNum}`,
      gesetz: target.gesetz,
      paragraph: normalizeParagraph(wanted),
      title,
      text,
      href: `https://www.gesetze-im-internet.de/${target.slug}/__${wantedNum}.html`,
    });
    console.log(`  ✓ ${wanted} extrahiert (${text.length} Zeichen)`);
  }
  return found;
}

async function main() {
  console.warn(
    "⚠ Dieses Skript wurde nicht gegen die echte gesetze-im-internet.de-Quelle getestet (Netzwerkzugriff war in der Entwicklungs-Sandbox blockiert). Ergebnis vor Nutzung prüfen.\n"
  );

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "recht-im-haus-laws-"));
  try {
    const allFound = [];
    for (const target of TARGETS) {
      allFound.push(...(await fetchLaw(target, tmpDir)));
    }

    if (allFound.length === 0) {
      console.error("✗ Keine Paragraphen extrahiert — data/lawLibrary.json nicht verändert.");
      process.exit(1);
    }

    if (DRY_RUN) {
      console.log(`\n--dry-run: ${allFound.length} Einträge gefunden, nicht geschrieben.`);
      for (const e of allFound) {
        console.log(`\n${e.paragraph} ${e.gesetz}${e.title ? ` — ${e.title}` : ""}`);
        console.log(e.text.slice(0, 300) + (e.text.length > 300 ? "…" : ""));
      }
      return;
    }

    const library = readLibrary();
    const { entries, added, updated } = upsertEntries(library.entries, allFound);
    writeLibrary({ updatedAt: new Date().toISOString(), source: "gesetze-im-internet", entries });
    console.log(`\n✓ data/lawLibrary.json aktualisiert: ${added} neu, ${updated} aktualisiert.`);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

export { normalizeParagraph, paragraphNumber, findNorms, extractText, extractXmlFromZip };

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  });
}
