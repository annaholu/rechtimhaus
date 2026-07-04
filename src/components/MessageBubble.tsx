import type { ChatMessage } from "@/lib/types";
import ChipGroup from "./ChipGroup";

export default function MessageBubble({
  message,
  onChipSelect,
}: {
  message: Extract<ChatMessage, { kind: "text" }>;
  onChipSelect?: (value: string) => void;
}) {
  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-user-bubble px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[85%]">
      <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground">
        {message.text}
      </p>
      {message.chips && message.chips.length > 0 && (
        <ChipGroup
          options={message.chips}
          disabled={message.chipsDisabled}
          onSelect={(v) => onChipSelect?.(v)}
        />
      )}
    </div>
  );
}
