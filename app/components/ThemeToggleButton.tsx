// app/components/ThemeToggleButton.tsx
"use client";

import { useTheme } from "../context/ThemeContext"; // Import hook tùy chỉnh

export default function ThemeToggleButton() {
  // Lấy trạng thái và hàm toggle từ Context
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600"
    >
      {/* Hiển thị icon Mặt trời hoặc Mặt trăng (dùng text) */}
      {theme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
    </button>
  );
}