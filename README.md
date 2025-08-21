# Monitoring Kuota Starlink

Proyek ini terdiri dari **dua aplikasi bersandingan** yang bekerja sama untuk memantau kuota Starlink secara otomatis dan mengirim notifikasi ke WhatsApp.  

## 1. api-bot.js
- Berfungsi sebagai **API server** menggunakan Node.js.
- Menerima data **POST** dari aplikasi lain (VB.NET) yang mengirimkan informasi kuota.
- **Menyimpan data ke database** MySQL (`monitoring_starlink`) untuk pencatatan dan analisis.
- **Mengirim notifikasi WhatsApp** secara otomatis saat data diterima, menggunakan library `whatsapp-web.js`.
- Dirancang untuk dijalankan di server, menyediakan endpoint API bagi klien.

### Contoh Endpoint API
```http
POST /api/send-data
Content-Type: application/json

{
  "device": "Starlink-001",
  "kuota": 1024,
  "tanggal": "2025-08-21"
}
2. Aplikasi VB.NET
Mengambil data kuota dari web Starlink.

Mengirim data yang diperoleh ke api-bot.js melalui HTTP POST.

Bisa dijalankan di client PC, otomatis mengirim data tanpa interaksi manual.

Dapat dijadwalkan menggunakan Task Scheduler agar berjalan periodik.

Cara Kerja Singkat
VB.NET mengakses halaman web Starlink dan membaca kuota.

Data kuota dikirim ke server api-bot.js melalui HTTP POST.

api-bot.js menerima data:

Menyimpan data ke database MySQL.

Mengirim notifikasi ke WhatsApp.

Menyimpan log aktivitas ke file lokal (opsional).

Instalasi dan Setup
api-bot.js
Pastikan Node.js dan npm sudah terinstall.

Clone repository:

bash
Copy
Edit
git clone https://github.com/fransiskussutris/monitoring-kuota-starlink.git
Masuk ke folder project:

bash
Copy
Edit
cd monitoring-kuota-starlink
Install dependencies:

bash
Copy
Edit
npm install
Buat file .env sesuai contoh:

env
Copy
Edit
DB_HOST=10.43.17.15
DB_USER=sutris
DB_PASS=packard1000
DB_NAME=monitoring_starlink
WA_SESSION_PATH=.wwebjs_auth/session
Jalankan server:

bash
Copy
Edit
node api-bot.js
Server siap menerima POST dari aplikasi VB.NET.

VB.NET
Sesuaikan URL endpoint API di VB.NET sesuai server api-bot.js.

Jalankan aplikasi atau jadwalkan task agar otomatis mengirim data ke server.

Catatan
Pastikan .wwebjs_auth/session sudah ada untuk autentikasi WhatsApp agar bot bisa mengirim notifikasi.

File log (log_kuota.txt) akan dibuat di folder aplikasi untuk mencatat aktivitas pengiriman data.

Pastikan firewall/port server mengizinkan akses HTTP dari client VB.NET.
