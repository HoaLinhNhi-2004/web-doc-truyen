'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Users, LogOut, Menu, X, DollarSign } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 1. Kiểm tra quyền Admin khi vào trang
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (!userStr || !token) {
      router.push('/sign-in');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      // Chỉ cho phép role 'admin' hoặc 'moderator'
      if (user.role !== 'admin' && user.role !== 'moderator') {
        alert('Bạn không có quyền truy cập trang này!');
        router.push('/');
        return;
      }
      setAuthorized(true);
    } catch (e) {
      router.push('/sign-in');
    }
  }, [router]);

  // [FIX] Loading screen đổi màu theo theme
  if (!authorized) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        Đang kiểm tra quyền...
    </div>
  );

  const menuItems = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Truyện', href: '/admin/stories', icon: BookOpen },
    { name: 'Quản lý Users', href: '/admin/users', icon: Users },
    { name: 'Quản lý Giao dịch', href: '/admin/transactions', icon: DollarSign },
  ];

  return (
    // [FIX] Thay đổi bg-zinc-950 -> bg-background, text-zinc-200 -> text-foreground
    <div className="min-h-screen bg-background text-foreground flex">
      
      {/* SIDEBAR */}
      {/* [FIX] bg-zinc-900 -> bg-card, border-zinc-800 -> border-border */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-500 tracking-wider">
            ADMIN PANEL
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    // [FIX] Hover effect đổi màu theo theme
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition">
            <LogOut size={20} /> Thoát Admin
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {/* [FIX] bg-zinc-900/50 -> bg-background/80 */}
        <header className="h-16 bg-background/80 backdrop-blur border-b border-border flex items-center px-4 md:hidden sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground p-2">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-foreground">Quản trị viên</span>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}