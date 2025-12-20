'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StarRatingProps {
  storyId: string | number;
  initialAverage?: number;
}

export default function StarRating({ storyId, initialAverage = 0 }: StarRatingProps) {
  const [rating, setRating] = useState(0); // Điểm người dùng đánh giá (Của tôi)
  const [average, setAverage] = useState(initialAverage); // Điểm trung bình (Của truyện)
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Lấy điểm đánh giá cũ của user (nếu có)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`http://127.0.0.1:5000/api/ratings/${storyId}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        setRating(data.data.score);
      }
    })
    .catch(err => console.error("Lỗi tải đánh giá:", err));
  }, [storyId]);

  // 2. Xử lý khi bấm vào ngôi sao
  const handleRate = async (score: number) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      if (confirm("Bạn cần đăng nhập để đánh giá. Đi đến trang đăng nhập?")) {
        router.push('/sign-in');
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storyId, score })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setRating(score);
        // Cập nhật điểm trung bình mới trả về từ backend
        if (data.data && data.data.average_rating) {
            setAverage(data.data.average_rating);
        }
        alert(`Cảm ơn bạn đã đánh giá ${score} sao!`);
      } else {
        alert(data.message || "Lỗi đánh giá");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(star)}
            disabled={loading}
            title={`Đánh giá ${star} sao`}
          >
            <Star
              size={20}
              className={`
                ${star <= (hover || rating) ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-400 fill-transparent'}
                transition-colors duration-200
              `}
            />
          </button>
        ))}
        <span className="text-sm font-bold text-yellow-500 ml-2">{average}/5</span>
      </div>
      <p className="text-xs text-zinc-500">
        {rating > 0 ? `Bạn đã chấm: ${rating} sao` : 'Hãy đánh giá truyện này'}
      </p>
    </div>
  );
}