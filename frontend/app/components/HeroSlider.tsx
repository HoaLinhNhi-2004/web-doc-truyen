"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { id: 1, title: "Hệ Thống Tự Save", genre: "Xuyên Không • Hài Hước", image: "/hero/1.webp" },
  { id: 2, title: "Toàn Chức Cao Thủ", genre: "Game • Thể Thao", image: "/hero/2.webp" },
  { id: 3, title: "Ma Đạo Tổ Sư", genre: "Đam Mỹ • Tiên Hiệp", image: "/hero/3.jpg" },
  { id: 4, title: "Đấu Phá Thương Khung", genre: "Huyền Huyễn", image: "/hero/4.jpg" },
  { id: 5, title: "Thiên Quan Tứ Phúc", genre: "Đam Mỹ • Huyền Huyễn", image: "/hero/5.webp" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1)), []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-transparent mt-24">
      {/* Background mờ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index].image}
            alt={slides[index].title}
            fill
            priority
            className="object-cover object-center opacity-15 dark:opacity-10"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="relative w-full max-w-7xl">
          <div className="flex items-center justify-center gap-8 md:gap-12">

            {/* Slide trái */}
            <motion.div
              className="hidden lg:block"
              animate={{ x: -160, rotateY: 50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <Image
                  src={slides[(index - 1 + slides.length) % slides.length].image}
                  fill
                  alt=""
                  className="object-cover opacity-90"
                />
              </div>
            </motion.div>

            {/* Slide chính giữa */}
            <motion.div
              key={index}
              initial={{ scale: 0.9, rotateY: -25 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 90 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-80 md:w-96 lg:w-[480px] h-[500px] md:h-[580px] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg group cursor-pointer">
                <Image
                  src={slides[index].image}
                  alt={slides[index].title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Gradient tối ở dưới */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Nội dung chữ + nút */}
                <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-20 px-8 text-center">
                  <p className="text-cyan-400 font-medium text-lg mb-3 tracking-wide">
                    {slides[index].genre}
                  </p>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-2xl max-w-4xl text-white">
                    {slides[index].title}
                  </h3>
                  <button className="mx-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg shadow-2xl text-white transition-all hover:scale-110 hover:shadow-blue-500/50">
                    Đọc ngay
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Slide phải */}
            <motion.div
              className="hidden lg:block"
              animate={{ x: 160, rotateY: -50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <Image
                  src={slides[(index + 1) % slides.length].image}
                  fill
                  alt=""
                  className="object-cover opacity-90"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Nút điều hướng – ĐÃ FIX HOÀN TOÀN CHO LIGHT MODE */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-md hover:bg-black/40 dark:hover:bg-white/30 transition"
      >
        <ChevronLeft className="w-8 h-8 text-white dark:text-black" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-md hover:bg-black/40 dark:hover:bg-white/30 transition"
      >
        <ChevronRight className="w-8 h-8 text-white dark:text-black" />
      </button>

      {/* Dots – ĐÃ FIX HOÀN TOÀN CHO LIGHT MODE */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all ${
              i === index
                ? "w-12 h-3 bg-white dark:bg-black rounded-full shadow-md"
                : "w-3 h-3 bg-white/60 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black"
            }`}
          />
        ))}
      </div>
    </div>
  );
}