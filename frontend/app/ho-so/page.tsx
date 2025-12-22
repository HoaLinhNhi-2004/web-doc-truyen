'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, LogOut, Heart, Clock, Coins, Shield, BookOpen, Camera, X, Edit3 } from 'lucide-react';

// --- Interfaces ---
interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  coin_balance: number;
  role: string;
}

interface StoryBasic {
  id: number;
  slug: string;
  title: string;
  cover_image: string;
  type: string;
  status: string;
}

interface HistoryItem {
  story: StoryBasic;
  last_read_chapter: { id: number; chapter_num: number; title: string };
  updatedAt: string;
}

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:5000${cleanUrl}`;
};

export default function ProfilePage() {
  const router = useRouter();
  
  // Data State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<StoryBasic[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [token, setToken] = useState<string | null>(null);
  
  // Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // State chỉnh sửa tên
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. FETCH DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken) {
      router.push('/sign-in'); 
      return;
    }
    setToken(savedToken);

    fetch('http://127.0.0.1:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setUser(data.data);
      setNewName(data.data.username);
      setLoading(false);
      fetchFavorites(savedToken);
    })
    .catch(() => handleLogout());
  }, [router]);

  const fetchFavorites = (t: string) => {
    fetch('http://127.0.0.1:5000/api/user/favorites', { headers: { 'Authorization': `Bearer ${t}` } })
      .then(res => res.json()).then(data => data.status === 'success' && setFavorites(data.data));
  };

  const fetchHistory = (t: string) => {
    fetch('http://127.0.0.1:5000/api/user/history', { headers: { 'Authorization': `Bearer ${t}` } })
      .then(res => res.json()).then(data => data.status === 'success' && setHistory(data.data));
  };

  const handleTabChange = (tab: 'favorites' | 'history') => {
    setActiveTab(tab);
    if (token) {
      if (tab === 'favorites' && favorites.length === 0) fetchFavorites(token);
      if (tab === 'history' && history.length === 0) fetchHistory(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    router.push('/sign-in');
    router.refresh();
  };

  // --- 2. XỬ LÝ ĐỔI AVATAR ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const uploadRes = await fetch('http://127.0.0.1:5000/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const uploadData = await uploadRes.json();

        if (uploadData.status !== 'success') throw new Error('Lỗi upload ảnh');

        const newAvatarPath = uploadData.data.path;
        await updateUserProfile({ avatar_url: newAvatarPath });

    } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi đổi ảnh đại diện');
    }
  };

  // --- 3. XỬ LÝ ĐỔI TÊN ---
  const handleUpdateName = async () => {
      if(!newName.trim() || !token) return;
      await updateUserProfile({ username: newName });
      setIsEditingName(false);
  };

  const updateUserProfile = async (bodyData: { username?: string, avatar_url?: string }) => {
      if(!token) return;
      try {
        const updateRes = await fetch('http://127.0.0.1:5000/api/user/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(bodyData)
        });
        
        const updateData = await updateRes.json();
        if (updateData.status === 'success') {
            setUser(updateData.data);
            localStorage.setItem('user', JSON.stringify(updateData.data));
            window.dispatchEvent(new Event('user-updated')); 
            alert('Cập nhật thành công!');
        }
      } catch (error) {
          console.error(error);
          alert('Lỗi cập nhật thông tin');
      }
  };

  // --- 4. XỬ LÝ ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPassMsg({ type: '', text: 'Đang xử lý...' });

    try {
        const res = await fetch('http://127.0.0.1:5000/api/user/password', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(passForm)
        });

        const data = await res.json();
        if (data.status === 'success') {
            setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPassForm({ oldPassword: '', newPassword: '' });
            setTimeout(() => setShowPasswordModal(false), 1500);
        } else {
            setPassMsg({ type: 'error', text: data.message || 'Lỗi đổi mật khẩu' });
        }

    } catch (error) {
        setPassMsg({ type: 'error', text: 'Lỗi kết nối server' });
    }
  };

  if (loading) return <div className="min-h-screen bg-background pt-32 text-center text-muted-foreground">Đang tải...</div>;

  return (
    // [FIX] Sử dụng bg-background và text-foreground để tự đổi màu
    <div className="min-h-screen bg-background pt-24 pb-12 text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* === HEADER INFO CARD === */}
        {/* [FIX] Sử dụng bg-card và border-border */}
        <div className="bg-card rounded-2xl p-6 md:p-10 border border-border flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 shadow-lg relative overflow-hidden">
          
          {/* Avatar Section */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Nhấn để đổi Avatar">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border shadow-2xl relative">
              <Image 
                src={getImageUrl(user?.avatar_url || '')} 
                alt="Avatar" 
                fill 
                className="object-cover group-hover:opacity-70 transition"
                unoptimized 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <Camera size={32} className="text-white drop-shadow-md" />
              </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
            <div className="absolute bottom-0 right-0 bg-blue-600 text-xs text-white font-bold px-2 py-1 rounded-full border-2 border-background uppercase">
              {user?.role}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-3">
            
            {/* Tên người dùng */}
            <div className="flex items-center justify-center md:justify-start gap-3">
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                        {/* [FIX] Input đổi màu theo theme */}
                        <input 
                            type="text" 
                            className="bg-background border border-border rounded px-2 py-1 text-foreground focus:border-blue-500 outline-none"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button onClick={handleUpdateName} className="text-green-500 hover:text-green-400 text-sm font-bold">Lưu</button>
                        <button onClick={() => setIsEditingName(false)} className="text-red-500 hover:text-red-400 text-sm">Hủy</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-foreground">{user?.username}</h1>
                        <button onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-blue-500 transition">
                            <Edit3 size={18} />
                        </button>
                    </>
                )}
            </div>

            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
               <User size={16} /> {user?.email}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-4 py-2 rounded-lg border border-yellow-500/20 flex items-center gap-2 font-bold">
                <Coins size={20} />
                <span>{user?.coin_balance.toLocaleString()} Xu</span>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg border border-border transition flex items-center gap-2"
              >
                <Shield size={18} /> Đổi mật khẩu
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition flex items-center gap-2"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        {/* === TABS === */}
        {/* [FIX] Container Tabs sử dụng bg-card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden min-h-[500px]">
          <div className="flex border-b border-border">
            <button onClick={() => handleTabChange('favorites')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${activeTab === 'favorites' ? 'text-red-500 border-b-2 border-red-500 bg-muted/50' : 'text-muted-foreground hover:bg-muted/30'}`}>
              <Heart size={20} /> Tủ Truyện ({favorites.length})
            </button>
            <button onClick={() => handleTabChange('history')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500 bg-muted/50' : 'text-muted-foreground hover:bg-muted/30'}`}>
              <Clock size={20} /> Lịch Sử Đọc
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'favorites' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favorites.length > 0 ? favorites.map(story => (
                  <Link href={`/truyen/${story.slug}`} key={story.id} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border shadow-md">
                      <Image 
                        src={getImageUrl(story.cover_image)} 
                        alt={story.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition duration-500" 
                        unoptimized 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    </div>
                    {/* [FIX] Text đổi màu theo theme */}
                    <h3 className="mt-2 text-sm font-bold text-foreground line-clamp-2 group-hover:text-red-500 transition">{story.title}</h3>
                  </Link>
                )) : <div className="col-span-full text-center py-20 text-muted-foreground italic">Bạn chưa theo dõi truyện nào.</div>}
              </div>
            )}

            {activeTab === 'history' && (
               <div className="flex flex-col gap-3">
               {history.length > 0 ? history.map((item, idx) => (
                 // [FIX] Item background
                 <div key={idx} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition group">
                   <Link href={`/truyen/${item.story.slug}`} className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-border shadow-sm">
                     <Image 
                        src={getImageUrl(item.story.cover_image)} 
                        alt={item.story.title} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                   </Link>
                   <div className="flex-1 flex flex-col justify-center">
                     <Link href={`/truyen/${item.story.slug}`}><h3 className="font-bold text-foreground group-hover:text-blue-500 transition line-clamp-1 text-lg">{item.story.title}</h3></Link>
                     <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                       <BookOpen size={16} className="text-blue-500" />
                       <span>Đọc đến:</span> 
                       <Link href={`/truyen/${item.story.slug}/${item.last_read_chapter.id}`} className="text-foreground font-bold hover:underline bg-blue-500/10 px-2 py-0.5 rounded text-xs">
                         {item.last_read_chapter.title || `Chương ${item.last_read_chapter.chapter_num}`}
                       </Link>
                     </div>
                     <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock size={12} /> {new Date(item.updatedAt).toLocaleString('vi-VN')}</p>
                   </div>
                   <div className="flex items-center pr-4">
                       <Link href={`/truyen/${item.story.slug}/${item.last_read_chapter.id}`} className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition">Đọc tiếp</Link>
                   </div>
                 </div>
               )) : <div className="text-center py-20 text-muted-foreground italic">Chưa có lịch sử đọc truyện.</div>}
             </div>
            )}
          </div>
        </div>

        {/* === MODAL ĐỔI MẬT KHẨU === */}
        {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                {/* [FIX] Modal background */}
                <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
                    <button 
                        onClick={() => setShowPasswordModal(false)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                    >
                        <X size={24} />
                    </button>
                    
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Shield className="text-blue-500" /> Đổi Mật Khẩu
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Mật khẩu cũ</label>
                            <input 
                                type="password" 
                                required
                                // [FIX] Input đổi màu
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                                value={passForm.oldPassword}
                                onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                required
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                                value={passForm.newPassword}
                                onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                            />
                        </div>

                        {passMsg.text && (
                            <div className={`text-sm p-2 rounded ${passMsg.type === 'success' ? 'bg-green-500/10 text-green-600' : passMsg.type === 'error' ? 'bg-red-500/10 text-red-600' : 'text-muted-foreground'}`}>
                                {passMsg.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition mt-2"
                        >
                            Xác nhận đổi
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}