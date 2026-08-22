"use client";

type ChatInputProps = {
  disabled?: boolean;
  message: string;
  onChange: (message: string) => void;
  onSend: () => void;
};

export function ChatInput({
  disabled = false,
  message,
  onChange,
  onSend,
}: ChatInputProps) {
  return (
    <form
      className="flex gap-3 border-t border-white/10 bg-[#0c1015] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <input
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#4f8cff]"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your reply..."
        value={message}
      />

      <button
        className="rounded-md bg-[#4f8cff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e7bef] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || message.trim().length === 0}
        type="submit"
      >
        Send
      </button>
    </form>
  );
}
