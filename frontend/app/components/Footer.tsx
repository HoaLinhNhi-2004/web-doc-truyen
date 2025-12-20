import Link from "next/link";
import { Facebook, Mail, Github, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] text-foreground border-t border-[var(--border)] transition-colors duration-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột 1: Logo & Giới thiệu (Chiếm 5 phần) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
               <div className="flex items-center gap-2">
                  {/* Đã thay thế ảnh logo bằng chữ */}
                  <span className="text-2xl font-bold text-foreground hover:text-blue-600 transition-colors">
                    DocTruyen
                  </span>
               </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground pr-4 text-justify">
              Kho truyện tranh đa dạng, cập nhật liên tục 24/7. 
              Nơi thỏa mãn đam mê với hàng ngàn đầu truyện hành động, 
              tình cảm, hài hước... Giao diện tối ưu trải nghiệm người dùng.
            </p>
            
            {/* Social Icons */}
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
            <h3 className="font-bold text-lg mb-4 text-foreground uppercase border-l-4 border-red-500 pl-3">
              Khám Phá
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-blue-500 transition-colors block py-1">
                  Truyện mới cập nhật
                </Link>
              </li>
              <li>
                <Link href="/truyen-hot" className="hover:text-blue-500 transition-colors block py-1">
                  Bảng xếp hạng
                </Link>
              </li>
              <li>
                <Link href="/category" className="hover:text-blue-500 transition-colors block py-1">
                  Thể loại truyện
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-blue-500 transition-colors block py-1">
                  Tìm truyện nâng cao
                </Link>
              </li>
              <li>
                <Link href="/lich-su" className="hover:text-blue-500 transition-colors block py-1">
                  Lịch sử đọc truyện
                </Link>
              </li>
              <li>
                  <Link href="/theo-doi" className="hover:text-blue-500 transition-colors block py-1">
                  Truyện đang theo dõi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ (Chiếm 4 phần) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground uppercase border-l-4 border-red-500 pl-3">
                Liên Hệ
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-blue-500" />
                  <span>contact@doctruyen.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <span>Việt Nam</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-muted-foreground">
            Copyright © {new Date().getFullYear()} DocTruyen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}