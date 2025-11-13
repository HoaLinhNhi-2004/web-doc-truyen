// app/components/ThemeScript.tsx
"use client"; // Mặc dù đây là script, component bọc nó cần chạy ở client

// Component này KHÔNG render gì ra React
// Nó chỉ dùng để chèn một script vào <head>
export default function ThemeScript() {
  const script = `
    (function() {
      // 1. Lấy theme từ localStorage
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        // 2. Nếu có, áp dụng nó
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        // 3. Nếu không có (lần đầu truy cập), kiểm tra hệ thống
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    })();
  `;

  // 4. Dùng 'dangerouslySetInnerHTML' để chèn script
  // Kỹ thuật này đảm bảo script chạy ngay lập tức
  return (
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}