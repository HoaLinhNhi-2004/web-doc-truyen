"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 👇 GỌI API ĐĂNG NHẬP CỦA BACKEND (Cổng 5000)
    // Lưu ý: Dùng 127.0.0.1 để tránh lỗi trên Windows
    const apiUrl = `http://127.0.0.1:5000/api/auth/login`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // ✅ Đăng nhập thành công
      console.log('Login success:', data);
      
      // 1. Lưu Token và User vào LocalStorage
      // Token này sẽ dùng để gửi kèm các request cần quyền (như comment, nạp tiền)
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data)); 

      // 2. Chuyển hướng về trang chủ
      router.push('/');
      
      // Mẹo: Reload trang để Header cập nhật trạng thái (nếu Header chưa xử lý state)
      // window.location.href = '/'; 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Đăng Nhập</h1>
          <p className="text-muted-foreground">Kết nối với hệ thống DocTruyen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Thông báo lỗi nếu có */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Đang xử lý...' : (
              <>
                <LogIn size={20} /> Đăng Nhập Ngay
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}