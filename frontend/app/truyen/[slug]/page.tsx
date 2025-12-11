import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/app/components/FollowButton';
import CommentSection from '@/app/components/CommentSection'; // ✅ Import Component Bình Luận
import { User, BookOpen, Clock, List, FileText, Search, ArrowUpDown, Eye, Book } from 'lucide-react';

// 1️⃣ Interface dữ liệu
interface Chapter {
  id: string;
  ten_chuong: string;
  ngay_dang?: string;
  luot_xem?: number;
  nguoi_dang?: string;
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

// 2️⃣ Hàm lấy dữ liệu
async function getStoryDetails(slug: string) {
  // Lưu ý: Đảm bảo JSON Server đang chạy
  const res = await fetch(`http://localhost:3000/data/truyen/${slug}.json`, {
    cache: 'no-cache', 
  });

  if (!res.ok) {
    throw new Error('Không tìm thấy truyện (Hãy kiểm tra lại URL hoặc JSON Server)');
  }

  const data: StoryDetail = await res.json();
  return data;
}

// 3️⃣ Component Chính
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryDetails(slug);

  const storyDataForButton = {
    slug: story.slug,
    ten_truyen: story.ten_truyen,
    anh_bia: story.anh_bia
  };

  // Mock data truyện liên quan (Sidebar)
  const relatedStories = [
    { id: 1, title: 'Failure Frame: Kẻ Vô Dụng Trở Thành Thần', views: '2.13K', img: '[https://placehold.co/100x150/1e293b/FFF?text=Failure](https://placehold.co/100x150/1e293b/FFF?text=Failure)', chap: 'Chapter #27' },
    { id: 2, title: 'One Piece: Đảo Hải Tặc', views: '66.11K', img: '[https://placehold.co/100x150/1e293b/FFF?text=OnePiece](https://placehold.co/100x150/1e293b/FFF?text=OnePiece)', chap: 'Chapter 1166' },
    { id: 3, title: 'Boruto: Two Blue Vortex', views: '10.21K', img: '[https://placehold.co/100x150/1e293b/FFF?text=Boruto](https://placehold.co/100x150/1e293b/FFF?text=Boruto)', chap: 'Chapter #028' },
    { id: 4, title: 'Chainsaw Man', views: '45.2K', img: '[https://placehold.co/100x150/1e293b/FFF?text=CSM](https://placehold.co/100x150/1e293b/FFF?text=CSM)', chap: 'Chapter 155' },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ================= PHẦN 1: THÔNG TIN TRUYỆN (HERO) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Cột trái: Ảnh bìa */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden shadow-2xl border border-border group">
              <Image
                src={story.anh_bia}
                alt={`Bìa truyện ${story.ten_truyen}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="mt-4 w-full md:hidden">
                 <FollowButton story={storyDataForButton} />
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase leading-tight tracking-wide">
              {story.ten_truyen}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card/50 p-4 rounded-lg border border-border text-sm shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={18} className="text-blue-500" />
                <span>Tác giả:</span>
                <span className="text-foreground font-semibold">{story.tac_gia}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={18} className="text-green-500" />
                <span>Tình trạng:</span>
                <span className="text-green-500 font-semibold">{story.tinh_trang}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <FileText size={18} className="text-orange-500" />
                <span>Thể loại:</span>
                <div className="flex flex-wrap gap-2 ml-1">
                  {story.the_loai.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-medium hover:bg-primary/20 cursor-pointer transition">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2 border-l-4 border-red-500 pl-3 text-foreground">
                <BookOpen size={20} /> Nội dung
              </h3>
              <div className="text-muted-foreground leading-7 text-justify bg-card p-4 rounded-lg border border-border shadow-sm text-sm md:text-base">
                 {story.mo_ta}
              </div>
            </div>

            <div className="hidden md:flex gap-4">
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition flex items-center gap-2">
                <BookOpen size={18} />
                Đọc từ đầu
              </button>
              <FollowButton story={storyDataForButton} />
            </div>
          </div>
        </div>

        {/* ================= PHẦN 2: NỘI DUNG CHÍNH & SIDEBAR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- CỘT CHÍNH (8/12) --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. DANH SÁCH CHƯƠNG */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                 <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                  <List /> Danh sách chương
                </h2>
              </div>

              {/* Toolbar */}
              <div className="bg-card p-3 rounded-lg border border-border flex flex-col sm:flex-row gap-3 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Tìm số chương..." 
                    className="w-full pl-9 pr-4 py-2 bg-background rounded-md text-sm border border-input focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-input rounded-md text-sm hover:bg-accent transition whitespace-nowrap font-medium">
                  <ArrowUpDown size={14} /> Mới nhất
                </button>
              </div>

              {/* Bảng Danh sách */}
              <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                  <div className="col-span-6">Số chương</div>
                  <div className="col-span-3 text-center">Cập nhật</div>
                  <div className="col-span-3 text-center">Lượt xem</div>
                </div>

                <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                  {story.danh_sach_chuong.map((chapter) => (
                    <Link 
                      key={chapter.id} 
                      href={`/truyen/${slug}/${chapter.id}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 hover:bg-accent/50 transition items-center group cursor-pointer"
                    >
                      <div className="col-span-1 md:col-span-6 flex items-center gap-3">
                        <Book size={18} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium text-sm md:text-base group-hover:text-blue-500 transition-colors line-clamp-1">
                          {chapter.ten_chuong}
                        </span>
                      </div>
                      <div className="col-span-1 md:col-span-3 text-left md:text-center text-xs text-muted-foreground flex items-center md:justify-center">
                        <span className="md:hidden w-5 inline-block" />
                        {chapter.ngay_dang || 'Đang cập nhật'} 
                      </div>
                      <div className="col-span-1 md:col-span-3 flex md:justify-center items-center gap-1 text-xs text-muted-foreground">
                        <span className="md:hidden w-5 inline-block" />
                        <Eye size={14} />
                        {chapter.luot_xem ? chapter.luot_xem.toLocaleString() : 'N/A'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. ✅ PHẦN BÌNH LUẬN MỚI THÊM VÀO */}
            <CommentSection slug={slug} />

          </div>

          {/* --- SIDEBAR: TRUYỆN LIÊN QUAN (4/12) --- */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-bold uppercase border-l-4 border-red-500 pl-3 mb-4 text-foreground">
              Truyện liên quan
            </h3>
            <div className="flex flex-col gap-4">
              {relatedStories.map((item) => (
                <Link href="#" key={item.id} className="flex gap-4 group bg-card p-3 rounded-lg border border-transparent hover:border-border transition hover:bg-accent/40 shadow-sm hover:shadow-md">
                  <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden shadow-sm border border-border/50">
                    <Image 
                      src={item.img} 
                      alt={item.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="64px"
                      unoptimized // Dùng unoptimized cho ảnh demo từ placehold.co
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                      <h4 className="font-bold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors text-foreground">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                        <span>★★★★★</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full gap-2 text-xs text-muted-foreground">
                      <span className="text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">{item.chap}</span>
                      <span>{item.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="w-full h-64 bg-muted/30 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
              <span>Khu vực Quảng Cáo</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
