import Link from 'next/link';
import { Search, Loader2, Frown, ChevronLeft, ChevronRight } from 'lucide-react';
import StoryCard from '../components/StoryCard';

// 1. Định nghĩa Interface cho dữ liệu
interface Story {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

interface SearchResponse {
  data: any[];
  pagination: {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
}

// Helper xử lý link ảnh (Thêm domain 127.0.0.1:5000 nếu thiếu)
const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

// 2. Hàm gọi API Tìm kiếm từ Backend
async function fetchSearchResults(query: string, page: number): Promise<SearchResponse | null> {
  // Gọi trực tiếp IP 127.0.0.1:5000 để tránh lỗi mạng trên Windows
  // Backend hỗ trợ các tham số: keyword, page, limit
  const apiUrl = `http://127.0.0.1:5000/api/stories?keyword=${encodeURIComponent(query)}&page=${page}&limit=12`;
  
  console.log("🔍 [Search] Đang gọi API:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("❌ Lỗi tìm kiếm:", error);
    return null;
  }
}

// 3. Component Chính
export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  // Giải nén Promise searchParams (Yêu cầu của Next.js mới)
  const searchParams = await props.searchParams;
  
  const query = searchParams.q || "";
  const currentPage = Number(searchParams.page) || 1;

  // Gọi API lấy dữ liệu
  const result = await fetchSearchResults(query, currentPage);
  
  // Map dữ liệu từ Backend sang Frontend
  const stories: Story[] = result?.data?.map((item: any) => ({
    id: String(item.id),
    slug: item.slug,
    ten_truyen: item.title, // Backend: title -> Frontend: ten_truyen
    anh_bia: getImageUrl(item.cover_image),
    chuong_moi_nhat: item.chapters && item.chapters.length > 0 
        ? item.chapters[0].title 
        : 'Đang cập nhật'
  })) || [];

  const pagination = result?.pagination || { totalPages: 1, currentPage: 1, total: 0 };

  return (
    <main className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      
      {/* --- PHẦN 1: FORM TÌM KIẾM --- */}
      <div className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Tìm kiếm truyện</h1>
        
        <form method="GET" action="/search" className="flex gap-2 shadow-lg rounded-lg overflow-hidden">
          <div className="relative grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Nhập tên truyện, tác giả..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-foreground"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* --- PHẦN 2: KẾT QUẢ --- */}
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-xl font-semibold text-foreground">
          {query ? `Kết quả cho "${query}":` : "Tất cả truyện mới nhất:"}
        </h2>
        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-bold">
          {pagination.total} kết quả
        </span>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <Frown size={48} className="text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-4">Không tìm thấy truyện nào phù hợp.</p>
          <Link href="/" className="text-blue-500 hover:underline font-medium">
            Quay về trang chủ xem truyện mới
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="animate-in fade-in zoom-in duration-300">
                <StoryCard 
                    slug={story.slug}
                    ten_truyen={story.ten_truyen}
                    anh_bia={story.anh_bia}
                    chuong_moi_nhat={story.chuong_moi_nhat}
                />
            </div>
          ))}
        </div>
      )}

      {/* --- PHẦN 3: PHÂN TRANG (Dùng dữ liệu thật từ Backend) --- */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-3">
          {/* Nút Trước */}
          {currentPage > 1 ? (
            <Link 
              href={`/search?q=${query}&page=${currentPage - 1}`}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent flex items-center gap-1 transition"
            >
              <ChevronLeft size={16} /> Trang trước
            </Link>
          ) : (
            <span className="px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed flex items-center gap-1 opacity-50">
              <ChevronLeft size={16} /> Trang trước
            </span>
          )}

          <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800 rounded-lg">
            {currentPage} / {pagination.totalPages}
          </span>

          {/* Nút Sau */}
          {currentPage < pagination.totalPages ? (
            <Link 
              href={`/search?q=${query}&page=${currentPage + 1}`}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent flex items-center gap-1 transition"
            >
              Trang sau <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed flex items-center gap-1 opacity-50">
              Trang sau <ChevronRight size={16} />
            </span>
          )}
        </div>
      )}
    </main>
  );
}