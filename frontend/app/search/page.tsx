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
    <main className="min-h-screen bg-background pt-24 pb-12">
     
      {/* --- PHẦN 1: HERO SEARCH SECTION --- */}
      <div className="relative py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
              🔍 Tìm Kiếm Truyện
            </h1>
            <p className="text-muted-foreground text-lg">Khám phá hàng ngàn truyện tranh hấp dẫn</p>
          </div>
         
          <form method="GET" action="/search" className="max-w-2xl mx-auto">
            <div className="flex gap-3 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Tìm tên truyện, tác giả..."
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-foreground placeholder-muted-foreground transition"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- PHẦN 2: KẾT QUẢ TÌMKIẾM --- */}
      <div className="container mx-auto px-4 py-12">
       
        {/* Header kết quả */}
        {stories.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {query ? `✨ Kết quả tìm "${query}"` : "📚 Tất cả truyện"}
                </h2>
                <p className="text-muted-foreground">Tìm thấy <span className="text-blue-500 font-bold text-lg">{pagination.total}</span> truyện</p>
              </div>
              <div className="inline-block bg-blue-600 px-4 py-2 rounded-full shadow-lg">
                <span className="text-white font-bold">{pagination.total} kết quả</span>
              </div>
            </div>
            <div className="h-1 bg-blue-600 rounded-full"></div>
          </div>
        )}

        {/* Hiển thị truyện */}
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border">
            <Frown size={64} className="text-muted-foreground mb-6" />
            <p className="text-foreground text-xl mb-2 font-medium">Không tìm thấy truyện nào</p>
            <p className="text-muted-foreground mb-8">Hãy thử từ khóa khác hoặc khám phá những truyện nổi bật</p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 transform hover:scale-105"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  className="animate-in fade-in zoom-in duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="group relative h-full">
                    <StoryCard
                      slug={story.slug}
                      ten_truyen={story.ten_truyen}
                      anh_bia={story.anh_bia}
                      chuong_moi_nhat={story.chuong_moi_nhat}
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- PHẦN 3: PHÂN TRANG --- */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 py-8 border-t border-border pt-12">
                {currentPage > 1 ? (
                  <Link
                    href={`/search?q=${query}&page=${currentPage - 1}`}
                    className="px-4 py-2 bg-card hover:bg-accent border border-border text-foreground rounded-lg flex items-center gap-2 transition duration-300 transform hover:scale-105"
                  >
                    <ChevronLeft size={18} /> Trước
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-muted border border-border text-muted-foreground rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <ChevronLeft size={18} /> Trước
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Trang</span>
                  <span className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg">
                    {currentPage}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground font-semibold">{pagination.totalPages}</span>
                </div>

                {currentPage < pagination.totalPages ? (
                  <Link
                    href={`/search?q=${query}&page=${currentPage + 1}`}
                    className="px-4 py-2 bg-card hover:bg-accent border border-border text-foreground rounded-lg flex items-center gap-2 transition duration-300 transform hover:scale-105"
                  >
                    Sau <ChevronRight size={18} />
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-muted border border-border text-muted-foreground rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed">
                    Sau <ChevronRight size={18} />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}