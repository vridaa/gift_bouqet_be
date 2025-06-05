// Import library yang dibutuhkan
const express = require('express');  // Framework untuk membuat server
const cors = require('cors');        // Untuk mengizinkan akses dari domain lain
const routes = require('./routes');  // Import semua route yang sudah dibuat
require('dotenv').config();         // Untuk membaca file .env (konfigurasi rahasia)

// Hubungkan ke database menggunakan Sequelize
const sequelize = require('./config/database');

// Buat aplikasi Express
const app = express();

// Pasang middleware (fungsi yang memproses request sebelum sampai ke route)
app.use(cors());                    // Izinkan akses dari domain lain
app.use(express.json());           // Untuk membaca body request dalam format JSON
app.use(express.urlencoded({ extended: true }));  // Untuk membaca body request dari form

// Endpoint untuk mengecek apakah server masih hidup/berjalan
// Biasanya digunakan oleh Google Cloud Run untuk monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'artefacto-backend'
  });
});

// Endpoint utama ketika mengakses root URL (/)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Artefacto Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Pasang semua route dengan awalan /api
// Contoh: /api/auth/login, /api/produk, dll
app.use('/api', routes);

// Middleware untuk menangani error
// Jika terjadi error di route manapun, akan ditangkap di sini
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server'
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan pada port ${PORT}`);
});



// Hubungkan ke database secara terpisah
// Ini dilakukan agar server tetap bisa jalan meski database belum siap
sequelize.authenticate()
  .then(() => {
    console.log('Database berhasil terhubung');
    return sequelize.sync();  // Sinkronkan model dengan tabel di database
  })
  .then(() => {
    console.log('Database sync completed');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    console.log('Server tetap berjalan tanpa database connection');
  });

// Penanganan ketika server harus dimatikan (shutdown)
// SIGTERM adalah sinyal yang dikirim ketika container/server diminta berhenti
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    sequelize.close();  // Tutup koneksi database dengan rapi
    process.exit(0);    // Matikan proses dengan status sukses (0)
  });
});

// Export app untuk keperluan testing
module.exports = app;
