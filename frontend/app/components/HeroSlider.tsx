"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link để chuyển trang
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

// Định nghĩa Interface cho dữ liệu truyện nhận vào (Khớp với page.tsx)
interface Story {
  id?: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
  mo_ta?: string;
}

export default function HeroSlider({ stories }: { stories: Story[] }) {
  const [index, setIndex] = useState(0);

  // Nếu không có truyện nào, hiển thị loading placeholder
  if (!stories || stories.length === 0) {
    return (
        <div className="w-full h-[520px] md:h-[600px] bg-zinc-900/10 animate-pulse mt-24 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Đang tải truyện đề cử...</p>
        </div>
    );
  }

  // Hàm chuyển slide
  const next = useCallback(() => setIndex((i) => (i + 1) % stories.length), [stories.length]);
  const prev = useCallback(() => setIndex((i) => (i === 0 ? stories.length - 1 : i - 1)), [stories.length]);

  // Tự động chạy slide mỗi 5s
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  // Helper để lấy story tại index (xử lý vòng lặp vô tận cho slide 3D)
  const getStory = (i: number) => stories[(i + stories.length) % stories.length];

  return (
    <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-transparent mt-24">
      
      {/* Background mờ phía sau */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stories[index].id || index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image
            src={stories[index].anh_bia}
            alt={stories[index].ten_truyen}
            fill
            priority
            unoptimized // FIX LỖI ẢNH KHÔNG HIỆN
            className="object-cover object-center opacity-15 dark:opacity-10 blur-sm"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="relative w-full max-w-7xl">
          <div className="flex items-center justify-center gap-8 md:gap-12">

            {/* Slide Trái (Hiệu ứng 3D) */}
            <motion.div
              className="hidden lg:block"
              animate={{ x: -160, rotateY: 50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <Image
                  src={getStory(index - 1).anh_bia}
                  fill
                  alt=""
                  unoptimized // FIX LỖI ẢNH KHÔNG HIỆN
                  className="object-cover opacity-90"
                />
              </div>
            </motion.div>

            {/* Slide Chính Giữa */}
            <motion.div
              key={stories[index].id || index}
              initial={{ scale: 0.9, rotateY: -25 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 90 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-80 md:w-96 lg:w-[480px] h-[500px] md:h-[580px] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg group cursor-pointer border border-white/10">
                <Image
                  src={stories[index].anh_bia}
                  alt={stories[index].ten_truyen}
                  fill
                  unoptimized // FIX LỖI ẢNH KHÔNG HIỆN
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Gradient tối ở dưới để làm nổi chữ - Giảm độ cao gradient để lộ ảnh nhiều hơn */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent top-1/3" />

                {/* Nội dung chữ + nút */}
                <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 text-center">
                  <p className="text-cyan-400 font-medium text-sm mb-2 tracking-wide line-clamp-1">
                    {stories[index].chuong_moi_nhat} • Đề cử
                  </p>
                  
                  {/* GIẢM SIZE CHỮ TIÊU ĐỀ */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3 drop-shadow-2xl max-w-4xl text-white line-clamp-2">
                    {stories[index].ten_truyen}
                  </h3>
                  
                  {/* GIẢM SIZE CHỮ MÔ TẢ & GIỚI HẠN DÒNG */}
                  {stories[index].mo_ta && (
                      <p className="text-gray-300 text-xs md:text-sm mb-5 line-clamp-2 hidden md:block px-4 font-light opacity-90">
                          {stories[index].mo_ta}
                      </p>
                  )}

                  <Link href={`/truyen/${stories[index].slug}`} className="inline-block mx-auto">
                    <button className="px-10 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-base shadow-2xl text-white transition-all hover:scale-105 hover:shadow-blue-500/50 flex items-center gap-2">
                        <BookOpen size={18} /> Đọc ngay
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Slide Phải (Hiệu ứng 3D) */}
            <motion.div
              className="hidden lg:block"
              animate={{ x: 160, rotateY: -50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <Image
                  src={getStory(index + 1).anh_bia}
                  fill
                  alt=""
                  unoptimized // FIX LỖI ẢNH KHÔNG HIỆN
                  className="object-cover opacity-90"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Nút điều hướng (Cải tiến giao diện) */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-blue-600/80 backdrop-blur-md transition text-white border border-white/10"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-blue-600/80 backdrop-blur-md transition text-white border border-white/10"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dots (Chỉ thị trang) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 ${
              i === index
                ? "w-8 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                : "w-2 h-2 bg-white/50 rounded-full hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}