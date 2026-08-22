export type LearningFeedback = {
  grammar: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  vocabulary: {
    word: string;
    meaning: string;
    example: string;
  }[];
  fluency_notes: string[];
};

export type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  feedback?: LearningFeedback;
};

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
          isUser
            ? "bg-[#4f8cff] text-white"
            : "border border-white/10 bg-white/[0.05] text-slate-200"
        }`}
      >
        {message.text}
      </div>

      {!isUser && message.feedback ? (
        <FeedbackPanel feedback={message.feedback} />
      ) : null}
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: LearningFeedback }) {
  const hasFeedback =
    feedback.grammar.length > 0 ||
    feedback.vocabulary.length > 0 ||
    feedback.fluency_notes.length > 0;

  if (!hasFeedback) {
    return null;
  }

  return (
    <div className="mt-2 max-w-[85%] rounded-lg border border-[#f7d77a]/20 bg-[#f7d77a]/10 p-4 text-sm text-slate-200 sm:max-w-[70%]">
      <p className="font-semibold text-[#f7d77a]">Feedback</p>

      {feedback.grammar.map((item) => (
        <div className="mt-3" key={`${item.original}-${item.correction}`}>
          <p className="text-slate-400">{item.original}</p>
          <p className="font-medium text-white">{item.correction}</p>
          <p className="mt-1 text-slate-400">{item.explanation}</p>
        </div>
      ))}

      {feedback.vocabulary.map((item) => (
        <div className="mt-3" key={item.word}>
          <p className="font-medium text-white">{item.word}</p>
          <p className="text-slate-400">{item.meaning}</p>
          <p className="mt-1 text-slate-400">{item.example}</p>
        </div>
      ))}

      {feedback.fluency_notes.map((note) => (
        <p className="mt-3 text-slate-400" key={note}>
          {note}
        </p>
      ))}
    </div>
  );
}
