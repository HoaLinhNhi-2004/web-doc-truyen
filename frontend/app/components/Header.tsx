'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User, Wallet, Coins, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
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
  const [isScrolled, setIsScrolled] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

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
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const shouldHideHeader = () => {
    if (!pathname) return false;
    if (pathname.startsWith('/admin')) return true;
    const parts = pathname.split('/').filter(p => p);
    if (parts[0] === 'truyen' && parts.length >= 3) return true;
    return false;
  };

  if (shouldHideHeader()) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
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
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg border-zinc-200 dark:border-zinc-800' 
            : 'bg-transparent border-transparent py-2'
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between p-4 h-16">
        {/* LOGO & MENU */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              DocTruyen
            </span>
          </Link>
          
          <div className="hidden md:flex gap-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group py-2"
                >
                  <span className={`text-base font-bold transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-300 group-hover:text-blue-500'}`}>
                    {item.name}
                  </span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-blue-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION: SEARCH & USER */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative group hidden sm:block">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm truyện..."
              // [ĐÃ SỬA]
              // 1. bg-zinc-100: Nền luôn là màu xám nhạt (kể cả dark mode)
              // 2. text-zinc-900: Chữ luôn là màu đen (kể cả dark mode)
              // 3. Xóa hết các thuộc tính dark: trong class này
              className="w-40 focus:w-64 transition-all duration-300 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 pl-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-500"
            />
            {/* Icon Search luôn màu xám tối để nổi trên nền sáng */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-600 transition-colors" size={16} />
          </form>

          <ThemeToggleButton />

          {user ? (
            <div 
                className="relative z-50"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
            >
                <div className="flex items-center gap-3 cursor-pointer py-2">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-foreground leading-none">{user.username}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{user.role || 'Member'}</p>
                    </div>
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition ring-2 ring-zinc-100 dark:ring-zinc-800">
                        <Image 
                            src={getImageUrl(user.avatar_url || '')} 
                            alt="Avatar" 
                            fill 
                            className="object-cover"
                            unoptimized 
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full pt-2 w-72"
                        >
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                <div className="p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1 tracking-wider">Số dư tài khoản</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-yellow-500 font-extrabold text-xl">
                                            <Wallet className="fill-yellow-500/20" size={20} />
                                            {user.coin_balance ? user.coin_balance.toLocaleString() : 0} <span className="text-xs font-normal text-zinc-500 mt-1">xu</span>
                                        </div>
                                        <Link href="/nap-tien" className="text-xs bg-yellow-500 text-black px-3 py-1 rounded-full font-bold hover:bg-yellow-400 transition">
                                            + Nạp
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-2 space-y-1">
                                    <Link href="/ho-so" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><User size={16} /></div>
                                        Hồ sơ cá nhân
                                    </Link>
                                    
                                    {user.role === 'admin' && (
                                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Coins size={16} /></div>
                                            Trang quản trị
                                        </Link>
                                    )}
                                    
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2"></div>

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                                    >
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"><LogOut size={16} /></div>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="relative overflow-hidden rounded-full bg-blue-600 px-6 py-2 text-white font-bold text-sm transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 group"
            >
              <span className="relative z-10">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}