'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { List, Search, Check } from 'lucide-react';

interface Chapter {
  id: number;
  chapter_num: number;
  title: string;
  created_at: string;
}

interface ChapterMenuProps {
  slug: string;
  chapters: Chapter[];
  currentChapterId: number;
}

export default function ChapterMenu({ slug, chapters, currentChapterId }: ChapterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Lọc chương
  const filteredChapters = chapters.filter(c => 
    (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.chapter_num.toString().includes(searchTerm)
  );

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset search khi mở menu
  useEffect(() => {
    if (isOpen) setSearchTerm('');
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. Nút bấm mở Menu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-lg transition-all duration-200 flex items-center justify-center
          ${isOpen ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-700/50 text-zinc-400 hover:text-white'}
        `}
        title="Danh sách chương"
      >
        <List size={24} />
      </button>

      {/* 2. Dropdown Menu (Giống ảnh mẫu) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-[#18181b] border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          
          {/* Thanh tìm kiếm (Sticky top) */}
          <div className="p-3 border-b border-zinc-700/50 bg-[#18181b]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Tìm số chương..." 
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Danh sách chương (Cuộn) */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {filteredChapters.length > 0 ? (
              <div className="flex flex-col p-1">
                {filteredChapters.map((chap) => {
                  const isActive = chap.id === Number(currentChapterId);
                  return (
                    <Link
                      key={chap.id}
                      href={`/truyen/${slug}/${chap.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                        ${isActive 
                          ? 'bg-blue-600/10 text-blue-400 font-medium' 
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }
                      `}
                    >
                      <span className="truncate">
                        {chap.title || `Chương ${chap.chapter_num}`}
                      </span>
                      {isActive && <Check size={14} className="shrink-0 ml-2" />}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
                <Search size={24} className="opacity-20" />
                <span>Không tìm thấy</span>
              </div>
            )}
          </div>

          {/* Footer nhỏ (Optional) */}
          <div className="px-3 py-2 bg-zinc-900/50 border-t border-zinc-700/50 text-[10px] text-zinc-500 text-center">
            Tổng số: {chapters.length} chương
          </div>
        </div>
      )}
    </div>
  );
}