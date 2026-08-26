"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const commonRoutes = [
  ["Practice", "/practice"],
  ["Progress", "/progress"],
  ["Settings", "/settings"],
] as const;

export function PageNavigation() {
  const router = useRouter();

  return (
    <nav aria-label="Page navigation" className="flex w-full flex-wrap gap-2 sm:w-auto">
      <button
        aria-label="Go back to the previous page"
        className="v-button-secondary min-w-0 flex-1 basis-[calc(50%-0.25rem)] px-4 py-3 text-sm font-semibold text-slate-200 sm:basis-auto sm:flex-none"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }}
        type="button"
      >
        <span aria-hidden="true" className="mr-1">&larr;</span>
        Back
      </button>
      <Link
        aria-label="Go to home"
        className="v-button-secondary min-w-0 flex-1 basis-[calc(50%-0.25rem)] px-4 py-3 text-center text-sm font-semibold text-slate-200 sm:basis-auto sm:flex-none"
        href="/"
      >
        <span aria-hidden="true" className="mr-1">⌂</span>
        Home
      </Link>
      {commonRoutes.map(([label, href]) => (
        <Link
          className="v-button-secondary min-w-0 flex-1 basis-[calc(50%-0.25rem)] px-4 py-3 text-center text-sm font-semibold text-slate-200 sm:basis-auto sm:flex-none"
          href={href}
          key={href}
          prefetch
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}