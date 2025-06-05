// Import Express untuk membuat router
const express = require('express');
const router = express.Router();

// Import semua route yang ada di aplikasi
const authRoutes = require('./authRoutes');           // Route untuk autentikasi (login/register)
const productRoutes = require('./produkRoutes');       // Route untuk manajemen produk    
const transactionRoutes = require('./transactionRoutes'); // Route untuk transaksi
const ownedProdukRoutes = require('./ownedProductRoutes'); // Route untuk produk yang dimiliki user


// Menghubungkan setiap route dengan endpoint spesifik
router.use('/auth', authRoutes);           // Contoh: /api/auth/login
router.use('/produk', productRoutes);      // Contoh: /api/produk/list
router.use('/transactions', transactionRoutes); // Contoh: /api/transactions/history
router.use('/owned-produk', ownedProdukRoutes); // Contoh: /api/owned-produk/my-produk

// Export router untuk digunakan di server.js
module.exports = router; 