import HeroSlider from "./components/HeroSlider";
import StoryList from "./components/StoryList"; // 👈 Sử dụng Component mới

// 1. Interface cho Component
interface Story {
  id?: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
  mo_ta?: string; // Thêm trường mô tả cho Slider
}

// Helper xử lý link ảnh (Thêm domain nếu thiếu)
const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  
  // Nếu là link tương đối (uploads/...) -> Thêm domain backend
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

// 2. Hàm gọi API lấy truyện MỚI
async function getNewStories(): Promise<Story[]> {
  const apiUrl = `http://127.0.0.1:5000/api/stories?sort=new&limit=24`;
  console.log("🚀 [Home] Tải truyện mới:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      console.error(`❌ [Home] Lỗi HTTP: ${res.status}`);
      return [];
    }

    const jsonData = await res.json();
    const backendData = jsonData.data || jsonData;

    if (!Array.isArray(backendData)) return [];

    // Map dữ liệu từ Backend sang Frontend
    return backendData.map((item: any) => ({
      id: item._id || item.id,
      slug: item.slug,
      ten_truyen: item.title || item.name || "Chưa có tên",
      anh_bia: getImageUrl(item.cover_image || item.thumbnail),
      chuong_moi_nhat: typeof item.latestChapter === 'object' 
        ? item.latestChapter?.title 
        : (item.latestChapter || 'Đang cập nhật')
    }));

  } catch (error) {
    console.error("❌ [Home] Lỗi kết nối Backend:", error);
    return [];
  }
}

// 3. Hàm gọi API lấy truyện ĐỀ CỬ (Cho Slider)
async function getFeaturedStories(): Promise<Story[]> {
    const apiUrl = `http://127.0.0.1:5000/api/stories?sort=view&limit=5`;
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) return [];
      const jsonData = await res.json();
      const data = jsonData.data || [];
      
      return data.map((item: any) => ({
        id: item._id || item.id,
        slug: item.slug,
        ten_truyen: item.title || item.name,
        anh_bia: getImageUrl(item.cover_image),
        chuong_moi_nhat: item.latestChapter?.title || 'Đang cập nhật',
        mo_ta: item.description
      }));
    } catch (error) {
      return [];
    }
}

export default async function HomePage() {
  // Gọi song song 2 API để tối ưu tốc độ
  const [newStories, featuredStories] = await Promise.all([
    getNewStories(),
    getFeaturedStories()
  ]);

  return (
    <>
      <div className="pt-24 md:pt-28" />
      <div className="relative -top-24 md:-top-28">
        <HeroSlider stories={featuredStories} />
      </div>

      {/* --- SỬ DỤNG STORYLIST THAY CHO SECTION CŨ --- */}
      
      <StoryList
        title="TRUYỆN MỚI CẬP NHẬT"
        subtitle="Những bộ truyện vừa được cập nhật chương mới nhất từ hệ thống."
        stories={newStories.slice(0, 12)}
      />

      <StoryList
        title="TOP THỊNH HÀNH"
        subtitle="Truyện được mọi người yêu thích nhất tuần này."
        stories={newStories.slice(0, 15)}
      />

      <StoryList
        title="TRUYỆN HOT"
        subtitle="Đang làm mưa làm gió trên bảng xếp hạng."
        stories={newStories.slice(3, 18)}
      />

      <StoryList
        title="THEO DÕI NHIỀU NHẤT"
        subtitle="Hàng triệu người đang chờ chap mới."
        stories={newStories.slice(8, 23)}
      />
    </>
  );
}