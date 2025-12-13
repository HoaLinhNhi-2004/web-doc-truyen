"use client";

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  story: {
    id?: string | number; // Backend cần ID để lưu vào DB
    slug: string;
    ten_truyen: string;
    anh_bia: string;
  };
}

export default function FollowButton({ story }: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Kiểm tra xem truyện này đã được theo dõi chưa khi component load
  useEffect(() => {
    const checkFollowStatus = async () => {
      // Lấy token từ localStorage
      const token = localStorage.getItem('accessToken');
      if (!token || !story.id) return;

      try {
        // Gọi API lấy danh sách truyện yêu thích của user
        // (Lưu ý: Dùng 127.0.0.1:5000 để tránh lỗi mạng trên Windows)
        const res = await fetch(`http://127.0.0.1:5000/api/user/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
          // Kiểm tra xem truyện hiện tại (story.id) có nằm trong danh sách không
          // Backend trả về mảng story, ta so sánh id
          const isFound = data.data.some((item: any) => String(item.id) === String(story.id));
          setIsFollowed(isFound);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra follow:", error);
      }
    };

    checkFollowStatus();
  }, [story.id]);

  // 2. Xử lý khi bấm nút
  const handleToggleFollow = async () => {
    const token = localStorage.getItem('accessToken');
    
    // Chưa đăng nhập -> Chuyển hướng
    if (!token) {
      if (confirm("Bạn cần đăng nhập để sử dụng tính năng này. Đi đến trang đăng nhập?")) {
        router.push('/sign-in');
      }
      return;
    }

    if (!story.id) {
      alert("Không tìm thấy ID truyện");
      return;
    }

    setLoading(true);
    try {
      // Gọi API Toggle (Thêm hoặc Xóa)
      const res = await fetch(`http://127.0.0.1:5000/api/user/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storyId: story.id })
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Cập nhật trạng thái nút dựa trên phản hồi của server
        if (data.action === 'added') {
          setIsFollowed(true);
        } else if (data.action === 'removed') {
          setIsFollowed(false);
        }
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi follow:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`
        mt-4 w-full md:w-auto px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg
        ${isFollowed 
          ? 'bg-gray-200 dark:bg-gray-800 text-red-500 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600' // Đã theo dõi (Màu xám/đỏ)
          : 'bg-green-600 hover:bg-green-700 text-white border border-green-600' // Chưa theo dõi (Màu xanh)
        }
      `}
    >
      {loading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Heart size={24} className={isFollowed ? "fill-current" : ""} />
      )}
      {isFollowed ? 'Đã Theo Dõi' : 'Theo Dõi'}
    </button>
  );
}