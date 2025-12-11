// src/models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    avatar_url: { type: DataTypes.STRING(255) },
    coin_balance: { type: DataTypes.INTEGER, defaultValue: 0 },
    role: { 
        // CHUẨN KHỚP TÀI LIỆU 
        type: DataTypes.ENUM('admin', 'moderator', 'member', 'uploader'), 
        defaultValue: 'member' 
    },
    status: { type: DataTypes.ENUM('active', 'banned'), defaultValue: 'active' }
}, { tableName: 'users' });

export default User;