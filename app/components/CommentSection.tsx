"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { MessageSquare, Send, User as UserIcon } from "lucide-react";
import Image from "next/image";

interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

export default function CommentSection({ slug }: { slug: string }) {
  const { isSignedIn, user } = useUser();
  const [commentText, setCommentText] = useState("");
  
  // Mock data bình luận (Sau này bạn có thể thay bằng gọi API thật)
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=1", content: "Truyện hay quá ad ơi!", time: "2 giờ trước" },
    { id: 2, user: "Trần B", avatar: "https://i.pravatar.cc/150?u=2", content: "Hóng chap mới quá đi mất.", time: "5 giờ trước" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Thêm bình luận mới vào danh sách (Giả lập)
    const newComment: Comment = {
      id: Date.now(),
      user: user?.fullName || "Bạn",
      avatar: user?.imageUrl || "",
      content: commentText,
      time: "Vừa xong",
    };

    setComments([newComment, ...comments]);
    setCommentText("");
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
        {isSignedIn ? (
          // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ---
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="shrink-0">
              <Image 
                src={user?.imageUrl || "/default-avatar.png"} 
                alt="Avatar" 
                width={40} 
                height={40} 
                className="rounded-full border border-border"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px] resize-y text-sm"
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={14} /> Gửi bình luận
                </button>
              </div>
            </div>
          </form>
        ) : (
          // --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP (Giống ảnh bạn gửi) ---
          <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border border-border border-dashed">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
               <UserIcon className="text-blue-500" size={20} />
            </div>
            <div className="text-muted-foreground text-sm">
              Bạn cần <SignInButton mode="modal"><button className="text-blue-500 font-semibold hover:underline">đăng nhập</button></SignInButton> để bình luận.
            </div>
          </div>
        )}
      </div>

      {/* DANH SÁCH BÌNH LUẬN */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="shrink-0">
               <Image 
                src={comment.avatar} 
                alt={comment.user} 
                width={40} 
                height={40} 
                className="rounded-full border border-border"
                unoptimized // Dùng unoptimized cho ảnh mock data
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">{comment.user}</span>
                <span className="text-xs text-muted-foreground">• {comment.time}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-r-lg rounded-bl-lg">
                {comment.content}
              </p>
              
              {/* Nút hành động nhỏ (Reply/Like) - Trang trí */}
              <div className="flex gap-4 mt-1 ml-1">
                <button className="text-xs text-muted-foreground hover:text-blue-500 font-medium">Trả lời</button>
                <button className="text-xs text-muted-foreground hover:text-red-500 font-medium">Thích</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}