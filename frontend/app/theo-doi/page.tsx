// app/theo-doi/page.tsx

// BẮT BUỘC: Biến đây thành một Client Component
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
// Import component StoryCard để tái sử dụng
import StoryCard from '../components/StoryCard';

// Định nghĩa kiểu dữ liệu cho truyện được lưu
interface FollowedStory {
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  // Giả sử StoryCard cũng cần chuong_moi_nhat
  // Nếu không, bạn có thể tạo một kiểu StoryCardProps riêng
}

// Định nghĩa kiểu StoryCard cần (lấy từ các file trước)
// Đảm bảo nó khớp với StoryCard.tsx
interface StoryCardProps {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}


export default function FollowingPage() {
  const { isSignedIn } = useUser();
  // Nếu chưa đăng nhập, tự động chuyển hướng về trang đăng nhập
  if (!isSignedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return null;
  }

  // State để lưu danh sách truyện đã theo dõi
  const [followedList, setFollowedList] = useState<FollowedStory[]>([]);
  // State để xử lý việc component chỉ chạy ở client
  const [isLoading, setIsLoading] = useState(true);

  // 1. Đọc localStorage khi component được tải (chỉ chạy ở client)
  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const listString = localStorage.getItem('followedStories');
    const list = listString ? JSON.parse(listString) : [];
    
    setFollowedList(list);
    setIsLoading(false); // Đã tải xong

    // Chỉ chạy 1 lần khi component mount
  }, []);

  // 2. Xử lý hiển thị
  
  // Hiển thị "Đang tải..." trong khi chờ useEffect chạy
  // để tránh lỗi "hydration mismatch" của Next.js
  if (isLoading) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Truyện đang theo dõi
        </h1>
        <p className="text-gray-500">Đang tải...</p>
      </main>
    );
  }

  // Sau khi đã tải, hiển thị nội dung
  return (
    <main className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Truyện đang theo dõi
      </h1>

      {followedList.length === 0 ? (
        <p className="text-gray-500">Bạn chưa theo dõi truyện nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {/* Lặp qua danh sách đã lưu và hiển thị */}
          {followedList.map((story) => (
            <StoryCard
              key={story.slug}
              slug={story.slug}
              ten_truyen={story.ten_truyen}
              anh_bia={story.anh_bia}
              // Chúng ta không lưu 'chuong_moi_nhat' trong localStorage
              // nên sẽ hiển thị một chuỗi rỗng
              chuong_moi_nhat="" 
            />
          ))}
        </div>
      )}
    </main>
  );
}