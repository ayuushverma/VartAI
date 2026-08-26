"use client";

import { useFormStatus } from "react-dom";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button className="v-button-secondary min-h-11 w-full px-5 py-3 text-sm font-semibold text-slate-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto" disabled={pending} type="submit">
      {pending ? "Signing out..." : "Log out"}
    </button>
  );
}
