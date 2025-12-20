'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  storyId: number | string;
  chapterId: number | string;
}

export default function ViewTracker({ storyId, chapterId }: ViewTrackerProps) {
  // 🟢 Sử dụng useRef để tạo biến cờ hiệu (flag)
  // Biến này sẽ giữ nguyên giá trị giữa các lần render của React Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ gọi API nếu chưa từng gọi (hasFetched = false)
    if (storyId && chapterId && !hasFetched.current) {
      
      // 🟢 Đánh dấu ngay lập tức là đã gọi
      hasFetched.current = true;

      fetch(`http://127.0.0.1:5000/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapterId: chapterId }),
      })
      .then(res => {
          if (!res.ok) console.error("Tăng view thất bại:", res.status);
      })
      .catch((err) => console.error("Lỗi kết nối tăng view:", err));
    }
  }, [storyId, chapterId]);

  return null;
}