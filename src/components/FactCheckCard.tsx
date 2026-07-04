import type { Einschaetzung, FactCheckRow } from "@/lib/types";

const BADGE_STYLES: Record<Einschaetzung, string> = {
  zutreffend: "bg-accent-soft text-accent",
  "teilweise zutreffend": "bg-[#f2e6cf] text-[#8a6a2a]",
  "unklar – hängt vom Fall ab": "bg-surface text-muted",
  "nicht belegt": "bg-[#f3e2da] text-[#9c5340]",
};

export default function FactCheckCard({
  rows,
  escalation,
}: {
  rows: FactCheckRow[];
  escalation?: string;
}) {
  return (
    <div className="max-w-full font-sans">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-3 text-sm"
          >
            <p className="mb-2 font-medium text-foreground">
              &ldquo;{row.behauptung}&rdquo;
            </p>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_STYLES[row.einschaetzung]}`}
              >
                {row.einschaetzung}
              </span>
              {row.rechtsgrundlage.href ? (
                <a
                  href={row.rechtsgrundlage.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-accent underline underline-offset-2"
                >
                  {row.rechtsgrundlage.label}
                </a>
              ) : (
                <span className="text-xs font-medium text-muted">
                  {row.rechtsgrundlage.label}
                </span>
              )}
              {row.rechtsgrundlage.lowConfidence && (
                <span className="text-xs italic text-muted">
                  (Stand hier nicht sicher belegt)
                </span>
              )}
            </div>
            <p className="mb-1.5 text-[13px] leading-relaxed text-foreground/90">
              {row.kurzbegruendung}
            </p>
            <p className="text-[13px] leading-relaxed text-muted">
              <span className="font-medium">Vorsicht:</span> {row.vorsicht}
            </p>
          </div>
        ))}
      </div>
      {escalation && (
        <p className="mt-3 max-w-[85%] font-serif text-[15px] leading-relaxed text-foreground">
          {escalation}
        </p>
      )}
    </div>
  );
}
