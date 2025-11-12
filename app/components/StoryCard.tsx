// app/components/StoryCard.tsx

// Bước A: Định nghĩa "hình dạng" dữ liệu mà component này cần
// Điều này giúp TypeScript kiểm tra xem bạn có truyền đúng props không
interface StoryCardProps {
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

// Bước B: Tạo component
// Dùng Tailwind CSS để tạo kiểu dáng
export default function StoryCard({ slug, ten_truyen, anh_bia, chuong_moi_nhat }: StoryCardProps) {
  return (
    <a href={`/truyen/${slug}`} className="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div className="relative h-[250px] w-full">
        {/* Chúng ta sẽ dùng Next/Image sau, tạm thời dùng 'img' */}
        <img
          src={anh_bia}
          alt={`Bìa truyện ${ten_truyen}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-3">
        <h3 className="truncate text-base font-semibold text-gray-800 group-hover:text-blue-600">
          {ten_truyen}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {chuong_moi_nhat}
        </p>
      </div>
    </a>
  );
}