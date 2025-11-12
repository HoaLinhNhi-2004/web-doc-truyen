// 📁 app/truyen/[slug]/page.tsx
import Image from 'next/image';

// 🧩 1️⃣ Định nghĩa kiểu dữ liệu khớp với file JSON
interface Chapter {
  id: string;
  ten_chuong: string;
}

interface StoryDetail {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  tac_gia: string;
  tinh_trang: string;
  the_loai: string[];
  mo_ta: string;
  danh_sach_chuong: Chapter[];
}

// 🧠 2️⃣ Hàm lấy dữ liệu chi tiết truyện
async function getStoryDetails(slug: string) {
  const res = await fetch(`http://localhost:3000/data/truyen/${slug}.json`, {
    cache: 'no-cache',
  });

  if (!res.ok) {
    // Nếu không tìm thấy file JSON => thông báo lỗi
    throw new Error('Không tìm thấy truyện');
  }

  const data: StoryDetail = await res.json();
  return data;
}

// 🧱 3️⃣ Trang chi tiết truyện (App Router - Next.js 15)
// ✅ params là Promise -> phải "await" trước khi dùng
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Giải Promise để lấy slug
  const { slug } = await params;

  // Gọi hàm lấy dữ liệu
  const story = await getStoryDetails(slug);

  // 🖼️ 4️⃣ Giao diện hiển thị
  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* --- Phần Thông tin truyện --- */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cột trái: Ảnh bìa */}
        <div className="w-full md:w-1/3 shrink-0">
          <Image
            src={story.anh_bia}
            alt={`Bìa truyện ${story.ten_truyen}`}
            width={300}
            height={450}
            className="w-full h-auto rounded-lg shadow-lg"
            priority
          />
        </div>

        {/* Cột phải: Thông tin */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{story.ten_truyen}</h1>

          {/* Thể loại */}
          <div className="flex flex-wrap gap-2 mb-4">
            {story.the_loai.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="mb-2">
            <strong>Tác giả:</strong> {story.tac_gia}
          </p>
          <p className="mb-4">
            <strong>Tình trạng:</strong> {story.tinh_trang}
          </p>

          {/* Mô tả */}
          <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
          <p className="text-gray-700 leading-relaxed">{story.mo_ta}</p>
        </div>
      </div>

      {/* --- Danh sách chương --- */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Danh sách chương
        </h2>
        <ul className="space-y-2">
          {story.danh_sach_chuong.map((chapter) => (
            <li
              key={chapter.id}
              className="border rounded-md p-3 hover:bg-gray-50 transition"
            >
              <a
                href={`/truyen/${slug}/${chapter.id}`}
                className="text-blue-600 hover:underline"
              >
                {chapter.ten_chuong}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
