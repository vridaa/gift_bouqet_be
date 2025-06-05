// ===================================
// Controller Transaksi/Transaction
// ===================================
// Fungsi: Menangani operasi terkait transaksi pembelian produk
// Fitur:
// 1. Mendapatkan semua transaksi (admin)
// 2. Membuat transaksi baru
// 3. Membuat produk yang dimiliki setelah transaksi berhasil

// Import library dan model yang dibutuhkan
const { Transaction, Produk, OwnedProduk } = require('../models');  // Model dari database
const { validationResult } = require('express-validator');                  // Validasi input
const crypto = require('crypto');                                          // Generate kode unik

// === Get All Transactions (Admin) ===
// Fungsi: Mendapatkan daftar semua transaksi (untuk admin)
// Method: GET
// Endpoint: /api/transactions/admin
// Akses: Admin only
exports.getAllTransactionsAdmin = async (req, res) => {
  try {
    // === Tahap 1: Ambil Data Transaksi ===
    const transactions = await Transaction.findAll({
      include: [{
        model: Produk,
      }],
      order: [['transaction_date', 'DESC']]
    });

    // === Tahap 2: Kirim Response ===
    res.json({
      status: 'sukses',
      data: { transactions }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// === Create Transaction ===
// Fungsi: Membuat transaksi baru dan produk yang dimiliki
// Method: POST
// Endpoint: /api/transactions
// Akses: User yang login
exports.createTransaction = async (req, res) => {
  try {
    // === Tahap 1: Validasi Input ===
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error validasi',
        errors: errors.array()
      });
    }

    // === Tahap 2: Ambil Data Input ===
    const { produkID, produkQuantity } = req.body;
    const userID = req.user.userID;

    // === Tahap 3: Validasi Produk ===
    const produk = await Produk.findByPk(produkID, {
    
    });

    if (!produk) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }

    // === Tahap 4: Hitung Total Harga ===
    const totalPrice = produk.price * produkQuantity;

    // === Tahap 5: Buat Transaksi ===
    const transaction = await Transaction.create({
      userID,
      produkID,
      produkQuantity,
      totalPrice,
      status: 'success',
      transactionDate: new Date()
    });

    // === Tahap 6: Buat Produk yang Dimiliki ===
    const ownedProduk = [];
    for (let i = 0; i < produkQuantity; i++) {
      const uniqueCode = crypto.randomBytes(8).toString('hex');
      const newOwnedProduk = await OwnedProduk.create({
        userID,
        produkID,
        transactionID: transaction.transactionID,
        uniqueCode,
        produkStatus: 'pesanan di terima'
      });
      ownedProduk.push(newOwnedProduk);
    }

    // === Tahap 7: Kirim Response ===
    res.status(201).json({
      status: 'sukses',
      message: 'Transaksi berhasil dibuat',
      data: {
        transaction: {
          ...transaction.toJSON(),
          produk: {
            nama : produk.nama,
            price: produk.price
          }
        },
        ownedProduk
      }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};