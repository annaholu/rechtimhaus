"use client";

import { useRef, useState } from "react";
import { BUNDESLAENDER, ROLES, SITUATION_TAGS } from "@/lib/constants";
import { buildFactCheckRows, buildFreeAnswer, detectEscalation } from "@/lib/mockEngine";
import type {
  Bundesland,
  ChatMessage,
  ChipOption,
  Role,
  SituationTag,
} from "@/lib/types";
import TopBar from "@/components/TopBar";
import MessageBubble from "@/components/MessageBubble";
import FactCheckCard from "@/components/FactCheckCard";
import AnswerCard from "@/components/AnswerCard";
import UploadAckCard from "@/components/UploadAckCard";
import DateDivider from "@/components/DateDivider";
import ChatInput from "@/components/ChatInput";

type Phase =
  | "ask-rolle"
  | "ask-bundesland"
  | "ask-situation"
  | "ask-hausordnung"
  | "ask-aktion"
  | "ask-factcheck-input"
  | "ask-question-input";

const ROLE_CHIPS: ChipOption[] = ROLES.map((r) => ({ label: r, value: r }));
const BUNDESLAND_CHIPS: ChipOption[] = BUNDESLAENDER.map((b) => ({ label: b, value: b }));
const TAG_CHIPS: ChipOption[] = SITUATION_TAGS.map((t) => ({ label: t, value: t }));
const AKTION_CHIPS: ChipOption[] = [
  { label: "Fact-check", value: "Fact-check" },
  { label: "Frage stellen", value: "Frage stellen" },
];
const HAUSORDNUNG_CHIPS: ChipOption[] = [{ label: "Überspringen", value: "skip" }];
const FOLLOWUP_CHIPS: ChipOption[] = [
  { label: "Frage stellen", value: "Frage stellen" },
  { label: "Fact-check", value: "Fact-check" },
  { label: "Rolle/Bundesland ändern", value: "restart-context" },
];

const WELCOME_TEXT =
  "Hallo. Ich helfe dir einzuordnen, ob eine Behauptung zu WEG-Recht, Mietrecht oder Nachbarrecht wirklich eine gesetzliche Grundlage hat — als erste, vorsichtige Einschätzung, nicht als Ersatz für eine Beratung.\n\nZum Start: Was bist du in dieser Sache?";
const BUNDESLAND_PROMPT = "In welchem Bundesland ist die Immobilie bzw. Wohnung?";
const SITUATION_PROMPT =
  "Beschreib kurz die Situation. Du kannst auch eins der Stichworte antippen, um die Formulierung anzustoßen — schreib danach einfach weiter im Feld unten.";
const HAUSORDNUNG_PROMPT =
  "Hast du eine Hausordnung oder Gemeinschaftsordnung für dieses Haus? Du kannst sie unten anhängen (PDF, Foto oder Word) — hilft besonders bei Fragen zu Hausregeln. Optional, du kannst auch überspringen.";
const AKTION_PROMPT = "Was möchtest du tun?";
const FACTCHECK_INPUT_PROMPT =
  "Füge die Nachricht, E-Mail oder den Ausschnitt ein, den du prüfen möchtest.";
const QUESTION_INPUT_PROMPT = "Was möchtest du wissen?";
const NEW_CHECK_PROMPT = "Neuer Check — was möchtest du als Nächstes tun?";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function initialMessages(): ChatMessage[] {
  return [
    {
      id: makeId(),
      sender: "assistant",
      kind: "text",
      text: WELCOME_TEXT,
      chips: ROLE_CHIPS,
      chipsDisabled: false,
    },
  ];
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [phase, setPhase] = useState<Phase>("ask-rolle");
  const [role, setRole] = useState<Role>();
  const [bundesland, setBundesland] = useState<Bundesland>();
  const [sessionTags, setSessionTags] = useState<SituationTag[]>([]);
  const [pendingTags, setPendingTags] = useState<SituationTag[]>([]);
  const [hausordnungFileName, setHausordnungFileName] = useState<string>();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function disableAllChips(msgs: ChatMessage[]): ChatMessage[] {
    return msgs.map((m) =>
      m.kind === "text" && m.sender === "assistant" ? { ...m, chipsDisabled: true } : m
    );
  }

  function pushUserText(text: string) {
    setMessages((prev) => [
      ...disableAllChips(prev),
      { id: makeId(), sender: "user", kind: "text", text },
    ]);
  }

  function pushAssistantText(text: string, chips?: ChipOption[]) {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), sender: "assistant", kind: "text", text, chips, chipsDisabled: false },
    ]);
    scrollToBottom();
  }

  function pushUploadAck(fileName: string, note: string) {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), sender: "assistant", kind: "upload-ack", fileName, note },
    ]);
  }

  function resetAll() {
    setMessages(initialMessages());
    setPhase("ask-rolle");
    setRole(undefined);
    setBundesland(undefined);
    setSessionTags([]);
    setPendingTags([]);
    setHausordnungFileName(undefined);
    setInputValue("");
  }

  function handleNewCheck() {
    setMessages((prev) => [
      ...disableAllChips(prev),
      {
        id: makeId(),
        sender: "assistant",
        kind: "text",
        text: NEW_CHECK_PROMPT,
        chips: AKTION_CHIPS,
        chipsDisabled: false,
      },
    ]);
    setPhase("ask-aktion");
    scrollToBottom();
  }

  function handleChipSelect(value: string) {
    if (phase === "ask-situation") {
      const tag = value as SituationTag;
      setPendingTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
      setInputValue((prev) => (prev ? `${prev} ${tag}` : tag));
      return;
    }

    setMessages((prev) => disableAllChips(prev));

    switch (phase) {
      case "ask-rolle": {
        pushUserText(value);
        setRole(value as Role);
        pushAssistantText(BUNDESLAND_PROMPT, BUNDESLAND_CHIPS);
        setPhase("ask-bundesland");
        break;
      }
      case "ask-bundesland": {
        pushUserText(value);
        setBundesland(value as Bundesland);
        pushAssistantText(SITUATION_PROMPT, TAG_CHIPS);
        setPhase("ask-situation");
        break;
      }
      case "ask-hausordnung": {
        pushUserText("Überspringen");
        pushAssistantText(AKTION_PROMPT, AKTION_CHIPS);
        setPhase("ask-aktion");
        break;
      }
      case "ask-aktion": {
        if (value === "restart-context") {
          resetAll();
          return;
        }
        pushUserText(value);
        if (value === "Fact-check") {
          pushAssistantText(FACTCHECK_INPUT_PROMPT);
          setPhase("ask-factcheck-input");
        } else {
          pushAssistantText(QUESTION_INPUT_PROMPT);
          setPhase("ask-question-input");
        }
        break;
      }
      default:
        break;
    }
  }

  function handleAttach(file: File) {
    setHausordnungFileName(file.name);
    setMessages((prev) => disableAllChips(prev));
    pushUploadAck(
      file.name,
      "Datei erhalten. In dieser Demo wird der Inhalt nicht wirklich ausgelesen (kein OCR/Textextraktion) — im fertigen Produkt würde hier gezielt aus deiner Hausordnung zitiert."
    );
    pushAssistantText(AKTION_PROMPT, AKTION_CHIPS);
    setPhase("ask-aktion");
  }

  function handleSend(text: string) {
    if (phase === "ask-situation") {
      pushUserText(text);
      setSessionTags(pendingTags);
      pushAssistantText(HAUSORDNUNG_PROMPT, HAUSORDNUNG_CHIPS);
      setPhase("ask-hausordnung");
      return;
    }

    if (phase === "ask-factcheck-input") {
      pushUserText(text);
      const rows = buildFactCheckRows(text, sessionTags, bundesland);
      const escalation = detectEscalation(text, sessionTags);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), sender: "assistant", kind: "factcheck", rows, escalation },
      ]);
      pushAssistantText("Möchtest du noch etwas prüfen?", FOLLOWUP_CHIPS);
      setPhase("ask-aktion");
      scrollToBottom();
      return;
    }

    if (phase === "ask-question-input") {
      pushUserText(text);
      const answer = buildFreeAnswer(text, sessionTags, bundesland, hausordnungFileName);
      const escalation = detectEscalation(text, sessionTags);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), sender: "assistant", kind: "answer", answer, escalation },
      ]);
      pushAssistantText("Möchtest du noch etwas prüfen?", FOLLOWUP_CHIPS);
      setPhase("ask-aktion");
      scrollToBottom();
      return;
    }
  }

  const textInputEnabled =
    phase === "ask-situation" || phase === "ask-factcheck-input" || phase === "ask-question-input";
  const placeholder =
    phase === "ask-situation"
      ? "Was ist passiert?"
      : phase === "ask-factcheck-input"
        ? "Nachricht hier einfügen …"
        : phase === "ask-question-input"
          ? "Was möchtest du wissen?"
          : "Was möchtest du prüfen?";

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        role={role}
        bundesland={bundesland}
        hausordnungFileName={hausordnungFileName}
        onNewCheck={handleNewCheck}
        onResetAll={resetAll}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-5">
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-center font-sans text-xs text-muted">
          Demo-Modus: Antworten hier sind Beispieldaten für die Oberfläche, keine echte
          Rechtsberatung und noch nicht mit einer echten Rechtsdatenbank verbunden.
        </p>
        <DateDivider label="Heute" />

        {messages.map((m) => {
          if (m.kind === "text") {
            return <MessageBubble key={m.id} message={m} onChipSelect={handleChipSelect} />;
          }
          if (m.kind === "upload-ack") {
            return <UploadAckCard key={m.id} fileName={m.fileName} note={m.note} />;
          }
          if (m.kind === "factcheck") {
            return <FactCheckCard key={m.id} rows={m.rows} escalation={m.escalation} />;
          }
          if (m.kind === "answer") {
            return <AnswerCard key={m.id} answer={m.answer} escalation={m.escalation} />;
          }
          return null;
        })}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={inputValue}
        onChangeValue={setInputValue}
        placeholder={placeholder}
        disabled={!textInputEnabled}
        showAttach={phase === "ask-hausordnung"}
        onSend={handleSend}
        onAttach={handleAttach}
      />
    </div>
  );
}
