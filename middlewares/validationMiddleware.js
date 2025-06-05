// ===================================
// Middleware Validasi Input
// ===================================
// Fungsi: Memvalidasi input dari request sebelum diproses
// Menggunakan express-validator untuk:
// 1. Validasi body request
// 2. Validasi parameter URL
// 3. Validasi query string
// 4. Custom validasi dengan database

const { body, param, query } = require('express-validator');  // Library untuk validasi
const { Produk, Transaction,  } = require('../models');             // Model untuk validasi foreign key

// === Validasi Autentikasi ===
// Validasi input registrasi user baru
exports.registerValidation = [
  body('username')
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 7}).withMessage('Password minimal 7 karakter'),
  body('passwordConfirmation')
    .notEmpty().withMessage('Konfirmasi password wajib diisi')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Konfirmasi password tidak cocok dengan password');
      }
      return true;
    })
];

// Validasi input login
exports.loginValidation = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];


// Validasi input produk baru
exports.produkValidation = [
  // Validasi harga dan deskripsi
  body('price')
    .notEmpty().withMessage('Harga produk wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga produk harus berupa angka positif'),

  body('description')
    .notEmpty().withMessage('Deskripsi produk wajib diisi')
    .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),

  body('category')
    .notEmpty().withMessage('Category wajib diisi')
    .isIn(['bunga segar', 'artificial', 'boneka', 'custom', 'uang', 'snack'])
    .withMessage('Kategori tidak valid. Pilih salah satu: bunga segar, artificial, boneka, custom, uang, atau snack'),
];


// Validasi update produk (semua field optional)
exports.updateProdukValidation = [
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga produk harus berupa angka positif'),
  body('description')
    .optional()
    .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
  body('category')
    .optional()
    .isIn(['bunga segar', 'artificial', 'boneka', 'custom', 'uang', 'snack'])
    .withMessage('Kategori tidak valid. Pilih salah satu: bunga segar, artificial, boneka, custom, uang, atau snack'),
];

// === Validasi Transaksi ===
// Validasi pembuatan transaksi baru
exports.transactionValidation = [
  // Validasi tiket yang dibeli
  body('produkID')
    .notEmpty().withMessage('ID produk wajib diisi')
    .isInt().withMessage('ID produk harus berupa angka')
    .custom(async (value) => {
      const produk = await Produk.findByPk(value);
      if (!produk) {
        throw new Error('produk tidak ditemukan');
      }
      return true;
    }),
  // Validasi jumlah produk
  body('produkQuantity')
    .notEmpty().withMessage('Jumlah produk wajib diisi')
    .isInt({ min: 1 }).withMessage('Jumlah produk minimal 1')
];

// === Validasi Parameter dan Query ===
// Validasi parameter ID di URL
exports.idParamValidation = [
  param('id')
    .isInt().withMessage('ID harus berupa angka')
];

// Validasi parameter paginasi
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Halaman harus berupa angka positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Batas harus antara 1 dan 100')
];

// === Validasi Update Profil ===
// Validasi data update profil user
exports.updateProfileValidation = [
  // Data profil
  body('username')
    .optional()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  body('email')
    .optional()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  // Validasi password
  body('currentPassword')
    .optional()
    .notEmpty().withMessage('Password saat ini wajib diisi'),
  body('newPassword')
    .optional()
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('confirmNewPassword')
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Konfirmasi password baru tidak cocok');
      }
      return true;
    })
];


// === Validasi Produk yang Dimiliki ===
// Validasi pembuatan record produk yang dimiliki
exports.ownedProdukValidation = [
  // Validasi produk yang dibeli
  body('produkID')
    .notEmpty().withMessage('ID produk wajib diisi')
    .isInt().withMessage('ID produk harus berupa angka')
    .custom(async (value) => {
      const produk = await Produk.findByPk(value);
      if (!produk) {
        throw new Error('Produk tidak ditemukan');
      }
      return true;
    }),
  body('transactionID')
    .notEmpty().withMessage('ID Transaksi wajib diisi')
    .isInt().withMessage('ID Transaksi harus berupa angka')
    .custom(async (value) => {
      const transaction = await Transaction.findByPk(value);
      if (!transaction) {
        throw new Error('Transaksi tidak ditemukan');
      }
      return true;
    })
]; 