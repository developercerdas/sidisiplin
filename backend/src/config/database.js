const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal membuka database SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite:', dbPath);
  }
});

db.serialize(() => {
  // 1. Tabel Users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      no_wa TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tabel Kelas
  db.run(`
    CREATE TABLE IF NOT EXISTS kelas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kelas TEXT NOT NULL,
      tingkat TEXT NOT NULL,
      wali_kelas_id INTEGER,
      FOREIGN KEY (wali_kelas_id) REFERENCES users(id)
    )
  `);

  // 3. Tabel Siswa
  db.run(`
    CREATE TABLE IF NOT EXISTS siswa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nisn TEXT UNIQUE NOT NULL,
      barcode_id TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      jenis_kelamin TEXT NOT NULL,
      kelas_id INTEGER NOT NULL,
      no_wa_ortu TEXT NOT NULL,
      nama_ortu TEXT NOT NULL,
      foto TEXT DEFAULT '/avatars/default.png',
      total_poin_pelanggaran INTEGER DEFAULT 0,
      total_poin_kebaikan INTEGER DEFAULT 0,
      status_sp TEXT DEFAULT 'AMAN',
      FOREIGN KEY (kelas_id) REFERENCES kelas(id)
    )
  `);

  // 4. Tabel Presensi
  db.run(`
    CREATE TABLE IF NOT EXISTS presensi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      tanggal DATE NOT NULL,
      jam_masuk TIME,
      status TEXT NOT NULL, -- 'HADIR', 'TERLAMBAT', 'SAKIT', 'IZIN', 'ALPA'
      menit_terlambat INTEGER DEFAULT 0,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id)
    )
  `);

  // 5. Tabel Kategori Pelanggaran
  db.run(`
    CREATE TABLE IF NOT EXISTS kategori_pelanggaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      nama_pelanggaran TEXT NOT NULL,
      kategori TEXT NOT NULL,
      bobot_poin INTEGER NOT NULL
    )
  `);

  // 6. Tabel Log Pelanggaran
  db.run(`
    CREATE TABLE IF NOT EXISTS log_pelanggaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      kategori_pelanggaran_id INTEGER NOT NULL,
      tanggal DATE NOT NULL,
      catatan TEXT,
      poin_diberikan INTEGER NOT NULL,
      pelapor_guru_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id),
      FOREIGN KEY (kategori_pelanggaran_id) REFERENCES kategori_pelanggaran(id),
      FOREIGN KEY (pelapor_guru_id) REFERENCES users(id)
    )
  `);

  // 7. Tabel Log WhatsApp
  db.run(`
    CREATE TABLE IF NOT EXISTS log_wa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_tujuan TEXT NOT NULL,
      pesan TEXT NOT NULL,
      tipe TEXT NOT NULL,
      status TEXT DEFAULT 'SENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Tabel Sesi Konseling BK
  db.run(`
    CREATE TABLE IF NOT EXISTS sesi_konseling (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      guru_bk_id INTEGER NOT NULL,
      tanggal DATE NOT NULL,
      keluhan TEXT NOT NULL,
      tindakan TEXT NOT NULL,
      hasil_kesepakatan TEXT,
      status TEXT DEFAULT 'DALAM_PROSES', -- 'DALAM_PROSES', 'SELESAI'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id),
      FOREIGN KEY (guru_bk_id) REFERENCES users(id)
    )
  `);

  // 9. Tabel Pengaturan Madrasah & WhatsApp
  db.run(`
    CREATE TABLE IF NOT EXISTS pengaturan (
      id INTEGER PRIMARY KEY,
      nama_madrasah TEXT DEFAULT 'MADRASAH TSANAWIYAH NEGERI 1 TELADAN',
      npsn TEXT DEFAULT '20109988',
      alamat TEXT DEFAULT 'Jl. Pendidikan Karakter No. 45, Kota Teladan',
      no_telp TEXT DEFAULT '(021) 555-1234',
      email TEXT DEFAULT 'info@mtsn1teladan.sch.id',
      nama_kepala TEXT DEFAULT 'Drs. H. Ahmad Subagio, M.Pd',
      nip_kepala TEXT DEFAULT '197508152000031001',
      jam_masuk TEXT DEFAULT '07:00',
      jam_toleransi TEXT DEFAULT '07:15',
      jam_alpa_otomatis TEXT DEFAULT '07:30',
      wa_provider TEXT DEFAULT 'botcake', -- 'botcake', 'fonnte', 'baileys'
      wa_api_key TEXT DEFAULT 'BOTCAKE_TOKEN_MADRASAH_LIVE',
      wa_sender_number TEXT DEFAULT '081298765432',
      wa_status TEXT DEFAULT 'CONNECTED', -- 'CONNECTED', 'DISCONNECTED'
      template_alpa TEXT DEFAULT 'Assalamu’alaikum Wr. Wb. Yth. {nama_ortu}. Menginformasikan bahwa ananda {nama_siswa} ({kelas}) pada hari ini {tanggal} tercatat ALPA (Tidak Masuk Tanpa Keterangan). Poin kedisiplinan bertambah +5 pt. Mohon hubungi pihak madrasah. Terima kasih.',
      template_pelanggaran TEXT DEFAULT 'Pemberitahuan Kedisiplinan: Ananda {nama_siswa} ({kelas}) tercatat melakukan pelanggaran: "{nama_pelanggaran}" (+{poin} pt). Total akumulasi poin saat ini: {total_poin} pt ({status_sp}). Mohon bimbingan bersama di rumah.',
      template_sp TEXT DEFAULT 'Pemberitahuan Resmi: Sehubungan akumulasi poin ananda {nama_siswa} telah mencapai {total_poin} pt, pihak madrasah menerbitkan {status_sp}. Surat resmi dan undangan dapat diunduh melalui tautan madrasah.',
      template_panggilan TEXT DEFAULT 'UNDANGAN BK: Mengharap kehadiran Bapak/Ibu dari {nama_siswa} ({kelas}) di Ruang BK Madrasah pada {tanggal} pukul 09.00 WIB untuk koordinasi pembinaan ananda.'
    )
  `);

  // Inisialisasi Pengaturan Default
  db.get(`SELECT COUNT(*) as count FROM pengaturan`, (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO pengaturan (id) VALUES (1)`);
    }
  });

  // Seed Users jika kosong
  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (!err && row.count === 0) {
      const hash = bcrypt.hashSync('admin123', 8);
      const stmt = db.prepare(`INSERT INTO users (nama, email, password, role, no_wa) VALUES (?, ?, ?, ?, ?)`);
      stmt.run('Drs. H. Ahmad Subagio, M.Pd (Kepala Madrasah)', 'kepala@madrasah.sch.id', hash, 'kepala', '081234567801');
      stmt.run('Ustadzah Siti Rahmawati, S.Psi (Guru BK)', 'bk@madrasah.sch.id', hash, 'bk', '081234567802');
      stmt.run('Ustadz Hendra Gunawan, S.Pd (Kesiswaan & Tatib)', 'tatib@madrasah.sch.id', hash, 'tatib', '081234567803');
      stmt.run('Ustadzah Nurul Hidayah, S.Pd (Wali Kelas VII A)', 'walikelas@madrasah.sch.id', hash, 'wali_kelas', '081234567804');
      stmt.run('Administrator IT Madrasah', 'admin@madrasah.sch.id', hash, 'admin', '081234567800');
      stmt.finalize();
    }
  });

  // Seed Kategori Pelanggaran jika kosong
  db.get(`SELECT COUNT(*) as count FROM kategori_pelanggaran`, (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO kategori_pelanggaran (kode, nama_pelanggaran, kategori, bobot_poin) VALUES (?, ?, ?, ?)`);
      stmt.run('IBD-01', 'Tidak mengikuti Sholat Dhuha / Dzuhur Berjamaah', 'IBADAH', 10);
      stmt.run('IBD-02', 'Tidak membawa kelengkapan ibadah (mukena/sarung/Al-Quran)', 'IBADAH', 5);
      stmt.run('IBD-03', 'Meninggalkan musholla saat pembacaan dzikir/doa bersama', 'IBADAH', 10);
      stmt.run('TAT-01', 'Atribut seragam tidak lengkap / badge / jilbab tidak rapi', 'RINGAN', 5);
      stmt.run('TAT-02', 'Terlambat hadir ke madrasah > 15 menit', 'RINGAN', 5);
      stmt.run('TAT-03', 'Rambut panjang / dicat / kuku panjang tidak rapi', 'RINGAN', 5);
      stmt.run('TAT-04', 'Membolos jam pelajaran / keluar madrasah tanpa izin', 'SEDANG', 20);
      stmt.run('TAT-05', 'Merokok di area madrasah / masih menggunakan seragam', 'SEDANG', 25);
      stmt.run('TAT-06', 'Membawa HP saat KBM tanpa instruksi guru', 'SEDANG', 15);
      stmt.run('BRT-01', 'Berkelahi / Terlibat tawuran antar pelajar', 'BERAT', 50);
      stmt.run('BRT-02', 'Membawa/menyebarkan konten pornografi / asusila', 'BERAT', 50);
      stmt.run('BRT-03', 'Perundungan / Bullying secara fisik, verbal, atau online', 'BERAT', 50);
      stmt.run('SBR-01', 'Mengonsumsi narkoba / miras / zat adiktif', 'SANGAT BERAT', 100);
      stmt.run('SBR-02', 'Pencurian / Pemerasan / Tindak pidana hukum', 'SANGAT BERAT', 100);
      stmt.finalize();
    }
  });

  // Seed Data Siswa Uji Coba jika kosong
  db.get(`SELECT COUNT(*) as count FROM siswa`, (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO kelas (nama_kelas, tingkat) VALUES ('VII A', '7'), ('VIII B', '8'), ('IX A', '9')`, function() {
        const stmt = db.prepare(`
          INSERT INTO siswa (nisn, barcode_id, nama, jenis_kelamin, kelas_id, no_wa_ortu, nama_ortu, total_poin_pelanggaran, status_sp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run('0081234561', 'SISWA-001', 'Ahmad Fauzi Rahman', 'L', 1, '081234567890', 'Bpk. Ridwan Fauzi', 15, 'AMAN');
        stmt.run('0081234562', 'SISWA-002', 'Siti Nur Aisyah', 'P', 1, '081234567891', 'Ibu Fatimah Az-Zahra', 0, 'AMAN');
        stmt.run('0081234563', 'SISWA-003', 'Muhammad Daffa Al-Fatih', 'L', 3, '081234567892', 'Bpk. Herman Susanto', 55, 'SP1 (Panggilan Ortu)');
        stmt.run('0081234564', 'SISWA-004', 'Rizky Bilal Maulana', 'L', 2, '081234567893', 'Bpk. Slamet Riyadi', 30, 'PERINGATAN');
        stmt.run('0081234565', 'SISWA-005', 'Zahra Putri Ramadhani', 'P', 1, '081234567894', 'Ibu Nurhayati', 5, 'AMAN');
        stmt.finalize();
      });
    }
  });
});

module.exports = db;
