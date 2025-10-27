require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/app_pagos',
    JWT_SECRET: process.env.JWT_SECRET || 'smarttech_secret_key_2025',
    NODE_ENV: process.env.NODE_ENV || 'development'
};