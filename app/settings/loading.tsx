export default function Loading() {
  return <RouteSkeleton title="Settings" />;
}

function RouteSkeleton({ title }: { title: string }) {
  return (
    <main className="v-page text-white" aria-busy="true" aria-label={`Loading ${title}`}>
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-4xl p-5 sm:p-8">
        <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-10 max-w-sm animate-pulse rounded bg-white/10" />
        <div className="mt-10 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        <div className="mt-4 h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      </section>
    </main>
  );
}
