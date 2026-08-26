type CelebrationProps = {
  label: string;
  detail: string;
};

export function Celebration({ label, detail }: CelebrationProps) {
  return (
    <section className="v-fade-up rounded-xl border border-[rgba(197,232,108,.45)] bg-[rgba(197,232,108,.1)] p-5" role="status">
      <p className="v-eyebrow">Milestone reached</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--lime)]">{label}</h2>
      <p className="mt-1 text-sm text-slate-300">{detail}</p>
    </section>
  );
}