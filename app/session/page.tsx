"use client";

import Link from "next/link";
import { useSessionEvaluationStore } from "@/lib/sessionEvaluationStore";
import { Celebration } from "@/app/_components/Celebration";
import { PageNavigation } from "@/app/_components/PageNavigation";

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
      <main className="v-page text-white">
        <section className="v-shell mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xl font-bold tracking-tight">
              Vart<span className="text-[#4f8cff]">AI</span>
            </div>
            <PageNavigation />
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
              className="v-button px-5 py-3 text-center text-sm font-semibold text-[#1b1110]"
              href="/practice"
            >
              Start conversation
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="text-xl font-bold tracking-tight">
            Vart<span className="text-[#4f8cff]">AI</span>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <PageNavigation />
            <div className="sm:text-right">
              <p className="v-eyebrow">Session complete</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {scenario || "Daily Conversation"}
              </h1>
              {evaluation.earnedXp ? (
                <p className="mt-4 text-sm font-semibold text-[var(--lime)]">
                  +{evaluation.earnedXp} XP earned from this session
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          {evaluation.earnedXp ? (
            <div className="lg:col-span-2">
              <Celebration
                detail="Your completed evaluation added real learning progress."
                label={`+${evaluation.earnedXp} XP earned`}
              />
            </div>
          ) : null}
          <section className="v-stagger grid gap-4 sm:grid-cols-2">
            {scoreLabels.map((score) => (
              <article
                className="v-card p-5"
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
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--coral),var(--blue))]"
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
                className="v-button px-5 py-3 text-center text-sm font-semibold text-[#1b1110]"
                href="/practice"
              >
                Practice again
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
    <article className="v-panel p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
