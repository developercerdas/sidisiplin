# SI-DISIPLIN & BK MADRASAH (SIBK-MADRASAH)
> **Sistem Informasi Presensi Barcode Kios, Kedisiplinan Poin & Bimbingan Konseling Madrasah (MTs/MA) Terintegrasi WhatsApp Gateway**

---

## 🌟 Ringkasan Konsep & Solusi

Aplikasi ini dirancang khusus untuk memecahkan masalah absensi, kedisiplinan, dan pembinaan karakter di lingkungan madrasah (MTsN, MA, negeri maupun swasta):

1. **Presensi Mandiri Cepat (Kios Barcode Monitor)**
   - Siswa membawa kartu pelajar ber-barcode (tanpa wajib bawa HP).
   - Di lobi/gerbang dipasang 1 unit monitor/TV dan barcode scanner kasir 2D USB (omni-directional).
   - Siswa tap kartu: **< 1 detik**, foto dan status hadir langsung muncul di layar + feedback audio bel.
   - Layar monitor **tidak perlu login**, langsung siap digunakan setiap pagi.

2. **Otomatisasi Sakit, Izin, dan Alpa**
   - Siswa yang sakit/izin diinput cepat oleh Wali Kelas / Guru Piket melalui HP masing-masing.
   - Pukul 07.30 (jam cut-off), siswa yang belum scan dan tidak berizin otomatis ditandai **ALPA (Bolos)** oleh sistem.
   - Alpa otomatis menambah poin pelanggaran siswa dan mengirimkan notifikasi peringatan WA ke orang tua.

3. **Manajemen Poin Pelanggaran & Reward (Poin Kebaikan)**
   - Klasifikasi pelanggaran: Ringan (2-5 pt), Sedang (10-25 pt), Berat (30-75 pt), Sangat Berat (100 pt).
   - Khusus madrasah: Dilengkapi kategori **Pelanggaran Ibadah & Akhlak** (tidak sholat dhuha/dzuhur berjamaah, tidak bawa mukena/Al-Qur'an, adab).
   - Dilengkapi sistem **Poin Kebaikan / Prestasi** (setoran hafalan/tahfidz, adzan, juara lomba) untuk mengurangi poin pelanggaran (pembinaan positif).

4. **Bimbingan Konseling (BK) & Surat Peringatan (SP) Otomatis**
   - **Radar Kasus**: Memantau siswa yang mendekati ambang batas poin.
   - **Threshold Surat**:
     - **25 Poin**: Peringatan Lisan / Notifikasi WA ke Ortu.
     - **50 Poin**: **SP 1** otomatis + Undangan Pemanggilan Orang Tua ke Ruang BK.
     - **75 Poin**: **SP 2** + Skorsing Pembinaan + Konseling Khusus.
     - **100 Poin**: **SP 3** / Konferensi Kasus Terakhir (Pengembalian ke orang tua).
   - Dilengkapi generator PDF resmi siap cetak lengkap dengan kop madrasah.

5. **WhatsApp Gateway Cerdas (Zero Spam, Efisien Biaya)**
   - Notifikasi WA **TIDAK** dikirim untuk kehadiran normal (hemat biaya API & tidak mengganggu orang tua).
   - Notifikasi WA **HANYA** aktif untuk:
     - Siswa Alpa / Bolos di jam masuk.
     - Pelanggaran baru yang dicatat tim tatib.
     - Undangan pemanggilan orang tua ke ruang BK.
     - Penerbitan Surat Peringatan (SP 1, SP 2, SP 3).

---

## 👥 Hak Akses Pengguna (Role-Based Access)

| Role | Akses Login | Fungsi Utama |
| :--- | :---: | :--- |
| **Kios Monitor** | ❌ Tanpa Login | Layar publik monitor lobi: live scan kartu, foto siswa, statistik hadir harian |
| **Super Admin** | ✅ Wajib Login | Kelola master data, generate kartu barcode siswa massal, setting WA, atur jam sekolah |
| **Guru BK** | ✅ Wajib Login | Radar kasus, buku kasus rahasia (konseling), generator SP & surat panggilan ortu |
| **Kesiswaan / Tatib**| ✅ Wajib Login | Input cepat pelanggaran lapangan, master jenis pelanggaran, input poin reward |
| **Wali Kelas** | ✅ Wajib Login | Pantau absensi kelas binaan, input Sakit/Izin anak kelasnya, pantau poin kelas |
| **Guru Piket** | ✅ Wajib Login | Pantau live kehadiran gerbang, input izin/keterlambatan siswa di pos piket |
| **Kepala Madrasah**| ✅ Wajib Login | Dashboard eksekutif: tren kehadiran & kedisiplinan madrasah, approval SP3/skorsing |

---

## 🏗️ Struktur Arsitektur & Folder

```
sibk-madrasah/
├── README.md               # Dokumentasi lengkap konsep & sistem
├── backend/                # Node.js REST API + WebSocket (Socket.io)
│   ├── src/
│   │   ├── config/         # Konfigurasi DB & App
│   │   ├── controllers/    # Logika bisnis (Presensi, Pelanggaran, BK, WA)
│   │   ├── middlewares/    # Auth JWT & RBAC
│   │   ├── models/         # Schema database
│   │   ├── routes/         # Routing API
│   │   ├── services/       # WhatsApp Gateway (Baileys/Waha), Cron Scheduler
│   │   └── server.js       # Entry point Node.js
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React + Tailwind CSS + Vite
    ├── src/
    │   ├── components/     # UI reusable (Navbar, Sidebar, Modal, Badge)
    │   ├── pages/
    │   │   ├── kiosk/      # Halaman Layar Monitor Gerbang (TANPA LOGIN)
    │   │   ├── auth/       # Login Dashboard Staff/Guru
    │   │   ├── dashboard/  # Dashboard per role
    │   │   ├── presensi/   # Live presensi, input izin/sakit, rekap
    │   │   ├── pelanggaran/# Input pelanggaran cepat & riwayat poin
    │   │   ├── bk/         # Radar kasus, buku konseling, generator SP
    │   │   ├── siswa/      # Data siswa & cetak kartu barcode massal
    │   │   └── pengaturan/ # Jam sekolah, template WA, user
    ├── package.json
    └── tailwind.config.js
```

---

## 🗄️ Desain Relasi Database Utama

1. **`users`**: Akun guru & staf (id, nama, email, password, role, no_wa, nip).
2. **`kelas`**: Data kelas (id, nama_kelas, tingkat [VII/VIII/IX atau X/XI/XII], jurusan, wali_kelas_id).
3. **`siswa`**: Data siswa (id, nisn, barcode_id, nama, jenis_kelamin, kelas_id, no_wa_ortu, nama_ortu, foto, total_poin_pelanggaran, total_poin_kebaikan, status_sp).
4. **`presensi`**: Log kehadiran (id, siswa_id, tanggal, jam_masuk, status [HADIR/TERLAMBAT/SAKIT/IZIN/ALPA], menit_terlambat, bukti_surat).
5. **`kategori_pelanggaran`**: Master pelanggaran (id, kode, nama_pelanggaran, kategori [RINGAN/SEDANG/BERAT/IBADAH], bobot_poin).
6. **`log_pelanggaran`**: Riwayat pelanggaran siswa (id, siswa_id, pelanggaran_id, tanggal, catatan, foto_bukti, pelapor_guru_id, poin_saat_itu).
7. **`log_reward`**: Riwayat poin kebaikan/prestasi (id, siswa_id, jenis_prestasi, poin_reward, tanggal, pencatat_id).
8. **`konseling_bk`**: Catatan sesi BK (id, siswa_id, guru_bk_id, tanggal, jenis_bimbingan, catatan_rahasia, rencana_tindak_lanjut).
9. **`surat_peringatan`**: Surat resmi diterbitkan (id, nomor_surat, siswa_id, jenis_surat [PANGGILAN_1/PANGGILAN_2/SP1/SP2/SP3], tanggal_terbit, status, pdf_url).
10. **`log_wa`**: Riwayat pengiriman WhatsApp (id, nomor_tujuan, pesan, tipe [ALPA/PELANGGARAN/SP], status [SENT/PENDING/FAILED], response).
