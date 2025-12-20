"use client";

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StoryCard from './StoryCard';

interface Story {
  id?: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

interface StoryListProps {
  title: string;
  subtitle?: string;
  stories: Story[];
}

export default function StoryList({ title, subtitle, stories }: StoryListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hàm cuộn danh sách
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300; // Khoảng cách mỗi lần cuộn (px)
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-red-500 flex items-center gap-3 uppercase">
              <span className="w-1.5 h-8 bg-red-500 rounded-full"></span>
              {title}
            </h2>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>

          {/* Nút Điều Hướng (Chỉ hiện khi có nhiều truyện) */}
          {stories.length > 4 && (
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition flex items-center justify-center"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Danh sách truyện (Ẩn thanh cuộn bằng CSS) */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
          {stories.length === 0 ? (
             <div className="w-full py-10 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                Đang cập nhật dữ liệu...
             </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.slug}
                className="flex-none w-40 md:w-[200px]"
              >
                <StoryCard {...story} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}