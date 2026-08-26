export default function Loading() {
  return <RouteSkeleton title="Practice lab" />;
}

function RouteSkeleton({ title }: { title: string }) {
  return (
    <main className="v-page text-white" aria-busy="true" aria-label={`Loading ${title}`}>
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl p-5 sm:p-8">
        <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-10 max-w-md animate-pulse rounded bg-white/10" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" key={item} />)}
        </div>
      </section>
    </main>
  );
}
