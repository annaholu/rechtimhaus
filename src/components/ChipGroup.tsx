import type { ChipOption } from "@/lib/types";

export default function ChipGroup({
  options,
  disabled,
  onSelect,
}: {
  options: ChipOption[];
  disabled?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt.value)}
          className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-sans text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
