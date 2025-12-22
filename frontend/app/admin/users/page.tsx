'use client';

import { useState, useEffect } from 'react';
import { Search, Lock, Ban, CheckCircle, Coins, Unlock } from 'lucide-react'; // [MỚI] Thêm icon Unlock

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  coin_balance: number;
  status: string; // 'active' | 'banned'
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);
    fetchUsers(t || '');
  }, []);

  // 1. Lấy danh sách user
  const fetchUsers = async (authToken: string) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. [CẬP NHẬT] Xử lý Khóa/Mở khóa tài khoản
  const handleBanUser = async (userId: number, currentStatus: string) => {
    const isBanned = currentStatus === 'banned';
    const actionText = isBanned ? 'MỞ KHÓA' : 'KHÓA';
    
    if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản này không?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message); // Hiển thị thông báo từ server
        
        // [QUAN TRỌNG] Cập nhật ngay UI theo status mới trả về từ backend
        setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: data.new_status } : u
        ));
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối server');
    }
  };

  // 3. Xử lý Nạp tiền
  const handleDeposit = async (userId: number) => {
    const amountStr = prompt("Nhập số xu muốn cộng thêm cho user này:");
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
        return alert("Số tiền không hợp lệ");
    }

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/admin/users/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, amount })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            alert(data.message); 
            fetchUsers(token); // Load lại danh sách để cập nhật số dư
        } else {
            alert("Lỗi: " + data.message);
        }
    } catch (error) {
        alert("Lỗi kết nối");
    }
  };

  // Lọc danh sách theo tìm kiếm
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Quản lý Thành Viên</h1>
        
        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng Danh sách */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-200 uppercase font-bold text-xs border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Thông tin User</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Số dư</th> 
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Đang tải danh sách...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center italic">Không tìm thấy thành viên nào.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50 transition">
                    <td className="px-6 py-3">#{user.id}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.username}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.role === 'admin' ? 'bg-red-900/30 text-red-500' :
                        user.role === 'moderator' ? 'bg-purple-900/30 text-purple-500' :
                        'bg-blue-900/30 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    
                    {/* Cột hiển thị số dư xu */}
                    <td className="px-6 py-3">
                        <span className="text-yellow-500 font-bold font-mono">
                            {user.coin_balance?.toLocaleString() || 0} xu
                        </span>
                    </td>

                    <td className="px-6 py-3">
                      {user.status === 'banned' ? (
                        <span className="text-red-500 flex items-center gap-1 font-bold text-xs"><Lock size={12} /> Bị khóa</span>
                      ) : (
                        <span className="text-green-500 flex items-center gap-1 font-bold text-xs"><CheckCircle size={12} /> Hoạt động</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        
                        <button
                            onClick={() => handleDeposit(user.id)}
                            className="p-2 rounded bg-yellow-600/20 hover:bg-yellow-600 hover:text-white text-yellow-500 transition"
                            title="Nạp xu thủ công"
                        >
                            <Coins size={16} />
                        </button>
                        
                        {/* [CẬP NHẬT UI] Nút Toggle Ban/Unban */}
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleBanUser(user.id, user.status)}
                            className={`p-2 rounded transition flex items-center gap-1 ${
                              user.status === 'banned' 
                                ? 'bg-green-600/20 hover:bg-green-600 hover:text-white text-green-500' // Nút Xanh cho Mở khóa
                                : 'bg-red-900/20 hover:bg-red-600 hover:text-white text-red-500'     // Nút Đỏ cho Khóa
                            }`} 
                            title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {/* Đổi Icon dựa trên trạng thái */}
                            {user.status === 'banned' ? <Unlock size={16} /> : <Ban size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}