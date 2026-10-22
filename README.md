# Aplikasi Checklist Harian & Kontrol Operasional Produksi
**PT. Berkat Cahaya Novena — Divisi Manufaktur & Baking (Gedung 1)**

Aplikasi web modern (Progressive Web App - PWA) berbasis *offline-first* dengan sinkronisasi data real-time, sistem pengingat shift cerdas, dan dasbor analitik performa operasional harian. Dibangun persis mengikuti template lembar kendali SOP resmi PT Berkat Cahaya Novena.

---

## 📑 Dokumen SOP yang Didukung Sesuai Template Lampiran

Aplikasi ini mencakup ketiga formulir standar ISO/SOP yang terdapat pada dokumen lampiran:

1. **Ruang Pengayakan Gedung 1 (Produksi)**
   - **Kode Dokumen**: `FR/PRD/004/003` | **Revisi**: `02` | **Tanggal Efektif**: `04 Maret 2024`
   - *Daftar Item (9 Aspek)*: Lantai, Dinding, Pintu Passbox, Timbangan tepung, Ayakan Tepung, Trolly Tepung, Lampu, Exhaust, Pallet. Termasuk sel abu-abu untuk jadwal pengecekan periodik.

2. **Ruang Penimbangan Gedung 1 (Produksi)**
   - **Kode Dokumen**: `FR/PRD/004/009` | **Revisi**: `00` | **Tanggal Efektif**: `26 Oktober 2020`
   - *Daftar Item (18 Aspek)*: Container plastik, Timbangan digital, Rak bahan kering, Meja penimbangan, Refrigerator ragi, Mixer premix, Wadah ragi, Wadah Shortening, Wadah premix, Wadah pewarna, Wadah uk 15 ltr, Solet Rubber, Wadah B 008, Wadah minyak, Centong stainless, Spatula stainless, Wadah plastik tepung, Trolly Tepung.

3. **Ruang Baking Gedung 1 (Produksi)**
   - **Kode Dokumen**: `FR/PRD/004/010` | **Revisi**: `01` | **Tanggal Efektif**: `24 Februari 2025`
   - *Daftar Item (17 Aspek)*: Mixer, Dough moulder, Dough devider, Meja deviding adonan, Rak proofer, Meja deviding roti, Loyang, Peralatan pembantu/pendukung, Spatula stainless, Kafe besi gagang rubber, Kafe plastik dough devider, Wadah sarung tangan, Rak Stalling, Kaca Akrilik Oven Rotary, Kaca Akrilik R Proofing, Jam Dinding, Wadah minyak.

---

## 🚀 Fitur Unggulan

### 1. 📴 Dukungan Akses Penuh Offline (*Offline-First*)
- **Penyimpanan Lokal IndexedDB**: Staf dapat mengisi formulir checklist kapan pun dan di mana pun, bahkan tanpa koneksi internet di area pabrik yang tertutup dinding tebal (*dead zones*).
- **Antrean Sinkronisasi Otomatis (*Sync Queue*)**: Setiap kali laporan disubmit saat offline, laporan ditandai `pending_sync`. Begitu koneksi internet kembali aktif, sistem otomatis mengunggah seluruh antrean ke server tanpa perlu input ulang.
- **Tombol Simulasi Offline**: Terdapat tombol penguji di header (klik badge status online/offline) untuk mempermudah demonstrasi dan pengujian alur kerja tanpa memutus WiFi/koneksi internet perangkat.
- **PWA Service Worker (`sw.js`)**: Meng-cache aset aplikasi (HTML, CSS, JS, icon) sehingga aplikasi dapat dibuka saat offline dan dipasang di layar utama tablet/ponsel (*Add to Home Screen*).

### 2. ⚡ Sinkronisasi Data Real-Time
- **Server-Sent Events (SSE)**: Perubahan data dari perangkat operator langsung terdorong ke dasbor Leader secara *live* tanpa perlu me-refresh halaman.
- **BroadcastChannel API**: Sinkronisasi instan antar-tab atau antar-jendela browser dalam satu perangkat secara *zero-latency*.
- **Multi-device Collaboration**: Ketika operator Shift 1 selesai mengisi checklist, Leader di kantor produksi langsung melihat status terverifikasi dan metrik analitik ter-update.

### 3. 🔔 Notifikasi Pengingat & Alarm Shift
- **Jadwal Pengingat Shift Otomatis**:
  - **Shift 1 (07:00 - 15:00)**: Pengingat awal shift pukul 07:15 & verifikasi operan pukul 14:30.
  - **Shift 2 (15:00 - 23:00)**: Pengingat awal shift pukul 15:15 & verifikasi operan pukul 22:30.
  - **Shift 3 (23:00 - 07:00)**: Pengingat awal shift pukul 23:15 & verifikasi operan pukul 06:30.
- **Web Audio API Sound Synthesizer**: Menghasilkan nada lonceng (*chime*) ramah tanpa ketergantungan file MP3 eksternal, bekerja 100% offline dengan zero latency:
  - 🔔 *Shift Reminder Chime* (nada melodis dua frekuensi)
  - ⚠️ *Urgent Alert* (peringatan kerusakan alat/eskalasi)
  - 🚀 *Sync Success Chime* (konfirmasi sinkronisasi data berhasil)
- **Web Desktop Notifications API**: Memunculkan notifikasi pop-up sistem operasi saat staf membuka aplikasi di latar belakang.
- **Pusat Notifikasi & In-App Toast**: Riwayat notifikasi tersimpan di ikon lonceng pada header.

### 4. 📊 Dasbor Analitik Ringkas & Intuitif
- **KPI Metrics Cards**:
  - *Tingkat Kepatuhan Checklist (%)* (Target ≥ 95%)
  - *Kondisi Peralatan Prima (%)*
  - *Tingkat Kebersihan Ruangan (%)*
  - *Tindakan Korektif (Pending vs Selesai)*
  - *Jumlah Checklist Terisi Hari Ini*
- **Grafik Tren 7 Hari**: Visualisasi SVG interaktif yang menampilkan laju pengisian checklist dan kemunculan temuan kerusakan.
- **Top Peralatan Butuh Perhatian**: Menampilkan daftar peralatan yang paling sering mengalami kerusakan atau keausan (misal: Solet Rubber, Centong, Kafe plastik) untuk perencanaan pemeliharaan preventif (*preventive maintenance*).
- **Log Tindakan Korektif**: Melacak penukaran alat baru dari gudang dan approval Leader.

### 5. 📑 Format SOP Resmi Sesuai Dokumen Kertas (Matrix Bulanan)
- Tampilan tabel matrix kalender Senin - Minggu dengan subkolom **Kondisi** (`√` / `×`) dan **Kebersihan** (`√` / `×`).
- Kolom **Corrective action** di sisi kanan untuk mencatat tindakan penukaran unit baru.
- Baris tanda tangan digital / paraf untuk **Paraf Operator (Produksi)** dan **Mengetahui Production Leader**.
- **Siap Cetak / Export PDF**: Tombol *Cetak / Simpan PDF* menggunakan aturan CSS `@media print` sehingga tercetak rapi 1 lembar sesuai standar audit ISO/SOP.

---

## 🛠️ Cara Menjalankan Aplikasi

Aplikasi dibangun dengan arsitektur ringan tanpa ketergantungan paket berat (hanya memerlukan Python 3 bawaan sistem operasi):

1. **Buka Terminal** dan masuk ke direktori proyek:
   ```bash
   cd /Users/naufalfirdaus/.gemini/antigravity/scratch/produksi-checklist-app
   ```

2. **Jalankan Server**:
   ```bash
   ./start.sh
   # atau:
   python3 server.py
   ```

3. **Buka di Browser**:
   Akses URL berikut di browser (Chrome / Safari / Edge / Firefox):
   ```
   http://localhost:8080
   ```

---

## 🧪 Panduan Uji Coba Cepat (Demonstrasi)

1. **Uji Pengisian Cepat Operator**:
   - Buka tab **📝 Input Checklist Harian**.
   - Pilih Ruang (contoh: *Ruang Penimbangan*), pilih Shift.
   - Klik tombol **✨ Tandai Semua Bersih & Berfungsi (√)** untuk pengisian instan seluruh item.
   - Ubah salah satu item (misal: *Solet Rubber*) menjadi `× Rusak`. Perhatikan panel *Catatan Kerusakan & Corrective Action* terbuka secara otomatis. Masukkan jumlah alat rusak (misal: 2 unit).
   - Buat goresan paraf pada kotak *Paraf Operator* dan centang persetujuan Leader.
   - Klik **💾 Simpan & Kirim Laporan**.

2. **Uji Mode Offline & Sinkronisasi Otomatis**:
   - Di header atas, klik badge **🟢 Online** sehingga berubah menjadi **🟡 Offline (Simulasi)**.
   - Lakukan pengisian checklist baru di ruangan lain (misal: *Ruang Baking*).
   - Klik **Simpan**. Muncul pemberitahuan bahwa data disimpan di memori lokal perangkat, dan indikator pill di atas menampilkan **⏳ 1 Laporan Pending**.
   - Klik kembali badge status untuk mengembalikan ke mode **Online**.
   - Sistem secara otomatis menyinkronkan antrean laporan, membunyikan nada sukses (*chime*), dan memperbarui dasbor analitik.

3. **Uji Suara & Notifikasi Pengingat**:
   - Buka tab **⏰ Pengingat & Pengaturan**.
   - Klik tombol **🔔 Uji Nada Pengingat Shift** atau **⚠️ Uji Nada Peringatan Kerusakan**.
   - Klik **Aktifkan** pada izin Desktop Notification untuk menerima notifikasi sistem.

4. **Uji Format Cetak SOP Resmi**:
   - Buka tab **📑 Format SOP Resmi (Bulanan)**.
   - Pilih ruangan dan bulan yang diinginkan.
   - Klik **🖨️ Cetak / Simpan PDF** untuk melihat pratinjau cetak formulir standar audit yang identik dengan template fisik aslinya.
