// app/page.tsx
import StoryCard from "./components/StoryCard";

// Định nghĩa kiểu dữ liệu cho một truyện, khớp với file JSON
interface Story {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

// Hàm để lấy dữ liệu
// Dùng 'fetch' để gọi đến API giả (file JSON trong public)
async function getNewStories() {
  // Đây là URL API giả của bạn
  // Khi backend thật hoàn thành, bạn CHỈ CẦN đổi URL này
  const res = await fetch('http://localhost:3000/data/truyen-moi-nhat.json');
  
  if (!res.ok) {
    throw new Error('Không thể tải dữ liệu');
  }
  
  const data: Story[] = await res.json();
  return data;
}

// Đây là component Trang chủ
export default async function HomePage() {
  // Gọi hàm lấy dữ liệu
  const newStories = await getNewStories();

  return (
    <main className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Truyện Mới Cập Nhật</h1>

      {/* Dùng Tailwind CSS Grid để tạo lưới truyện */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {/* Lặp qua mảng dữ liệu và render component StoryCard */}
        {newStories.map((story) => (
          <StoryCard
            key={story.id}
            slug={story.slug}
            ten_truyen={story.ten_truyen}
            anh_bia={story.anh_bia}
            chuong_moi_nhat={story.chuong_moi_nhat}
          />
        ))}
      </div>
    </main>
  );
}