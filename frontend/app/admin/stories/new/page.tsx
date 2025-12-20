'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Save, ArrowLeft, CheckSquare, Square, FileText, Image as ImageIcon, Tag } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

export default function CreateStoryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('comic'); // Vẫn giữ state type để gửi lên backend
  const [coverUrl, setCoverUrl] = useState(''); 

  // State cho Thể loại
  const [allCategories, setAllCategories] = useState<Category[]>([]); 
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]); 

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/categories');
        const data = await res.json();
        if (data.status === 'success') {
          setAllCategories(data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy thể loại:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id); 
      } else {
        return [...prev, id]; 
      }
    });
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

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
        setCoverUrl(data.data.path);
      } else {
        alert('Lỗi upload ảnh: ' + data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối khi upload ảnh');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverUrl) {
      alert('Vui lòng nhập tên truyện và tải ảnh bìa!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin/stories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: title,
          author_name: author,
          description: desc,
          type: type,
          cover_image: coverUrl,
          categories: selectedCategories
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('Thêm truyện thành công!');
        router.push('/admin/stories');
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/stories" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Đăng Truyện Mới</h1>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Phần Ảnh bìa */}
          <div className="flex flex-col sm:flex-row gap-8 items-start border-b border-zinc-800 pb-8">
            <div className="w-full sm:w-48 shrink-0">
              <label className="block text-sm font-bold text-zinc-400 mb-3">Ảnh bìa truyện</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[2/3] w-full border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-zinc-800/50 transition relative overflow-hidden bg-black/40 group"
              >
                {coverUrl ? (
                  <>
                    <Image 
                      src={`http://127.0.0.1:5000/${coverUrl}`} 
                      alt="Cover" 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Upload className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-zinc-500">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <span className="text-sm font-medium">Tải ảnh lên</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleUploadCover} 
              />
              <p className="text-xs text-zinc-500 mt-2 text-center">
                JPG, PNG. Max 5MB.
              </p>
            </div>

            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tên truyện <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Ví dụ: Độc Bộ Thiên Hạ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tác giả</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Tên tác giả..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Mô tả nội dung</label>
                <textarea 
                  rows={5}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                  placeholder="Tóm tắt nội dung chính của truyện..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. Phần Thể loại */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag size={20} className="text-blue-500" /> Thể loại
              </h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                Đã chọn: <span className="text-white font-bold">{selectedCategories.length}</span>
              </span>
            </div>
            
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {allCategories.length > 0 ? (
                  allCategories.map(cat => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => toggleCategory(cat.id)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition select-none border
                          ${isSelected 
                            ? 'bg-blue-900/20 border-blue-500/50 shadow-sm shadow-blue-900/10' 
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                          }
                        `}
                      >
                        <div className={`text-blue-500 transition-transform ${isSelected ? 'scale-110' : 'opacity-30'}`}>
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <span className={`text-sm truncate ${isSelected ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-zinc-500 italic flex flex-col items-center gap-2">
                    <FileText size={32} className="opacity-20" />
                    <p>Chưa có thể loại nào trong hệ thống.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-800">
            <Link 
              href="/admin/stories"
              className="px-6 py-3 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Hủy bỏ
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <>
                  <Save size={20} /> Đăng Truyện Ngay
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}