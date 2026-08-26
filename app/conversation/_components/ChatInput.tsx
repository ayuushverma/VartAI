"use client";

type ChatInputProps = {
  disabled?: boolean;
  isListening?: boolean;
  isVoiceSupported?: boolean;
  voiceError?: string | null;
  message: string;
  mode: "text" | "voice";
  onChange: (message: string) => void;
  onModeChange: (mode: "text" | "voice") => void;
  onSend: () => void;
  onToggleListening: () => void;
};

export function ChatInput({
  disabled = false,
  isListening = false,
  isVoiceSupported = false,
  voiceError = null,
  message,
  mode,
  onChange,
  onModeChange,
  onSend,
  onToggleListening,
}: ChatInputProps) {
  return (
    <form
      className="border-t border-white/10 bg-black/20 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          aria-pressed={mode === "text"}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "text" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
          onClick={() => onModeChange("text")}
          type="button"
        >
          Text mode
        </button>
        <button
          aria-pressed={mode === "voice"}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "voice" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
          onClick={() => onModeChange("voice")}
          type="button"
        >
          Voice mode
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[var(--blue)]"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={mode === "voice" ? "Review your transcript..." : "Type your reply..."}
          value={message}
        />

        {mode === "voice" ? (
          <button
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={`v-button-secondary px-4 py-3 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? "v-listening text-[var(--coral)]" : ""}`}
            disabled={disabled || !isVoiceSupported}
            onClick={onToggleListening}
            type="button"
          >
            {isListening ? "Listening..." : "Speak"}
          </button>
        ) : null}

        <button
          className="v-button px-5 py-3 text-sm font-semibold text-[#1b1110] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || message.trim().length === 0}
          type="submit"
        >
          Send
        </button>
      </div>

      {mode === "voice" && !isVoiceSupported ? (
        <p className="mt-3 text-xs text-slate-400">Voice input isn&apos;t supported in this browser. You can still type.</p>
      ) : null}
      {mode === "voice" && voiceError ? <p className="mt-3 text-xs text-red-200">{voiceError}</p> : null}
    </form>
  );
}
