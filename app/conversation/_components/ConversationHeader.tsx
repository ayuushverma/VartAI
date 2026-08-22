type ConversationHeaderProps = {
  isEnding?: boolean;
  onEndConversation: () => void;
  scenario: string;
};

export function ConversationHeader({
  isEnding = false,
  onEndConversation,
  scenario,
}: ConversationHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="text-sm font-medium text-[#f7d77a]">Conversation</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {scenario}
        </h1>
      </div>

      <button
        className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={isEnding}
        onClick={onEndConversation}
        type="button"
      >
        {isEnding ? "Evaluating..." : "End conversation"}
      </button>
    </header>
  );
}
