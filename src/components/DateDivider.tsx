export default function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center justify-center">
      <span className="rounded-full bg-surface px-3 py-1 font-sans text-xs text-muted">
        {label}
      </span>
    </div>
  );
}
