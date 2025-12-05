// src/models/Transaction.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false }, 
    type: { 
        // CHUẨN KHỚP TÀI LIỆU 
        type: DataTypes.ENUM('deposit', 'unlock_chapter', 'gift'), 
        allowNull: false 
    },
    description: { type: DataTypes.STRING },
}, { tableName: 'user_transactions' });

export default Transaction;