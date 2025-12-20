import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, AlertCircle } from 'lucide-react';
import HistorySaver from '@/app/components/HistorySaver'; 
import ViewTracker from '@/app/components/ViewTracker'; 
import ChapterMenu from '@/app/components/ChapterMenu'; // 👈 Import Component Menu

// 1️⃣ Interface dữ liệu
interface ChapterNavigation {
  id: number;
  chapter_num: number;
}

interface ChapterContent {
  content_images?: string[]; 
  content_text?: string;    
}

interface ChapterData {
  id: number;
  title: string;
  chapter_num: number;
  price: number; 
  content?: ChapterContent;
  story: {
    id: number;
    title: string;
    slug: string;
  };
  prev_chapter?: ChapterNavigation | null;
  next_chapter?: ChapterNavigation | null;
}

// 2️⃣ Helper xử lý link ảnh
const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

// 3️⃣ Hàm gọi API lấy nội dung chương
async function getChapterData(chapterId: string): Promise<ChapterData | null> {
  const apiUrl = `http://127.0.0.1:5000/api/chapters/${chapterId}`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 402 || res.status === 403) {
         const errorData = await res.json();
         return errorData.data || null;
      }
      console.error(`❌ Lỗi tải chương: ${res.status}`);
      return null;
    }

    const jsonData = await res.json();
    return jsonData.data || jsonData;
  } catch (error) {
    console.error("❌ Lỗi kết nối Backend:", error);
    return null;
  }
}

// 👇 Hàm lấy danh sách tất cả chương của truyện (Để truyền vào Menu)
async function getAllChapters(slug: string) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/stories/${slug}`, { cache: 'no-store' });
        const data = await res.json();
        return data.data?.chapters || [];
    } catch (error) {
        return [];
    }
}

// 4️⃣ Component Chính
export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  const { slug, chapterId } = await params;

  // Gọi song song 2 API để tối ưu tốc độ
  const [chapter, allChapters] = await Promise.all([
      getChapterData(chapterId),
      getAllChapters(slug)
  ]);

  if (!chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy chương này 😔</h1>
        <Link href={`/truyen/${slug}`} className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
          Quay lại trang truyện
        </Link>
      </div>
    );
  }

  const isLocked = !chapter.content?.content_images && !chapter.content?.content_text && chapter.price > 0;

  return (
    <div className="bg-zinc-900 text-gray-200 min-h-screen flex flex-col">
      
      {/* --- THANH ĐIỀU HƯỚNG TRÊN (Sticky) --- */}
      <div className="sticky top-0 z-[60] bg-zinc-800/95 backdrop-blur border-b border-zinc-700 shadow-lg">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 overflow-hidden text-sm md:text-base">
            <Link href="/" className="p-2 hover:bg-zinc-700 rounded-full transition flex items-center justify-center" title="Trang chủ">
              <Home size={18} />
            </Link>
            <ChevronRight size={16} className="text-zinc-500 shrink-0" />
            <Link 
              href={`/truyen/${slug}`} 
              className="font-bold truncate hover:text-blue-400 transition max-w-[120px] md:max-w-xs"
            >
              {chapter.story.title}
            </Link>
            <span className="text-zinc-500 shrink-0">/</span>
            <span className="text-blue-400 font-medium whitespace-nowrap truncate">
              {chapter.title || `Chương ${chapter.chapter_num}`}
            </span>
          </div>

          {/* Nút điều hướng nhanh */}
          <div className="flex items-center gap-1">
            <Link
              href={chapter.prev_chapter ? `/truyen/${slug}/${chapter.prev_chapter.id}` : '#'}
              className={`p-2 rounded hover:bg-zinc-700 transition flex items-center justify-center ${!chapter.prev_chapter ? 'opacity-30 pointer-events-none' : ''}`}
              title="Chương trước"
            >
              <ChevronLeft size={24} />
            </Link>
            
            {/* 👇 ĐÃ THAY THẾ LINK BẰNG COMPONENT MENU */}
            <ChapterMenu 
                slug={slug} 
                chapters={allChapters} 
                currentChapterId={chapter.id} 
            />

            <Link
              href={chapter.next_chapter ? `/truyen/${slug}/${chapter.next_chapter.id}` : '#'}
              className={`p-2 rounded hover:bg-zinc-700 transition flex items-center justify-center ${!chapter.next_chapter ? 'opacity-30 pointer-events-none' : ''}`}
              title="Chương sau"
            >
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- NỘI DUNG CHƯƠNG --- */}
      <div className="flex-1 container mx-auto max-w-4xl py-6 md:py-10 px-0 md:px-4">
        
        {/* Trường hợp 1: Chương VIP bị khóa */}
        {isLocked && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-800 rounded-xl border border-yellow-600/30 mx-4 mt-10">
                <div className="w-16 h-16 bg-yellow-900/30 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Chương này đã bị khóa</h2>
                <p className="text-zinc-400 mb-6">
                    Bạn cần <strong>{chapter.price} Xu</strong> để mở khóa nội dung này.
                </p>
                <button className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-yellow-600/20">
                    Mở Khóa Ngay
                </button>
            </div>
        )}

        {/* Trường hợp 2: Truyện Tranh (Ảnh) */}
        {chapter.content?.content_images && chapter.content.content_images.length > 0 && (
          <div className="flex flex-col items-center bg-black md:bg-transparent space-y-0 md:space-y-4">
            {chapter.content.content_images.map((imgUrl, index) => (
              <div key={index} className="relative w-full max-w-3xl shadow-2xl">
                <img
                  src={getImageUrl(imgUrl)}
                  alt={`Trang ${index + 1}`}
                  className="w-full h-auto block md:rounded-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Trường hợp 3: Truyện Chữ (Text) */}
        {chapter.content?.content_text && (
            <div className="prose prose-invert prose-lg max-w-none px-6 py-8 bg-zinc-800 rounded-xl mx-4 leading-loose text-justify font-serif border border-zinc-700 shadow-xl">
                <div dangerouslySetInnerHTML={{ __html: chapter.content.content_text.replace(/\n/g, '<br/><br/>') }} />
            </div>
        )}

        {/* Thông báo nếu chương trống */}
        {!isLocked && !chapter.content?.content_images?.length && !chapter.content?.content_text && (
             <div className="text-center py-20 text-zinc-500 italic">
                Nội dung chương này đang được cập nhật...
             </div>
        )}

      </div>

      {/* --- ĐIỀU HƯỚNG DƯỚI CÙNG --- */}
      <div className="py-8 border-t border-zinc-800 bg-zinc-900 mt-auto">
        <div className="container mx-auto px-4 flex justify-between max-w-4xl gap-4">
            <Link 
                href={chapter.prev_chapter ? `/truyen/${slug}/${chapter.prev_chapter.id}` : '#'}
                className={`flex-1 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 font-bold flex items-center justify-center gap-2 border border-zinc-700 transition ${!chapter.prev_chapter ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <ChevronLeft size={20} /> Chap Trước
            </Link>

            <Link 
                href={chapter.next_chapter ? `/truyen/${slug}/${chapter.next_chapter.id}` : '#'}
                className={`flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition ${!chapter.next_chapter ? 'opacity-50 pointer-events-none' : ''}`}
            >
                Chap Sau <ChevronRight size={20} />
            </Link>
        </div>
      </div>

      {/* 👇 CÁC COMPONENT LOGIC ẨN (Client Components) */}
      <HistorySaver storyId={chapter.story.id} chapterId={chapter.id} />
      <ViewTracker storyId={chapter.story.id} chapterId={chapter.id} /> 

    </div>
  );
}