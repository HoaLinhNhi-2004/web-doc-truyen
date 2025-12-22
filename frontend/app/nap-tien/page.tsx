'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Coins, Copy, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const router = useRouter();
  
  // --- CẤU HÌNH TÀI KHOẢN NHẬN TIỀN ---
  const BANK_ID = 'MB'; 
  const ACCOUNT_NO = '01013906070904'; 
  const ACCOUNT_NAME = 'TRẦN VĂN SỸ'; 
  // 1000 VNĐ = 10 Xu
  
  const [amount, setAmount] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (!t) {
        router.push('/sign-in');
        return;
    }
    setToken(t);
    fetchUserInfo(t);
  }, []);

  const fetchUserInfo = async (t: string) => {
      try {
          const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
              headers: { 'Authorization': `Bearer ${t}` }
          });
          const data = await res.json();
          if (data.status === 'success') setUserInfo(data.data);
      } catch (e) {
          console.error(e);
      }
  };

  const coinsReceived = amount ? Math.floor(parseInt(amount) / 1000 * 10) : 0;
  const transferContent = userInfo ? `NAP ${userInfo.id} ${userInfo.username}` : 'NAPTIEN';
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  const handleConfirmTransfer = async () => {
    if (!amount || parseInt(amount) < 10000) {
        alert("Vui lòng nạp tối thiểu 10.000đ");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch('http://127.0.0.1:5000/api/payment/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                coins: coinsReceived,
                description: transferContent,
                method: 'banking'
            })
        });

        const data = await res.json();
        if (data.status === 'success') {
            alert("Đã gửi yêu cầu nạp tiền! Vui lòng đợi Admin duyệt.");
            router.push('/');
        } else {
            alert("Lỗi: " + data.message);
        }
    } catch (error) {
        alert("Lỗi kết nối");
    } finally {
        setLoading(false);
    }
  };

  return (
    // [FIX] Sử dụng bg-background và text-foreground
    <div className="min-h-screen bg-background pt-24 pb-10 px-4 text-foreground transition-colors duration-300">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header - Giữ nguyên gradient vàng để nổi bật */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2 drop-shadow-md">
                <Coins className="text-white" /> Nạp Xu
            </h1>
            <p className="text-yellow-100 font-medium text-sm mt-1">Tỷ lệ: 1.000đ = 10 Xu</p>
        </div>

        <div className="p-6">
            {/* STEP 1: NHẬP SỐ TIỀN */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Số tiền muốn nạp (VNĐ)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="10000"
                                step="10000"
                                placeholder="VD: 20000"
                                // [FIX] Input background & border theo theme
                                className="w-full bg-background border border-border rounded-xl pl-4 pr-16 py-3 text-foreground text-lg focus:border-yellow-500 outline-none transition font-bold"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {/* [FIX] Background của suffix VNĐ cũng theo theme */}
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold bg-background pl-2 pointer-events-none">
                                VNĐ
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Tối thiểu 10.000 VNĐ</p>
                    </div>

                    {/* [FIX] Box hiển thị xu */}
                    <div className="bg-muted/50 rounded-xl p-4 flex justify-between items-center border border-border">
                        <span className="text-muted-foreground">Xu thực nhận:</span>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{coinsReceived} Xu</span>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-2">Chọn nhanh mệnh giá:</p>
                        <div className="grid grid-cols-3 gap-3">
                            {[10000, 20000, 50000, 100000, 200000, 500000].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    // [FIX] Button style theo theme
                                    className={`py-3 rounded-lg text-sm font-bold border transition ${
                                        amount === val.toString() 
                                        ? 'bg-yellow-500 border-yellow-600 text-white shadow-lg' 
                                        : 'bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                                >
                                    {val.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (!amount || parseInt(amount) < 10000) return alert("Tối thiểu 10.000đ");
                            setStep(2);
                        }}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-yellow-500/20"
                    >
                        Tiếp tục <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* STEP 2: QUÉT QR & XÁC NHẬN */}
            {step === 2 && (
                <div className="space-y-6 text-center">
                    {/* [FIX] Container QR Code luôn để trắng để dễ quét */}
                    <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-lg border border-zinc-200">
                        <Image 
                            src={qrUrl}
                            alt="QR Code"
                            width={250}
                            height={250}
                            unoptimized
                        />
                    </div>
                    
                    {/* [FIX] Info Box */}
                    <div className="text-left bg-muted/30 p-4 rounded-xl border border-border space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngân hàng:</span>
                            <span className="text-foreground font-bold">{BANK_ID}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Chủ tài khoản:</span>
                            <span className="text-foreground font-bold uppercase">{ACCOUNT_NAME}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tài khoản:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground font-bold tracking-wider">{ACCOUNT_NO}</span>
                                <Copy 
                                    size={14} 
                                    className="text-muted-foreground cursor-pointer hover:text-yellow-500 transition"
                                    onClick={() => navigator.clipboard.writeText(ACCOUNT_NO)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tiền:</span>
                            <span className="text-yellow-600 dark:text-yellow-500 font-bold">{parseInt(amount).toLocaleString()} VNĐ</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border mt-2">
                            <span className="text-muted-foreground">Nội dung CK:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 font-bold">{transferContent}</span>
                                <Copy 
                                    size={14} 
                                    className="text-muted-foreground cursor-pointer hover:text-yellow-500 transition"
                                    onClick={() => navigator.clipboard.writeText(transferContent)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setStep(1)}
                            className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition border border-border"
                        >
                            Quay lại
                        </button>
                        <button 
                            onClick={handleConfirmTransfer}
                            disabled={loading}
                            className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-600/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                            Tôi đã chuyển tiền
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
      
      <div className="max-w-md mx-auto mt-6 text-center">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition">
            Về trang chủ
        </Link>
      </div>
    </div>
  );
}