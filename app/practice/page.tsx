import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import { PageNavigation } from "@/app/_components/PageNavigation";

export default function PracticePage() {
  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="v-eyebrow">Practice lab</p>
            <h1 className="v-display mt-2 text-4xl font-semibold">Choose your setting.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Pick a situation and start a focused conversation with VartAI.
            </p>
          </div>
          <PageNavigation />
        </header>
        <div className="v-stagger grid gap-5 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <article className="v-card flex flex-col p-6" key={scenario.id}>
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--coral)] text-lg font-bold text-[#1b1110]">{scenario.title.slice(0, 1)}</span>
                <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lime)]">{scenario.difficulty}</p>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{scenario.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{scenario.description}</p>
              <Link className="v-button mt-6 px-4 py-3 text-center text-sm font-semibold text-[#1b1110]" href={`/conversation?scenario=${scenario.id}`}>
                Start
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}