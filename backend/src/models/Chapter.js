import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Chapter = sequelize.define('Chapter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    story_id: { type: DataTypes.INTEGER, allowNull: false }, // FK
    chapter_num: { type: DataTypes.FLOAT, allowNull: false },
    title: { type: DataTypes.STRING(255) },
    price: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 = Free
    published_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'chapters' });

export default Chapter;