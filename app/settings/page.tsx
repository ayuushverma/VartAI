import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageNavigation } from "@/app/_components/PageNavigation";
import { LogoutButton } from "@/app/settings/_components/LogoutButton";
import { logoutAction } from "@/app/settings/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const profile = await getProfile(session?.user?.id);
  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto min-h-[calc(100vh-3rem)] max-w-4xl">
        <header className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8"><div><p className="v-eyebrow">Settings</p><h1 className="v-display mt-2 text-4xl font-semibold">Workspace settings</h1></div><PageNavigation /></header>
        <div className="space-y-4 p-5 sm:p-8">
          {profile ? <section className="v-card p-5"><h2 className="text-base font-semibold">Your profile</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Setting label="Name" value={session?.user?.name || "Learner"} /><Setting label="Email" value={session?.user?.email || "Unavailable"} /><Setting label="Conversations" value={String(profile.conversationCount)} /></dl></section> : <section className="rounded-xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-100">Settings are temporarily unavailable.</section>}
          <section className="v-card p-5"><h2 className="text-base font-semibold">Application status</h2><p className="mt-3 text-sm leading-6 text-slate-400">VartAI is running with secure account sessions. Google sign-in requires OAuth credentials in the environment.</p></section>
          <form action={logoutAction}><LogoutButton /></form>
        </div>
      </section>
    </main>
  );
}
function Setting({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-1 break-all text-sm font-medium text-white">{value}</dd></div>; }
async function getProfile(userId?: string) { try { if (!userId) return null; const conversationCount = await db.conversation.count({ where: { userId } }); return { id: userId, conversationCount }; } catch (error) { console.error("Settings data retrieval failed:", error); return null; } }