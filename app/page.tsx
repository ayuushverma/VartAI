import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getGamificationSummary } from "@/lib/gamification";
import { LandingPage } from "@/app/_components/LandingPage";

export const dynamic = "force-dynamic";

const navigation = [
  ["Home", "/"],
  ["Practice", "/practice"],
  ["Progress", "/progress"],
  ["Settings", "/settings"],
] as const;

export default async function Home() {
  const session = await auth();
  if (!session) return <LandingPage />;

  const userId = session?.user?.id;
  const [latestSession, gamification] = await Promise.all([
    getLatestSession(userId),
    getHomeGamification(userId),
  ]);

  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-black/20 p-5 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-[#1b1110]">V</span>
            Vart<span className="text-[var(--blue)]">AI</span>
          </div>

          <nav className="mt-8 flex gap-1 overflow-x-auto lg:block lg:space-y-1">
            {navigation.map(([label, href]) => (
              <Link
                className={`block whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium transition hover:bg-white/5 hover:text-white ${label === "Home" ? "bg-white/10 text-white" : "text-slate-400"}`}
                href={href}
                key={label}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
            <div>
              <p className="v-eyebrow">Your language studio</p>
              <h1 className="v-display mt-2 text-4xl font-semibold sm:text-5xl">Make today a speaking day.</h1>
            </div>

            <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-400 sm:block">{session?.user?.name || session?.user?.email}</p>
            <Link
              className="v-button px-4 py-3 text-sm font-semibold text-[#1b1110]"
              href="/practice"
            >
              Start practice
            </Link>
            </div>
          </header>

          <div className="v-stagger grid gap-5 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="v-card p-6 sm:p-8">
              <p className="v-eyebrow">A little practice goes far</p>
              <h2 className="v-display mt-4 max-w-xl text-3xl font-semibold sm:text-4xl">
                Build confidence one real conversation at a time.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Choose a situation, find your words, and get useful feedback after the conversation.
              </p>
            </section>

            <section className="rounded-lg border border-[rgba(197,232,108,.5)] bg-[var(--lime)] p-6 text-[#151b0b]">
              <p className="text-sm font-bold uppercase tracking-[0.14em]">Continue learning</p>
              {latestSession ? (
                <>
                  <p className="mt-4 text-xl font-semibold">
                    {latestSession.scenario}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Your latest completed session is ready to review.
                  </p>
                  <Link
                    className="mt-5 inline-block rounded-lg bg-[#151b0b] px-4 py-3 text-sm font-semibold text-[var(--lime)]"
                    href="/progress"
                  >
                    View progress
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-4 text-2xl font-semibold">No conversations yet</p>
                  <p className="mt-2 text-sm font-medium">
                    Start a session to begin building your learning history.
                  </p>
                  <Link
                    className="mt-5 inline-block rounded-lg bg-[#151b0b] px-4 py-3 text-sm font-semibold text-[var(--lime)]"
                    href="/practice"
                  >
                    Start practicing
                  </Link>
                </>
              )}
            </section>

            <section className="v-card grid gap-5 p-6 sm:grid-cols-3 lg:col-span-2">
              <Metric label="Learning XP" value={String(gamification.xp)} detail="earned from evaluations" />
              <Metric label="Today" value={`${gamification.todayProgress}/${gamification.dailyGoal}`} detail={gamification.dailyGoalComplete ? "Daily goal complete" : "conversation goal"} />
              <Metric label="Current streak" value={`${gamification.currentStreak} ${gamification.currentStreak === 1 ? "day" : "days"}`} detail="based on completed learning" />
              {gamification.nextMilestone ? <div className="sm:col-span-3"><p className="v-eyebrow">Next milestone</p><p className="mt-2 text-lg font-semibold">{gamification.nextMilestone.title}</p><p className="mt-1 text-sm text-slate-400">{gamification.nextMilestone.progress}/{gamification.nextMilestone.target} {gamification.nextMilestone.description.toLowerCase()}</p></div> : null}
            </section>

            <section className="space-y-3 lg:col-span-2">
              <Link
                className="v-card block p-6"
                href="/practice"
              >
                <p className="v-eyebrow">Your next move</p>
                <h2 className="mt-2 text-2xl font-semibold">Talk to VartAI</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Start a live speaking session with your AI partner.
                </p>
              </Link>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-semibold text-[var(--blue)]">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

async function getLatestSession(userId?: string) {
  try {
    if (!userId) return null;
    return await db.conversation.findFirst({
      where: { userId },
      orderBy: { startedAt: "desc" },
      select: { scenario: true },
    });
  } catch (error) {
    console.error("Dashboard data retrieval failed:", error);
    return null;
  }
}

async function getHomeGamification(userId?: string) {
  try {
    if (!userId) throw new Error("Not signed in");
    return await getGamificationSummary(userId, "UTC");
  } catch (error) {
    console.error("Dashboard gamification retrieval failed:", error);
    return { xp: 0, todayProgress: 0, dailyGoal: 1, dailyGoalComplete: false, currentStreak: 0, milestones: [], achievements: [], nextMilestone: null };
  }
}
