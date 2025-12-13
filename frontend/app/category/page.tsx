"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, ChevronRight, Check, Search, Loader2 } from 'lucide-react';
import StoryCard from '../components/StoryCard';

// 1. Danh sách Thể loại (Tạm thời dùng danh sách tĩnh, ID khớp với slug trong DB)
const GENRES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'chuyen-sinh', name: 'Chuyển Sinh' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'drama', name: 'Drama' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'harem', name: 'Harem' },
  { id: 'horror', name: 'Horror' },
  { id: 'manhua', name: 'Manhua' },
  { id: 'manhwa', name: 'Manhwa' },
  { id: 'ngon-tinh', name: 'Ngôn Tình' },
  { id: 'romance', name: 'Romance' },
  { id: 'school-life', name: 'School Life' },
  { id: 'shounen', name: 'Shounen' },
];

export default function CategoryPage() {
  const [activeGenre, setActiveGenre] = useState('all');
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper xử lý link ảnh (Thêm domain Backend nếu thiếu)
  const getImageUrl = (url: string) => {
      if (!url) return '/placeholder.jpg';
      if (url.startsWith('http')) return url;
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `http://127.0.0.1:5000${cleanUrl}`;
  };

  // 2. Hàm gọi API lấy truyện (Chạy lại khi activeGenre thay đổi)
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        // Xây dựng URL API (127.0.0.1:5000 để tránh lỗi mạng Windows)
        let url = `http://127.0.0.1:5000/api/stories?limit=18`;
        
        // Nếu chọn thể loại cụ thể, thêm tham số category vào URL
        if (activeGenre !== 'all') {
            url += `&category=${activeGenre}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'success') {
          // Map dữ liệu từ Backend sang Frontend
          const mappedStories = data.data.map((item: any) => ({
            id: String(item.id),
            slug: item.slug,
            ten_truyen: item.title, // Backend: title -> Frontend: ten_truyen
            anh_bia: getImageUrl(item.cover_image),
            chuong_moi_nhat: item.chapters && item.chapters.length > 0 
                ? item.chapters[0].title 
                : 'Đang cập nhật'
          }));
          setStories(mappedStories);
        }
      } catch (error) {
        console.error("Lỗi tải truyện:", error);
        setStories([]); // Reset về rỗng nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [activeGenre]); 

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-blue-500 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">Thể loại</span>
          </div>
          <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3 uppercase">
            <Filter className="text-blue-500" size={32} />
            Tìm Kiếm Thể Loại
          </h1>
        </div>

        {/* --- KHU VỰC BỘ LỌC (FILTER) --- */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Chọn thể loại:
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`
                  relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border
                  ${activeGenre === genre.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                    : 'bg-background text-muted-foreground border-border hover:border-blue-500 hover:text-blue-500 hover:bg-accent'
                  }
                `}
              >
                {activeGenre === genre.id && (
                  <Check size={14} className="inline-block mr-1 -mt-0.5" />
                )}
                {genre.name}
              </button>
            ))}
          </div>
          
          {/* Dòng trạng thái kết quả */}
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Đang xem:</span>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-xs font-bold uppercase">
                {GENRES.find(g => g.id === activeGenre)?.name}
              </span>
            </div>
            {!loading && (
                <span>
                Tìm thấy <strong className="text-foreground">{stories.length}</strong> kết quả
                </span>
            )}
          </div>
        </div>

        {/* --- LƯỚI TRUYỆN --- */}
        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        ) : stories.length === 0 ? (
          // Giao diện khi không tìm thấy truyện nào
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="text-muted-foreground" size={32} />
            </div>
            <p className="text-xl text-muted-foreground mb-2">Chưa có truyện nào thuộc thể loại này.</p>
            <button 
              onClick={() => setActiveGenre('all')}
              className="mt-2 text-blue-500 hover:underline font-medium"
            >
              Xem tất cả truyện
            </button>
          </div>
        ) : (
          // Grid hiển thị truyện
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {stories.map((story) => (
              <div key={story.id} className="animate-in fade-in zoom-in duration-300">
                <StoryCard 
                  slug={story.slug}
                  ten_truyen={story.ten_truyen}
                  anh_bia={story.anh_bia}
                  chuong_moi_nhat={story.chuong_moi_nhat}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}