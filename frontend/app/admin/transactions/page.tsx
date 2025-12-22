'use client';
import { useState, useEffect } from 'react';
import { Check, X, Clock, Search } from 'lucide-react';

interface Transaction {
  id: number;
  user: { username: string; email: string };
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
        setToken(t);
        fetchData(t);
    }
  }, []);

  const fetchData = async (t: string) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.status === 'success') setTransactions(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`Bạn chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} giao dịch này?`)) return;
    
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/admin/transactions/${id}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert(data.message);
            fetchData(token); // Load lại danh sách
        } else {
            alert("Lỗi: " + data.message);
        }
    } catch (e) {
        alert("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Quản Lý Giao Dịch</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950 text-zinc-200 uppercase font-bold text-xs border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Số xu</th>
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? <tr><td colSpan={7} className="p-4 text-center">Đang tải...</td></tr> : 
             transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-800/50 transition">
                <td className="px-6 py-3">#{tx.id}</td>
                <td className="px-6 py-3 font-bold text-white">{tx.user?.username}</td>
                <td className={`px-6 py-3 font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-3 truncate max-w-xs">{tx.description}</td>
                <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        tx.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                    }`}>
                        {tx.status}
                    </span>
                </td>
                <td className="px-6 py-3">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-3 text-right">
                    {tx.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleAction(tx.id, 'approve')}
                                className="p-2 bg-green-600 hover:bg-green-500 text-white rounded shadow" 
                                title="Duyệt"
                            >
                                <Check size={16} />
                            </button>
                            <button 
                                onClick={() => handleAction(tx.id, 'reject')}
                                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded shadow" 
                                title="Từ chối"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}