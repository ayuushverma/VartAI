"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

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
      <section className="v-auth-shell grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="v-auth-aside relative hidden min-h-[680px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <div className="v-entry-grid absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <AuthBrand />
            <p className="v-eyebrow mt-24">Speak a little more freely</p>
            <h2 className="v-display mt-4 text-5xl font-semibold leading-[1.04]">Practice for the moments that matter.</h2>
          </div>
          <p className="relative max-w-xs text-sm leading-6 text-slate-400">A focused space for real conversations, useful feedback, and steady progress.</p>
        </div>
        <div className="v-auth-panel p-6 sm:p-10 lg:p-14">
          <div className="lg:hidden"><AuthBrand /></div>
          <div className="mt-10 lg:mt-0">
            <p className="v-eyebrow">{isSignup ? "Begin your practice" : "Welcome back"}</p>
            <h1 className="v-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{isSignup ? "Start speaking with confidence." : "Continue your English journey."}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{isSignup ? "Create your space and make conversation part of your day." : "Pick up where your language practice left off."}</p>
          </div>

          <form action={formAction} className="mt-8 space-y-4">
            {isSignup ? <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Name</span><input className="v-auth-input" name="name" required autoComplete="name" /></label> : null}
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Email</span><input className="v-auth-input" name="email" type="email" required autoComplete="email" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Password</span><input className="v-auth-input" name="password" type="password" required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} /></label>
            {isSignup ? <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Confirm password</span><input className="v-auth-input" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label> : <label className="flex min-h-11 items-center gap-3 text-sm text-slate-300"><input className="h-5 w-5 accent-(--lime)" name="rememberMe" type="checkbox" /><span>Remember me</span></label>}
            {error ? <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100" role="alert">{error}</p> : null}
            <button className="v-button flex min-h-14 w-full items-center justify-center px-5 py-3.5 text-sm font-semibold text-[#1b1110] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? (isSignup ? "Creating your space..." : "Opening your studio...") : isSignup ? "Create account" : "Log in"}</button>
          </form>

          <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
          <form action={googleAction}><GoogleSubmitButton disabled={!googleConfigured} /></form>
          {!googleConfigured ? <p className="mt-2 text-center text-xs text-slate-500">Google sign-in is not configured yet.</p> : null}
          <p className="mt-7 text-center text-sm text-slate-400">{isSignup ? "Already practicing?" : "New to VartAI?"} <Link className="font-semibold text-[var(--lime)] hover:text-white" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}

function AuthBrand() {
  return (
    <Link className="v-auth-brand inline-flex items-center gap-3 text-xl font-bold tracking-tight" href="/">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-[#1b1110]">V</span>
            Vart<span className="text-[var(--blue)]">AI</span>
    </Link>
  );
}

function GoogleSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button className="v-button-secondary flex min-h-14 w-full items-center justify-center px-5 py-3.5 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled || pending} type="submit">{pending ? "Connecting to Google..." : "Continue with Google"}</button>;
}