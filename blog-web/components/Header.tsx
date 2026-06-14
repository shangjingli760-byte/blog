"use client";

import Link from "next/link";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";

export default function Header() {
  return (
    <>
      <GlassFilter />
      <header className="sticky top-0 z-10 w-full">
        <GlassEffect className="rounded-none w-full">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between w-full">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              My Blog
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                文章
              </Link>
              <Link
                href="/tombs"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                🪦 赛博坟墓
              </Link>
              <a
                href="/rss.xml"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                RSS
              </a>
            </nav>
          </div>
        </GlassEffect>
      </header>
    </>
  );
}
