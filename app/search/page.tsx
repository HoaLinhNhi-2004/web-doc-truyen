// app/search/page.tsx
import path from 'path';
import fs from 'fs/promises';
import StoryCard from "../components/StoryCard"; // Import component StoryCard

// MỚI: Định nghĩa số lượng truyện trên mỗi trang
// Chúng ta dùng số 2 (rất nhỏ) để dễ dàng kiểm tra phân trang
const STORIES_PER_PAGE = 2;

// ... (Interface Story và hàm getAllStories giữ nguyên) ...
interface Story {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string; // Đảm bảo tên này khớp với file JSON
}

async function getAllStories() {
  try {
    const jsonFilePath = path.join(
      process.cwd(), 
      'public', 
      'data', 
      'truyen-moi-nhat.json'
    );
    const fileContent = await fs.readFile(jsonFilePath, 'utf8');
    const data: Story[] = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("LỖI ĐỌC FILE KHI TÌM KIẾM:", error);
    return []; 
  }
}

// Component nhận props (bao gồm searchParams)
export default async function SearchPage(props: {
  searchParams: { 
    q?: string;
    page?: string; // MỚI: Nhận thêm 'page' từ URL
  };
}) {
  
  // "await" props.searchParams để giải nén Promise
  const searchParams = await props.searchParams;
  
  // Lấy từ khóa tìm kiếm
  const query = searchParams?.q || "";
  
  // MỚI: Lấy số trang. Mặc định là trang 1.
  // Dùng 'Number()' để chuyển "page" (string) thành số.
  const currentPage = Number(searchParams?.page) || 1;

  // Lấy tất cả truyện
  const allStories = await getAllStories();

  // 1. LỌC (Filter) theo từ khóa 'query'
  const filteredStories = allStories.filter(story => 
    story.ten_truyen.toLowerCase().includes(query.toLowerCase())
  );

  // MỚI: 2. CẮT (Slice) mảng kết quả đã lọc để phân trang
  // Tính toán tổng số truyện và tổng số trang
  const totalStories = filteredStories.length;
  const totalPages = Math.ceil(totalStories / STORIES_PER_PAGE);

  // Tính toán chỉ số bắt đầu và kết thúc
  const startIndex = (currentPage - 1) * STORIES_PER_PAGE;
  const endIndex = startIndex + STORIES_PER_PAGE;

  // Cắt mảng để lấy đúng các truyện cho trang hiện tại
  const pagedStories = filteredStories.slice(startIndex, endIndex);

  

  // MỚI: Tính toán trang trước và trang sau
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <main className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Tìm kiếm truyện
      </h1>

      {/* Thanh tìm kiếm (giữ nguyên) */}
      <form method="GET" action="/search" className="mb-8">
        <div className="flex">
          <input 
            type="text"
            name="q"
            placeholder="Nhập tên truyện..."
            className="grow rounded-l-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={query}
          />
          <button 
            type="submit"
            className="rounded-r-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Tìm
          </button>
        </div>
      </form>

      {/* Hiển thị kết quả (Sửa lại: dùng pagedStories) */}
      <h2 className="mb-4 text-xl font-semibold">
        {query ? `Kết quả cho "${query}":` : "Tất cả truyện"}
      </h2>

      {pagedStories.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy kết quả nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {/* MỚI: Dùng 'pagedStories' thay vì 'filteredStories' */}
          {pagedStories.map((story) => (
            <StoryCard
              key={story.id}
              slug={story.slug}
              ten_truyen={story.ten_truyen}
              anh_bia={story.anh_bia}
              chuong_moi_nhat={story.chuong_moi_nhat}
            />
          ))}
        </div>
      )}

      {/* MỚI: Khu vực điều khiển Phân trang */}
      <div className="mt-8 flex justify-center gap-4">
        {/* Nút Trang trước */}
        {hasPrevPage ? (
          <a 
            href={`/search?q=${query}&page=${currentPage - 1}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            &larr; Trang trước
          </a>
        ) : (
          <span className="rounded-md bg-gray-300 px-4 py-2 text-gray-500 cursor-not-allowed">
            &larr; Trang trước
          </span>
        )}

        {/* Hiển thị số trang */}
        <span className="flex items-center px-4 py-2">
          Trang {currentPage} / {totalPages}
        </span>

        {/* Nút Trang sau */}
        {hasNextPage ? (
          <a 
            href={`/search?q=${query}&page=${currentPage + 1}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Trang sau &rarr;
          </a>
        ) : (
          <span className="rounded-md bg-gray-300 px-4 py-2 text-gray-500 cursor-not-allowed">
            Trang sau &rarr;
          </span>
        )}
      </div>
    </main>
  );
}