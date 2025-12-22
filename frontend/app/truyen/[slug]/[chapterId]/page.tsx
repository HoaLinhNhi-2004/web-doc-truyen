'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, Lock, Unlock, Loader2 } from 'lucide-react';

// Import các Component phụ
import HistorySaver from '@/app/components/HistorySaver'; 
import ViewTracker from '@/app/components/ViewTracker'; 
import ChapterMenu from '@/app/components/ChapterMenu'; 

// 1. Interface
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

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

export default function ChapterReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  const router = useRouter();
  const { slug, chapterId } = use(params);

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State khóa chương
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    setToken(t);
    fetchChapterData(t);
    fetchChapterList();
  }, [chapterId, slug]);

  const fetchChapterData = async (authToken: string | null) => {
    setLoading(true);
    setIsLocked(false);
    setError('');

    try {
      const headers: any = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`http://127.0.0.1:5000/api/chapters/${chapterId}`, { 
        headers,
        cache: 'no-store' 
      });

      // Xử lý khi bị khóa (402: Payment Required hoặc 403: Forbidden)
      if (res.status === 402 || res.status === 403) {
        const errorData = await res.json();
        
        // Vẫn lưu data cơ bản để hiện tên chương, nút prev/next
        setChapter(errorData.data || null); 
        setIsLocked(true);
        // Lấy giá tiền từ data trả về
        setUnlockPrice(errorData.data?.price || 0);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Không tìm thấy chương');

      const jsonData = await res.json();
      setChapter(jsonData.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối server hoặc không tìm thấy chương.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterList = async () => {
      try {
          const res = await fetch(`http://127.0.0.1:5000/api/stories/${slug}`);
          const data = await res.json();
          setAllChapters(data.data?.chapters || []);
      } catch (e) {
          console.error(e);
      }
  };

  const handleUnlock = async () => {
    if (!token) {
        if(confirm("Bạn cần đăng nhập để mua chương này. Chuyển đến trang đăng nhập?")) {
            router.push('/sign-in');
        }
        return;
    }

    if (!confirm(`Bạn có chắc muốn dùng ${unlockPrice} xu để mở khóa chương này?`)) return;

    setProcessing(true);
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/payment/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ chapterId: chapterId })
        });

        const data = await res.json();

        if (data.status === 'success' || data.status === 'already_owned') {
            alert("Mở khóa thành công!");
            window.location.reload(); 
        } else if (data.status === 'not_enough_money') {
            alert("Bạn không đủ xu! Vui lòng nạp thêm.");
        } else {
            alert(data.message || "Lỗi giao dịch");
        }
    } catch (err) {
        alert("Lỗi kết nối server");
    } finally {
        setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Đang tải nội dung...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy chương này 😔</h1>
        <Link href={`/truyen/${slug}`} className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
          Quay lại trang truyện
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 text-gray-200 min-h-screen flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-[60] bg-zinc-800/95 backdrop-blur border-b border-zinc-700 shadow-lg">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
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

          <div className="flex items-center gap-1">
            <Link
              href={chapter.prev_chapter ? `/truyen/${slug}/${chapter.prev_chapter.id}` : '#'}
              className={`p-2 rounded hover:bg-zinc-700 transition flex items-center justify-center ${!chapter.prev_chapter ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <ChevronLeft size={24} />
            </Link>
            
            <ChapterMenu 
                slug={slug} 
                chapters={allChapters} 
                currentChapterId={chapter.id} 
            />

            <Link
              href={chapter.next_chapter ? `/truyen/${slug}/${chapter.next_chapter.id}` : '#'}
              className={`p-2 rounded hover:bg-zinc-700 transition flex items-center justify-center ${!chapter.next_chapter ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 container mx-auto max-w-4xl py-6 md:py-10 px-0 md:px-4">
        
        {/* LOGIC KHÓA CHƯƠNG */}
        {isLocked ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-800 rounded-xl border border-yellow-600/30 mx-4 mt-10 shadow-2xl">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-zinc-700 mb-6 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <Lock size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Chương VIP</h2>
                <p className="text-zinc-400 mb-8 text-lg">
                    Bạn cần <strong>{unlockPrice} Xu</strong> để mở khóa nội dung này.
                </p>
                
                {token ? (
                    <button 
                        onClick={handleUnlock}
                        disabled={processing}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-full transition transform hover:scale-105 shadow-lg flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processing ? <Loader2 className="animate-spin" /> : <Unlock size={20} />}
                        {processing ? 'Đang xử lý...' : `Mở Khóa Ngay (-${unlockPrice} xu)`}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-red-400 italic">Bạn chưa đăng nhập</p>
                        <Link href="/sign-in" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition">
                            Đăng nhập để mua
                        </Link>
                    </div>
                )}
            </div>
        ) : (
            // LOGIC HIỂN THỊ NỘI DUNG (KHI ĐÃ MỞ KHÓA)
            <>
                <HistorySaver storyId={chapter.story.id} chapterId={chapter.id} />
                <ViewTracker storyId={chapter.story.id} chapterId={chapter.id} />

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

                {chapter.content?.content_text && (
                    <div className="prose prose-invert prose-lg max-w-none px-6 py-8 bg-zinc-800 rounded-xl mx-4 leading-loose text-justify font-serif border border-zinc-700 shadow-xl">
                        <div dangerouslySetInnerHTML={{ __html: chapter.content.content_text.replace(/\n/g, '<br/><br/>') }} />
                    </div>
                )}

                {!chapter.content?.content_images?.length && !chapter.content?.content_text && (
                     <div className="text-center py-20 text-zinc-500 italic">
                        Nội dung chương này đang được cập nhật...
                     </div>
                )}
            </>
        )}

      </div>

      {/* --- FOOTER NAVIGATION --- */}
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

    </div>
  );
}