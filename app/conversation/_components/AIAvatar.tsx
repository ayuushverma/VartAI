export function AIAvatar() {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0c1015] p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#4f8cff] text-xl font-bold shadow-lg shadow-[#4f8cff]/20">
          VA
        </div>

        <div>
          <p className="text-sm font-medium text-[#f7d77a]">AI communicator</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">VartAI</h2>
          <p className="mt-1 text-sm text-slate-400">English practice coach</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-medium text-slate-300">
          Focus for this session
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Speak naturally, use complete sentences, and keep the conversation
          moving.
        </p>
      </div>
    </section>
  );
}
