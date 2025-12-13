import HeroSlider from "./components/HeroSlider";
import StoryCard from "./components/StoryCard";

// 1. Interface cho Component (Giữ nguyên)
interface Story {
  id?: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

// 2. Hàm gọi API
async function getNewStories(): Promise<Story[]> {
  // 👇 GỌI TRỰC TIẾP BACKEND 5000 (Không qua Proxy 3000 nữa để chắc chắn)
  const apiUrl = `http://127.0.0.1:5000/api/stories`;
  
  console.log("🚀 [Frontend] Đang gọi API:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store", 
    });

    if (!res.ok) {
      console.error(`❌ [Frontend] Lỗi HTTP: ${res.status} ${res.statusText}`);
      return [];
    }

    const jsonData = await res.json();
    // Lấy dữ liệu từ key 'data' hoặc mảng trực tiếp
    const backendData = jsonData.data || jsonData;

    if (!Array.isArray(backendData)) {
      console.error("⚠️ [Frontend] Dữ liệu không phải mảng:", backendData);
      return [];
    }

    console.log(`✅ [Frontend] Kết nối OK! Lấy được ${backendData.length} truyện.`);

    // Map dữ liệu từ Backend sang Frontend
    return backendData.map((item: any) => ({
      id: item._id,
      slug: item.slug,
      ten_truyen: item.name,
      anh_bia: item.thumbnail,
      chuong_moi_nhat: typeof item.latestChapter === 'object' 
        ? item.latestChapter?.title 
        : (item.latestChapter || 'Đang cập nhật')
    }));

  } catch (error) {
    console.error("❌ [Frontend] Lỗi kết nối Backend:", error);
    return [];
  }
}

// Component Section
function Section({
  title,
  subtitle,
  stories,
}: {
  title: string;
  subtitle?: string;
  stories: Story[];
}) {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-red-500 flex items-center gap-4">
              <span className="w-2 h-12 bg-red-500 rounded-full"></span>
              {title}
            </h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          {stories.length > 4 && (
            <div className="hidden md:flex items-center gap-3">
              <button className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-2xl font-light">←</button>
              <button className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-2xl font-light">→</button>
            </div>
          )}
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-4 px-4">
          {stories.map((story) => (
            <div key={story.slug} className="flex-none w-48 md:w-56 lg:w-64 snap-center">
              <StoryCard {...story} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const stories = await getNewStories();

  return (
    <>
      <div className="pt-24 md:pt-28" />
      <div className="relative -top-24 md:-top-28">
        <HeroSlider />
      </div>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-red-500 flex items-center gap-4">
                <span className="w-2 h-12 bg-red-500 rounded-full"></span>
                TRUYỆN MỚI CẬP NHẬT
              </h2>
              <p className="text-muted-foreground mt-2">Những bộ truyện vừa được cập nhật chương mới nhất từ hệ thống.</p>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-4 px-4">
            {stories.length === 0 ? (
              <p className="text-center w-full py-20 text-xl text-muted-foreground">
                Đang tải dữ liệu...
              </p>
            ) : (
              stories.slice(0, 24).map((story) => (
                <div key={story.slug} className="flex-none w-48 md:w-56 lg:w-64 snap-center">
                  <StoryCard {...story} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Section title="TOP THỊNH HÀNH" subtitle="Truyện được mọi người yêu thích nhất tuần này." stories={stories.slice(0, 15)} />
      <Section title="TRUYỆN HOT" subtitle="Đang làm mưa làm gió trên bảng xếp hạng." stories={stories.slice(3, 18)} />
      <Section title="THEO DÕI NHIỀU NHẤT" subtitle="Hàng triệu người đang chờ chap mới." stories={stories.slice(8, 23)} />
    </>
  );
}