"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-emerald-200">
      <div className="max-w-[1200px] mx-auto px-8 flex items-center h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
        >
          <Logo size={32} />
          <span className="text-green-900 text-xl font-extrabold tracking-tight">
            LearnTrack
          </span>
        </Link>
        <div className="ml-auto flex gap-1 items-center">
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
          ].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`px-5 py-2 rounded-lg border-none text-sm font-semibold no-underline transition-all duration-150 ${
                pathname === p.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border-none text-sm font-bold bg-green-700 text-white ml-2 no-underline hover:bg-green-800 transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
