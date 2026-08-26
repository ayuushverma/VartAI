type AIAvatarProps = {
  status?: "idle" | "listening" | "thinking" | "speaking" | "success";
};

export function AIAvatar({ status = "idle" }: AIAvatarProps) {
  const statusLabel = {
    idle: "Ready when you are",
    listening: "Listening to you",
    thinking: "Thinking through a reply",
    speaking: "Speaking now",
    success: "Nice work",
  }[status];

  return (
    <section className="v-panel p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--blue)] text-xl font-bold text-[#071018] shadow-lg shadow-[var(--blue)]/20 ${status === "speaking" ? "v-speaking" : ""} ${status === "listening" ? "v-listening" : ""}`}>
          VA
        </div>

        <div>
          <p className="v-eyebrow">AI communicator</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">VartAI</h2>
          <p className="mt-1 text-sm text-slate-400">English practice coach</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-medium text-slate-300">
          {statusLabel}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Speak naturally, use complete sentences, and keep the conversation
          moving.
        </p>
      </div>
    </section>
  );
}
