import express from "express";
import dotenv from "dotenv"; 
import cors from "cors";
// import path from 'path'; // Có thể bỏ nếu không dùng
import { syncDatabase } from './src/models/index.js'; 
import initRoutes from "./src/routes/web.js";

dotenv.config();

const app = express();
// Đảm bảo PORT là 5000 để khớp với frontend
const PORT = process.env.PORT || 5000;

// Cấu hình CORS: Cho phép Frontend (cổng 3000) gọi sang
app.use(cors({
    origin: true, // Cho phép tất cả (để test cho dễ)
    credentials: true, // Cho phép gửi cookie/token
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Middleware xử lý dữ liệu gửi lên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Link ảnh tĩnh
app.use('/uploads', express.static('uploads'));

// Khởi tạo các Route API
initRoutes(app);

// Đồng bộ Database (Tạo bảng)
syncDatabase(); 

// Route test server
app.get('/', (req, res) => {
    res.send('Server Backend đang chạy ngon lành!');
});

// --- PHẦN QUAN TRỌNG NHẤT: SỬA LỖI SOCKET HANG UP ---
// Thêm tham số '0.0.0.0' vào hàm listen
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on the port ${PORT}`);
    console.log(`🌍 Network: http://127.0.0.1:${PORT}`);
});