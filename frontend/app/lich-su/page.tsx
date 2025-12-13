"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { History, Loader2, Clock } from 'lucide-react';
import StoryCard from '../components/StoryCard';

interface HistoryItem {
  story: {
    id: number;
    title: string;
    slug: string;
    cover_image: string;
  };
  last_read_chapter: {
    id: number;
    chapter_num: number;
    title: string;
  };
  updatedAt: string; // Thời gian đọc
}

export default function HistoryPage() {
  const router = useRouter();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/sign-in'); // Chưa đăng nhập thì đá về login
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === 'success') {
          setHistoryList(data.data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [router]);

  // Helper xử lý ảnh
  const getImageUrl = (url: string) => {
      if (!url) return '/placeholder.jpg';
      if (url.startsWith('http')) return url;
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `http://127.0.0.1:5000${cleanUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 pt-24 min-h-screen">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <History size={32} /> Lịch Sử Đọc Truyện
        </h1>
      </div>

      {historyList.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-lg mb-4">Bạn chưa đọc truyện nào.</p>
          <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">
            Đọc truyện ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {historyList.map((item, index) => (
            <div key={index} className="relative group">
              <StoryCard
                slug={item.story.slug}
                ten_truyen={item.story.title}
                anh_bia={getImageUrl(item.story.cover_image)}
                // Hiển thị chương đang đọc dở thay vì chương mới nhất
                chuong_moi_nhat={`Đọc tiếp: Chap ${item.last_read_chapter?.chapter_num || 0}`}
              />
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 px-1">
                <Clock size={12} />
                {new Date(item.updatedAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}