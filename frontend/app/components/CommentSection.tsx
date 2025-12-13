"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { MessageSquare, Send, User as UserIcon, Loader2 } from "lucide-react";

// Định nghĩa kiểu dữ liệu User (lấy từ localStorage hoặc API)
interface User {
  id: number;
  username: string;
  avatar_url: string;
  role: string;
}

// Định nghĩa kiểu dữ liệu Comment trả về từ Backend
interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User; // Backend include User model
}

export default function CommentSection({ slug }: { slug: string }) { 
  // Lưu ý: 'slug' ở đây thực tế là ID của truyện được truyền từ trang chi tiết
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 1. Kiểm tra trạng thái đăng nhập từ LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi đọc thông tin user:", error);
      }
    }
  }, []);

  // 2. Hàm lấy danh sách bình luận từ API Backend
  const fetchComments = async () => {
    try {
      // Gọi trực tiếp 127.0.0.1:5000 để tránh lỗi socket hang up
      const res = await fetch(`http://127.0.0.1:5000/api/comments/${slug}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setComments(data.data);
      }
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động lấy bình luận khi component được tải
  useEffect(() => {
    if (slug) fetchComments();
  }, [slug]);

  // 3. Hàm gửi bình luận
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmitting(true);
    const token = localStorage.getItem('accessToken'); // Lấy token để xác thực

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Bắt buộc phải có Token vì authMiddleware yêu cầu
        },
        body: JSON.stringify({
          storyId: slug,
          content: commentText
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        // Thêm bình luận mới vào đầu danh sách ngay lập tức
        setComments([data.data, ...comments]); 
        setCommentText(""); // Xóa nội dung ô nhập
      } else {
        alert(data.message || "Gửi thất bại. Vui lòng đăng nhập lại.");
      }
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      alert("Lỗi kết nối server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-sm">
      {/* Header */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase border-b border-border pb-2 text-foreground">
        <MessageSquare size={20} className="text-blue-500" /> 
        Bình Luận ({comments.length})
      </h3>

      {/* KHU VỰC NHẬP BÌNH LUẬN */}
      <div className="mb-8">
        {user ? (
          // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ---
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-white font-bold border border-white/20">
                    {/* Hiển thị Avatar User */}
                    {user.avatar_url?.startsWith('http') ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user.username?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Viết bình luận của bạn với tên ${user.username}...`}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-20 resize-y text-sm transition"
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={!commentText.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Gửi bình luận
                </button>
              </div>
            </div>
          </form>
        ) : (
          // --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP ---
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-muted/30 p-6 rounded-lg border border-dashed border-border text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="text-muted-foreground" size={20} />
            </div>
            <div className="text-muted-foreground">
              Bạn cần đăng nhập để tham gia bình luận.
            </div>
            <Link href="/sign-in" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition shadow-lg shadow-blue-500/20">
                Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>

      {/* DANH SÁCH BÌNH LUẬN */}
      <div className="space-y-6">
        {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải bình luận...</div>
        ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic bg-muted/10 rounded-lg">
                Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
        ) : (
            comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold border border-border">
                        {comment.user?.avatar_url?.startsWith('http') ? (
                            <img src={comment.user.avatar_url} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                            comment.user?.username?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-sm ${comment.user?.role === 'admin' ? 'text-red-500' : 'text-foreground'}`}>
                            {comment.user?.username || 'Người dùng ẩn danh'}
                        </span>
                        {comment.user?.role === 'admin' && (
                            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded border border-red-200 font-bold">ADMIN</span>
                        )}
                        <span className="text-xs text-muted-foreground">• {new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-r-xl rounded-bl-xl border border-border/50 shadow-sm">
                        {comment.content}
                    </div>
                    
                    {/* Các nút tương tác nhỏ bên dưới */}
                    <div className="flex gap-4 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-muted-foreground hover:text-blue-500 font-medium">Trả lời</button>
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}