import React from 'react';
import { motion } from 'framer-motion';

// Komponen Deskripsi Proyek
export default function ProjectDescription() {
  return (
    <motion.div
      className="project-description"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
    >
      <div className="description-header">
        🌿 Wargabantuin — Aplikasi Cerdas untuk Petani & Peternak Indonesia
      </div>

      <div className="description-section">
        <h4 className="section-title">✨ Tujuan Utama Aplikasi</h4>
        <p>Memberikan rekomendasi hewan ternak dan tanaman sayuran paling cocok untuk lokasi pengguna, berdasarkan data iklim terkini dari BMKG dan basis data komoditas.</p>
        <ul>
          <li>🎯 Mengurangi kerugian akibat cuaca ekstrem & mendukung pertanian/peternakan berkelanjutan.</li>
          <li>⚙️ Dukungan Lokasi</li>
        </ul>
        <p>Mendukung ± 1000 titik lokasi (±20 lokasi per provinsi). Lokasi pengguna otomatis dipetakan ke titik terdekat untuk efisiensi server & penyimpanan.</p>
      </div>

      <div className="description-section">
        <h4 className="section-title">📌 Bagaimana Aplikasi Bekerja</h4>
        <ol>
          <li><span className="step-title">Memahami Kebutuhan</span>
            <p>Menentukan hewan/sayuran yang sesuai dengan cuaca lokal pengguna.</p>
          </li>
          <li><span className="step-title">Mengumpulkan Data</span>
            <p>Data Cuaca: dari BMKG (real-time & historis). Data Komoditas: suhu & kelembapan ideal tiap hewan/tanaman.</p>
            <pre className="code-block"><code>
{`// Contoh Data Lokasi
{
  "provinsi": "Sumatera Utara",
  "kotkab": "Tapanuli Tengah",
  "kecamatan": "Barus",
  "desa": "Kampung Solok",
  "lon": 98.38,
  "lat": 2.06,
  "timezone": "Asia/Jakarta"
}

// Contoh Data Hewan
{"nama":"Ayam Broiler","suhu_min":20,"suhu_max":28,"hu_min":60,"hu_max":75}

// Contoh Data Sayuran
{"nama":"Bawang Merah","suhu_min":25,"suhu_max":32,"hu_min":50,"hu_max":70}`}
            </code></pre>
          </li>
          <li><span className="step-title">Mengolah Data</span>
            <p>Menghitung suhu & kelembapan saat ini. Membandingkan dengan standar ideal tiap komoditas.</p>
          </li>
          <li><span className="step-title">Memberikan Rekomendasi</span>
            <p>Skor kecocokan 0–100. Alasan singkat kenapa cocok/tidak cocok.</p>
          </li>
          <li><span className="step-title">Menguji & Memperbaiki</span>
            <p>Umpan balik dari petani & peternak digunakan untuk memperbaiki rekomendasi.</p>
          </li>
        </ol>
      </div>

      <div className="description-section">
        <h4 className="section-title">🧠 Teknologi AI yang Digunakan</h4>
        <p><strong>Searching</strong></p>
        <ul>
          <li>Blind Search → membandingkan semua komoditas di database.</li>
          <li>Heuristic Search → menghitung jarak optimal suhu/kelembapan.</li>
          <li>Probabilistic Search → memprediksi peluang keberhasilan (misal dengan Bayesian).</li>
        </ul>
        <p><strong>Reasoning</strong></p>
        <ul>
          <li>Rule-Based → IF suhu & kelembapan ideal THEN cocok.</li>
          <li>Case-Based → mencocokkan dengan data panen historis.</li>
          <li>Fuzzy Logic → menangani suhu borderline (misal “sedikit panas”).</li>
          <li>Uncertainty Reasoning → memperhitungkan ketidakpastian cuaca.</li>
        </ul>
        <p><strong>Planning</strong></p>
        <ul>
          <li>Membuat rencana tanam & pemeliharaan berdasarkan data dan batasan (cuaca, anggaran, musim).</li>
        </ul>
        <p><strong>Learning</strong></p>
        <ul>
          <li>Supervised → model klasifikasi berdasarkan suhu & kelembapan.</li>
          <li>Unsupervised → clustering lokasi yang mirip.</li>
          <li>Reinforcement → sistem belajar dari hasil nyata pengguna.</li>
        </ul>
      </div>

      <div className="description-section">
        <h4 className="section-title">🛠️ Teknologi & Arsitektur</h4>
        <p><strong>Backend</strong></p>
        <ul>
          <li>Python + Flask (REST API)</li>
          <li>Data JSON lokal (tanpa DB besar) → cepat & ringan</li>
          <li>Fuzzy Matching: fuzzywuzzy, RapidFuzz</li>
          <li>Penjadwalan otomatis (APScheduler)</li>
          <li>Gunicorn sebagai server produksi</li>
        </ul>
        <p><strong>Frontend</strong></p>
        <ul>
          <li>React (SPA)</li>
          <li>Peta: Leaflet + react-leaflet</li>
          <li>UI: Framer Motion, react-icons</li>
          <li>Komunikasi API: Axios</li>
          <li>Build minimal Node.js 18.x</li>
        </ul>
        <p><strong>Chatbot AI</strong></p>
        <ul>
          <li>NLP + Fuzzy Matching</li>
          <li>43 jenis pertanyaan yang dapat dijawab</li>
          <li>Template respons dinamis</li>
          <li>Tidak bergantung pada internet cepat, bisa pakai data lokal</li>
        </ul>
      </div>

      <div className="description-section">
        <h4 className="section-title">📊 Fitur Utama</h4>
        <ul>
          <li><strong>Peta Interaktif:</strong> Menampilkan ribuan titik lokasi tanpa lag. Klik lokasi → lihat cuaca + rekomendasi komoditas.</li>
          <li><strong>Chatbot AI:</strong> Jawaban kontekstual & ramah. Memahami bahasa alami, termasuk penulisan informal.</li>
          <li><strong>Rekomendasi Cerdas:</strong> Skor kesesuaian + alasan ilmiah.</li>
        </ul>
      </div>

      <div className="description-section">
        <h4 className="section-title">🧠 Contoh Pertanyaan Lengkap yang Bisa Ditanyakan</h4>
        <div className="questions-list">
          <ul>
            <li>“Data provinsi apa saja yang tersedia”</li>
            <li>“Data kota/kotkab apa saja yang tersedia”</li>
            <li>“Kecamatan apa saja yang tersedia”</li>
            <li>“Desa apa saja yang tersedia”</li>
            <li>“Apa saja hewan yang dapat dicek”</li>
            <li>“Daftar sayuran”</li>
            <li>“[Nama Hewan] cocok di mana?”</li>
            <li>“[Nama Sayuran] cocok di mana?”</li>
            <li>“Dimana letak [nama_lokasi]”</li>
            <li>“Di mana posisi [nama_lokasi]”</li>
            <li>“Koordinat [nama lokasi]”</li>
            <li>“Bagaimana cuaca di [nama lokasi]”</li>
            <li>“Suhu tertinggi di [nama lokasi]”</li>
            <li>“Suhu terendah di [nama lokasi]”</li>
            <li>“Kelembapan di [nama lokasi]”</li>
            <li>“Ringkasan cuaca di [nama lokasi]”</li>
          </ul>
        </div>
        <p>✅ <strong>Keterangan input:</strong></p>
        <ul>
          <li>[nama lokasi] → kota,provinsi, kabupaten, kecamatan, atau desa</li>
          <li>[nama hewan] → ayam, kambing, sapi, dll</li>
          <li>[nama sayuran] → selada, tomat, bayam, dll</li>
          <li>[angka suhu tertentu] → misalnya 20°C, 22°C, dll</li>
        </ul>
      </div>

      <div className="description-footer">
        &copy; {new Date().getFullYear()} Team RUCE. All rights reserved.
      </div>
    </motion.div>
  );
}
