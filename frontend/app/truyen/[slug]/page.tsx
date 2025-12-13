import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/app/components/FollowButton';
import CommentSection from '@/app/components/CommentSection'; 
import { User, BookOpen, Clock, List, FileText, Search, ArrowUpDown, Eye, Book } from 'lucide-react';

// 1️⃣ Interface dữ liệu (Khớp với Backend trả về)
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

// 2️⃣ Hàm lấy dữ liệu và Map từ Backend
async function getStoryDetails(slug: string): Promise<StoryDetail | null> {
  // 👇 GỌI API TRỰC TIẾP (127.0.0.1:5000) ĐỂ TRÁNH LỖI MẠNG TRÊN WINDOWS
  const apiUrl = `http://127.0.0.1:5000/api/stories/${slug}`;
  console.log("🔍 [Frontend] Đang tải chi tiết truyện:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      cache: 'no-store', // Luôn lấy dữ liệu mới nhất
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Không tìm thấy
      throw new Error(`Lỗi API: ${res.status}`);
    }

    const jsonData = await res.json();
    const data = jsonData.data; // Backend trả về { status: 'success', data: { ... } }

    if (!data) return null;

    // 🔥 FIX LỖI ẢNH "Failed to parse src": 
    // Kiểm tra nếu ảnh là đường dẫn tương đối (uploads/...) thì nối thêm domain Backend vào
    let coverImage = data.cover_image;
    
    // Trường hợp 1: Ảnh tương đối không có dấu / ở đầu (vd: uploads/abc.jpg)
    if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('/')) {
        coverImage = `http://127.0.0.1:5000/${coverImage}`;
    } 
    // Trường hợp 2: Ảnh tương đối có dấu / ở đầu (vd: /uploads/abc.jpg)
    else if (coverImage && coverImage.startsWith('/')) {
        coverImage = `http://127.0.0.1:5000${coverImage}`;
    }
    // Trường hợp 3: Không có ảnh -> Dùng ảnh placeholder mặc định
    else if (!coverImage) {
        coverImage = '/placeholder.jpg';
    }

    // 🔥 MAP DỮ LIỆU: Chuyển từ Backend (Anh) sang Frontend (Việt)
    return {
      id: String(data.id),
      slug: data.slug,
      ten_truyen: data.title,       // title -> ten_truyen
      anh_bia: coverImage,          // ✅ Đã xử lý thành link tuyệt đối ở trên
      tac_gia: data.author_name || 'Đang cập nhật', 
      tinh_trang: data.status === 'ongoing' ? 'Đang tiến hành' : 'Đã hoàn thành',
      
      // Xử lý mảng thể loại: Lấy ra tên thể loại từ mảng object
      the_loai: data.categories ? data.categories.map((cat: any) => cat.name) : [],
      
      mo_ta: data.description || 'Chưa có mô tả cho truyện này.',
      
      // Xử lý danh sách chương
      danh_sach_chuong: data.chapters ? data.chapters.map((chap: any) => ({
        id: String(chap.id),
        ten_chuong: chap.title || `Chương ${chap.chapter_num}`,
        ngay_dang: new Date(chap.created_at).toLocaleDateString('vi-VN'),
        luot_xem: 0, // Backend hiện tại chưa trả về view chương, để tạm 0
      })) : []
    };

  } catch (error) {
    console.error("❌ Lỗi fetch truyện:", error);
    return null;
  }
}

// 3️⃣ Component Chính
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryDetails(slug);

  // Xử lý khi không có dữ liệu (404)
  if (!story) {
    return (
      <div className="min-h-screen pt-32 text-center container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-400 mb-4">404 - Không tìm thấy truyện</h1>
        <p className="mb-8">Đường dẫn không tồn tại hoặc truyện đã bị xóa.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho nút Theo Dõi
  const storyDataForButton = {
    id: story.id,
    slug: story.slug,
    ten_truyen: story.ten_truyen,
    anh_bia: story.anh_bia
  };

  // Mock data truyện liên quan (Sidebar)
  const relatedStories = [
    { id: 1, title: 'Solo Leveling', views: '2.13K', img: 'https://upload.wikimedia.org/wikipedia/en/9/95/Solo_Leveling_Webtoon_cover.png', chap: 'Chapter #179' },
    { id: 2, title: 'One Piece', views: '66.11K', img: 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg', chap: 'Chapter 1111' },
    { id: 3, title: 'Naruto', views: '10.21K', img: 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg', chap: 'End' },
    { id: 4, title: 'Bleach', views: '45.2K', img: 'https://upload.wikimedia.org/wikipedia/en/7/72/Bleach_Vol._1.jpg', chap: 'End' },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ================= PHẦN 1: THÔNG TIN TRUYỆN (HERO) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Cột trái: Ảnh bìa */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden shadow-2xl border border-border group">
              {/* Ảnh bìa chính */}
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
                  {story.the_loai.map((genre, index) => (
                    <span key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-medium hover:bg-primary/20 cursor-pointer transition">
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
              <div className="text-muted-foreground leading-7 text-justify bg-card p-4 rounded-lg border border-border shadow-sm text-sm md:text-base max-h-60 overflow-y-auto">
                 {story.mo_ta}
              </div>
            </div>

            <div className="hidden md:flex gap-4">
              {/* Nút Đọc từ đầu */}
              {story.danh_sach_chuong.length > 0 ? (
                // Lấy chương đầu tiên (thường là phần tử cuối cùng nếu danh sách trả về Mới nhất -> Cũ nhất)
                <Link 
                  href={`/truyen/${slug}/${story.danh_sach_chuong[story.danh_sach_chuong.length - 1].id}`}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition flex items-center gap-2"
                >
                  <BookOpen size={18} /> Đọc từ đầu
                </Link>
              ) : (
                <button disabled className="px-6 py-2 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed">
                  Chưa có chương
                </button>
              )}
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
                <span className="text-sm text-muted-foreground">
                  Tổng số: {story.danh_sach_chuong.length}
                </span>
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
                  
                  {story.danh_sach_chuong.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Truyện này chưa cập nhật chương nào.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. ✅ PHẦN BÌNH LUẬN (Truyền ID cho Backend) */}
            <CommentSection slug={story.id} />

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
                    {/* Dùng unoptimized cho ảnh bên ngoài để tránh lỗi hostname */}
                    <Image 
                      src={item.img} 
                      alt={item.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="64px"
                      unoptimized 
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