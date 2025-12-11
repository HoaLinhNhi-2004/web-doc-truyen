"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react'; 
import StoryCard from '../components/StoryCard'; // Đảm bảo đường dẫn import đúng

// Định nghĩa kiểu dữ liệu cho item trong localStorage
interface FollowedStory {
  slug: string;
  ten_truyen: string;
  anh_bia: string;
}

export default function FollowingPage() {
  // Lấy trạng thái đăng nhập từ Clerk
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  // State lưu danh sách truyện và trạng thái loading dữ liệu
  const [followedList, setFollowedList] = useState<FollowedStory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // -------------------------------------------------------
  // 1. FIX QUAN TRỌNG: Kiểm tra Auth an toàn
  // Chỉ redirect khi Clerk đã tải xong (isLoaded = true)
  // Ngăn chặn việc redirect nhầm khi mạng chậm hoặc đang loading
  // -------------------------------------------------------
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // -------------------------------------------------------
  // 2. Đọc dữ liệu từ localStorage khi component mount
  // (Chỉ chạy ở Client để tránh lỗi Hydration)
  // -------------------------------------------------------
  useEffect(() => {
    try {
      const listString = localStorage.getItem('followedStories');
      const list = listString ? JSON.parse(listString) : [];
      setFollowedList(list);
    } catch (error) {
      console.error("Lỗi đọc localStorage:", error);
      setFollowedList([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // -------------------------------------------------------
  // 3. Hàm xóa truyện khỏi danh sách theo dõi
  // -------------------------------------------------------
  const handleRemove = (slug: string) => {
    const newList = followedList.filter(item => item.slug !== slug);
    setFollowedList(newList);
    localStorage.setItem('followedStories', JSON.stringify(newList));
  };

  // ==================== PHẦN GIAO DIỆN (RENDERING) ====================

  // Trường hợp 1: Đang tải Auth hoặc đang đọc localStorage -> Hiện Skeleton Loading
  if (!isLoaded || isLoadingData) {
    return (
      <main className="container mx-auto p-4 pt-24 min-h-screen">
        <h1 className="mb-6 text-3xl font-bold text-foreground flex items-center gap-2">
          📚 Truyện đang theo dõi
        </h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  // Trường hợp 2: Đã tải xong nhưng chưa đăng nhập
  // Return null để màn hình không nháy nội dung trước khi chuyển trang
  if (!isSignedIn) return null;

  // Trường hợp 3: Đã đăng nhập và có dữ liệu -> Hiển thị nội dung
  return (
    <main className="container mx-auto p-4 pt-24 min-h-screen">
      <h1 className="mb-8 text-3xl font-bold text-red-500 flex items-center gap-2 border-b pb-4 border-gray-200 dark:border-gray-800">
        <span className="text-4xl">❤️</span> Tủ Truyện Của Bạn
      </h1>

      {followedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-muted-foreground text-lg mb-4">Bạn chưa theo dõi truyện nào.</p>
          <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition shadow-lg shadow-blue-500/30">
            Khám phá truyện mới ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {followedList.map((story) => (
            <div key={story.slug} className="relative group">
              {/* Tái sử dụng StoryCard */}
              <StoryCard 
                slug={story.slug}
                ten_truyen={story.ten_truyen}
                anh_bia={story.anh_bia}
                chuong_moi_nhat="" 
              />
              
              {/* Nút xóa nhanh (Chỉ hiện khi di chuột vào) */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(story.slug);
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 z-10"
                title="Bỏ theo dõi"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}