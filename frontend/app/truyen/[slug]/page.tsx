import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/app/components/FollowButton';
import CommentSection from '@/app/components/CommentSection'; 
import StarRating from '@/app/components/StarRating'; 
import { User, Book, BookOpen, Clock, List, Eye, Calendar, Tag, Star, Crown, TrendingUp } from 'lucide-react'; 

// 1️⃣ Interface dữ liệu
interface Chapter {
  id: string;
  ten_chuong: string;
  ngay_dang?: string;
  luot_xem?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface StoryDetail {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  tac_gia: string;
  tinh_trang: string;
  the_loai: string[];      
  categories_raw: Category[]; 
  mo_ta: string;
  danh_sach_chuong: Chapter[];
  luot_xem: number;
  ngay_cap_nhat: string;
  danh_gia: number; 
}

interface RelatedStory {
  id: string;
  slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
  views: number;
  danh_gia: number; 
}

// 2️⃣ Helper xử lý link ảnh
const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

// 3️⃣ Hàm lấy chi tiết truyện
async function getStoryDetails(slug: string): Promise<StoryDetail | null> {
  const apiUrl = `http://127.0.0.1:5000/api/stories/${slug}`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;

    const jsonData = await res.json();
    const data = jsonData.data;

    if (!data) return null;

    return {
      id: String(data.id),
      slug: data.slug,
      ten_truyen: data.title,
      anh_bia: getImageUrl(data.cover_image),
      tac_gia: data.author_name || 'Đang cập nhật',
      tinh_trang: data.status === 'ongoing' ? 'Đang tiến hành' : 'Đã hoàn thành',
      
      luot_xem: data.total_views || 0,
      danh_gia: data.average_rating || 0, 
      ngay_cap_nhat: new Date(data.updated_at).toLocaleDateString('vi-VN'),

      the_loai: data.categories ? data.categories.map((cat: any) => cat.name) : [],
      categories_raw: data.categories || [],
      
      mo_ta: data.description || 'Chưa có mô tả.',
      
      danh_sach_chuong: data.chapters ? data.chapters.map((chap: any) => ({
        id: String(chap.id),
        ten_chuong: chap.title || `Chương ${chap.chapter_num}`,
        ngay_dang: new Date(chap.created_at).toLocaleDateString('vi-VN'),
        luot_xem: chap.views || 0, 
      })) : []
    };
  } catch (error) {
    console.error("❌ Lỗi fetch truyện:", error);
    return null;
  }
}

// 4️⃣ Hàm lấy truyện liên quan
async function getRelatedStories(categorySlug: string, currentStoryId: string): Promise<RelatedStory[]> {
  if (!categorySlug) return [];

  const apiUrl = `http://127.0.0.1:5000/api/stories?category=${categorySlug}&limit=6`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return [];

    const jsonData = await res.json();
    const stories = jsonData.data || [];

    return stories
      .filter((item: any) => String(item.id) !== currentStoryId)
      .map((item: any) => ({
        id: String(item.id),
        slug: item.slug,
        ten_truyen: item.title,
        anh_bia: getImageUrl(item.cover_image),
        chuong_moi_nhat: item.chapters && item.chapters.length > 0 ? item.chapters[0].title : 'Mới',
        views: item.total_views || 0,
        danh_gia: item.average_rating || 0 
      }));

  } catch (error) {
    console.error("❌ Lỗi fetch truyện liên quan:", error);
    return [];
  }
}

// 👇 5️⃣ Hàm lấy Top Truyện Xem Nhiều (MỚI)
async function getTopStories(): Promise<RelatedStory[]> {
  const apiUrl = `http://127.0.0.1:5000/api/stories?sort=view&limit=5`; // Lấy 5 truyện view cao nhất
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return [];
    const jsonData = await res.json();
    const stories = jsonData.data || [];
    return stories.map((item: any) => ({
        id: String(item.id),
        slug: item.slug,
        ten_truyen: item.title,
        anh_bia: getImageUrl(item.cover_image),
        chuong_moi_nhat: item.chapters && item.chapters.length > 0 ? item.chapters[0].title : 'Mới',
        views: item.total_views || 0,
        danh_gia: item.average_rating || 0
    }));
  } catch (error) {
    return [];
  }
}

// 6️⃣ Component Chính
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryDetails(slug);

  if (!story) {
    return (
      <div className="min-h-screen pt-32 text-center container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-400 mb-4">404 - Không tìm thấy truyện</h1>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const firstCategorySlug = story.categories_raw.length > 0 ? story.categories_raw[0].slug : '';
  
  // Gọi song song API lấy truyện liên quan và truyện hot
  const [relatedStories, topStories] = await Promise.all([
    getRelatedStories(firstCategorySlug, story.id),
    getTopStories()
  ]);

  const storyDataForButton = {
    id: story.id,
    slug: story.slug,
    ten_truyen: story.ten_truyen,
    anh_bia: story.anh_bia
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ================= PHẦN 1: THÔNG TIN TRUYỆN ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Cột trái: Ảnh bìa */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-border group">
              <Image
                src={story.anh_bia}
                alt={`Bìa truyện ${story.ten_truyen}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="mt-4 w-full md:hidden">
                 <FollowButton story={storyDataForButton} />
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase leading-tight tracking-wide">
                {story.ten_truyen}
                </h1>
                
                {/* 👇 HIỂN THỊ COMPONENT ĐÁNH GIÁ SAO */}
                <div className="flex items-center gap-4">
                    <StarRating storyId={story.id} initialAverage={story.danh_gia} />
                </div>
            </div>

            {/* Bảng thông tin chi tiết */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card/50 p-5 rounded-xl border border-border text-sm shadow-sm">
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
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye size={18} className="text-purple-500" />
                <span>Lượt xem:</span>
                <span className="text-foreground font-semibold">{story.luot_xem.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={18} className="text-red-500" />
                <span>Cập nhật:</span>
                <span className="text-foreground font-semibold">{story.ngay_cap_nhat}</span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2 mt-2 pt-2 border-t border-border/50">
                <Tag size={18} className="text-orange-500 mt-0.5" />
                <span className="shrink-0">Thể loại:</span>
                <div className="flex flex-wrap gap-2 ml-1">
                  {story.the_loai.map((genre, index) => (
                    <span key={index} className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium hover:bg-primary/20 cursor-pointer transition">
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

            {/* 👇 2 NÚT: ĐỌC & THEO DÕI (Đã căn đều chiều cao) */}
            <div className="hidden md:flex items-center gap-4 h-12">
              {story.danh_sach_chuong.length > 0 ? (
                <Link 
                  href={`/truyen/${slug}/${story.danh_sach_chuong[story.danh_sach_chuong.length - 1].id}`}
                  className="h-full px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition flex items-center justify-center gap-2"
                >
                  <BookOpen size={20} /> Đọc từ đầu
                </Link>
              ) : (
                <button disabled className="h-full px-8 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                  Chưa có chương
                </button>
              )}
              
              <div className="h-full [&_button]:h-full [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:px-6 [&_button]:rounded-lg">
                <FollowButton story={storyDataForButton} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= PHẦN 2: NỘI DUNG CHÍNH & SIDEBAR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- CỘT CHÍNH (8/12) --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                 <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                  <List /> Danh sách chương
                </h2>
                <span className="text-sm text-muted-foreground">
                  Tổng số: {story.danh_sach_chuong.length}
                </span>
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
                        {chapter.luot_xem ? chapter.luot_xem.toLocaleString() : '0'}
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

            {/* Bình Luận */}
            <CommentSection slug={story.id} />

          </div>

          {/* --- SIDEBAR: TRUYỆN LIÊN QUAN & TOP TRENDING (API THẬT) --- */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. TOP TRUYỆN XEM NHIỀU (Thay thế quảng cáo) */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground uppercase border-l-4 border-yellow-500 pl-3">
                    <Crown size={24} className="text-yellow-500" />
                    Top Xem Nhiều
                </h3>
                <div className="flex flex-col gap-4">
                    {topStories.map((item, index) => (
                        <Link href={`/truyen/${item.slug}`} key={item.id} className="flex gap-3 group relative">
                            {/* Số thứ hạng */}
                            <div className={`absolute -left-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 
                                ${index === 0 ? 'bg-yellow-500 text-black' : 
                                  index === 1 ? 'bg-gray-400 text-black' : 
                                  index === 2 ? 'bg-orange-700 text-white' : 'bg-zinc-700 text-white'}`}>
                                {index + 1}
                            </div>

                            <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden shadow-sm border border-border/50">
                                <Image 
                                    src={item.anh_bia} 
                                    alt={item.ten_truyen} 
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    sizes="64px"
                                    unoptimized 
                                />
                            </div>
                            <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors text-foreground">
                                    {item.ten_truyen}
                                </h4>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Eye size={12} /> {item.views.toLocaleString()} lượt xem
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                        <Star size={12} className="fill-yellow-500" />
                                        <span className="font-medium">{item.danh_gia > 0 ? item.danh_gia.toFixed(1) : '0.0'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 2. TRUYỆN LIÊN QUAN */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-bold uppercase border-l-4 border-red-500 pl-3 mb-4 text-foreground flex items-center gap-2">
                  <TrendingUp size={20} className="text-red-500" /> Có thể bạn thích
                </h3>
                
                <div className="flex flex-col gap-4">
                  {relatedStories.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">Chưa có truyện liên quan.</p>
                  ) : (
                    relatedStories.map((item) => (
                      <Link href={`/truyen/${item.slug}`} key={item.id} className="flex gap-4 group">
                        <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden shadow-sm border border-border/50">
                          <Image 
                            src={item.anh_bia} 
                            alt={item.ten_truyen} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="64px"
                            unoptimized 
                          />
                        </div>
                        <div className="flex flex-col justify-between py-1 flex-1">
                          <div>
                            <h4 className="font-bold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors text-foreground">
                              {item.ten_truyen}
                            </h4>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                              <Star size={12} className="fill-yellow-500" />
                              <span className="font-medium">{item.danh_gia > 0 ? item.danh_gia.toFixed(1) : '0.0'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center w-full gap-2 text-xs text-muted-foreground">
                            <span className="text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">{item.chuong_moi_nhat}</span>
                            <span className="flex items-center gap-1"><Eye size={10}/> {item.views}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}