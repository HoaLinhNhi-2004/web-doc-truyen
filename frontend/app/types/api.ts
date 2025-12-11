// Định nghĩa kiểu cho 1 Truyện
export interface Story {
  _id: string;          // Backend thường trả về _id thay vì id
  slug: string;
  name: string;         // Tên truyện (khớp với field bên backend)
  thumbnail: string;    // Ảnh bìa
  latestChapter?: string;
  author?: string;
  status?: string;
}

// Định nghĩa kiểu phản hồi chung (nếu backend trả về dạng { success: true, data: [...] })
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}