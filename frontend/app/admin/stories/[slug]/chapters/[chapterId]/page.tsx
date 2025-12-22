'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, ArrowLeft, Trash2, Image as ImageIcon, Layers, FileDigit, Type, DollarSign, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

export default function EditChapterPage({ params }: { params: Promise<{ slug: string; chapterId: string }> }) {
  const router = useRouter();
  const { slug, chapterId } = use(params);

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form Data
  const [chapterNum, setChapterNum] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('0'); // <--- Giá tiền
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [contentText, setContentText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);
    fetchChapterInfo();
  }, [chapterId]);

  // 1. Lấy thông tin chương hiện tại để điền vào form
  const fetchChapterInfo = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/chapters/${chapterId}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        const chap = data.data;
        setChapterNum(chap.chapter_num.toString());
        setTitle(chap.title || '');
        setPrice(chap.price?.toString() || '0'); // Load giá tiền
        
        // Load nội dung (ảnh/text)
        if (chap.content) {
             setContentImages(chap.content.content_images || []);
             setContentText(chap.content.content_text || '');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  // 2. Hàm upload ảnh (giống trang tạo mới)
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };

  // 3. Hàm lưu thay đổi (UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Vui lòng đăng nhập!');

    setLoading(true);
    try {
      // Gọi API PUT thay vì POST
      const res = await fetch(`http://127.0.0.1:5000/api/admin/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_num: parseFloat(chapterNum),
          title: title,
          content_images: contentImages,
          content_text: contentText,
          price: parseInt(price) || 0 // <--- Cập nhật giá tiền
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('Cập nhật thành công!');
        router.push(`/admin/stories/${slug}`); // Quay về danh sách chương
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể cập nhật'));
      }
    } catch (error) {
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/stories/${slug}`} className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Chỉnh Sửa Chương {chapterNum}</h1>
          <p className="text-sm text-zinc-500">Cập nhật nội dung và giá bán</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN & GIÁ */}
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <FileDigit className="text-blue-500" size={20} /> Thiết lập
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Số chương</label>
                <input
                    type="number"
                    step="0.1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono text-lg"
                    value={chapterNum}
                    onChange={e => setChapterNum(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Tên chương</label>
                <div className="relative">
                  <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"/>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* --- Ô NHẬP GIÁ TIỀN (KHÓA CHƯƠNG) --- */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${parseInt(price) > 0 ? 'bg-yellow-900/10 border-yellow-600/50' : 'bg-zinc-950 border-zinc-800'}`}>
                <label className="block text-sm font-semibold text-zinc-400 mb-2 flex justify-between">
                    <span>Giá Xu (0 = Miễn phí)</span>
                    {parseInt(price) > 0 ? 
                        <span className="text-xs text-yellow-500 flex items-center gap-1 font-bold"><Lock size={12}/> ĐANG KHÓA (VIP)</span> : 
                        <span className="text-xs text-green-500 flex items-center gap-1 font-bold"><Unlock size={12}/> MIỄN PHÍ</span>
                    }
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-transparent border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-yellow-400 font-bold focus:border-yellow-500 focus:bg-zinc-900 outline-none transition text-lg"
                    placeholder="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">xu</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {parseInt(price) > 0 
                    ? 'Thành viên phải trả tiền để đọc chương này.' 
                    : 'Ai cũng có thể đọc chương này.'}
                </p>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : <><Save size={20} /> Lưu Thay Đổi</>}
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: NỘI DUNG ẢNH */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl min-h-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex gap-2"><ImageIcon className="text-green-500"/> Nội dung</h3>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{contentImages.length} trang</span>
                </div>
                
                {/* Upload Area */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 bg-zinc-950 hover:border-blue-500 hover:bg-zinc-900 cursor-pointer rounded-xl p-8 flex flex-col items-center justify-center transition mb-6"
                >
                    <p className="text-zinc-400 font-medium">Thêm trang truyện mới</p>
                </div>
                <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleUploadImage} />

                {/* List Images */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {contentImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-[2/3] bg-black rounded-lg overflow-hidden border border-zinc-800">
                            <Image src={`http://127.0.0.1:5000/${img}`} alt="" fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-white font-bold text-xl">#{idx + 1}</span>
                                <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white hover:scale-110 transition"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}