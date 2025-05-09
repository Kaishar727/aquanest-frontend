# AquaNest

**AquaNest** adalah sistem monitoring dan manajemen kualitas air akuakultur berbasis IoT yang dirancang untuk membantu peternak ikan/udang dalam memantau kondisi kolam secara real-time.

---

## 🚀 Fitur Utama

### 🔎 Monitoring Real-Time
- Parameter kualitas air: pH, suhu, salinitas, amonia, dan lainnya
- Visualisasi data dalam bentuk grafik dan tabel
- Pembacaan sensor otomatis setiap 5 menit

### 🚨 Sistem Peringatan
- Notifikasi saat parameter melebihi batas optimal
- Klasifikasi tingkat urgensi: *Warning* dan *Danger*

### 🧠 Manajemen Kolam
- Dukungan multi-kolam
- Riwayat historis data
- Analisis tren kualitas air

### 💻 Antarmuka Pengguna
- Dashboard interaktif & responsif (desktop & mobile)
- Grafik informatif berbasis Chart.js
- UI modern dengan PrimeReact & Material UI

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- React.js
- PrimeReact (UI Library)
- Material-UI (MUI)
- Chart.js (visualisasi data)
- Axios (komunikasi API)

### Backend
- PHP (REST API)
- MySQL (Database)

### IoT
- Sensor kualitas air (pH, suhu, salinitas, amonia)
- Mikrokontroler: ESP32 / Arduino
- Komunikasi via MQTT / HTTP

---

## ⚙️ Instalasi & Konfigurasi

### Prasyarat
- Node.js (v14+)
- Yarn
- XAMPP / WAMP (untuk menjalankan backend PHP)

### Langkah Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/aquanest/aquanest-web.git
Masuk ke direktori proyek

bash
Copy
Edit
cd aquanest-web
Install dependencies

bash
Copy
Edit
yarn install
Konfigurasi environment

Buat file .env di root folder proyek (sejajar dengan README.md)

Isi sesuai konfigurasi berikut:

env
Copy
Edit
VITE_APP_VERSION = v1.4.1
GENERATE_SOURCEMAP = false

VITE_APP_BASE_NAME = /aquanest

VITE_BASE_URL = http://contohbackend/backend


Jalankan aplikasi

bash
Copy
Edit
yarn dev
📁 Struktur Direktori
bash
Copy
Edit
aquanest-web/
├── .env                         # File konfigurasi environment
├── public/                      # Aset statis (favicon, index.html, dll)
├── src/
│   ├── api/                     # Fungsi request API
│   ├── assets/                  # Gambar, ikon, dan asset statis lainnya
│   ├── components/              # Komponen reusable (card, table, dll)
│   ├── contexts/                # Context API untuk global state
│   ├── data/                    # Data dummy atau statis
│   ├── hooks/                   # Custom React Hooks
│   ├── layout/                  # Layout aplikasi
│   ├── menu-items/              # Navigasi menu sidebar
│   ├── pages/                   # Halaman utama aplikasi
│   ├── routes/                  # Routing konfigurasi
│   ├── sections/                # Bagian halaman spesifik
│   ├── themes/                  # Konfigurasi tema dan styling
│   └── utils/                   # Fungsi utilitas umum
├── package.json                 # Konfigurasi dependencies dan scripts
└── README.md                    # Dokumentasi proyek
🔧 Konfigurasi Backend
Jalankan server PHP menggunakan XAMPP atau WAMP

Import file aquanest.sql ke MySQL

Edit config.php dan sesuaikan:

Host

Username

Password

Nama Database

📊 Penggunaan Aplikasi
Dashboard Utama
Ringkasan kondisi semua kolam

Grafik parameter (pH, suhu, dll)

Notifikasi peringatan

Monitoring Kolam
Pilih kolam yang ingin dimonitor

Lihat data real-time dan historis

Export data untuk analisis

Pengaturan
Atur parameter optimal per kolam

Manajemen pengguna dan notifikasi

