// app/components/FollowButton.tsx

// BẮT BUỘC: Biến đây thành một Client Component
"use client";

import { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho truyện được lưu
// Chúng ta sẽ lưu một object nhỏ thay vì chỉ slug
interface FollowedStory {
  slug: string;
  ten_truyen: string;
  anh_bia: string;
}

// Component này nhận props là thông tin của truyện nó đang ở
interface FollowButtonProps {
  story: FollowedStory;
}

export default function FollowButton({ story }: FollowButtonProps) {
  // 'isFollowed' là state cho biết truyện NÀY đã được theo dõi chưa
  const [isFollowed, setIsFollowed] = useState(false);

  // Hàm helper để lấy danh sách theo dõi từ localStorage
  const getFollowedList = (): FollowedStory[] => {
    // Chỉ chạy code này nếu ở trong trình duyệt
    if (typeof window === "undefined") return [];
    
    const list = localStorage.getItem('followedStories');
    return list ? JSON.parse(list) : [];
  };

  // 1. Kiểm tra trạng thái theo dõi KHI component được tải
  useEffect(() => {
    const list = getFollowedList();
    // Kiểm tra xem truyện này (dựa trên slug) đã có trong list chưa
    const alreadyFollowed = list.some(item => item.slug === story.slug);
    setIsFollowed(alreadyFollowed);
    
    // Chỉ chạy 1 lần khi component mount
  }, [story.slug]); // Thêm story.slug vào dependency array

  // 2. Hàm xử lý khi nhấn nút
  const handleFollow = () => {
    const list = getFollowedList();
    let newList: FollowedStory[];

    if (isFollowed) {
      // ĐÃ THEO DÕI -> BỎ THEO DÕI
      // Lọc ra, chỉ giữ lại những truyện KHÔNG có slug này
      newList = list.filter(item => item.slug !== story.slug);
      
    } else {
      // CHƯA THEO DÕI -> THÊM THEO DÕI
      // Thêm truyện hiện tại vào danh sách
      newList = [...list, story];
    }

    // 3. Lưu danh sách mới vào localStorage
    localStorage.setItem('followedStories', JSON.stringify(newList));
    // 4. Cập nhật state của nút
    setIsFollowed(!isFollowed);
  };

  // 5. Render nút dựa trên state
  return (
    <button
      onClick={handleFollow}
      className={`mt-4 w-full rounded-md px-4 py-3 text-lg font-semibold transition-colors
        ${
          isFollowed
            ? 'bg-red-600 text-white hover:bg-red-700' // Nút "Bỏ theo dõi"
            : 'bg-green-600 text-white hover:bg-green-700' // Nút "Theo dõi"
        }
      `}
    >
      {isFollowed ? 'Bỏ theo dõi' : 'Theo dõi'}
    </button>
  );
}