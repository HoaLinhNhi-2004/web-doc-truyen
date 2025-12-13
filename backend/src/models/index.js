import sequelize from '../config/database.js';

// Import Entities (Đảm bảo tên file trong thư mục models khớp với tên import ở đây)
// Ví dụ: file phải là User.js (hoặc user.js tùy bạn đặt), nếu lỗi "Module not found" hãy check lại tên file.
import User from './User.js';
import Story from './Story.js';
import Chapter from './Chapter.js';
import ChapterContent from './ChapterContent.js';
import Category from './Category.js';
import StoryCategory from './StoryCategory.js';
import Transaction from './Transaction.js';
import UnlockedChapter from './UnlockedChapter.js';
import ReadingHistory from './ReadingHistory.js';
import Favorite from './Favorite.js';
import Comment from './Comment.js';
import Rating from './Rating.js';

// ==========================================================
// 1. Story (Truyện) & Chapter (Chương)
// ==========================================================
Story.hasMany(Chapter, { foreignKey: 'story_id', as: 'chapters', onDelete: 'CASCADE' });
Chapter.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });

// ==========================================================
// 2. Chapter & Content (Nội dung)
// ==========================================================
Chapter.hasOne(ChapterContent, { foreignKey: 'chapter_id', as: 'content', onDelete: 'CASCADE' });
ChapterContent.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });

// ==========================================================
// 3. Story & Category (Thể loại)
// ==========================================================
Story.belongsToMany(Category, { through: StoryCategory, foreignKey: 'story_id', as: 'categories' });
Category.belongsToMany(Story, { through: StoryCategory, foreignKey: 'category_id', as: 'stories' });

// ==========================================================
// 4. User & Transaction (Giao dịch)
// ==========================================================
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ==========================================================
// 5. User & Story -> Favorites (Tủ truyện)
// ==========================================================
// Quan hệ nhiều-nhiều
User.belongsToMany(Story, { through: Favorite, foreignKey: 'user_id', as: 'favorite_stories' });
Story.belongsToMany(User, { through: Favorite, foreignKey: 'story_id', as: 'followers' });

// --- BỔ SUNG QUAN HỆ TRỰC TIẾP (Để query bảng Favorite lấy Story) ---
Favorite.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });
Story.hasMany(Favorite, { foreignKey: 'story_id' });

Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Favorite, { foreignKey: 'user_id' });

// ==========================================================
// 6. User & Story -> ReadingHistory (Lịch sử đọc)
// ==========================================================
// Quan hệ nhiều-nhiều
User.belongsToMany(Story, { through: ReadingHistory, foreignKey: 'user_id', as: 'reading_history' });
Story.belongsToMany(User, { through: ReadingHistory, foreignKey: 'story_id', as: 'readers' });

// --- BỔ SUNG QUAN HỆ TRỰC TIẾP (QUAN TRỌNG ĐỂ FIX LỖI 500) ---
// Dòng này giúp bảng ReadingHistory hiểu nó thuộc về Story nào khi query trực tiếp
ReadingHistory.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });
Story.hasMany(ReadingHistory, { foreignKey: 'story_id' });

ReadingHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ReadingHistory, { foreignKey: 'user_id' });

// Liên kết với chương đang đọc dở
ReadingHistory.belongsTo(Chapter, { foreignKey: 'last_chapter_id', as: 'last_read_chapter' });

// ==========================================================
// 7. User & Story -> Ratings (Đánh giá sao)
// ==========================================================
User.belongsToMany(Story, { through: Rating, foreignKey: 'user_id', as: 'rated_stories' });
Story.belongsToMany(User, { through: Rating, foreignKey: 'story_id', as: 'user_ratings' });

Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Rating.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });

// ==========================================================
// 8. User & Chapter -> UnlockedChapters (Mua chương)
// ==========================================================
User.belongsToMany(Chapter, { through: UnlockedChapter, foreignKey: 'user_id', as: 'unlocked_chapters' });
Chapter.belongsToMany(User, { through: UnlockedChapter, foreignKey: 'chapter_id', as: 'buyers' });

// ==========================================================
// 9. Comments (Bình luận)
// ==========================================================
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Story.hasMany(Comment, { foreignKey: 'story_id' });
Comment.belongsTo(Story, { foreignKey: 'story_id' });

Chapter.hasMany(Comment, { foreignKey: 'chapter_id', as: 'comments' });
Comment.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });

Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

// ==========================================================
// SYNC DB
// ==========================================================
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công!');
        // await sequelize.sync({ alter: true }); // Bỏ comment dòng này nếu muốn tự động cập nhật cấu trúc bảng
        console.log('✅ DATABASE ĐÃ SẴN SÀNG!');
    } catch (error) {
        console.error('❌ Lỗi kết nối CSDL:', error);
    }
};

export { 
    sequelize, syncDatabase, 
    User, Story, Chapter, ChapterContent, Category, StoryCategory,
    Transaction, UnlockedChapter, ReadingHistory, Favorite, Comment, Rating
};