// app/page.tsx ← CHỈ SỬA PHẦN TRUYỆN MỚI CẬP NHẬT, GIỐNG HỆT TOP THỊNH HÀNH
import HeroSlider from "./components/HeroSlider";
import StoryCard from "./components/StoryCard";

interface Story {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

async function getNewStories(): Promise<Story[]> {
  const res = await fetch("http://localhost:3000/data/truyen-moi-nhat.json", {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    console.error("Lỗi tải dữ liệu truyện mới nhất");
    return [];
  }
  const data: Story[] = await res.json();
  return data;
}

function Section({
  title,
  subtitle,
  stories,
  showArrows = true,
}: {
  title: string;
  subtitle?: string;
  stories: Story[];
  showArrows?: boolean;
}) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-red-500 flex items-center gap-4">
              <span className="w-2 h-12 bg-red-500 rounded-full"></span>
              {title}
            </h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          {showArrows && stories.length > 4 && (
            <div className="hidden md:flex gap-3">
              <button className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-2xl font-light">
                Previous
              </button>
              <button className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-2xl font-light">
                Next
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex-none w-48 md:w-56 lg:w-60 snap-center group"
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
  const newStories = await getNewStories();
  const stories = newStories.length > 0 ? newStories : [];

  return (
    <>
      {/* ĐẨY NỘI DUNG XUỐNG ĐỂ KHÔNG BỊ HEADER ĐÈ */}
      <div className="pt-24 md:pt-28" />

      {/* HERO SLIDER – GIỮ NGUYÊN */}
      <div className="relative -top-24 md:-top-28">
        <HeroSlider />
      </div>

      {/* TRUYỆN MỚI CẬP NHẬT – ĐÃ ĐẸP GIỐNG HỆT TOP THỊNH HÀNH */}
      <section className="py-12">
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

          <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4">
            {stories.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground text-xl w-full">
                Đang tải dữ liệu...
              </p>
            ) : (
              stories.slice(0, 24).map((story) => (
                <div
                  key={story.id}
                  className="flex-none w-48 md:w-56 lg:w-60 snap-center group"
                >
                  <StoryCard
                    slug={story.slug}
                    ten_truyen={story.ten_truyen}
                    anh_bia={story.anh_bia}
                    chuong_moi_nhat={story.chuong_moi_nhat}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CÁC SECTION KHÁC GIỮ NGUYÊN 100% */}
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
        showArrows={true}
      />
    </>
  );
}