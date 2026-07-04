"use client";

import { useState } from "react";
import type { Bundesland, Role } from "@/lib/types";

export default function TopBar({
  role,
  bundesland,
  hausordnungFileName,
  onNewCheck,
  onResetAll,
}: {
  role?: Role;
  bundesland?: Bundesland;
  hausordnungFileName?: string;
  onNewCheck: () => void;
  onResetAll: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <button
          type="button"
          aria-label="Sitzungsinfo"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface"
        >
          <span aria-hidden className="text-lg">
            ☰
          </span>
        </button>
        <h1 className="font-serif text-base font-medium text-foreground">
          Recht im Haus
        </h1>
        <button
          type="button"
          aria-label="Neuer Check"
          onClick={onNewCheck}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-foreground hover:bg-surface"
        >
          <span aria-hidden>＋</span>
        </button>
      </div>
      {menuOpen && (
        <div className="mx-auto max-w-2xl px-4 pb-3 font-sans text-sm">
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-muted">
              Rolle: <span className="text-foreground">{role ?? "—"}</span>
            </p>
            <p className="mt-1 text-muted">
              Bundesland: <span className="text-foreground">{bundesland ?? "—"}</span>
            </p>
            <p className="mt-1 text-muted">
              Hausordnung:{" "}
              <span className="text-foreground">
                {hausordnungFileName ?? "nicht hochgeladen"}
              </span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Nichts aus dieser Sitzung wird darüber hinaus gespeichert.
            </p>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onResetAll();
              }}
              className="mt-3 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-accent hover:text-accent"
            >
              Sitzung neu starten
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
