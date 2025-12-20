'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Eye, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  // State lưu trữ số liệu thống kê
  const [stats, setStats] = useState({
    totalStories: 0,
    totalUsers: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      
      // Token là bắt buộc để lấy danh sách User (API Admin)
      if (!token) return;

      try {
        // --- GỌI API 1: Lấy danh sách Truyện ---
        // Mẹo: Gọi limit lớn để lấy hết data nhằm tính tổng View chính xác
        // Trong dự án thực tế lớn, Backend nên có API riêng cho Stats (VD: /api/admin/stats)
        const storiesRes = await fetch('http://127.0.0.1:5000/api/stories?limit=10000');
        const storiesData = await storiesRes.json();

        let viewsCount = 0;
        let storiesCount = 0;

        if (storiesData.status === 'success') {
          // Lấy tổng số truyện từ pagination backend trả về
          storiesCount = storiesData.pagination.total;
          
          // Tính tổng lượt xem toàn hệ thống (Cộng dồn field total_views của từng truyện)
          viewsCount = storiesData.data.reduce((sum: number, story: any) => sum + (story.total_views || 0), 0);
        }

        // --- GỌI API 2: Lấy danh sách User ---
        const usersRes = await fetch('http://127.0.0.1:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        
        let usersCount = 0;
        if (usersData.status === 'success') {
          usersCount = usersData.data.length;
        }

        // Cập nhật State
        setStats({
          totalStories: storiesCount,
          totalUsers: usersCount,
          totalViews: viewsCount
        });

      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Tổng quan hệ thống</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Tổng truyện */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center justify-between shadow-lg hover:border-blue-500/50 transition">
          <div>
            <h3 className="text-zinc-400 text-sm font-medium uppercase mb-1">Tổng số truyện</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalStories.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>
        
        {/* Card 2: Thành viên */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center justify-between shadow-lg hover:border-green-500/50 transition">
          <div>
            <h3 className="text-zinc-400 text-sm font-medium uppercase mb-1">Thành viên</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-900/20 text-green-500 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Card 3: Tổng View */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center justify-between shadow-lg hover:border-purple-500/50 transition">
          <div>
            <h3 className="text-zinc-400 text-sm font-medium uppercase mb-1">Tổng lượt xem</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-900/20 text-purple-500 rounded-lg flex items-center justify-center">
            <Eye size={24} />
          </div>
        </div>

      </div>

      {/* Khu vực thông báo hoặc biểu đồ (Placeholder) */}
      <div className="bg-zinc-900/50 rounded-xl p-8 border border-dashed border-zinc-800 text-center text-zinc-500 flex flex-col items-center">
        <TrendingUp className="mb-4 opacity-50 text-blue-500" size={48} />
        <p className="text-lg font-medium text-zinc-300">Hệ thống đang hoạt động ổn định</p>
        <p className="text-sm">Dữ liệu được cập nhật theo thời gian thực từ cơ sở dữ liệu.</p>
      </div>
    </div>
  );
}