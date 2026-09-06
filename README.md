# Demo Digital — Platform Aspirasi Publik Terverifikasi

Dokumentasi ini disusun untuk memenuhi ketentuan pengumpulan karya babak penyisihan.

---

## 1. Penjelasan Aplikasi (Latar Belakang dan Tujuan)

### Latar Belakang
Di era digital saat ini, media sosial sering kali menjadi ruang utama bagi masyarakat untuk menyuarakan isu publik atau keluhan sosial. Namun, ekosistem ini dipenuhi oleh akun anonim, bot, dan disinformasi (hoaks). Akibatnya, petisi atau laporan masyarakat sering kali tumpang tindih, kehilangan kredibilitas, dan sulit ditindaklanjuti oleh pihak berwenang karena tidak ada sistem validasi identitas pelapor yang jelas.

### Tujuan Aplikasi
Aplikasi ini dibangun sebagai wadah penyampaian aspirasi dan pelaporan isu publik yang terverifikasi, transparan, dan akuntabel. Tujuannya adalah menciptakan ruang demokrasi digital di mana setiap suara dapat dipertanggungjawabkan (prinsip One Citizen, One Voice), sekaligus memberikan visualisasi data secara real-time mengenai isu-isu paling mendesak di masyarakat (seperti infrastruktur, lingkungan, atau kebijakan publik) agar penanganannya lebih terarah dan terukur.

---

## 2. Fitur Utama (Pembeda & Keunggulan)

* **Sistem e-KYC Berbasis AI (Verified Citizen):** Pembeda utama platform ini adalah integrasi teknologi Optical Character Recognition (OCR) untuk memindai KTP dan Face Matching untuk mencocokkan wajah pengguna. Sistem memastikan 100% isu yang diajukan dan didukung berasal dari warga negara asli, mengeliminasi risiko manipulasi vote oleh akun palsu atau bot.
* **Arsitektur Privasi "Client-Side Processing":** Menjawab kekhawatiran terkait keamanan data pribadi, pemrosesan ekstraksi data KTP dan pengenalan wajah dilakukan langsung di sisi klien (browser pengguna). Gambar sensitif tidak pernah disimpan secara permanen di database server, melainkan langsung dihancurkan setelah status "Warga Terverifikasi" didapatkan.
* **Live Dashboard & Command Center UI:** Mengadaptasi desain antarmuka pusat komando analitik (dark mode, data-driven), aplikasi ini menyajikan widget interaktif seperti "Siaran Langsung Pergerakan Warga" dan progress bar dukungan untuk transparansi mutlak.

---

## 3. Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur monorepo modern dengan pemisahan peran yang jelas antara frontend, backend, dan client-side processing untuk menjamin kinerja tinggi, efisiensi sistem, dan privasi data.

### Implementasi Fokus SDG 9 (Industri, Inovasi, dan Infrastruktur)
* **Inovasi Teknologi (Client-Side AI):** Mengintegrasikan modul kecerdasan buatan langsung di browser pengguna untuk verifikasi e-KYC. Langkah inovatif ini memangkas beban server, menjamin keamanan data pribadi, dan meniadakan kebutuhan infrastruktur backend terpusat yang mahal.
* **Infrastruktur Digital Modern & Inklusif:** Membangun platform pelaporan berkinerja tinggi yang responsif dan dapat diakses dari berbagai perangkat sebagai fondasi infrastruktur informasi publik yang andal dan transparan.

### Stack Spesifikasi Teknis
* **Frontend & UI Design:** React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React, Radix UI.
* **Backend & Client-Side AI Engine:** Node.js, Express.js, Tesseract.js / Face-API.js.
* **Package Management & Deployment:** pnpm Workspace, Vercel.

---

## 4. Cara Instalasi

### Prasyarat Sistem
* **Node.js**: v18.x atau lebih baru
* **pnpm**: v8.x atau v9.x (`npm install -g pnpm`)

### Langkah-Langkah Setup

1. **Cloning Repository**
   ```bash
   git clone [https://github.com/username-anda/demo-digital.git](https://github.com/username-anda/demo-digital.git)
   cd demo-digital
2. Instalasi Dependencies
Jalankan perintah berikut di direktori utama (root workspace):
Bash
pnpm install
3. Pengaturan Environment Variables
Buat file .env di direktori artifacts/api-server/.env dan sesuaikan variabel berikut:
Code snippet
PORT=3000
NODE_ENV=development
SESSION_SECRET=K5c+Jp+o5LXEJl1h23S/EmVl6f9uCi0rD3kqU114mzT7RXb6EgOQrtt8rvMQ8HovOyTl2mdAEvcj/5c/cSC6+A==
NEXT_PUBLIC_SUPABASE_URL=[https://tdhlocujvjrqrqrtnvwi.supabase.co](https://tdhlocujvjrqrqrtnvwi.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yJq7wrvNUKAA-sAQiqSb1A_MkDQKu7R

5. Cara Penggunaan
Gunakan command snippet berikut untuk menjalankan aplikasi dalam mode pengembang (development) maupun kesiapan rilis (production).
1. Menjalankan Mode Development
Aplikasi ini menggunakan struktur monorepo. Jalankan Backend Server dan Frontend secara bersamaan di dua terminal terpisah:
Terminal 1 (Backend API Server):
Bash
npx cross-env PORT=3000 NODE_ENV=development pnpm --filter api-server dev
Terminal 2 (Frontend Client):
Bash
npx cross-env PORT=5000 BASE_PATH="/" pnpm --filter demo-digital dev
Akses http://localhost:5000 pada browser Anda untuk membuka antarmuka aplikasi.

2. Menjalankan Type Checking & Linting
Gunakan perintah ini untuk memastikan seluruh struktur tipe data TypeScript tervalidasi dengan baik:
Bash
pnpm run typecheck
3. Melakukan Build & Menjalankan Mode Production
Gunakan perintah ini untuk melakukan kompilasi proyek dan menguji hasil build secara lokal:
Bash
# Kompilasi seluruh package di workspace (Build)
pnpm run build

# Menjalankan preview hasil build lokal
pnpm run preview
