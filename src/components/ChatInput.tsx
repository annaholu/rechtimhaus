"use client";

import { useRef } from "react";

export default function ChatInput({
  value,
  onChangeValue,
  placeholder,
  disabled,
  showAttach,
  onSend,
  onAttach,
}: {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  showAttach?: boolean;
  onSend: (text: string) => void;
  onAttach?: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onChangeValue("");
  }

  return (
    <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        {showAttach && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAttach?.(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              aria-label="Datei anhängen"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-lg text-foreground hover:border-accent hover:text-accent"
            >
              <span aria-hidden>📎</span>
            </button>
          </>
        )}
        <div className="flex flex-1 items-center rounded-full border border-border bg-surface px-4 py-2.5">
          <input
            value={value}
            disabled={disabled}
            onChange={(e) => onChangeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent font-serif text-[15px] text-foreground placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          aria-label="Senden"
          disabled={disabled || !value.trim()}
          onClick={handleSend}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-lg text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>↑</span>
        </button>
      </div>
    </div>
  );
}
