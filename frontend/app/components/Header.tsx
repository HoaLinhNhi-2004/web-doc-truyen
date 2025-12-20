'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User, Wallet } from 'lucide-react';
import ThemeToggleButton from './ThemeToggleButton';

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:5000${url.startsWith('/') ? url : `/${url}`}`;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const loadUser = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser((prev: any) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsedUser)) {
                return parsedUser;
            }
            return prev;
        });
      } catch (error) {
        console.error("Lỗi đọc user:", error);
      }
    } else {
        setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUser();

    window.addEventListener('user-updated', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('user-updated', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [loadUser]);

  // 👇 LOGIC MỚI: Ẩn Header ở các trang đặc biệt
  const shouldHideHeader = () => {
    if (!pathname) return false;

    // 1. Ẩn ở trang Admin
    if (pathname.startsWith('/admin')) return true;

    // 2. Ẩn ở trang Đọc truyện (URL dạng: /truyen/{slug}/{chapterId})
    // Phân tích URL: ['', 'truyen', 'ten-truyen', 'id-chuong']
    const parts = pathname.split('/').filter(p => p); // Lọc bỏ phần tử rỗng
    // Nếu bắt đầu bằng 'truyen' và có từ 3 phần trở lên -> Đang ở trang đọc chương
    if (parts[0] === 'truyen' && parts.length >= 3) return true;

    return false;
  };

  // Nếu thuộc trang cần ẩn thì không render gì cả
  if (shouldHideHeader()) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('user-updated'));
    router.push('/sign-in');
    router.refresh();
  };

  const menuItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Theo dõi", href: "/theo-doi" },
    { name: "Thể loại", href: "/category" },
    { name: "Truyện hot", href: "/truyen-hot" },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-lg" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />

      <nav className="relative container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-blue-600 transition-colors duration-300">
            DocTruyen
          </Link>
          
          <div className="hidden md:flex gap-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    text-lg font-medium transition-colors duration-300
                    ${isActive 
                      ? 'text-blue-600 font-bold' 
                      : 'text-foreground/80 hover:text-blue-500' 
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm truyện..."
              className="w-32 md:w-64 rounded-l-full border border-border bg-background/70 px-4 py-2 text-foreground placeholder-muted-foreground backdrop-blur focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="rounded-r-full bg-blue-600 hover:bg-blue-700 px-4 md:px-6 py-2 text-white font-medium transition duration-300"
            >
              Tìm
            </button>
          </form>

          <ThemeToggleButton />

          {user ? (
            <div className="relative group z-50">
              <div className="flex items-center gap-2 cursor-pointer py-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role || 'Member'}</p>
                </div>
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-500/50 group-hover:border-blue-500 transition">
                  <Image 
                    key={user.avatar_url} 
                    src={getImageUrl(user.avatar_url || '')} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                    unoptimized 
                  />
                </div>
              </div>

              <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Số dư tài khoản</p>
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
                       <Wallet size={18} />
                       {user.coin_balance ? user.coin_balance.toLocaleString() : 0} xu
                    </div>
                  </div>

                  <div className="p-2">
                    <Link 
                      href="/ho-so" 
                      className="flex items-center gap-3 px-3 py-2.5 text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                    >
                      <User size={18} /> Hồ sơ cá nhân
                    </Link>
                    
                    {user.role === 'admin' && (
                       <Link 
                         href="/admin" 
                         className="flex items-center gap-3 px-3 py-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                       >
                         <User size={18} /> Trang quản trị
                       </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition mt-1"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-medium transition duration-300 whitespace-nowrap shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}