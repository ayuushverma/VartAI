"use client";

import Link from "next/link";
import { useSessionEvaluationStore } from "@/lib/sessionEvaluationStore";

const scoreLabels = [
  { key: "fluency", label: "Fluency" },
  { key: "grammar", label: "Grammar" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "communication", label: "Communication" },
] as const;

export default function SessionPage() {
  const evaluation = useSessionEvaluationStore((state) => state.evaluation);
  const scenario = useSessionEvaluationStore((state) => state.scenario);

  if (!evaluation) {
    return (
      <main className="min-h-screen bg-[#07090c] px-5 py-6 text-white sm:px-8">
        <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center rounded-lg border border-white/10 bg-[#10141a] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="text-xl font-bold tracking-tight">
            Vart<span className="text-[#4f8cff]">AI</span>
          </div>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">
            No session result yet
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Complete a conversation first, then VartAI will show your learning
            report here.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-md bg-[#4f8cff] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3e7bef]"
              href="/conversation"
            >
              Start conversation
            </Link>
            <Link
              className="rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              href="/"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090c] px-5 py-6 text-white sm:px-8">
      <section className="mx-auto min-h-[calc(100vh-3rem)] max-w-7xl rounded-lg border border-white/10 bg-[#10141a] shadow-2xl shadow-black/30">
        <header className="border-b border-white/10 px-5 py-5 sm:px-8">
          <div className="text-xl font-bold tracking-tight">
            Vart<span className="text-[#4f8cff]">AI</span>
          </div>
          <p className="mt-8 text-sm font-medium text-[#f7d77a]">
            Session complete
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {scenario || "Daily Conversation"}
          </h1>
        </header>

        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid gap-4 sm:grid-cols-2">
            {scoreLabels.map((score) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
                key={score.key}
              >
                <p className="text-sm font-medium text-slate-400">
                  {score.label}
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  {evaluation.scores[score.key]}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#4f8cff]"
                    style={{ width: `${evaluation.scores[score.key]}%` }}
                  />
                </div>
              </article>
            ))}
          </section>

          <section className="space-y-4">
            <ResultList title="Strengths" items={evaluation.strengths} />
            <ResultList
              title="Areas to improve"
              items={evaluation.areas_to_improve}
            />
            <ResultList
              title="Recommendations"
              items={evaluation.recommendations}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                className="rounded-md bg-[#4f8cff] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3e7bef]"
                href="/conversation"
              >
                Practice again
              </Link>
              <Link
                className="rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                href="/"
              >
                Back to dashboard
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#0c1015] p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
