"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User as UserIcon } from 'lucide-react'; // Icon cho menu user
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  
  // State lưu thông tin user (thay thế cho Clerk)
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // 1. Kiểm tra đăng nhập khi load trang
  useEffect(() => {
    setMounted(true);
    // Lấy thông tin user từ localStorage (đã lưu lúc đăng nhập ở trang sign-in)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi đọc user:", error);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // 2. Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Xóa token
    localStorage.removeItem('user');        // Xóa info
    setUser(null);
    router.push('/sign-in'); // Chuyển về trang đăng nhập
    router.refresh();        // Làm mới trang
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-lg" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />

      <nav className="relative container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-foreground hover:opacity-80 transition">
            DocTruyen
          </Link>
          
          <div className="hidden md:flex gap-6">
            {[
              { name: "Trang chủ", href: "/" },
              { name: "Theo dõi", href: "/theo-doi" },
              { name: "Thể loại", href: "/category" },
              { name: "Truyện hot", href: "/truyen-hot" },
              { name: "Lịch sử", href: "/lich-su" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-foreground/80 hover:text-foreground transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm truyện..."
              className="w-32 md:w-64 rounded-l-full border border-border bg-background/70 px-4 py-2 text-foreground placeholder-muted-foreground backdrop-blur focus:outline-none focus:border-foreground/50 transition-all"
            />
            <button
              type="submit"
              className="rounded-r-full bg-blue-600 hover:bg-blue-700 px-4 md:px-6 py-2 text-white font-medium transition"
            >
              Tìm
            </button>
          </form>

          <ThemeToggleButton />

          {/* 3. Logic Hiển thị User (Thay thế Clerk) */}
          {mounted && user ? (
            // TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP
            <div className="flex items-center gap-3">
              {/* Hiển thị tên & Role */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-foreground">{user.username || user.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role || 'Member'}</span>
              </div>
              
              {/* Avatar & Dropdown */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden border-2 border-white/20 transition-transform hover:scale-105">
                   {/* Nếu có avatar url thì dùng img, không thì dùng icon mặc định */}
                   {user.avatar_url && user.avatar_url.startsWith('http') ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                      <UserIcon size={20} />
                   )}
                </button>

                {/* Menu thả xuống khi hover vào Avatar */}
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-1 hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">Số dư: <span className="text-yellow-500 font-bold">{user.coin_balance || 0} xu</span></p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition">
                    Hồ sơ cá nhân
                  </Link>
                  {/* Nếu là admin thì hiện thêm link quản lý */}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-500 hover:bg-accent transition">
                      Trang quản trị
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // TRƯỜNG HỢP CHƯA ĐĂNG NHẬP
            <Link
              href="/sign-in"
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-medium transition whitespace-nowrap shadow-lg shadow-blue-500/30"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}