import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapController } from './MapController';

export default function MapComponent({
    myLocation,
    searchedLocation,
    allLokasi,
    allLaporan,
    mapType,
    setMapType,
    initialMapCenter,
    initialMapZoom,
    API
}) {
    // --- Custom icons ---
    const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    const yellowIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png' });
    const greenIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

    // --- Dynamic weather icon ---
    const getWeatherIcon = (iconUrl) => {
        if (iconUrl) {
            return new L.Icon({
                iconUrl: iconUrl,
                shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
                shadowSize: [41, 41]
            });
        }
        return blueIcon;
    };

    const [nearestData, setNearestData] = useState(null);
    const [searchedNearestData, setSearchedNearestData] = useState(null);

    // Fetch nearest location saat myLocation berubah
   useEffect(() => {
     if (myLocation) {
         const fetchNearest = async () => {
             try {
                // Perbaikan: Pastikan URL API sudah benar.
                // Jika API tidak diberikan, gunakan URL default.
                const apiUrl = API || 'https://bisakah.pythonanywhere.com';
                const url = `${apiUrl}/api/nearest-location?lat=${myLocation.lat}&lon=${myLocation.lon}`;

                 const res = await fetch(url);
                 
                 // Cek jika respons tidak berhasil
                 if (!res.ok) {
                     const errorText = await res.text();
                     throw new Error(`Server merespons dengan status ${res.status}: ${errorText}`);
                 }
                 
                 // Periksa apakah respons adalah JSON yang valid
                 const contentType = res.headers.get("content-type");
                 if (contentType && contentType.indexOf("application/json") !== -1) {
                     const data = await res.json();
                     setNearestData(data);
                 } else {
                     const errorText = await res.text();
                     throw new Error(`Server merespons dengan tipe konten yang tidak terduga: ${contentType}. Respons: ${errorText}`);
                 }
             } catch (error) {
                 console.error('❌ Error fetching nearest location for myLocation:', error);
                 setNearestData({ error: 'Gagal memuat data lokasi terdekat. Pastikan server berfungsi dengan baik.', details: error.message });
             }
         };
         fetchNearest();
     } else {
         setNearestData(null);
     }
 }, [myLocation, API]);

    // Fetch nearest location saat searchedLocation berubah
 // Fetch nearest location saat searchedLocation berubah
 useEffect(() => {
     if (searchedLocation) {
         const fetchSearchedNearest = async () => {
             try {
                // Perbaikan: Pastikan URL API sudah benar.
                // Jika API tidak diberikan, gunakan URL default.
                const apiUrl = API || 'https://bisakah.pythonanywhere.com';
                const url = `${apiUrl}/api/nearest-location?lat=${searchedLocation.lat}&lon=${searchedLocation.lon}`;
                 const res = await fetch(url);

                 // Cek jika respons tidak berhasil
                 if (!res.ok) {
                     const errorText = await res.text();
                     throw new Error(`Server merespons dengan status ${res.status}: ${errorText}`);
                 }

                 // Periksa apakah respons adalah JSON yang valid
                 const contentType = res.headers.get("content-type");
                 if (contentType && contentType.indexOf("application/json") !== -1) {
                     const data = await res.json();
                     setSearchedNearestData(data);
                 } else {
                     const errorText = await res.text();
                     throw new Error(`Server merespons dengan tipe konten yang tidak terduga: ${contentType}. Respons: ${errorText}`);
                 }
             } catch (error) {
                 console.error('❌ Error fetching nearest location for searchedLocation:', error);
                 setSearchedNearestData({ error: 'Gagal memuat data lokasi terdekat. Pastikan server berfungsi dengan baik.', details: error.message });
             }
         };
         fetchSearchedNearest();
     } else {
         setSearchedNearestData(null);
     }
 }, [searchedLocation, API]);

    return (
        <div className="map-container">
            <MapContainer
                center={initialMapCenter}
                zoom={initialMapZoom}
                style={{ height: '100%', width: '100%' }}
                maxBounds={[[-11, 94], [6, 141]]}
                maxBoundsViscosity={1.0}
                minZoom={4}
                maxZoom={18}
            >
                <MapController myLocation={myLocation} searchedLocation={searchedLocation} />

                {mapType === 'standard'
                    ? <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    : <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri' />
                }

                {searchedLocation && (
                    <Marker position={[searchedLocation.lat, searchedLocation.lon]} icon={blueIcon}>
                        <Popup>
                            <div className="popup-content-scrollable" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {searchedNearestData?.lokasi_terdekat ? (
                                    <>
                                        Lokasi terdekat: {searchedNearestData.lokasi_terdekat?.desa || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kecamatan || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kotkab || 'N/A'}, {searchedNearestData.lokasi_terdekat?.provinsi || 'N/A'}
                                        <br /><br />
                                        <b>Data Cuaca</b><br />
                                        🌡 Suhu Saat Ini: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.suhu != null ? `${searchedNearestData.lokasi_terdekat.cuaca_saat_ini.suhu}°C` : 'N/A'}<br />
                                        💧 Kelembapan Saat Ini: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.kelembapan != null ? `${searchedNearestData.lokasi_terdekat.cuaca_saat_ini.kelembapan}%` : 'N/A'}<br />
                                        ☁️ Kondisi Cuaca: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.cuaca || 'Tidak ada data'}<br /><br />
                                        
                                        <b>Rekomendasi Hewan (Sangat Cocok, Skor ≥ 70)</b><br />
                                        {searchedNearestData.rekomendasi?.hewan?.length > 0
                                            ? <>{searchedNearestData.rekomendasi.hewan.join(', ')}<br /></>
                                            : 'Tidak ada data'}<br />
                                        
                                        <b>Rekomendasi Sayuran (Sangat Cocok, Skor ≥ 70)</b><br />
                                        {searchedNearestData.rekomendasi?.sayuran?.length > 0
                                            ? <>{searchedNearestData.rekomendasi.sayuran.join(', ')}<br /></>
                                            : 'Tidak ada data'}<br /><br />
                                        
                                        <b>Penilaian Lengkap</b><br />
                                        🐄 Hewan:<br />
                                        {(searchedNearestData.penilaian?.hewan || []).length > 0
                                            ? (searchedNearestData.penilaian.hewan.map((item, idx) => (
                                                <span key={`hewan-${idx}`}>
                                                    - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}, Alasan: {item.alasan_skor || 'N/A'})<br />
                                                </span>
                                            )))
                                            : 'Tidak ada'}<br />
                                        
                                        🥬 Sayuran:<br />
                                        {(searchedNearestData.penilaian?.sayuran || []).length > 0
                                            ? (searchedNearestData.penilaian.sayuran.map((item, idx) => (
                                                <span key={`sayuran-${idx}`}>
                                                    - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}, Alasan: {item.alasan_skor || 'N/A'})<br />
                                                </span>
                                            )))
                                            : 'Tidak ada'}
                                    </>
                                ) : (
                                    <p>Sedang memuat data lokasi terdekat...</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {allLokasi.filter(r => r.lat != null && r.lon != null).map((r, i) => (
                    <Marker key={r.adm4 || `lokasi-${i}`} position={[r.lat, r.lon]} icon={getWeatherIcon(r.weather_icon_url)}>
                        <Popup>
                            <div className="popup-content-scrollable">
                                📍 Lokasi: {r.desa || 'N/A'}, {r.kecamatan || 'N/A'}, {r.kotkab || 'N/A'}, {r.provinsi || 'N/A'}
                                <br /><br />
                                🌡 Suhu Saat Ini: {r.suhu_realtime != null && r.suhu_realtime !== "N/A" ? `${r.suhu_realtime}°C` : 'N/A'}<br />
                                💧 Kelembapan Saat Ini: {r.kelembapan_realtime != null && r.kelembapan_realtime !== "N/A" ? `${r.kelembapan_realtime}%` : 'N/A'}<br />
                                ☁️ Kondisi Cuaca: {r.weather_desc || 'Tidak ada data'}<br /><br />
                                📅 Suhu Hari Ini:<br />
                                – Rata-rata: {r.suhu_hari_ini?.rata2 != null ? `${r.suhu_hari_ini.rata2}°C` : 'N/A'}<br />
                                – Maksimum: {r.suhu_hari_ini?.max != null ? `${r.suhu_hari_ini.max}°C` : 'N/A'}<br />
                                – Minimum: {r.suhu_hari_ini?.min != null ? `${r.suhu_hari_ini.min}°C` : 'N/A'}<br /><br />
                                📊Periode Rata-rata (2 hari kedepan):<br />
                                🌡 Suhu rata-rata periode: {r.rata2_suhu != null ? `${r.rata2_suhu}°C` : 'N/A'}<br />
                                💧 Kelembapan rata-rata periode: {r.rata2_hu != null ? `${r.rata2_hu}%` : 'N/A'}<br /><br />
                                🐄 Rekomendasi Hewan<br />✅ Sangat Cocok (Skor diatas 70 ) <br />
                                {r.pilihan_tepat?.hewan?.length > 0 ? <>{r.pilihan_tepat.hewan.join(', ')}<br /></> : '🐄 Hewan: Tidak ada data'}<br />
                                🥬 Rekomendasi Sayuran<br />✅ Sangat Cocok (Skor diatas 70 ) <br />
                                {r.pilihan_tepat?.sayuran?.length > 0 ? <>{r.pilihan_tepat.sayuran.join(', ')}<br /></> : '🥬 Sayuran: Tidak ada data'}<br /><br />
                                <b>Penilaian:</b><br />
                                🐄 Hewan:<br />
                                {(r.cocok_untuk?.hewan || []).length > 0
                                    ? (r.cocok_untuk.hewan.map((item, idx) => (
                                        <span key={`hewan-${idx}`}>
                                            - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}{item.alasan_skor ? `, ${item.alasan_skor}` : ''})<br />
                                        </span>
                                    )))
                                    : 'Tidak ada'}<br />
                                🥬 Sayuran:<br />
                                {(r.cocok_untuk?.sayuran || []).length > 0
                                    ? (r.cocok_untuk.sayuran.map((item, idx) => (
                                        <span key={`sayuran-${idx}`}>
                                            - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}{item.alasan_skor ? `, ${item.alasan_skor}` : ''})<br />
                                        </span>
                                    )))
                                    : 'Tidak ada'}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {allLaporan.filter(lap => lap.lat != null && lap.lon != null).map((lap, idx) => (
                    <Marker key={`lap-${lap.waktu}-${idx}`} position={[lap.lat, lap.lon]} icon={greenIcon}>
                        <Popup>
                            📍 <b>{lap.lokasi || 'Lokasi Tidak Diketahui'}</b><br/>
                            🗑 Kategori: {lap.kategori || '-'}<br/>
                            🕒 Waktu: {new Date(lap.waktu).toLocaleString()}<br/>
                            📞 Kontak: {lap.kontak || '-'}<br/>
                            📝 Deskripsi: {lap.deskripsi || '-'}
                        </Popup>
                    </Marker>
                ))}

                {myLocation && (
                    <>
                        <style>
                            {`
                                .radar-wrapper {
                                    position: absolute;
                                    top: -40px;
                                    left: -40px;
                                    width: 120px;
                                    height: 120px;
                                    pointer-events: none;
                                }
                                .radar-pulse {
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    border-radius: 50%;
                                    border: 3px solid rgba(0, 0, 0, 0.8);
                                    animation: radarPulse 2s infinite ease-out;
                                }
                                .radar-pulse::after {
                                    content: '';
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    width: 12px;
                                    height: 12px;
                                    background-color: lime;
                                    border-radius: 50%;
                                    transform: translate(-50%, -50%);
                                    box-shadow: 0 0 10px lime;
                                }
                                @keyframes radarPulse {
                                    0% {
                                        transform: scale(0.3);
                                        opacity: 1;
                                    }
                                    70% {
                                        transform: scale(1.8);
                                        opacity: 0;
                                    }
                                    100% {
                                        transform: scale(2);
                                        opacity: 0;
                                    }
                                }
                                .custom-marker {
                                    position: relative;
                                }
                            `}
                        </style>
                        <Marker position={[myLocation.lat, myLocation.lon]} icon={yellowIcon}>
                            <div className="custom-marker">
                                <div className="radar-wrapper">
                                    <div className="radar-pulse"></div>
                                </div>
                            </div>
                            <Popup>
                                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    📍 Ini lokasi kamu sekarang<br/>
                                    <b>Latitude:</b> {myLocation.lat}<br/>
                                    <b>Longitude:</b> {myLocation.lon}<br/><br/>
                                    {nearestData?.lokasi_terdekat ? (
                                        <>
                                            🌏 <b>Lokasi Terdekat:</b> {nearestData.lokasi_terdekat.desa}, {nearestData.lokasi_terdekat.kecamatan}, {nearestData.lokasi_terdekat.kotkab}, {nearestData.lokasi_terdekat.provinsi}<br/><br/>
                                            🌡 Suhu Saat Ini: {nearestData.lokasi_terdekat.cuaca_saat_ini?.suhu ?? 'N/A'}°C<br/>
                                            💧 Kelembapan Saat Ini: {nearestData.lokasi_terdekat.cuaca_saat_ini?.kelembapan ?? 'N/A'}%<br/>
                                            ☁️ Cuaca: {nearestData.lokasi_terdekat.cuaca_saat_ini?.cuaca || 'Tidak ada data'}<br/><br/>
                                            
                                            **Rekomendasi Hewan (Sangat Cocok, Skor ≥ 70)**<br/>
                                            {
                                                (nearestData.penilaian?.hewan || []).filter(h => h.skor >= 70).length > 0
                                                ? (
                                                    nearestData.penilaian.hewan
                                                        .filter(h => h.skor >= 70)
                                                        .map((h, idx) => (
                                                            <span key={`rec-hewan-${idx}`}>
                                                                {h.nama} (Skor: {h.skor}){idx < (nearestData.penilaian.hewan.filter(h => h.skor >= 70).length - 1) ? ', ' : ''}
                                                            </span>
                                                        ))
                                                )
                                                : 'Tidak ada data'
                                            }<br/><br/>
                                            
                                            **Rekomendasi Sayuran (Sangat Cocok, Skor ≥ 70)**<br/>
                                            {
                                                (nearestData.penilaian?.sayuran || []).filter(s => s.skor >= 70).length > 0
                                                ? (
                                                    nearestData.penilaian.sayuran
                                                        .filter(s => s.skor >= 70)
                                                        .map((s, idx) => (
                                                            <span key={`rec-sayur-${idx}`}>
                                                                {s.nama} (Skor: {s.skor}){idx < (nearestData.penilaian.sayuran.filter(s => s.skor >= 70).length - 1) ? ', ' : ''}
                                                            </span>
                                                        ))
                                                )
                                                : 'Tidak ada data'
                                            }<br/><br/>

                                            **Penilaian Lengkap**<br/>
                                            🐄 Hewan:<br/>
                                            {(nearestData.penilaian?.hewan || []).length > 0
                                                ? (nearestData.penilaian.hewan.map((item, idx) => (
                                                    <span key={`hewan-${idx}`}>
                                                        - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}, Alasan: {item.alasan_skor || 'N/A'})<br/>
                                                    </span>
                                                )))
                                                : 'Tidak ada'}<br/>
                                            
                                            🥬 Sayuran:<br/>
                                            {(nearestData.penilaian?.sayuran || []).length > 0
                                                ? (nearestData.penilaian.sayuran.map((item, idx) => (
                                                    <span key={`sayuran-${idx}`}>
                                                        - {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}, Alasan: {item.alasan_skor || 'N/A'})<br/>
                                                    </span>
                                                )))
                                                : 'Tidak ada'}
                                        </>
                                    ) : nearestData?.error ? (
                                        <p>❌ Error: {nearestData.error}</p>
                                    ) : (
                                        <p>Sedang memuat data lokasi terdekat...</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}
            </MapContainer>

            <div className="map-controls-overlay">
                <motion.button
                    onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {mapType === 'standard' ? '🌍 Peta Satelit' : '🗺 Peta Jalan'}
                </motion.button>
            </div>
        </div>
    );
}