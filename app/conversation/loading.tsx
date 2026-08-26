export default function Loading() {
  return (
    <main className="v-page text-white" aria-busy="true" aria-label="Loading conversation">
      <section className="v-shell mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden p-5 sm:p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-6 grid min-h-[560px] flex-1 gap-4 lg:grid-cols-[340px_1fr]">
          <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      </section>
    </main>
  );
}
