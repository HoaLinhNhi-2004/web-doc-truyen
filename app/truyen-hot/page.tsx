"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, Calendar, Clock, Trophy } from 'lucide-react';
import StoryCard from '../components/StoryCard';

// 1. Dữ liệu giả lập (Mock Data)
// Trong thực tế, bạn sẽ gọi API và truyền tham số ?filter=day/week/month
const ALL_STORIES = [
  { id: '1', slug: 'chang-re-manh-nhat-lich-su', ten_truyen: 'Chàng Rể Mạnh Nhất Lịch Sử', anh_bia: 'https://st.nettruyenco.com/data/comics/162/chang-re-manh-nhat-lich-su.jpg', chuong_moi_nhat: 'Chap 356', views: '2.28M' },
  { id: '2', slug: 'one-punch-man', ten_truyen: 'One Punch Man', anh_bia: 'https://upload.wikimedia.org/wikipedia/en/c/c3/OnePunchMan_manga_cover.png', chuong_moi_nhat: 'Chap 292', views: '40.3K' },
  { id: '3', slug: 'vo-luyen-dinh-phong', ten_truyen: 'Võ Luyện Đỉnh Phong', anh_bia: 'https://st.nettruyenco.com/data/comics/32/vo-luyen-dinh-phong.jpg', chuong_moi_nhat: 'Chap 3857', views: '66.4M' },
  { id: '4', slug: 'dai-quan-gia-la-ma-hoang', ten_truyen: 'Đại Quản Gia Là Ma Hoàng', anh_bia: 'https://st.nettruyenco.com/data/comics/188/dai-quan-gia-la-ma-hoang.jpg', chuong_moi_nhat: 'Chap 775', views: '120.75K' },
  { id: '5', slug: 'gantz', ten_truyen: 'Gantz', anh_bia: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Gantz_vol._1.jpg', chuong_moi_nhat: 'End', views: '440.02K' },
  { id: '6', slug: 'a-wonderful-new-world', ten_truyen: 'A Wonderful New World', anh_bia: 'https://placehold.co/200x300/1e293b/FFF?text=New+World', chuong_moi_nhat: 'Chap 262', views: '500K' },
  { id: '7', slug: 'dao-hai-tac', ten_truyen: 'One Piece', anh_bia: 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg', chuong_moi_nhat: 'Chap 1111', views: '99M' },
  { id: '8', slug: 'thanh-guom-diet-quy', ten_truyen: 'Kimetsu no Yaiba', anh_bia: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg', chuong_moi_nhat: 'End', views: '12M' },
];

// Định nghĩa các Tab lọc
const TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'day', label: 'NGÀY' },
  { id: 'week', label: 'TUẦN' },
  { id: 'month', label: 'THÁNG' },
];

export default function HotStoriesPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Hàm lọc giả lập (Đảo thứ tự mảng để tạo cảm giác dữ liệu thay đổi khi bấm tab)
  const getFilteredStories = () => {
    switch (activeTab) {
      case 'day': return [...ALL_STORIES].slice(0, 4); // Lấy 4 truyện đầu
      case 'week': return [...ALL_STORIES].reverse();  // Đảo ngược danh sách
      case 'month': return [...ALL_STORIES].sort((a, b) => a.ten_truyen.localeCompare(b.ten_truyen)); // Sắp xếp theo tên
      default: return ALL_STORIES;
    }
  };

  const currentStories = getFilteredStories();

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
            
            {/* Top 1 Badge trang trí */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full font-bold text-sm border border-yellow-200 dark:border-yellow-800">
              <Trophy size={16} />
              <span>Top 1: Võ Luyện Đỉnh Phong</span>
            </div>
          </div>
        </div>

        {/* 2. Bộ Lọc Tabs (Giao diện giống ảnh) */}
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
                {/* Thanh gạch dưới animation */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 min-h-[400px]">
          {currentStories.map((story, index) => (
            <div key={story.id} className="relative group animate-in fade-in zoom-in duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
              
              {/* Badge Xếp Hạng (Số thứ tự) */}
              <div className={`
                absolute -top-2 -left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full font-bold text-white shadow-md
                ${index === 0 ? 'bg-red-600 scale-110' : 
                  index === 1 ? 'bg-orange-500' : 
                  index === 2 ? 'bg-yellow-500' : 'bg-gray-500 text-xs'}
              `}>
                {index + 1}
              </div>

              {/* Thẻ Truyện */}
              <StoryCard 
                slug={story.slug}
                ten_truyen={story.ten_truyen}
                anh_bia={story.anh_bia}
                chuong_moi_nhat={story.chuong_moi_nhat}
              />

              {/* Thông tin phụ: Lượt xem (Hiện bên dưới) */}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-1">
                   <Flame size={12} className="text-red-500" /> {story.views}
                </span>
                <span className="flex items-center gap-1">
                   <Clock size={12} /> 1 giờ
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Nút Xem Thêm */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-full transition border border-border">
            Xem thêm 20 truyện nữa
          </button>
        </div>

      </div>
    </div>
  );
}