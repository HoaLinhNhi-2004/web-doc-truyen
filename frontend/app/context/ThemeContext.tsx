// app/context/ThemeContext.tsx
"use client"; // BẮT BUỘC: Context cần chạy ở Client

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho Context
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Tạo Context với giá trị mặc định (rỗng)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tạo "Nhà cung cấp" (Provider) - component bọc ứng dụng
export function ThemeProvider({ children }: { children: ReactNode }) {
  // State để lưu theme, mặc định là 'light'
  const [theme, setTheme] = useState('light');

  // 1. Chỉ chạy ở client (sau khi component mount)
  useEffect(() => {
    // Lấy theme đã lưu từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Thêm class 'dark' vào <html> nếu theme là 'dark'
    // Đây là cách để Tailwind nhận diện
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // 2. Hàm để bật/tắt theme
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      
      // Lưu vào localStorage
      localStorage.setItem('theme', newTheme);
      
      // Cập nhật class 'dark' trên <html>
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Tạo một "hook" tùy chỉnh để dễ dàng sử dụng
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}