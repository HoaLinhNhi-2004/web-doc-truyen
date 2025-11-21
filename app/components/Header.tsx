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
      {/* Glass background – trong suốt + blur */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/10 backdrop-blur-lg" />
      
      {/* Đường viền dưới mờ nhẹ để phân cách với hero */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 dark:bg-white/5" />

      <nav className="relative container mx-auto flex items-center justify-between p-4">
        {/* Logo + Menu trái */}
        <div className="flex items-center gap-6">
          <a href="/" className="text-2xl font-bold text-white drop-shadow-md hover:text-white/90 transition">
            DocTruyen
          </a>
          <a href="/" className="text-lg font-medium text-white/90 hover:text-white transition">
            Trang chủ
          </a>
          <a href="/theo-doi" className="text-lg font-medium text-white/90 hover:text-white transition">
            Theo dõi
          </a>
          <a href="/the-loai" className="text-lg font-medium text-white/90 hover:text-white transition">
            Thể loại
          </a>
          <a href="/truyen-hot" className="text-lg font-medium text-white/90 hover:text-white transition">
            Truyện hot
          </a>
        </div>

        {/* Tìm kiếm + Theme + Đăng nhập */}
        <div className="flex items-center gap-4">
          {/* Thanh tìm kiếm – cũng trong suốt */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm truyện..."
              className="w-48 md:w-64 rounded-l-full border border-white/20 bg-white/10 dark:bg-black/20 px-4 py-2 text-white placeholder-white/60 backdrop-blur focus:outline-none focus:border-white/50 transition"
            />
            <button
              type="submit"
              className="rounded-r-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-medium transition"
            >
              Tìm
            </button>
          </form>

          {/* Nút đổi theme */}
          <ThemeToggleButton />

          {/* Đăng nhập / UserButton */}
          <SignedOut>
            <a
              href="/sign-in"
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-medium transition shadow-lg"
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