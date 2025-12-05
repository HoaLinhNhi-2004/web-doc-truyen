import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReadingHistory = sequelize.define('ReadingHistory', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    story_id: { type: DataTypes.INTEGER, primaryKey: true },
    last_chapter_id: { type: DataTypes.INTEGER }, // Chương đang đọc dở
    scroll_position: { type: DataTypes.INTEGER, defaultValue: 0 } // Vị trí cuộn
}, { 
    tableName: 'reading_history',
    timestamps: true // Để biết đọc lúc nào (updatedAt)
});

export default ReadingHistory;