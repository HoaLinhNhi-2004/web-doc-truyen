"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronRight, Check, Search } from 'lucide-react';
import StoryCard from '../components/StoryCard'; // Đảm bảo đường dẫn import đúng

// 1. Danh sách Thể loại (Mock Data)
const GENRES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'chuyen-sinh', name: 'Chuyển Sinh' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'co-dai', name: 'Cổ Đại' },
  { id: 'drama', name: 'Drama' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'harem', name: 'Harem' },
  { id: 'horror', name: 'Horror' },
  { id: 'manhua', name: 'Manhua' },
  { id: 'manhwa', name: 'Manhwa' },
  { id: 'mecha', name: 'Mecha' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'ngon-tinh', name: 'Ngôn Tình' },
  { id: 'romance', name: 'Romance' },
  { id: 'school-life', name: 'School Life' },
  { id: 'shoujo', name: 'Shoujo' },
  { id: 'shounen', name: 'Shounen' },
  { id: 'trinh-tham', name: 'Trinh Thám' },
  { id: 'xuyen-khong', name: 'Xuyên Không' },
];

// 2. Danh sách Truyện giả lập
const MOCK_STORIES = [
  { 
    id: '1', slug: 'tham-tu-conan', ten_truyen: 'Thám Tử Lừng Danh Conan', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Detective_Conan_Vol_1.jpg', 
    chuong_moi_nhat: 'Chap 1000', 
    genres: ['mystery', 'shounen', 'comedy', 'trinh-tham'] 
  },
  { 
    id: '2', slug: 'one-piece', ten_truyen: 'One Piece', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg', 
    chuong_moi_nhat: 'Chap 1100', 
    genres: ['action', 'adventure', 'shounen', 'fantasy'] 
  },
  { 
    id: '3', slug: 'naruto', ten_truyen: 'Naruto', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg', 
    chuong_moi_nhat: 'End', 
    genres: ['action', 'adventure', 'shounen'] 
  },
  { 
    id: '4', slug: 'solo-leveling', ten_truyen: 'Solo Leveling', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/9/95/Solo_Leveling_Webtoon_cover.png', 
    chuong_moi_nhat: 'End', 
    genres: ['action', 'manhwa', 'fantasy'] 
  },
  { 
    id: '5', slug: 'vo-luyen-dinh-phong', ten_truyen: 'Võ Luyện Đỉnh Phong', 
    anh_bia: 'https://st.nettruyenco.com/data/comics/32/vo-luyen-dinh-phong.jpg', 
    chuong_moi_nhat: 'Chap 3600', 
    genres: ['action', 'manhua', 'fantasy', 'chuyen-sinh'] 
  },
  { 
    id: '6', slug: 'thanh-guom-diet-quy', ten_truyen: 'Thanh Gươm Diệt Quỷ', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg', 
    chuong_moi_nhat: 'End', 
    genres: ['action', 'adventure', 'horror'] 
  },
  { 
    id: '7', slug: 'jujutsu-kaisen', ten_truyen: 'Chú Thuật Hồi Chiến', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/4/44/Jujutsu_Kaisen_cover.jpg', 
    chuong_moi_nhat: 'Chap 240', 
    genres: ['action', 'horror', 'shounen'] 
  },
  { 
    id: '8', slug: 'chuyen-sinh-thanh-slime', ten_truyen: 'Chuyển Sinh Thành Slime', 
    anh_bia: 'https://upload.wikimedia.org/wikipedia/en/3/30/That_Time_I_Got_Reincarnated_as_a_Slime_manga_volume_1.jpg', 
    chuong_moi_nhat: 'Chap 110', 
    genres: ['fantasy', 'chuyen-sinh', 'comedy'] 
  },
];

export default function CategoryPage() {
  const [activeGenre, setActiveGenre] = useState('all');

  // Lọc danh sách truyện
  const filteredStories = activeGenre === 'all' 
    ? MOCK_STORIES 
    : MOCK_STORIES.filter(story => story.genres.includes(activeGenre));

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb - Đã cập nhật href */}
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

        {/* --- KHU VỰC BỘ LỌC --- */}
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
          
          {/* Kết quả tìm kiếm */}
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Đang xem:</span>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-xs font-bold uppercase">
                {GENRES.find(g => g.id === activeGenre)?.name}
              </span>
            </div>
            <span>
              Tìm thấy <strong className="text-foreground">{filteredStories.length}</strong> kết quả
            </span>
          </div>
        </div>

        {/* --- LƯỚI TRUYỆN --- */}
        {filteredStories.length === 0 ? (
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {filteredStories.map((story) => (
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