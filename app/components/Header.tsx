"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Glass background + viền dưới */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-lg" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />

      <nav className="relative container mx-auto flex items-center justify-between p-4">
        {/* Logo + Menu trái */}
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold text-foreground hover:opacity-80 transition">
            DocTruyen
          </a>
          {[
            { name: "Trang chủ", href: "/" },
            { name: "Theo dõi", href: "/theo-doi" },
            { name: "Thể loại", href: "/the-loai" },
            { name: "Truyện hot", href: "/truyen-hot" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-lg font-medium text-foreground/80 hover:text-foreground transition"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Tìm kiếm + Theme + Auth */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm truyện..."
              className="w-48 md:w-64 rounded-l-full border border-border bg-background/70 px-4 py-2 text-foreground placeholder-muted-foreground backdrop-blur focus:outline-none focus:border-foreground/50 transition-all"
            />
            <button
              type="submit"
              className="rounded-r-full bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white font-medium transition"
            >
              Tìm
            </button>
          </form>

          <ThemeToggleButton />

          <SignedOut>
            <a
              href="/sign-in"
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-medium transition"
            >
              Đăng nhập
            </a>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}