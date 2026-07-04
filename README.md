# Recht im Haus

A clarity tool for owners, renters, and landlords navigating German housing law
(WEG-Recht, Mietrecht, Nachbarrecht). See `PRD.md`-style context in the project
brief for full scope.

**Status:** Phase 1 UI shell — the chat flow (Rolle → Bundesland → Situation →
Hausordnung-Upload → Aktion → Antwort) is wired up with a mocked answer engine
(`src/lib/mockEngine.ts`, `src/lib/legalData.ts`) so the interface can be
reviewed end-to-end. No LLM or live legal database is connected yet, and
Hausordnung uploads are acknowledged but not actually parsed (no OCR).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/page.tsx` — chat flow state machine
- `src/components/` — chat bubbles, chip groups, fact-check/answer cards, input bar, top bar
- `src/lib/types.ts` — shared types
- `src/lib/constants.ts` — roles, Bundesländer, situation tags
- `src/lib/legalData.ts` — demo statute/Landesnachbarrecht reference data (illustrative, not live-sourced)
- `src/lib/mockEngine.ts` — claim extraction + mocked fact-check/answer generation
