const sidebarItems = ["Home", "Practice", "Progress", "Settings"];

const mainSections = [
  {
    title: "Greeting",
    detail: "Welcome back, Ayush. Ready for today's practice?",
  },
  {
    title: "Streak / XP",
    detail: "3 day streak - 240 XP",
  },
  {
    title: "Continue Learning",
    detail: "Spanish beginner conversation: ordering coffee",
  },
  {
    title: "Talk to VartAI",
    detail: "Start a live speaking session with your AI partner.",
  },
  {
    title: "Recommended Practice",
    detail: "Practice pronunciation with five short prompts.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07090c] px-5 py-6 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#10141a] shadow-2xl shadow-black/30 lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-[#0c1015] p-5 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="text-xl font-bold tracking-tight">
            Vart<span className="text-[#4f8cff]">AI</span>
          </div>

          <nav className="mt-8 space-y-1">
            {sidebarItems.map((item) => (
              <a
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                href="#"
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
            <div>
              <p className="text-sm font-medium text-[#f7d77a]">Dashboard</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Home
              </h1>
            </div>

            <button className="rounded-md bg-[#4f8cff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e7bef]">
              Start practice
            </button>
          </header>

          <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium text-slate-400">Greeting</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Keep the conversation going.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                VartAI helps you build confidence through short, natural
                conversations and focused feedback after every session.
              </p>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#f7d77a] p-5 text-[#17140a]">
              <p className="text-sm font-semibold">Streak / XP</p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight">3</span>
                <span className="pb-2 text-sm font-semibold">day streak</span>
              </div>
              <p className="mt-4 text-sm font-medium">240 XP earned</p>
            </section>

            <section className="space-y-3 lg:col-span-2">
              {mainSections.slice(2).map((section) => (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                  key={section.title}
                >
                  <h2 className="text-base font-semibold">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {section.detail}
                  </p>
                </article>
              ))}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
