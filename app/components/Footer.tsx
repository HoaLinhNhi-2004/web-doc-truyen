import Image from "next/image";
import Link from "next/link";
import { Facebook, Mail, Github, MapPin } from "lucide-react";

export default function Footer() {
  return (
    // Thêm border-t để tạo vạch ngăn cách rõ ràng
    <footer className="bg-[var(--footer-bg)] text-foreground border-t border-[var(--border)] transition-colors duration-200">
      <div className="container mx-auto px-4 py-8"> {/* Giảm py-12 xuống py-8 cho gọn */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột 1: Logo & Giới thiệu (Chiếm 5 phần) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
               {/* Nếu chưa có logo thật thì dùng text thay thế để đỡ lỗi ảnh */}
               <div className="flex items-center gap-2">
                  <Image
                    src="/logo-nettruyen.png" 
                    alt="NetTruyen"
                    width={180}
                    height={60}
                    className="object-contain"
                    // Thêm fallback nếu ảnh lỗi để không bị vỡ layout
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
               </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground pr-4 text-justify">
              Kho truyện tranh đa dạng, cập nhật liên tục 24/7. 
              Nơi thỏa mãn đam mê với hàng ngàn đầu truyện hành động, 
              tình cảm, hài hước... Giao diện tối ưu trải nghiệm người dùng.
            </p>
            
            {/* Social Icons - Thay thế cho đống link rác */}
            <div className="flex gap-4 pt-2">
              <Link href="#" className="p-2 bg-[var(--card)] rounded-full hover:text-blue-600 transition shadow-sm border border-[var(--border)]">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="p-2 bg-[var(--card)] rounded-full hover:text-red-500 transition shadow-sm border border-[var(--border)]">
                <Mail size={18} />
              </Link>
              <Link href="#" className="p-2 bg-[var(--card)] rounded-full hover:text-gray-900 dark:hover:text-white transition shadow-sm border border-[var(--border)]">
                <Github size={18} />
              </Link>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh (Chiếm 3 phần) */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-lg mb-4 text-foreground">Khám Phá</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/truyen-moi" className="hover:text-orange-500 transition block py-1">Truyện mới cập nhật</Link></li>
              <li><Link href="/top" className="hover:text-orange-500 transition block py-1">Bảng xếp hạng</Link></li>
              <li><Link href="/category" className="hover:text-orange-500 transition block py-1">Thể loại truyện</Link></li>
              <li><Link href="/tim-truyen" className="hover:text-orange-500 transition block py-1">Tìm truyện nâng cao</Link></li>
              <li><Link href="/lich-su" className="hover:text-orange-500 transition block py-1">Lịch sử đọc truyện</Link></li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ (Chiếm 4 phần) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Liên Hệ</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0" />
                  <span>hangtruyenbiz@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0" />
                  <span>Việt Nam</span>
                </li>
              </ul>
            </div>

            {/* Ảnh nhân vật trang trí - Giữ lại nhưng làm gọn hơn */}
            <div className="hidden lg:block self-end mt-4 -mb-4 opacity-80 hover:opacity-100 transition-opacity">
                 <Image
                  src="/footer-characters.png"
                  alt="Characters"
                  width={200} // Giảm size xuống cho đỡ choán chỗ
                  height={120}
                  className="object-contain"
                />
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-muted-foreground">
            Copyright © {new Date().getFullYear()} NetTruyen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}