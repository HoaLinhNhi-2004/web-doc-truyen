'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Save, ArrowLeft, Trash2, Image as ImageIcon, Layers, FileDigit, Type, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function CreateChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Thông tin truyện (để hiển thị tên truyện cho đẹp)
  const [storyId, setStoryId] = useState<number | null>(null);
  const [storyTitle, setStoryTitle] = useState('');

  // Form Data
  const [chapterNum, setChapterNum] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('0'); // <--- MỚI: State lưu giá tiền
  const [contentImages, setContentImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);

    // Lấy thông tin truyện để hiển thị tiêu đề và gợi ý số chương
    const fetchStoryInfo = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/stories/${slug}`);
        const data = await res.json();
        if (data.status === 'success') {
          setStoryId(data.data.id);
          setStoryTitle(data.data.title);
          // Gợi ý số chương tiếp theo
          if (data.data.chapters && data.data.chapters.length > 0) {
            const maxChap = Math.max(...data.data.chapters.map((c: any) => c.chapter_num));
            setChapterNum((maxChap + 1).toString());
          } else {
            setChapterNum('1');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStoryInfo();
  }, [slug]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    const uploadedPaths: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('http://127.0.0.1:5000/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();

        if (data.status === 'success') {
          uploadedPaths.push(data.data.path);
        }
      } catch (err) {
        console.error('Lỗi upload ảnh', err);
      }
    }

    setContentImages(prev => [...prev, ...uploadedPaths]);

    // Reset input để cho phép chọn lại cùng file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) {
      alert('Đang tải thông tin truyện, vui lòng chờ...');
      return;
    }
    if (!chapterNum) {
      alert('Vui lòng nhập số chương!');
      return;
    }
    if (contentImages.length === 0) {
      alert('Vui lòng upload ít nhất 1 trang truyện!');
      return;
    }
    if (!token) {
      alert('Vui lòng đăng nhập!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/stories/${storyId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_num: parseFloat(chapterNum),
          title: title || `Chương ${chapterNum}`,
          content_text: null,
          content_images: contentImages,
          price: parseInt(price) || 0 // <--- MỚI: Gửi giá tiền lên server (chuyển về int)
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('Thêm chương thành công!');
        router.push(`/admin/stories/${slug}`);
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể thêm chương'));
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/stories/${slug}`} className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Thêm Chương Mới</h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">Truyện: <span className="text-blue-400">{storyTitle || 'Đang tải...'}</span></p>
          </div>
        </div>

        {/* Nút hành động nhanh (Optional) */}
        <div className="hidden md:block">
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-500 font-mono">
            Mode: Comic Upload
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* === CỘT TRÁI: THÔNG TIN CƠ BẢN === */}
        <div className="space-y-6">
          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <FileDigit className="text-blue-500" size={20} /> Thông tin chương
            </h3>

            <div className="space-y-5">
              {/* Số chương */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Số chương <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="0.1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-lg"
                    placeholder="1"
                    value={chapterNum}
                    onChange={e => setChapterNum(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">#</span>
                </div>
              </div>

              {/* Tên chương */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Tên chương (Tùy chọn)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                    <Type size={16} />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="VD: Cuộc gặp gỡ..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* --- MỚI: Ô NHẬP GIÁ TIỀN --- */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Giá Xu (0 = Miễn phí)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-yellow-400 font-bold focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    placeholder="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">xu</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {parseInt(price) > 0
                    ? 'Chương này sẽ bị khóa, thành viên phải trả xu để đọc.'
                    : 'Chương này sẽ hiển thị miễn phí cho tất cả mọi người.'}
                </p>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                    Đăng Ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI: UPLOAD ẢNH === */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="text-green-500" size={20} /> Nội dung truyện tranh
              </h3>
              <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full border border-zinc-700">
                {contentImages.length} trang đã tải
              </span>
            </div>

            {/* Vùng Dropzone Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900/80 hover:border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-900/20 transition duration-300 border border-zinc-800 group-hover:border-blue-500/50">
                <Upload size={36} className="text-zinc-500 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-zinc-300 font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">Nhấn để tải ảnh lên</p>
              <p className="text-sm text-zinc-500">Hỗ trợ JPG, PNG. Có thể chọn nhiều ảnh cùng lúc.</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleUploadImage}
            />

            {/* Danh sách ảnh đã upload (Grid View) */}
            {contentImages.length > 0 ? (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 uppercase font-bold tracking-wider">
                  <Layers size={14} /> Danh sách trang
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {contentImages.map((img, idx) => (
                    <div key={idx} className="group relative aspect-[2/3] bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-md hover:border-zinc-600 transition">
                      <Image
                        src={`http://127.0.0.1:5000/${img}`}
                        alt={`Page ${idx}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* Overlay & Controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                        <span className="text-white font-bold text-xl drop-shadow-md">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition"
                          title="Xóa trang này"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Badge số trang góc */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                        Trang {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm mt-8 italic border-t border-zinc-800/50 pt-8">
                Chưa có ảnh nào được tải lên.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}