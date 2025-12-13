"use client";

import { useEffect } from "react";

interface HistorySaverProps {
  storyId: number;
  chapterId: number;
}

export default function HistorySaver({ storyId, chapterId }: HistorySaverProps) {
  useEffect(() => {
    const saveHistory = async () => {
      const token = localStorage.getItem("accessToken");
      // Chỉ lưu nếu đã đăng nhập
      if (!token) return;

      try {
        await fetch(`http://127.0.0.1:5000/api/user/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ storyId, chapterId }),
        });
        console.log("✅ Đã lưu lịch sử đọc");
      } catch (error) {
        console.error("Lỗi lưu lịch sử:", error);
      }
    };

    saveHistory();
  }, [storyId, chapterId]);

  // Component này không hiển thị gì cả, chỉ chạy ngầm
  return null;
}