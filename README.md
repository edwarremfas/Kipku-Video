# Klipku

Editor video gratis yang berjalan di browser. Tanpa watermark, tanpa akun, tanpa langganan. Video diproses di perangkat dan tidak diunggah ke server mana pun.

## Fitur

- Ruang kerja ala editor ponsel: pratinjau di atas, linimasa dengan thumbnail dan playhead di tengah, bilah alat di bawah
- Tombol + memberi pilihan Video atau Foto
- Bilah alat berubah sesuai item yang dipilih; ujung klip bisa ditarik untuk memotong
- Overlay (gambar atau video) bisa digeser, diubah ukuran, diduplikat, dan dipotong langsung di pratinjau; teks juga bisa digeser
- Video dan foto sebagai klip; tombol Potong dan Hapus langsung di bilah alat
- Beberapa klip di linimasa: potong, pisah, geser urutan, hapus
- Kecepatan 0,5x sampai 2x, volume, memudar, cermin, isi layar penuh
- Filter siap pakai dan pengatur kecerahan, kontras, saturasi
- Teks dengan waktu, durasi, ukuran, dan warna
- Beberapa jalur musik atau audio dari file sendiri: atur volume, waktu mulai di linimasa, potong awal dan akhir
- Rasio 16:9, 9:16, 1:1, 4:5
- Pisahkan audio dari klip, dan atur posisi teks (horizontal dan vertikal)
- Simpan dan buka proyek (disimpan di browser, termasuk file video)
- Overlay gambar (logo, stiker milik sendiri) dengan posisi, ukuran, transparansi, waktu, dan opsi di belakang video
- Hapus latar warna (chroma key) untuk green screen, dengan warna latar pengganti atau gambar di belakang
- Transisi masuk per klip: memudar, geser, zoom, putar
- Urungkan dan ulangi
- Ekspor ke WebM atau MP4 (tergantung browser)

## Menjalankan

Buka `index.html` di browser (disarankan Chrome atau Edge desktop). Tidak ada yang perlu diinstal.

## Memasang di GitHub Pages

1. Buat repositori baru di GitHub, lalu unggah semua file ini.
2. Buka **Settings > Pages**.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu simpan.
4. Setelah beberapa menit, situs tayang di `https://NAMA-ANDA.github.io/NAMA-REPO/`.

## Pasang sebagai aplikasi (PWA)

Setelah situs tayang lewat HTTPS (GitHub Pages sudah HTTPS), buka di Chrome atau Edge lalu pilih **Instal** di bilah alamat, atau **Tambahkan ke layar utama** di ponsel. Setelah kunjungan pertama, Klipku bisa dibuka tanpa internet. Saat mengubah file aplikasi, naikkan `VERSI` di `sw.js` agar cache lama diganti.

## Catatan

- Ekspor direkam secara real-time: video 1 menit butuh sekitar 1 menit.
- Filter warna mungkin tidak tampil di Safari iPhone.
- Proyek tersimpan di penyimpanan browser (IndexedDB). Video besar bisa melebihi kuota dan gagal disimpan.
- Audio yang dipisahkan tidak ikut bergeser jika urutan klip diubah sesudahnya.
- Belum ada keyframe, atau penghapus latar otomatis berbasis AI (chroma key sudah ada).
- Transisi bersifat animasi masuk, bukan crossfade antar dua klip.

## Lisensi

MIT. Klipku adalah proyek orisinal dan tidak berafiliasi dengan aplikasi editor video lain.
