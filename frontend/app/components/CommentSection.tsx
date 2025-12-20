'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Send, MessageSquare, Trash2, User as UserIcon, CornerDownRight, Loader2 } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatar_url: string;
  role: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
  replies?: Comment[];
}

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:5000${url.startsWith('/') ? url : `/${url}`}`;
};

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State quản lý việc đang trả lời comment nào (lưu ID comment cha)
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Lấy user hiện tại & Danh sách comment
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            setCurrentUser(JSON.parse(userStr));
        } catch (e) {
            console.error("Lỗi đọc user", e);
        }
    }

    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/comments/${slug}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setComments(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // 2. Gửi bình luận (Gốc hoặc Trả lời)
  const handleSubmit = async (parentId: number | null = null) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }

    const textToSend = parentId ? replyContent : content;
    if (!textToSend.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storyId: slug, // slug ở đây chính là storyId (do cách bạn truyền ở page.tsx)
          content: textToSend,
          parentId: parentId
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        // Reset form sau khi gửi thành công
        if (parentId) {
            setReplyingTo(null);
            setReplyContent('');
        } else {
            setContent('');
        }
        // Load lại danh sách để hiện comment mới
        fetchComments();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Xóa bình luận
  const handleDelete = async (commentId: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchComments(); // Load lại danh sách sau khi xóa
      } else {
        alert(data.message || "Không thể xóa");
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  // Component con hiển thị từng comment
  const CommentItem = ({ item, isReply = false }: { item: Comment, isReply?: boolean }) => {
    const isOwner = currentUser?.id === item.user.id;
    const isAdmin = currentUser?.role === 'admin';

    return (
      <div className={`flex gap-3 ${isReply ? 'mt-3 pl-4 border-l-2 border-zinc-800' : 'mt-6'}`}>
        <div className="shrink-0">
          <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden border border-zinc-700 relative`}>
            {item.user.avatar_url ? (
               <Image 
                 src={getImageUrl(item.user.avatar_url)} 
                 alt={item.user.username} 
                 fill 
                 className="object-cover" 
                 unoptimized
               />
            ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <UserIcon size={isReply ? 14 : 18} />
                </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 relative group">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${item.user.role === 'admin' ? 'text-red-500' : 'text-zinc-200'}`}>
                        {item.user.username}
                    </span>
                    {item.user.role === 'admin' && (
                        <span className="bg-red-900/30 text-red-500 text-[10px] px-1.5 py-0.5 rounded border border-red-900/50 uppercase font-bold">Admin</span>
                    )}
                    <span className="text-xs text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>
                
                {/* Nút Xóa (Chỉ hiện khi hover VÀ có quyền) */}
                {(isOwner || isAdmin) && (
                    <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Xóa bình luận"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
          </div>

          {/* Nút Trả lời - Luôn hiển thị */}
          {!isReply && (
              <div className="flex gap-4 mt-1 ml-2">
                  <button 
                    onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
                    className="text-xs font-bold text-zinc-500 hover:text-blue-500 transition flex items-center gap-1"
                  >
                      <CornerDownRight size={12} /> Trả lời
                  </button>
              </div>
          )}

          {/* Form Trả lời (Hiện khi bấm nút) */}
          {replyingTo === item.id && (
              <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <input 
                    type="text" 
                    placeholder={`Trả lời ${item.user.username}...`}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSubmit(item.id)}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center justify-center"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
              </div>
          )}

          {/* Hiển thị các câu trả lời con (Nested) */}
          {item.replies && item.replies.length > 0 && (
              <div className="mt-2">
                  {item.replies.map(reply => (
                      <CommentItem key={reply.id} item={reply} isReply={true} />
                  ))}
              </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
            <MessageSquare className="text-blue-500" /> Bình luận ({comments.length})
        </h3>

        {/* Form Bình Luận Gốc */}
        <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 overflow-hidden border border-zinc-700 relative">
                {currentUser?.avatar_url ? (
                    <Image 
                        src={getImageUrl(currentUser.avatar_url)} 
                        alt="Me" 
                        fill 
                        className="object-cover"
                        unoptimized
                    />
                ) : <UserIcon className="w-full h-full p-2 text-zinc-500" />}
            </div>
            <div className="flex-1 relative">
                <textarea 
                    placeholder={currentUser ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
                    disabled={!currentUser}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none min-h-[100px] shadow-inner transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                {currentUser && (
                    <button 
                        onClick={() => handleSubmit(null)}
                        disabled={submitting || !content.trim()}
                        className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitting ? 'Đang gửi...' : <><Send size={16} /> Gửi</>}
                    </button>
                )}
            </div>
        </div>

        {/* Danh sách bình luận */}
        <div className="space-y-2">
            {loading ? (
                <div className="text-center py-8 text-zinc-500">Đang tải bình luận...</div>
            ) : comments.length > 0 ? (
                comments.map(comment => (
                    <CommentItem key={comment.id} item={comment} />
                ))
            ) : (
                <div className="text-center py-10 text-zinc-500 italic">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                </div>
            )}
        </div>
    </div>
  );
}