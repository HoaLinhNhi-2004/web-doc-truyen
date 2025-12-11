import express from "express";
import dotenv from "dotenv"; // Sửa 1: Dùng import thay vì require cho đồng bộ
import cors from "cors";
import path from 'path';
// Lưu ý đường dẫn: Nếu server.js nằm ngoài cùng (ngang hàng src) thì phải là ./src/models/index.js
import { syncDatabase } from './src/models/index.js'; 
import initRoutes from "./src/routes/web.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS
app.use(cors({
    origin: process.env.CLIENT_URL || "*", // Cho phép tất cả nếu chưa config CLIENT_URL
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Middleware xử lý dữ liệu
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Dòng này giúp link http://localhost:3000/uploads/anh.jpg hoạt động
app.use('/uploads', express.static('uploads'));

// Đồng bộ Database (Tạo bảng)
initRoutes(app);
syncDatabase();

// Route test
app.get('/', (req, res) => {
    res.send('Server Web Truyện Tranh đang chạy ổn định!');
});

// Khởi động server
const listener = app.listen(PORT, () => { // Sửa 2: Dùng biến PORT (viết hoa) thay vì port (thường)
    console.log(`🚀 Server is running on the port ${listener.address().port}`);
});