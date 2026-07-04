export default function UploadAckCard({
  fileName,
  note,
}: {
  fileName: string;
  note: string;
}) {
  return (
    <div className="max-w-[85%] rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <div className="flex items-center gap-2 font-sans text-sm font-medium text-foreground">
        <span aria-hidden>📎</span>
        <span>{fileName}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{note}</p>
    </div>
  );
}
