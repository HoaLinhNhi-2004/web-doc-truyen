// app/components/StoryCard.tsx
import Image from "next/image";
import Link from "next/link";

interface StoryCardProps {
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
}

export default function StoryCard({
  slug,
  ten_truyen,
  anh_bia,
  chuong_moi_nhat,
}: StoryCardProps) {
  return (
    <Link
      href={`/truyen/${slug}`}
      className="group block overflow-hidden rounded-lg border shadow-sm bg-card border-border transition-all hover:shadow-xl hover:border-blue-500"
    >
      <div className="relative h-[250px] w-full overflow-hidden bg-gray-900">
        <Image
          src={anh_bia || "/placeholder.jpg"}
          alt={`Bìa truyện ${ten_truyen}`}
          fill
          sizes="(max-width: 768px) 150px, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized // nếu ảnh từ localhost hoặc domain ngoài
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3">
        <h3 className="truncate text-base font-semibold text-card-foreground group-hover:text-blue-500 transition-colors line-clamp-2">
          {ten_truyen}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {chuong_moi_nhat}
        </p>
      </div>
    </Link>
  );
}