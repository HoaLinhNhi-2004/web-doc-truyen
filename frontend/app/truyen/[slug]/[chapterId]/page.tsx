// 📁 app/truyen/[slug]/[chapterId]/page.tsx
import path from "path";
import fs from "fs/promises";
import Image from "next/image"; // Dùng để tối ưu nếu ảnh nằm trong /public

// 🧩 1️⃣ Kiểu dữ liệu của chương
interface ChapterData {
  id: string;
  ten_chuong: string;
  ten_truyen: string;
  slug: string;
  danh_sach_anh: string[];
}

// 🧠 2️⃣ Hàm đọc dữ liệu chương từ file JSON
async function getChapterData(slug: string, chapterId: string) {
  const fileName = `${slug}-${chapterId}.json`;

  try {
    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "data",
      "chuong",
      fileName
    );

    const fileContent = await fs.readFile(jsonFilePath, "utf8");
    const data: ChapterData = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("❌ LỖI ĐỌC FILE CHƯƠNG:", error);
    throw new Error("Không tìm thấy dữ liệu chương");
  }
}

// 📖 3️⃣ Trang đọc truyện
export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  // ✅ Giải Promise params (Next.js 15 yêu cầu)
  const { slug, chapterId } = await params;

  // Lấy dữ liệu chương từ JSON
  const chapterData = await getChapterData(slug, chapterId);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Thanh điều hướng */}
      <div className="sticky top-0 z-10 bg-gray-800 p-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <a
              href={`/truyen/${slug}`}
              className="text-blue-400 hover:underline"
            >
              {chapterData.ten_truyen}
            </a>
            <span className="mx-2">/</span>
            <span>{chapterData.ten_chuong}</span>
          </div>
          <div className="flex gap-2">
            <a
              href="#"
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
            >
              Chương trước
            </a>
            <a
              href="#"
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
            >
              Chương sau
            </a>
          </div>
        </div>
      </div>

      {/* Khu vực hiển thị ảnh */}
      <div className="container mx-auto max-w-3xl pt-4">
        <div className="flex flex-col items-center">
          {chapterData.danh_sach_anh.map((imageUrl, index) => (
            <div key={index} className="w-full mb-2">
              <img
                src={imageUrl}
                alt={`Ảnh ${index + 1} của ${chapterData.ten_chuong}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
