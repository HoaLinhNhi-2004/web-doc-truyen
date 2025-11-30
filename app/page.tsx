// app/page.tsx
import HeroSlider from "./components/HeroSlider";
import StoryCard from "./components/StoryCard";

interface Story {
  id?: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

async function getNewStories(): Promise<Story[]> {
  const res = await fetch("http://localhost:3000/data/truyen-moi-nhat.json", {
    cache: "no-store", // BẮT BUỘC khi dev để thấy thay đổi ngay
  });

  if (!res.ok) {
    console.error("Lỗi tải dữ liệu truyện");
    return [];
  }
  return await res.json();
}

// Component Section chung – đẹp, có nút ← →
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
              <button className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-2xl font-light">
                ←
              </button>
              <button className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-2xl font-light">
                →
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-4 px-4">
          {stories.map((story) => (
            <div
              key={story.slug}
              className="flex-none w-48 md:w-56 lg:w-64 snap-center"
            >
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

      {/* TRUYỆN MỚI CẬP NHẬT */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-red-500 flex items-center gap-4">
                <span className="w-2 h-12 bg-red-500 rounded-full"></span>
                TRUYỆN MỚI CẬP NHẬT
              </h2>
              <p className="text-muted-foreground mt-2">
                Những bộ truyện vừa được cập nhật chương mới nhất.
              </p>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-4 px-4">
            {stories.length === 0 ? (
              <p className="text-center w-full py-20 text-xl text-muted-foreground">
                Đang tải dữ liệu...
              </p>
            ) : (
              stories.slice(0, 24).map((story) => (
                <div
                  key={story.slug}
                  className="flex-none w-48 md:w-56 lg:w-64 snap-center"
                >
                  <StoryCard {...story} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3 SECTION ĐỒNG NHẤT + CÓ NÚT ← → */}
      <Section
        title="TOP THỊNH HÀNH"
        subtitle="Truyện được mọi người yêu thích nhất tuần này."
        stories={stories.slice(0, 15)}
      />

      <Section
        title="TRUYỆN HOT"
        subtitle="Đang làm mưa làm gió trên bảng xếp hạng."
        stories={stories.slice(3, 18)}
      />

      <Section
        title="THEO DÕI NHIỀU NHẤT"
        subtitle="Hàng triệu người đang chờ chap mới."
        stories={stories.slice(8, 23)}
      />
    </>
  );
}