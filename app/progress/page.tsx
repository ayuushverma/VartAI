import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getGamificationSummary, GamificationSummary } from "@/lib/gamification";
import { PageNavigation } from "@/app/_components/PageNavigation";

export const dynamic = "force-dynamic";

type ScoreKey = "fluency" | "grammar" | "vocabulary" | "communication";
const scoreLabels: { key: ScoreKey; label: string }[] = [
  { key: "fluency", label: "Fluency" },
  { key: "grammar", label: "Grammar" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "communication", label: "Communication" },
];

export default async function ProgressPage() {
  const session = await auth();
  const data = await getProgressData(session?.user?.id);
  const averageScores = data.averageScores;
  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div><p className="v-eyebrow">Progress report</p><h1 className="v-display mt-2 text-4xl font-semibold">Your learning history</h1></div>
          <PageNavigation />
        </header>
        {data.error ? <EmptyState message="Progress is temporarily unavailable." /> : data.sessions.length === 0 ? <EmptyState message="Complete a conversation to see your progress here." /> : (
          <div className="v-stagger space-y-5 p-5 sm:p-8">
            <section className="grid gap-4 sm:grid-cols-2">
              <Summary label="Total sessions" value={String(data.sessions.length)} />
              <Summary label="Latest session" value={data.sessions[0].scenario} />
            </section>
            {averageScores ? <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {scoreLabels.map((score) => <article className="v-card p-5" key={score.key}><p className="text-sm font-medium text-slate-400">Average {score.label}</p><p className="mt-3 text-4xl font-semibold text-[var(--blue)]">{averageScores[score.key]}</p></article>)}
            </section> : null}
            <GamificationPanel gamification={data.gamification} />
            <section className="v-card p-5">
              <h2 className="text-base font-semibold">Completed sessions</h2>
              <div className="mt-4 divide-y divide-white/10">{data.sessions.map((session) => <div className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between" key={session.id}><div><p className="font-medium">{session.scenario}</p><p className="mt-1 text-sm text-slate-400">{session.createdAt.toLocaleDateString()}</p></div><span className="text-sm text-slate-300">{session.hasEvaluation ? "Evaluation saved" : "Evaluation unavailable"}</span></div>)}</div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <article className="rounded-xl border border-[rgba(197,232,108,.5)] bg-[var(--lime)] p-5 text-[#151b0b]"><p className="text-sm font-semibold uppercase tracking-[0.12em]">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></article>; }
function GamificationPanel({ gamification }: { gamification: GamificationSummary }) { return <section className="v-card space-y-5 p-5"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-slate-400">Learning XP</p><p className="mt-2 text-3xl font-semibold text-[var(--blue)]">{gamification.xp}</p></div><div><p className="text-sm text-slate-400">Daily goal</p><p className="mt-2 text-3xl font-semibold text-[var(--blue)]">{gamification.todayProgress}/{gamification.dailyGoal}</p></div><div><p className="text-sm text-slate-400">Current streak</p><p className="mt-2 text-3xl font-semibold text-[var(--blue)]">{gamification.currentStreak} {gamification.currentStreak === 1 ? "day" : "days"}</p></div></div><div><h2 className="text-base font-semibold">Milestones</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{gamification.milestones.map((milestone) => <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4" key={milestone.id}><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{milestone.title}</p><span className="text-xs text-slate-400">{milestone.progress}/{milestone.target}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{milestone.description}</p></div>)}</div></div><div><h2 className="text-base font-semibold">Achievements</h2><div className="mt-3 flex flex-wrap gap-2">{gamification.achievements.map((achievement) => <span className={`rounded-full px-3 py-2 text-xs font-semibold ${achievement.unlocked ? "bg-[var(--lime)] text-[#151b0b]" : "bg-white/10 text-slate-400"}`} key={achievement.id}>{achievement.unlocked ? "Unlocked: " : "Locked: "}{achievement.title}</span>)}</div></div></section>; }
function EmptyState({ message }: { message: string }) { return <div className="p-5 sm:p-8"><section className="v-card p-8 text-center"><h2 className="v-display text-2xl font-semibold">No progress to show</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">{message}</p><Link className="v-button mt-6 inline-block px-5 py-3 text-sm font-semibold text-[#1b1110]" href="/practice">Start practicing</Link></section></div>; }

async function getProgressData(userId?: string) {
  try {
    if (!userId) throw new Error("Not signed in");
    const [sessions, gamification] = await Promise.all([
      db.conversation.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, select: { id: true, scenario: true, startedAt: true, sessionEvaluation: { select: { fluency: true, grammar: true, vocabulary: true, communication: true, createdAt: true } } } }),
      getGamificationSummary(userId, "UTC"),
    ]);
    const evaluations = sessions.flatMap((session) => session.sessionEvaluation ? [session.sessionEvaluation] : []);
    const averageScores = evaluations.length > 0 ? scoreLabels.reduce((averages, { key }) => ({ ...averages, [key]: Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation[key], 0) / evaluations.length) }), {} as Record<ScoreKey, number>) : null;
    return { error: false, averageScores, gamification, sessions: sessions.map((session) => ({ id: session.id, scenario: session.scenario, hasEvaluation: Boolean(session.sessionEvaluation), createdAt: session.sessionEvaluation?.createdAt ?? session.startedAt })) };
  } catch (error) {
    console.error("Progress data retrieval failed:", error);
    return { error: true, averageScores: null, gamification: { xp: 0, todayProgress: 0, dailyGoal: 1, dailyGoalComplete: false, currentStreak: 0, milestones: [], achievements: [], nextMilestone: null }, sessions: [] };
  }
}