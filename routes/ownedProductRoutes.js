// Import library dan middleware yang dibutuhkan
const express = require('express');
const router = express.Router();
const ownedProdukController = require('../controllers/ownedProductController');  // Controller untuk produk yang dimiliki user
const { ownedProdukValidation, idParamValidation } = require('../middlewares/validationMiddleware');  // Validasi input
const authenticateToken = require('../middlewares/authMiddleware');  // Middleware untuk cek token JWT

// Semua endpoint di route ini memerlukan login (autentikasi)
router.use(authenticateToken);

// === Route untuk user yang sudah login ===
// Mendapatkan semua produk yang dimiliki user
// GET /api/owned-produk
router.get('/', ownedProdukController.getOwnedProduk);

// Mendapatkan detail produk tertentu yang dimiliki user
// GET /api/owned-produk/:id
router.get('/:id', idParamValidation, ownedProdukController.getOwnedProdukById);

// Mencatat pembelian produk baru oleh user
// POST /api/owned-produk
router.post('/', ownedProdukValidation, ownedProdukController.createOwnedProduk);

// Mengupdate status penggunaan produk (misal: sudah digunakan)
// PUT /api/owned-produk/:id/use
router.put('/:id/use', idParamValidation, ownedProdukController.updateProdukStatus);

module.exports = router;
