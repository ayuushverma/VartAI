"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function PageNavigation() {
  const router = useRouter();

  return (
    <nav aria-label="Page navigation" className="flex w-full gap-2 sm:w-auto">
      <button
        aria-label="Go back to the previous page"
        className="v-button-secondary min-h-11 flex-1 px-4 py-3 text-sm font-semibold text-slate-200 sm:flex-none"
        onClick={() => router.back()}
        type="button"
      >
        <span aria-hidden="true" className="mr-1">&larr;</span>
        Back
      </button>
      <Link
        aria-label="Go to home"
        className="v-button-secondary min-h-11 flex-1 px-4 py-3 text-center text-sm font-semibold text-slate-200 sm:flex-none"
        href="/"
      >
        <span aria-hidden="true" className="mr-1">⌂</span>
        Home
      </Link>
    </nav>
  );
}