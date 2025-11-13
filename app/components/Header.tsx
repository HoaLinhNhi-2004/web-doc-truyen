// app/components/Header.tsx
"use client"; // BẮT BUỘC

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/search?q=${query}`);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        
        {/* Phần Logo và "Theo dõi" */}
        <div className="flex items-center gap-6">
          <a href="/" className="text-2xl font-bold text-white hover:text-gray-300">
            DocTruyen
          </a>
          <a href="/theo-doi" className="text-lg font-medium text-gray-300 hover:text-white">
            Theo dõi
          </a>
        </div>

        {/* Phần Tìm kiếm, Nút Theme, và Nút Đăng nhập */}
        <div className="flex items-center gap-4">
          
          {/* Thanh tìm kiếm (Đã điền đầy đủ) */}
          <form onSubmit={handleSearch} className="w-full max-w-xs">
            <div className="flex">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm truyện..."
                className="grow rounded-l-md border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Nút Chế độ Tối */}
          <ThemeToggleButton />

          {/* Nút Đăng nhập / Đăng xuất (Đã sửa) */}
          <SignedOut>
            <a 
              href="/sign-in" 
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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