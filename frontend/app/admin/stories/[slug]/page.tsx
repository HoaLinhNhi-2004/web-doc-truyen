'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // [FIX] Dùng useParams thay cho props
import Image from 'next/image';
import { Upload, Save, ArrowLeft, RefreshCw, CheckSquare, Square, Plus, FileText, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  chapter_num: number;
  title: string;
  created_at: string;
  views: number;
}

export default function EditStoryPage() {
  const router = useRouter();
  
  // [FIX QUAN TRỌNG] Dùng useParams để lấy ID từ URL an toàn nhất
  // Tránh lỗi "undefined" khi dùng props params
  const params = useParams();
  const slug = params?.slug as string; 

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Data State
  const [storyId, setStoryId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [coverUrl, setCoverUrl] = useState('');
  const [type, setType] = useState('comic');
  
  const [allCategories, setAllCategories] = useState<Category[]>([]); 
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]); 
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    // Chỉ chạy khi slug đã có giá trị
    if (!slug) return;

    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);

    const fetchData = async () => {
      try {
        // 1. Lấy danh sách thể loại
        // [FIX] Đảm bảo đúng cổng 5000
        const catRes = await fetch('http://127.0.0.1:5000/api/categories');
        const catData = await catRes.json();
        if (catData.status === 'success') {
          setAllCategories(catData.data);
        }

        // 2. Lấy chi tiết truyện dành cho Admin
        // [FIX] Đổi URL sang /api/admin/stories/... để tìm theo ID
        // [FIX] Thêm headers Authorization để xác thực Admin
        if (t) {
            const storyRes = await fetch(`http://127.0.0.1:5000/api/admin/stories/${slug}`, {
                headers: {
                    'Authorization': `Bearer ${t}`
                }
            });
            
            // Kiểm tra nếu lỗi 404 hoặc 500
            if (!storyRes.ok) {
                console.error("API Lỗi:", storyRes.status, storyRes.statusText);
                alert(`Không thể tải truyện (Lỗi ${storyRes.status}). Vui lòng kiểm tra Server.`);
                return;
            }

            const storyData = await storyRes.json();
            
            if (storyData.status === 'success' && storyData.data) {
              const s = storyData.data;
              setStoryId(s.id);
              setTitle(s.title);
              setAuthor(s.author_name || '');
              setDesc(s.description || '');
              setStatus(s.status);
              setCoverUrl(s.cover_image);
              setType(s.type);
              
              if (s.categories && Array.isArray(s.categories)) {
                setSelectedCategories(s.categories.map((c: any) => c.id));
              }

              if (s.chapters && Array.isArray(s.chapters)) {
                setChapters(s.chapters);
              }
            } else {
              alert('Không tìm thấy dữ liệu truyện!');
              router.push('/admin/stories');
            }
        }
      } catch (err) {
        console.error("Lỗi Fetch:", err);
        alert('Lỗi kết nối đến Server (Cổng 5000)');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [slug, router]); // Dependency thay đổi khi slug thay đổi

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) return prev.filter(cId => cId !== id);
      else return [...prev, id];
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
        alert('Lỗi upload: ' + data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối upload');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId || !token) return;

    setLoading(true);
    try {
      // [FIX] URL API Admin
      const res = await fetch(`http://127.0.0.1:5000/api/admin/stories/${storyId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title, author_name: author, description: desc, status, cover_image: coverUrl, categories: selectedCategories, type
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('Cập nhật thành công!');
        router.refresh();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này không?')) return;
    if (!token) return;

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/admin/chapters/${chapterId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            setChapters(prev => prev.filter(c => c.id !== chapterId));
            alert('Đã xóa chương thành công!');
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa chương'));
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối khi xóa chương');
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/stories" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Chỉnh Sửa: {title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === CỘT TRÁI === */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <FileText size={20} className="text-blue-500" /> Thông tin truyện
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-full sm:w-40 shrink-0">
                            <label className="block text-sm text-zinc-400 mb-2">Ảnh bìa</label>
                            <div onClick={() => fileInputRef.current?.click()} className="aspect-[2/3] w-full border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-zinc-800/50 transition relative overflow-hidden bg-black/40">
                                {coverUrl ? <Image src={coverUrl.startsWith('http') ? coverUrl : `http://127.0.0.1:5000/${coverUrl}`} alt="Cover" fill className="object-cover" unoptimized /> : <Upload size={24} className="text-zinc-500" />}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadCover} />
                        </div>
                        
                        <div className="flex-1 w-full space-y-4">
                            <div><label className="text-sm text-zinc-400">Tên truyện</label><input type="text" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={title} onChange={e => setTitle(e.target.value)} /></div>
                            <div><label className="text-sm text-zinc-400">Tác giả</label><input type="text" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={author} onChange={e => setAuthor(e.target.value)} /></div>
                            <div>
                                <label className="text-sm text-zinc-400">Tình trạng</label>
                                <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="ongoing">Đang tiến hành</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="dropped">Tạm ngưng</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400">Mô tả</label>
                        <textarea rows={4} className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 resize-none" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400 mb-2 block">Thể loại</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950 p-3 rounded border border-zinc-700 max-h-40 overflow-y-auto custom-scrollbar">
                            {allCategories.map(cat => (
                                <div key={cat.id} onClick={() => toggleCategory(cat.id)} className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${selectedCategories.includes(cat.id) ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400'}`}>
                                    {selectedCategories.includes(cat.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                    <span className="text-xs font-bold truncate">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-800">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50">
                            {loading ? 'Đang lưu...' : <><RefreshCw size={18} /> Cập nhật thông tin</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* === CỘT PHẢI === */}
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
                    <h3 className="text-lg font-bold text-white">Danh sách chương</h3>
                    <Link 
                        href={`/admin/stories/${slug}/chapters/new`}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-lg shadow-green-900/20"
                    >
                        <Plus size={16} /> Thêm chương
                    </Link>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar space-y-2">
                    {chapters.length > 0 ? (
                        chapters.map(chap => (
                            <div key={chap.id} className="group bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex items-center justify-between hover:border-zinc-600 transition">
                                <div>
                                    <p className="text-sm font-bold text-zinc-300 group-hover:text-blue-400 transition">
                                        {chap.title || `Chương ${chap.chapter_num}`}
                                    </p>
                                    <div className="text-xs text-zinc-500 flex gap-3 mt-1">
                                        <span>#{chap.chapter_num}</span>
                                        <span>{new Date(chap.created_at).toLocaleDateString('vi-VN')}</span>
                                        <span>{chap.views || 0} view</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition">
                                    <Link 
                                      href={`/admin/stories/${slug}/chapters/${chap.id}`}
                                      className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" 
                                      title="Sửa chương"
                                    >
                                        <Edit size={14} />
                                    </Link>
                                    
                                    <button 
                                      onClick={() => handleDeleteChapter(chap.id)}
                                      className="p-1.5 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-500" 
                                      title="Xóa chương"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-zinc-500 italic">
                            Chưa có chương nào.<br/>Hãy thêm chương đầu tiên!
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}