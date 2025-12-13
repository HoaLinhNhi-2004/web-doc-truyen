"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, Calendar, Clock, Trophy, Loader2 } from 'lucide-react';
import StoryCard from '../components/StoryCard';

// Định nghĩa các Tab lọc
const TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'day', label: 'NGÀY' },
  { id: 'week', label: 'TUẦN' },
  { id: 'month', label: 'THÁNG' },
];

export default function HotStoriesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper xử lý ảnh (Thêm domain Backend nếu thiếu)
  const getImageUrl = (url: string) => {
      if (!url) return '/placeholder.jpg';
      if (url.startsWith('http')) return url;
      // Backend chạy 127.0.0.1:5000
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `http://127.0.0.1:5000${cleanUrl}`;
  };

  useEffect(() => {
    const fetchHotStories = async () => {
      setLoading(true);
      try {
        // Gọi API lấy truyện xem nhiều nhất (sort=view)
        // Backend hỗ trợ: /api/stories?sort=view
        // Dùng 127.0.0.1:5000 để tránh lỗi mạng Windows
        const res = await fetch(`http://127.0.0.1:5000/api/stories?sort=view&limit=24`);
        const data = await res.json();

        if (data.status === 'success') {
          // Map dữ liệu từ Backend sang cấu trúc Frontend cần
          let fetchedStories = data.data.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            ten_truyen: item.title, // Backend: title -> Frontend: ten_truyen
            anh_bia: getImageUrl(item.cover_image),
            chuong_moi_nhat: item.chapters && item.chapters.length > 0 
                ? item.chapters[0].title 
                : 'Đang cập nhật',
            views: item.total_views // Lấy thêm lượt xem để hiển thị
          }));

          // --- LOGIC GIẢ LẬP LỌC THEO THỜI GIAN (Client-side) ---
          // Vì Backend chưa có API lọc theo thời gian, ta xử lý tạm ở Frontend
          if (activeTab === 'day') {
             // Ví dụ: Lấy 8 truyện đầu tiên làm "Top Ngày"
             fetchedStories = fetchedStories.slice(0, 8); 
          } else if (activeTab === 'week') {
             // Ví dụ: Đảo ngược danh sách để thay đổi vị trí
             fetchedStories = [...fetchedStories].reverse(); 
          } else if (activeTab === 'month') {
             // Ví dụ: Sắp xếp theo tên để tạo sự khác biệt
             fetchedStories = fetchedStories.sort((a: any, b: any) => a.ten_truyen.localeCompare(b.ten_truyen)); 
          }

          setStories(fetchedStories);
        }
      } catch (error) {
        console.error("Lỗi tải truyện hot:", error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotStories();
  }, [activeTab]); // Chạy lại khi chuyển Tab

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* 1. Header & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-blue-500 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">Truyện Hot</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2 uppercase">
                <Flame className="fill-red-500" size={32} />
                Truyện Hot Nhất
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Danh sách truyện tranh được quan tâm nhiều nhất trong thời gian qua.
              </p>
            </div>
            
            {/* Top 1 Badge (Lấy truyện đầu tiên trong danh sách làm Top 1) */}
            {!loading && stories.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full font-bold text-sm border border-yellow-200 dark:border-yellow-800 animate-pulse">
                <Trophy size={16} />
                <span>Top 1: {stories[0].ten_truyen}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Bộ Lọc Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative pb-3 text-sm font-bold uppercase transition-all duration-300 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transition-transform duration-300 origin-left ${
                    activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* 3. Lưới Truyện */}
        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        ) : stories.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic">
                Chưa có truyện nào trong bảng xếp hạng.
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 min-h-[400px]">
            {stories.map((story, index) => (
                <div key={story.id} className="relative group animate-in fade-in zoom-in duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                
                {/* Badge Xếp Hạng */}
                <div className={`
                    absolute -top-2 -left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full font-bold text-white shadow-md
                    ${index === 0 ? 'bg-red-600 scale-110 ring-2 ring-white dark:ring-zinc-900' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-gray-500 text-xs'}
                `}>
                    {index + 1}
                </div>

                <StoryCard 
                    slug={story.slug}
                    ten_truyen={story.ten_truyen}
                    anh_bia={story.anh_bia}
                    chuong_moi_nhat={story.chuong_moi_nhat}
                />

                {/* Thông tin phụ: Lượt xem */}
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                        <Flame size={12} className="text-red-500 fill-red-500" /> {story.views ? story.views.toLocaleString() : 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> 1 giờ
                    </span>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* Nút Xem Thêm (Giả lập) */}
        {!loading && stories.length > 0 && (
            <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-full transition border border-border">
                Xem thêm 20 truyện nữa
            </button>
            </div>
        )}

      </div>
    </div>
  );
}