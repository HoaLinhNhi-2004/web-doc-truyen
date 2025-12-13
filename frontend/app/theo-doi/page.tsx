"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, HeartOff, Loader2 } from 'lucide-react';
import StoryCard from '../components/StoryCard';

// Định nghĩa kiểu dữ liệu truyện trả về từ Backend
interface FavoriteStory {
  id: number;
  title: string;
  slug: string;
  cover_image: string;
}

export default function FollowingPage() {
  const router = useRouter();
  const [stories, setStories] = useState<FavoriteStory[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Kiểm tra Auth và Load dữ liệu từ Backend
  useEffect(() => {
    const loadFavorites = async () => {
      // Lấy token đăng nhập
      const token = localStorage.getItem('accessToken');

      // Nếu chưa đăng nhập -> Chuyển về trang Sign In
      if (!token) {
        router.push('/sign-in');
        return;
      }

      try {
        // Gọi API lấy danh sách tủ truyện (127.0.0.1 để tránh lỗi Windows)
        const res = await fetch(`http://127.0.0.1:5000/api/user/favorites`, {
          headers: { 
            'Authorization': `Bearer ${token}` // Gửi token để xác thực
          }
        });
        
        // Nếu token hết hạn (401/403) -> Đá ra trang login
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            router.push('/sign-in');
            return;
        }

        const data = await res.json();

        if (data.status === 'success') {
          setStories(data.data); // data.data là mảng các truyện
        }
      } catch (error) {
        console.error("Lỗi tải tủ truyện:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [router]);

  // 2. Hàm bỏ theo dõi (Gọi API xóa khỏi DB)
  const handleRemove = async (storyId: number) => {
    if (!confirm("Bạn muốn bỏ theo dõi truyện này?")) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storyId })
      });

      const data = await res.json();
      
      if (data.status === 'success' && data.action === 'removed') {
        // Cập nhật lại UI bằng cách lọc bỏ truyện vừa xóa
        setStories(prev => prev.filter(s => s.id !== storyId));
      } else {
        alert(data.message || "Lỗi khi xóa");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối server");
    }
  };

  // Helper xử lý ảnh (Thêm domain nếu thiếu)
  const getImageUrl = (url: string) => {
      if (!url) return '/placeholder.jpg';
      if (url.startsWith('http')) return url;
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `http://127.0.0.1:5000${cleanUrl}`;
  };

  // --- GIAO DIỆN ---

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col justify-center items-center bg-background">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
        <p className="text-muted-foreground">Đang tải tủ truyện...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 pt-24 min-h-screen bg-background">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
          <span className="text-4xl">❤️</span> Tủ Truyện Của Bạn
        </h1>
        <span className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-bold text-foreground">
          {stories.length}
        </span>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border text-center">
          <HeartOff size={48} className="text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-4">Bạn chưa theo dõi truyện nào.</p>
          <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition shadow-lg">
            Khám phá truyện mới ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="relative group">
              <StoryCard
                slug={story.slug}
                ten_truyen={story.title} // Backend trả về title -> Map sang ten_truyen
                anh_bia={getImageUrl(story.cover_image)} // Xử lý link ảnh
                chuong_moi_nhat="" // API favorites hiện tại chưa trả về chap mới, để trống
              />
              
              {/* Nút Xóa nhanh (Hiện khi hover) */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(story.id);
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