'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho Truyện trong danh sách
interface Story {
  id: number;
  title: string;
  slug: string;
  cover_image: string;
  author_name: string;
  status: string;
  total_views: number;
  updated_at: string;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState('');

  // 1. Lấy token khi load trang
  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);
  }, []);

  // 2. Fetch danh sách truyện mỗi khi token, page hoặc keyword thay đổi
  useEffect(() => {
    if (!token) return;
    fetchStories();
  }, [token, page, keyword]); 

  const fetchStories = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách truyện (Cổng 5000 như bạn đang dùng)
      const res = await fetch(`http://127.0.0.1:5000/api/admin/stories?page=${page}&limit=10&keyword=${keyword}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setStories(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách truyện:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác!')) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Xóa thành công!');
        fetchStories(); // Load lại danh sách sau khi xóa
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối khi xóa');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header & Nút Thêm */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Quản Lý Truyện</h1>
        <Link 
          href="/admin/stories/new" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium"
        >
          <Plus size={20} /> Thêm Truyện Mới
        </Link>
      </div>

      {/* Thanh Tìm kiếm */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm truyện theo tên..." 
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            value={keyword}
            onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1); // Reset về trang 1 khi tìm kiếm
            }}
          />
        </div>
      </div>

      {/* Bảng Danh sách */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950 text-zinc-200 uppercase font-bold border-b border-zinc-800">
            <tr>
              <th className="p-4 w-16 text-center">ID</th>
              <th className="p-4 w-24 text-center">Ảnh</th>
              <th className="p-4">Thông tin truyện</th>
              <th className="p-4 w-32 text-center">Trạng thái</th>
              <th className="p-4 w-24 text-center">View</th>
              <th className="p-4 w-32 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Đang tải dữ liệu...</td></tr>
            ) : stories.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-500 italic">Không tìm thấy truyện nào.</td></tr>
            ) : (
              stories.map(story => (
                <tr key={story.id} className="hover:bg-zinc-800/50 transition group">
                  <td className="p-4 text-center">#{story.id}</td>
                  <td className="p-4">
                    <div className="relative w-12 h-16 bg-zinc-800 rounded overflow-hidden mx-auto border border-zinc-700">
                      {story.cover_image ? (
                        <Image 
                          src={story.cover_image.startsWith('http') ? story.cover_image : `http://127.0.0.1:5000/${story.cover_image}`} 
                          alt={story.title} 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                            <Eye size={16}/>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-base mb-1 group-hover:text-blue-400 transition">{story.title}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span>Tác giả: {story.author_name || 'Chưa rõ'}</span>
                        <span>•</span>
                        <span>Cập nhật: {new Date(story.updated_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      story.status === 'ongoing' ? 'bg-green-900/20 text-green-400 border-green-900' :
                      story.status === 'completed' ? 'bg-blue-900/20 text-blue-400 border-blue-900' :
                      'bg-red-900/20 text-red-400 border-red-900'
                    }`}>
                      {story.status === 'ongoing' ? 'Đang ra' : 
                       story.status === 'completed' ? 'Full' : 'Ngưng'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono text-zinc-300">
                    {story.total_views.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Nút Sửa: Link sang trang [slug] với slug là ID truyện */}
                      <Link 
                        href={`/admin/stories/${story.id}`} 
                        className="p-2 hover:bg-blue-900/30 text-zinc-400 hover:text-blue-400 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </Link>
                      
                      {/* Nút Xóa */}
                      <button 
                        onClick={() => handleDelete(story.id)}
                        className="p-2 hover:bg-red-900/30 text-zinc-400 hover:text-red-500 rounded-lg transition"
                        title="Xóa truyện"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 pt-4">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 rounded-lg text-white text-sm font-medium transition"
        >
          Trang trước
        </button>
        <span className="text-zinc-400 text-sm">Trang <span className="text-white font-bold">{page}</span> / {totalPages || 1}</span>
        <button 
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 rounded-lg text-white text-sm font-medium transition"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}