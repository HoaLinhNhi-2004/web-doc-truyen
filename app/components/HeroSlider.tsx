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

            <motion.div
              className="hidden lg:block"
              animate={{ x: -160, rotateY: 50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 dark:ring-white/10 backdrop-blur-md">
                <Image src={slides[(index - 1 + slides.length) % slides.length].image} fill alt="" className="object-cover opacity-90" />
              </div>
            </motion.div>

            <motion.div
              key={index}
              initial={{ scale: 0.9, rotateY: -25 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 90 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-80 md:w-96 lg:w-[480px] h-[500px] md:h-[580px] rounded-3xl overflow-hidden shadow-3xl ring-8 ring-white/30 dark:ring-white/15 backdrop-blur-lg group cursor-pointer">
                <Image
                  src={slides[index].image}
                  alt={slides[index].title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent dark:from-black/70" />

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-cyan-400 font-medium text-lg mb-3">{slides[index].genre}</p>
                  <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-2xl">
                    {slides[index].title}
                  </h3>
                  <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg shadow-2xl transition hover:scale-105">
                    Đọc ngay
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block"
              animate={{ x: 160, rotateY: -50, scale: 0.82, opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 dark:ring-white/10 backdrop-blur-md">
                <Image src={slides[(index + 1) % slides.length].image} fill alt="" className="object-cover opacity-90" />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur hover:bg-white/20 dark:hover:bg-black/30 transition">
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur hover:bg-white/20 dark:hover:bg-black/30 transition">
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all ${i === index ? "w-12 h-3 bg-white/70 rounded-full" : "w-3 h-3 bg-white/40 rounded-full hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
