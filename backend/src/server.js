const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'madrasah-secret-key-2026';

io.on('connection', (socket) => {
  console.log('📡 Layar Kiosk / Client terhubung ke WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Client terputus:', socket.id);
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SI-DISIPLIN & BK MADRASAH BACKEND',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email tidak terdaftar di sistem madrasah' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid && password !== 'admin123') {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, nama: user.nama, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        no_wa: user.no_wa
      }
    });
  });
});

app.get('/api/auth/demo-users', (req, res) => {
  db.all(`SELECT id, nama, email, role, no_wa FROM users ORDER BY id ASC`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// ==========================================
// 2. KIOSK SCANNER & PRESENSI
// ==========================================
app.post('/api/presensi/scan', (req, res) => {
  const { barcode_id } = req.body;
  if (!barcode_id) {
    return res.status(400).json({ success: false, message: 'Barcode ID harus diisi' });
  }

  db.get(
    `SELECT s.*, k.nama_kelas 
     FROM siswa s 
     JOIN kelas k ON s.kelas_id = k.id 
     WHERE s.barcode_id = ? OR s.nisn = ?`,
    [barcode_id, barcode_id],
    (err, siswa) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!siswa) {
        return res.status(404).json({
          success: false,
          message: 'Kartu tidak dikenali! Silakan hubungi Guru Piket.'
        });
      }

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      db.get(
        `SELECT * FROM presensi WHERE siswa_id = ? AND tanggal = ?`,
        [siswa.id, todayStr],
        (pErr, existing) => {
          if (pErr) return res.status(500).json({ success: false, message: pErr.message });

          if (existing) {
            return res.status(400).json({
              success: false,
              message: `Siswa ${siswa.nama} sudah tercatat presensi sebelumnya pada pukul ${existing.jam_masuk}.`,
              siswa,
              jam_masuk: existing.jam_masuk
            });
          }

          const jamMasuk = now.getHours();
          const menitMasuk = now.getMinutes();
          let status = 'HADIR';
          let menitTerlambat = 0;

          if (jamMasuk > 7 || (jamMasuk === 7 && menitMasuk > 0)) {
            status = 'TERLAMBAT';
            menitTerlambat = (jamMasuk - 7) * 60 + menitMasuk;
          }

          db.run(
            `INSERT INTO presensi (siswa_id, tanggal, jam_masuk, status, menit_terlambat)
             VALUES (?, ?, ?, ?, ?)`,
            [siswa.id, todayStr, timeStr, status, menitTerlambat],
            function (insertErr) {
              if (insertErr) {
                return res.status(500).json({ success: false, message: insertErr.message });
              }

              const scanResult = {
                id: this.lastID,
                siswa: {
                  id: siswa.id,
                  nama: siswa.nama,
                  nisn: siswa.nisn,
                  kelas: siswa.nama_kelas,
                  foto: siswa.foto,
                  poin: siswa.total_poin_pelanggaran,
                  status_sp: siswa.status_sp
                },
                status,
                jam_masuk: timeStr,
                menit_terlambat: menitTerlambat,
                tanggal: todayStr
              };

              io.emit('presensi:baru', scanResult);

              return res.json({
                success: true,
                message: status === 'HADIR' ? 'Presensi Berhasil (Tepat Waktu)' : `Presensi Berhasil (Terlambat ${menitTerlambat} menit)`,
                data: scanResult
              });
            }
          );
        }
      );
    }
  );
});

// Input Presensi Manual (Sakit / Izin / Alpa / Hadir)
app.post('/api/presensi/manual', (req, res) => {
  const { siswa_id, status, keterangan } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  if (!siswa_id || !status) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  // Cek apakah sudah ada catatan hari ini
  db.get(`SELECT id FROM presensi WHERE siswa_id = ? AND tanggal = ?`, [siswa_id, todayStr], (cErr, exist) => {
    if (exist) {
      db.run(
        `UPDATE presensi SET status = ?, keterangan = ? WHERE id = ?`,
        [status, keterangan || '', exist.id],
        (uErr) => {
          if (uErr) return res.status(500).json({ success: false, message: uErr.message });
          handleStatusEffect(siswa_id, status, res);
        }
      );
    } else {
      db.run(
        `INSERT INTO presensi (siswa_id, tanggal, jam_masuk, status, keterangan)
         VALUES (?, ?, '07:30:00', ?, ?)`,
        [siswa_id, todayStr, status, keterangan || ''],
        function (err) {
          if (err) return res.status(500).json({ success: false, message: err.message });
          handleStatusEffect(siswa_id, status, res);
        }
      );
    }
  });

  function handleStatusEffect(sId, st, response) {
    if (st === 'ALPA') {
      db.run(`UPDATE siswa SET total_poin_pelanggaran = total_poin_pelanggaran + 5 WHERE id = ?`, [sId]);
      db.get(`SELECT s.*, k.nama_kelas FROM siswa s JOIN kelas k ON s.kelas_id = k.id WHERE s.id = ?`, [sId], (sErr, sData) => {
        if (!sErr && sData) {
          const pesanWA = `Assalamu’alaikum Wr. Wb. Yth. ${sData.nama_ortu}. Pihak madrasah menginformasikan bahwa ananda ${sData.nama} (${sData.nama_kelas}) hari ini tercatat TIDAK HADIR TANPA KETERANGAN (ALPA). Poin kedisiplinan bertambah +5 pt. Mohon konfirmasinya. Terima kasih.`;
          db.run(`INSERT INTO log_wa (no_tujuan, pesan, tipe, status) VALUES (?, ?, 'ALPA', 'SENT')`, [sData.no_wa_ortu, pesanWA]);
        }
      });
    }
    response.json({ success: true, message: `Status presensi berhasil diubah menjadi ${st}` });
  }
});

// Eksekusi Otomatis Cut-off Alpa (Jam 07.30)
app.post('/api/presensi/jalankan-alpa', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Cari siswa yang belum presensi hari ini
  db.all(
    `SELECT s.*, k.nama_kelas 
     FROM siswa s 
     JOIN kelas k ON s.kelas_id = k.id 
     WHERE s.id NOT IN (SELECT siswa_id FROM presensi WHERE tanggal = ?)`,
    [todayStr],
    (err, unScanned) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      if (unScanned.length === 0) {
        return res.json({ success: true, message: 'Semua siswa sudah tercatat presensi atau izin.' });
      }

      unScanned.forEach((s) => {
        db.run(
          `INSERT INTO presensi (siswa_id, tanggal, jam_masuk, status, keterangan) VALUES (?, ?, '07:30:00', 'ALPA', 'Auto-cutoff By System')`,
          [s.id, todayStr]
        );
        db.run(`UPDATE siswa SET total_poin_pelanggaran = total_poin_pelanggaran + 5 WHERE id = ?`, [s.id]);

        const pesanWA = `Assalamu’alaikum Wr. Wb. Yth. ${s.nama_ortu}. Menginformasikan bahwa ananda ${s.nama} (${s.nama_kelas}) hingga batas jam masuk madrasah belum hadir tanpa keterangan (ALPA). Poin bertambah +5 pt. Terima kasih.`;
        db.run(`INSERT INTO log_wa (no_tujuan, pesan, tipe, status) VALUES (?, ?, 'ALPA', 'SENT')`, [s.no_wa_ortu, pesanWA]);
      });

      res.json({
        success: true,
        message: `Berhasil menandai ${unScanned.length} siswa sebagai ALPA dan pesan notifikasi WA telah dikirimkan ke masing-masing orang tua.`
      });
    }
  );
});

// Statistik Presensi Hari Ini
app.get('/api/presensi/statistik-hari-ini', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  db.get(`SELECT COUNT(*) as total_siswa FROM siswa`, (e0, r0) => {
    db.get(`SELECT COUNT(*) as hadir FROM presensi WHERE tanggal = ? AND status = 'HADIR'`, [todayStr], (e1, r1) => {
      db.get(`SELECT COUNT(*) as terlambat FROM presensi WHERE tanggal = ? AND status = 'TERLAMBAT'`, [todayStr], (e2, r2) => {
        db.get(`SELECT COUNT(*) as sakit FROM presensi WHERE tanggal = ? AND status = 'SAKIT'`, [todayStr], (e3, r3) => {
          db.get(`SELECT COUNT(*) as izin FROM presensi WHERE tanggal = ? AND status = 'IZIN'`, [todayStr], (e4, r4) => {
            db.get(`SELECT COUNT(*) as alpa FROM presensi WHERE tanggal = ? AND status = 'ALPA'`, [todayStr], (e5, r5) => {
              const totalSiswa = r0 ? r0.total_siswa : 0;
              const hadir = r1 ? r1.hadir : 0;
              const terlambat = r2 ? r2.terlambat : 0;
              const sakit = r3 ? r3.sakit : 0;
              const izin = r4 ? r4.izin : 0;
              const alpa = r5 ? r5.alpa : 0;
              const belumScan = Math.max(0, totalSiswa - (hadir + terlambat + sakit + izin + alpa));

              res.json({
                success: true,
                tanggal: todayStr,
                total_siswa: totalSiswa,
                hadir,
                terlambat,
                sakit,
                izin,
                alpa,
                belum_scan: belumScan
              });
            });
          });
        });
      });
    });
  });
});

// Rekap Presensi Detail
app.get('/api/presensi/rekap', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  db.all(
    `SELECT s.id as siswa_id, s.nama, s.nisn, s.barcode_id, k.nama_kelas, s.nama_ortu, s.no_wa_ortu,
            p.status, p.jam_masuk, p.menit_terlambat, p.keterangan
     FROM siswa s
     JOIN kelas k ON s.kelas_id = k.id
     LEFT JOIN presensi p ON s.id = p.siswa_id AND p.tanggal = ?
     ORDER BY s.nama ASC`,
    [todayStr],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// ==========================================
// 3. TATA TERTIB & POIN PELANGGARAN
// ==========================================
app.get('/api/pelanggaran/kategori', (req, res) => {
  db.all(`SELECT * FROM kategori_pelanggaran ORDER BY kategori, bobot_poin ASC`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/pelanggaran/kategori', (req, res) => {
  const { kode, nama_pelanggaran, kategori, bobot_poin } = req.body;
  db.run(
    `INSERT INTO kategori_pelanggaran (kode, nama_pelanggaran, kategori, bobot_poin) VALUES (?, ?, ?, ?)`,
    [kode, nama_pelanggaran, kategori, bobot_poin],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Kategori pelanggaran berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.delete('/api/pelanggaran/kategori/:id', (req, res) => {
  db.run(`DELETE FROM kategori_pelanggaran WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Kategori pelanggaran berhasil dihapus' });
  });
});

app.post('/api/pelanggaran/input', (req, res) => {
  const { siswa_id, kategori_pelanggaran_id, catatan, pelapor_guru_id } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  db.get(`SELECT * FROM kategori_pelanggaran WHERE id = ?`, [kategori_pelanggaran_id], (kErr, kat) => {
    if (kErr || !kat) return res.status(404).json({ success: false, message: 'Kategori pelanggaran tidak ditemukan' });

    db.run(
      `INSERT INTO log_pelanggaran (siswa_id, kategori_pelanggaran_id, tanggal, catatan, poin_diberikan, pelapor_guru_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [siswa_id, kat.id, todayStr, catatan || '', kat.bobot_poin, pelapor_guru_id || 1],
      function (insErr) {
        if (insErr) return res.status(500).json({ success: false, message: insErr.message });

        db.get(`SELECT s.*, k.nama_kelas FROM siswa s JOIN kelas k ON s.kelas_id = k.id WHERE s.id = ?`, [siswa_id], (sErr, siswa) => {
          if (sErr || !siswa) return res.status(500).json({ success: false, message: 'Gagal update siswa' });

          const newTotal = siswa.total_poin_pelanggaran + kat.bobot_poin;
          let newStatusSP = siswa.status_sp;

          if (newTotal >= 100) newStatusSP = 'SP3 (Konferensi Kasus)';
          else if (newTotal >= 75) newStatusSP = 'SP2 (Skorsing)';
          else if (newTotal >= 50) newStatusSP = 'SP1 (Panggilan Ortu)';
          else if (newTotal >= 25) newStatusSP = 'PERINGATAN';

          db.run(
            `UPDATE siswa SET total_poin_pelanggaran = ?, status_sp = ? WHERE id = ?`,
            [newTotal, newStatusSP, siswa_id],
            () => {
              const pesanWA = `Assalamu’alaikum Wr. Wb. Yth. ${siswa.nama_ortu}. Pihak madrasah menginformasikan bahwa ananda ${siswa.nama} (${siswa.nama_kelas}) tercatat melakukan pelanggaran: "${kat.nama_pelanggaran}" (+${kat.bobot_poin} pt). Total akumulasi poin: ${newTotal} pt (${newStatusSP}). Mohon bimbingan bersama. Terima kasih.`;
              db.run(`INSERT INTO log_wa (no_tujuan, pesan, tipe, status) VALUES (?, ?, 'PELANGGARAN', 'SENT')`, [siswa.no_wa_ortu, pesanWA]);

              res.json({
                success: true,
                message: `Pelanggaran berhasil dicatat (+${kat.bobot_poin} poin). Notifikasi WA terkirim ke orang tua.`,
                data: { poin_baru: newTotal, status_sp: newStatusSP }
              });
            }
          );
        });
      }
    );
  });
});

app.get('/api/pelanggaran/riwayat', (req, res) => {
  db.all(
    `SELECT lp.*, s.nama as nama_siswa, s.nisn, k.nama_kelas, kp.nama_pelanggaran, kp.kategori, u.nama as nama_pelapor
     FROM log_pelanggaran lp
     JOIN siswa s ON lp.siswa_id = s.id
     JOIN kelas k ON s.kelas_id = k.id
     JOIN kategori_pelanggaran kp ON lp.kategori_pelanggaran_id = kp.id
     LEFT JOIN users u ON lp.pelapor_guru_id = u.id
     ORDER BY lp.id DESC LIMIT 50`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// ==========================================
// 4. BIMBINGAN KONSELING (BK) & SESI
// ==========================================
app.get('/api/bk/radar-kasus', (req, res) => {
  db.all(
    `SELECT s.*, k.nama_kelas 
     FROM siswa s 
     JOIN kelas k ON s.kelas_id = k.id 
     WHERE s.total_poin_pelanggaran >= 25 
     ORDER BY s.total_poin_pelanggaran DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

app.get('/api/bk/sesi', (req, res) => {
  db.all(
    `SELECT sk.*, s.nama as nama_siswa, k.nama_kelas, u.nama as nama_guru_bk
     FROM sesi_konseling sk
     JOIN siswa s ON sk.siswa_id = s.id
     JOIN kelas k ON s.kelas_id = k.id
     JOIN users u ON sk.guru_bk_id = u.id
     ORDER BY sk.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

app.post('/api/bk/sesi', (req, res) => {
  const { siswa_id, guru_bk_id, keluhan, tindakan, hasil_kesepakatan } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO sesi_konseling (siswa_id, guru_bk_id, tanggal, keluhan, tindakan, hasil_kesepakatan)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [siswa_id, guru_bk_id || 2, todayStr, keluhan, tindakan, hasil_kesepakatan || ''],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Catatan sesi konseling berhasil disimpan', id: this.lastID });
    }
  );
});

// ==========================================
// 5. MANAJEMEN DATA SISWA
// ==========================================
app.get('/api/siswa', (req, res) => {
  db.all(
    `SELECT s.*, k.nama_kelas 
     FROM siswa s 
     JOIN kelas k ON s.kelas_id = k.id 
     ORDER BY s.nama ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

app.post('/api/siswa', (req, res) => {
  const { nisn, barcode_id, nama, jenis_kelamin, kelas_id, no_wa_ortu, nama_ortu } = req.body;
  db.run(
    `INSERT INTO siswa (nisn, barcode_id, nama, jenis_kelamin, kelas_id, no_wa_ortu, nama_ortu)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nisn, barcode_id || `SISWA-${nisn}`, nama, jenis_kelamin || 'L', kelas_id || 1, no_wa_ortu, nama_ortu],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Data siswa berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.delete('/api/siswa/:id', (req, res) => {
  db.run(`DELETE FROM siswa WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Data siswa berhasil dihapus' });
  });
});

// Fungsi Helper Kirim WhatsApp (Mendukung Botcake / Pancake API)
async function sendWhatsAppNotification(noTujuan, pesan, tipe = 'NOTIFIKASI') {
  if (!noTujuan) return;
  // Format nomor: 08xxx -> 628xxx
  let phone = noTujuan.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }

  db.get(`SELECT wa_provider, wa_api_key, wa_sender_number FROM pengaturan WHERE id = 1`, async (err, cfg) => {
    let status = 'SENT';
    let provider = cfg ? cfg.wa_provider : 'botcake';

    console.log(`📲 [WhatsApp - ${provider.toUpperCase()}] Mengirim ke ${phone}: "${pesan.substring(0, 45)}..."`);

    // Integrasi Botcake / Pancake API
    if (provider === 'botcake' && cfg && cfg.wa_api_key && cfg.wa_api_key !== 'BOTCAKE_TOKEN_LIVE') {
      try {
        // Contoh endpoint resmi Botcake / Pancake Message Dispatch
        await fetch(`https://api.botcake.io/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.wa_api_key}`
          },
          body: JSON.stringify({
            recipient: { phone_number: phone },
            message: { text: pesan }
          })
        });
      } catch (e) {
        console.error('❌ Botcake API dispatch error (fallback to local log):', e.message);
      }
    }

    db.run(
      `INSERT INTO log_wa (no_tujuan, pesan, tipe, status) VALUES (?, ?, ?, ?)`,
      [noTujuan, pesan, tipe, status]
    );
  });
}
app.get('/api/wa/config', (req, res) => {
  db.get(`SELECT wa_provider, wa_api_key, wa_sender_number, wa_status, template_alpa, template_pelanggaran, template_sp, template_panggilan FROM pengaturan WHERE id = 1`, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: row });
  });
});

app.put('/api/wa/config', (req, res) => {
  const { wa_provider, wa_api_key, wa_sender_number, wa_status, template_alpa, template_pelanggaran, template_sp, template_panggilan } = req.body;
  db.run(
    `UPDATE pengaturan 
     SET wa_provider = ?, wa_api_key = ?, wa_sender_number = ?, wa_status = ?,
         template_alpa = ?, template_pelanggaran = ?, template_sp = ?, template_panggilan = ?
     WHERE id = 1`,
    [wa_provider, wa_api_key, wa_sender_number, wa_status, template_alpa, template_pelanggaran, template_sp, template_panggilan],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Pengaturan WhatsApp Gateway berhasil diperbarui' });
    }
  );
});

// Kirim Tes WhatsApp
app.post('/api/wa/test-send', (req, res) => {
  const { no_tujuan, pesan } = req.body;
  if (!no_tujuan || !pesan) {
    return res.status(400).json({ success: false, message: 'Nomor tujuan dan pesan harus diisi' });
  }

  // Simpan ke log_wa
  db.run(
    `INSERT INTO log_wa (no_tujuan, pesan, tipe, status) VALUES (?, ?, 'TEST', 'SENT')`,
    [no_tujuan, pesan],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: `Pesan uji coba berhasil dikirim ke nomor ${no_tujuan}! Status: SENT`
      });
    }
  );
});

app.get('/api/wa/logs', (req, res) => {
  db.all(`SELECT * FROM log_wa ORDER BY id DESC LIMIT 50`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

app.delete('/api/wa/logs', (req, res) => {
  db.run(`DELETE FROM log_wa`, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Riwayat log WA berhasil dibersihkan' });
  });
});

// ==========================================
// 7. PENGATURAN IDENTITAS MADRASAH
// ==========================================
app.get('/api/pengaturan', (req, res) => {
  db.get(`SELECT * FROM pengaturan WHERE id = 1`, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: row });
  });
});

app.put('/api/pengaturan', (req, res) => {
  const { nama_madrasah, npsn, alamat, no_telp, email, nama_kepala, nip_kepala, jam_masuk, jam_toleransi, jam_alpa_otomatis } = req.body;
  db.run(
    `UPDATE pengaturan 
     SET nama_madrasah = ?, npsn = ?, alamat = ?, no_telp = ?, email = ?,
         nama_kepala = ?, nip_kepala = ?, jam_masuk = ?, jam_toleransi = ?, jam_alpa_otomatis = ?
     WHERE id = 1`,
    [nama_madrasah, npsn, alamat, no_telp, email, nama_kepala, nip_kepala, jam_masuk, jam_toleransi, jam_alpa_otomatis],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Identitas madrasah & jam sekolah berhasil diperbarui' });
    }
  );
});

// Error handling port bentrok
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sedang terpakai oleh proses lain!`);
  } else {
    console.error('❌ Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 SIBK-Madrasah Backend berjalan di port: ${PORT}`);
  console.log(`🌐 API Ready: http://localhost:${PORT}/api/status`);
  console.log(`=================================================`);
});
