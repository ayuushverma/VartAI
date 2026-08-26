export default function Loading() {
  return (
    <main className="v-page text-white" aria-busy="true" aria-label="Loading session report">
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl p-5 sm:p-8">
        <div className="h-8 w-52 animate-pulse rounded bg-white/10" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <div className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/4" key={item} />)}
        </div>
      </section>
    </main>
  );
}
