"use client";

import Link from "next/link";
import { useActionState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (state: string, formData: FormData) => Promise<string>;
  googleAction: () => Promise<void>;
  googleConfigured: boolean;
};

export function AuthForm({ mode, action, googleAction, googleConfigured }: AuthFormProps) {
  const [error, formAction, pending] = useActionState(action, "");
  const isSignup = mode === "signup";
  return (
    <main className="v-page flex items-center justify-center">
      <section className="v-shell w-full max-w-md p-6 sm:p-9">
        <div className="text-center">
          <Link className="inline-flex items-center gap-3 text-xl font-bold tracking-tight" href="/login">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-[#1b1110]">V</span>
            Vart<span className="text-[var(--blue)]">AI</span>
          </Link>
          <p className="v-eyebrow mt-9">{isSignup ? "Begin your practice" : "Welcome back"}</p>
          <h1 className="v-display mt-2 text-4xl font-semibold">{isSignup ? "Start speaking with confidence." : "Your next conversation awaits."}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{isSignup ? "A calmer, more natural way to build language confidence." : "Pick up where your language practice left off."}</p>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          {isSignup ? <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Name</span><input className="v-auth-input" name="name" required autoComplete="name" /></label> : null}
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Email</span><input className="v-auth-input" name="email" type="email" required autoComplete="email" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Password</span><input className="v-auth-input" name="password" type="password" required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} /></label>
          {isSignup ? <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Confirm password</span><input className="v-auth-input" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label> : <div className="text-right text-xs text-slate-500">Password recovery will be added later.</div>}
          {error ? <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100" role="alert">{error}</p> : null}
          <button className="v-button w-full px-5 py-3.5 text-sm font-semibold text-[#1b1110] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "Opening your studio..." : isSignup ? "Create account" : "Continue"}</button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
        <form action={googleAction}><button className="v-button-secondary w-full px-5 py-3.5 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50" disabled={!googleConfigured} type="submit">Continue with Google</button></form>
        {!googleConfigured ? <p className="mt-2 text-center text-xs text-slate-500">Google sign-in is not configured yet.</p> : null}
        <p className="mt-7 text-center text-sm text-slate-400">{isSignup ? "Already practicing?" : "New to VartAI?"} <Link className="font-semibold text-[var(--lime)] hover:text-white" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create your account"}</Link></p>
      </section>
    </main>
  );
}