import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChapterContent = sequelize.define('ChapterContent', {
    chapter_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        // Sẽ set references trong file index.js
    },
    content_text: { type: DataTypes.TEXT('long') }, // Cho truyện chữ
    content_images: { type: DataTypes.JSON } // Cho truyện tranh (Mảng link ảnh)
}, { 
    tableName: 'chapter_contents',
    timestamps: false 
});

export default ChapterContent;