import { PageNavigation } from "@/app/_components/PageNavigation";

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
    <header className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="v-eyebrow">Live practice</p>
        <h1 className="v-display mt-2 text-3xl font-semibold tracking-tight">
          {scenario}
        </h1>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <PageNavigation />
        <button
          className="v-button-secondary w-full min-h-11 px-4 py-3 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          disabled={isEnding}
          onClick={onEndConversation}
          type="button"
        >
          {isEnding ? "Evaluating..." : "End conversation"}
        </button>
      </div>
    </header>
  );
}
