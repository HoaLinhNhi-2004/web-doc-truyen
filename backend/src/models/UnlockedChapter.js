import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UnlockedChapter = sequelize.define('UnlockedChapter', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    chapter_id: { type: DataTypes.INTEGER, primaryKey: true },
    price_paid: { type: DataTypes.INTEGER, defaultValue: 0 } // Lưu giá tại thời điểm mua
}, { 
    tableName: 'unlocked_chapters',
    timestamps: true 
});

export default UnlockedChapter;