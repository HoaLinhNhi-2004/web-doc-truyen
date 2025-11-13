// app/components/StoryCard.tsx

// Bước A: Định nghĩa "hình dạng" dữ liệu mà component này cần
// (Không thay đổi)
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
    <a 
      href={`/truyen/${slug}`} 
      // THAY ĐỔI 1: Thay thế các class màu cũ bằng các biến màu mới
      className="group block overflow-hidden rounded-lg border shadow-sm bg-card border-border"
    >
      <div className="relative h-[250px] w-full">
        {/* (Không thay đổi) */}
        <img
          src={anh_bia}
          alt={`Bìa truyện ${ten_truyen}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-3">
        <h3 
          // THAY ĐỔI 2: Dùng màu chữ 'card-foreground'
          className="truncate text-base font-semibold text-card-foreground group-hover:text-blue-600"
        >
          {ten_truyen}
        </h3>
        <p 
          // THAY ĐỔI 3: Dùng màu chữ 'muted-foreground'
          className="mt-1 text-sm text-muted-foreground"
        >
          {chuong_moi_nhat}
        </p>
      </div>
    </a>
  );
}