// app/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cột 1: Logo + Mô tả */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-nettruyen.png"
                alt="NetTruyen"
                width={220}
                height={80}
                className="drop-shadow-lg"
                priority
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
              Truyện tranh online, đọc truyện tranh miễn phí, kho truyện tranh đa dạng bảng phong phú các thể loại: hành động, tình cảm, hài hước, kinh dị... 
              Cập nhật liên tục 24/7, giao diện đẹp, tốc độ tải nhanh.
            </p>
            <p className="text-xs text-muted-foreground">
              NetTruyen - Nơi gặp gỡ của những tín đồ truyện tranh Việt Nam
            </p>
          </div>

          {/* Cột 2: Link nhanh (giả lập như bản thật) */}
          <div className="space-y-4">
            <h3 className="text-foreground font-bold text-lg mb-4">Liên Kết Nhanh</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/" className="hover:text-red-500 transition">Trang chủ</Link>
              <Link href="/the-loai" className="hover:text-red-500 transition">Thể loại</Link>
              <Link href="/truyen-moi" className="hover:text-red-500 transition">Truyện mới</Link>
              <Link href="/top" className="hover:text-red-500 transition">Bảng xếp hạng</Link>
              <Link href="/theo-doi" className="hover:text-red-500 transition">Theo dõi</Link>
              <Link href="/lich-su" className="hover:text-red-500 transition">Lịch sử</Link>
              <Link href="/random" className="hover:text-red-500 transition">Ngẫu nhiên</Link>
              <Link href="/lien-he" className="hover:text-red-500 transition">Liên hệ</Link>
            </div>
          </div>

          {/* Cột 3: Link "ngầm" + Email + Nhân vật */}
          <div className="space-y-6">
            {/* Nhân vật anime bên phải (giống bản thật) */}
            <div className="flex justify-end -mr-10 -mt-10 relative">
              <div className="relative">
                <Image
                  src="/footer-characters.png"
                  alt="NetTruyen Characters"
                  width={380}
                  height={220}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Link cá cược + email (như bản gốc, font nhỏ xíu) */}
            <div className="text-xs text-muted-foreground space-y-2 text-right">
              <p className="leading-relaxed">
                nettruyen https://aaa79.gifts/ abababababababababababababababababa
              </p>
              <p className="leading-relaxed">
                https://need89.three/ https://inject.us.com/ sdfhjkdfshjkdfhjkdjkolasdjklasdjklqweiojsdfhjasdjklasdfjkl 
                hjkashjkasjoasdopjasjioasnjksdkldjklaskljasjklasdjklskjlskjasjklasjkl
              </p>
              <p className="mt-3 text-yellow-500 font-medium">
                Liên hệ: hangtruyenbiz@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Copyright © 2024-2025 NetTruyen. All rights reserved. 
            <span className="block mt-2 text-xs">
              Bản quyền thuộc về đội ngũ phát triển NetTruyen. Mọi hành vi sao chép cần được sự cho phép.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}