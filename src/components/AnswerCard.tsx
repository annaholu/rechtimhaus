import type { FreeAnswer } from "@/lib/types";

export default function AnswerCard({
  answer,
  escalation,
}: {
  answer: FreeAnswer;
  escalation?: string;
}) {
  return (
    <div className="max-w-[85%]">
      <p className="text-[15px] leading-relaxed text-foreground">{answer.text}</p>
      {answer.citation && (
        <p className="mt-2 font-sans text-sm">
          {answer.citation.href ? (
            <a
              href={answer.citation.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline underline-offset-2"
            >
              {answer.citation.label}
            </a>
          ) : (
            <span className="font-medium text-muted">{answer.citation.label}</span>
          )}
          {answer.citation.lowConfidence && (
            <span className="ml-1.5 italic text-muted">
              (Stand hier nicht sicher belegt)
            </span>
          )}
        </p>
      )}
      {answer.hinweis && (
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">
          <span className="font-medium">Wo Vorsicht geboten ist:</span> {answer.hinweis}
        </p>
      )}
      {escalation && (
        <p className="mt-3 text-[15px] leading-relaxed text-foreground">{escalation}</p>
      )}
    </div>
  );
}
