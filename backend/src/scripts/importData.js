import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { 
    sequelize, Story, Chapter, ChapterContent, Category, StoryCategory 
} from '../models/index.js';

// Đọc file JSON từ thư mục gốc
const dataPath = path.resolve('data.json'); 
const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const importData = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Đã kết nối DB, bắt đầu nhập liệu...');

        // Nếu file JSON là 1 object đơn lẻ, chuyển thành mảng để xử lý chung
        const stories = Array.isArray(jsonData) ? jsonData : [jsonData];

        for (const item of stories) {
            console.log(`\n📚 Đang xử lý truyện: ${item.title}`);

            // 1. Tạo Slug
            const slug = slugify(item.title, { lower: true, strict: true });

            // 2. Tạo hoặc Tìm Truyện (Tránh trùng lặp)
            const [story, created] = await Story.findOrCreate({
                where: { slug: slug },
                defaults: {
                    title: item.title,
                    type: item.type,
                    status: item.status,
                    description: item.description,
                    cover_image: item.cover_image,
                    author_name: item.author_name || 'Đang cập nhật',
                    total_views: 0
                }
            });

            if (!created) {
                console.log(`   ⚠️ Truyện này đã có, bỏ qua tạo mới.`);
            } else {
                console.log(`   ✅ Đã tạo truyện mới.`);
            }

            // 3. Xử lý Thể loại (Categories)
            if (item.categories && item.categories.length > 0) {
                for (const catName of item.categories) {
                    // Tìm hoặc tạo thể loại mới
                    const [category] = await Category.findOrCreate({
                        where: { slug: slugify(catName, { lower: true, strict: true }) },
                        defaults: { name: catName }
                    });
                    // Link truyện vào thể loại (Bảng trung gian)
                    await StoryCategory.findOrCreate({
                        where: { story_id: story.id, category_id: category.id }
                    });
                }
                console.log(`   🏷️  Đã gắn ${item.categories.length} thể loại.`);
            }

            // 4. Xử lý Chương (Chapters)
            if (item.chapters && item.chapters.length > 0) {
                console.log(`   📄 Đang nhập ${item.chapters.length} chương...`);
                
                for (const chap of item.chapters) {
                    // Tạo chương
                    const newChap = await Chapter.create({
                        story_id: story.id,
                        chapter_num: chap.chapter_num,
                        title: chap.title || `Chapter ${chap.chapter_num}`,
                        price: 0 // Mặc định miễn phí
                    });

                    // Tạo nội dung chương
                    await ChapterContent.create({
                        chapter_id: newChap.id,
                        content_images: chap.content_images, // Sequelize tự stringify JSON mảng ảnh
                        content_text: chap.content_text || null
                    });
                }
                console.log(`   ✅ Hoàn tất nhập chương.`);
            }
        }

        console.log('\n🎉 NHẬP DỮ LIỆU THÀNH CÔNG 100%!');
        process.exit();

    } catch (error) {
        console.error('❌ Lỗi nhập liệu:', error);
        process.exit(1);
    }
};

importData();