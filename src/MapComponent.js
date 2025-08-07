import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapController } from './MapController'; // pastikan file ada

// API Base URL untuk server PythonAnywhere
const API_BASE_URL = 'https://bisakah.pythonanywhere.com/api';

export default function MapComponent({
  myLocation,
  searchedLocation,
  allLokasi,
  allLaporan,
  mapType,
  setMapType,
  initialMapCenter,
  initialMapZoom
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

  // State untuk nearestData dari myLocation
  const [nearestData, setNearestData] = useState(null);
  // State untuk nearestData dari searchedLocation
  const [searchedNearestData, setSearchedNearestData] = useState(null);
  // State untuk loading dan error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function untuk fetch dengan error handling
  const fetchWithErrorHandling = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn('📦 Response bukan JSON:', text.substring(0, 200));
        throw new Error(`Invalid JSON response from server`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server tidak merespon');
      }
      throw error;
    }
  };

  // Fetch nearest data untuk myLocation
  useEffect(() => {
    if (myLocation) {
      const fetchNearest = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log(`🔍 Fetching nearest location for myLocation: ${myLocation.lat}, ${myLocation.lon}`);
          const data = await fetchWithErrorHandling(
            `${API_BASE_URL}/nearest-location?lat=${myLocation.lat}&lon=${myLocation.lon}`
          );
          
          console.log('✅ MyLocation nearest data received:', data);
          setNearestData(data);
        } catch (error) {
          console.error('❌ Error fetch nearest location untuk myLocation:', error);
          setError(`Gagal memuat data lokasi terdekat: ${error.message}`);
          setNearestData(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchNearest();
    } else {
      setNearestData(null);
    }
  }, [myLocation]);

  // Fetch nearest data untuk searchedLocation
  useEffect(() => {
    if (searchedLocation) {
      const fetchSearchedNearest = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log(`🔍 Fetching nearest location for searchedLocation: ${searchedLocation.lat}, ${searchedLocation.lon}`);
          const data = await fetchWithErrorHandling(
            `${API_BASE_URL}/nearest-location?lat=${searchedLocation.lat}&lon=${searchedLocation.lon}`
          );
          
          console.log('✅ SearchedLocation nearest data received:', data);
          setSearchedNearestData(data);
        } catch (error) {
          console.error('❌ Error fetch nearest location untuk searchedLocation:', error);
          setError(`Gagal memuat data lokasi pencarian: ${error.message}`);
          setSearchedNearestData(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSearchedNearest();
    } else {
      setSearchedNearestData(null);
    }
  }, [searchedLocation]);

  return (
    <div className="map-container">
      {/* Error notification */}
      {error && (
        <div className="error-notification" style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '14px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator" style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4a90e2',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          🔄 Memuat data lokasi terdekat...
        </div>
      )}

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
          ? <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; OpenStreetMap contributors' 
            />
          : <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              attribution='Tiles &copy; Esri' 
            />
        }

        {/* --- Marker lokasi yang dicari dengan data dari nearestLocation API --- */}
        {searchedLocation && searchedNearestData && (
          <Marker position={[searchedLocation.lat, searchedLocation.lon]} icon={blueIcon}>
            <Popup>
              <div className="popup-content-scrollable" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <strong>📍 Lokasi Pencarian</strong><br/>
                Terdekat: {searchedNearestData.lokasi_terdekat?.desa || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kecamatan || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kotkab || 'N/A'}, {searchedNearestData.lokasi_terdekat?.provinsi || 'N/A'}
                <br /><br />
                <strong>🌡️ Data Cuaca Saat Ini</strong><br />
                🌡 Suhu: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.suhu != null ? `${searchedNearestData.lokasi_terdekat.cuaca_saat_ini.suhu}°C` : 'N/A'}<br />
                💧 Kelembapan: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.kelembapan != null ? `${searchedNearestData.lokasi_terdekat.cuaca_saat_ini.kelembapan}%` : 'N/A'}<br />
                ☁️ Kondisi: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.cuaca || 'Tidak ada data'}<br /><br />
                
                <strong>✅ Rekomendasi Sangat Cocok (Skor ≥ 70)</strong><br />
                🐄 Hewan: {searchedNearestData.rekomendasi?.hewan?.length > 0
                  ? searchedNearestData.rekomendasi.hewan.join(', ')
                  : 'Tidak ada'}<br />
                🥬 Sayuran: {searchedNearestData.rekomendasi?.sayuran?.length > 0
                  ? searchedNearestData.rekomendasi.sayuran.join(', ')
                  : 'Tidak ada'}<br /><br />
                
                <strong>📊 Penilaian Lengkap</strong><br />
                🐄 <strong>Hewan:</strong><br />
                {(searchedNearestData.penilaian?.hewan || []).length > 0
                  ? (searchedNearestData.penilaian.hewan.map((item, idx) => (
                    <span key={`hewan-${idx}`} style={{ fontSize: '12px' }}>
                      • {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}) - {item.alasan_skor || 'N/A'}<br />
                    </span>
                  )))
                  : 'Tidak ada data'}<br />
                
                🥬 <strong>Sayuran:</strong><br />
                {(searchedNearestData.penilaian?.sayuran || []).length > 0
                  ? (searchedNearestData.penilaian.sayuran.map((item, idx) => (
                    <span key={`sayuran-${idx}`} style={{ fontSize: '12px' }}>
                      • {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}) - {item.alasan_skor || 'N/A'}<br />
                    </span>
                  )))
                  : 'Tidak ada data'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* --- Marker semua lokasi dengan popup lengkap --- */}
        {allLokasi.filter(r => r.lat != null && r.lon != null).map((r, i) => (
          <Marker key={r.adm4 || `lokasi-${i}`} position={[r.lat, r.lon]} icon={getWeatherIcon(r.weather_icon_url)}>
            <Popup>
              <div className="popup-content-scrollable" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <strong>📍 {r.desa || 'N/A'}, {r.kecamatan || 'N/A'}</strong><br/>
                {r.kotkab || 'N/A'}, {r.provinsi || 'N/A'}
                <br /><br />
                
                <strong>🌡️ Cuaca Saat Ini</strong><br />
                🌡 Suhu: {r.suhu_realtime != null && r.suhu_realtime !== "N/A" ? `${r.suhu_realtime}°C` : 'N/A'}<br />
                💧 Kelembapan: {r.kelembapan_realtime != null && r.kelembapan_realtime !== "N/A" ? `${r.kelembapan_realtime}%` : 'N/A'}<br />
                ☁️ Kondisi: {r.weather_desc || 'Tidak ada data'}<br /><br />
                
                <strong>📅 Suhu Hari Ini</strong><br />
                📊 Rata-rata: {r.suhu_hari_ini?.rata2 != null ? `${r.suhu_hari_ini.rata2}°C` : 'N/A'}<br />
                🔺 Maksimum: {r.suhu_hari_ini?.max != null ? `${r.suhu_hari_ini.max}°C` : 'N/A'}<br />
                🔻 Minimum: {r.suhu_hari_ini?.min != null ? `${r.suhu_hari_ini.min}°C` : 'N/A'}<br /><br />
                
                <strong>📈 Rata-rata Periode</strong><br />
                🌡 Suhu: {r.rata2_suhu != null ? `${r.rata2_suhu}°C` : 'N/A'}<br />
                💧 Kelembapan: {r.rata2_hu != null ? `${r.rata2_hu}%` : 'N/A'}<br /><br />
                
                <strong>✅ Sangat Cocok (Skor ≥ 70)</strong><br />
                🐄 Hewan: {r.pilihan_tepat?.hewan?.length > 0 ? r.pilihan_tepat.hewan.join(', ') : 'Tidak ada'}<br />
                🥬 Sayuran: {r.pilihan_tepat?.sayuran?.length > 0 ? r.pilihan_tepat.sayuran.join(', ') : 'Tidak ada'}<br /><br />
                
                <strong>📊 Penilaian Detail</strong><br />
                🐄 <strong>Hewan:</strong><br />
                {(r.cocok_untuk?.hewan || []).length > 0
                  ? (r.cocok_untuk.hewan.slice(0, 5).map((item, idx) => (
                    <span key={`hewan-${idx}`} style={{ fontSize: '12px' }}>
                      • {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}){item.alasan_skor ? `, ${item.alasan_skor}` : ''}<br />
                    </span>
                  )))
                  : 'Tidak ada data'}<br />
                
                🥬 <strong>Sayuran:</strong><br />
                {(r.cocok_untuk?.sayuran || []).length > 0
                  ? (r.cocok_untuk.sayuran.slice(0, 5).map((item, idx) => (
                    <span key={`sayuran-${idx}`} style={{ fontSize: '12px' }}>
                      • {item.nama || 'N/A'} (Skor: {item.skor ?? 'N/A'}){item.alasan_skor ? `, ${item.alasan_skor}` : ''}<br />
                    </span>
                  )))
                  : 'Tidak ada data'}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* --- Marker semua laporan --- */}
        {allLaporan.filter(lap => lap.lat != null && lap.lon != null).map((lap, idx) => (
          <Marker key={`lap-${lap.waktu}-${idx}`} position={[lap.lat, lap.lon]} icon={greenIcon}>
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <strong>📍 {lap.lokasi || 'Lokasi Tidak Diketahui'}</strong><br/>
                🗑 Kategori: {lap.kategori || '-'}<br/>
                🕒 Waktu: {lap.waktu ? new Date(lap.waktu).toLocaleString('id-ID') : '-'}<br/>
                📞 Kontak: {lap.kontak || '-'}<br/>
                📝 Deskripsi: {lap.deskripsi || '-'}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* --- Marker myLocation dengan nearestData --- */}
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
                  border: 3px solid rgba(0, 255, 0, 0.8);
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
                <div style={{ maxHeight: '300px', overflowY: 'auto', maxWidth: '300px' }}>
                  <strong>📍 Lokasi Kamu Saat Ini</strong><br/>
                  🌍 Koordinat: {myLocation.lat.toFixed(6)}, {myLocation.lon.toFixed(6)}<br/><br/>
                  
                  {isLoading && (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      🔄 Memuat data terdekat...<br/><br/>
                    </div>
                  )}
                  
                  {error && !nearestData && (
                    <div style={{ color: '#e74c3c', fontSize: '12px' }}>
                      ⚠️ {error}<br/><br/>
                    </div>
                  )}
                  
                  {nearestData?.lokasi_terdekat && (
                    <>
                      <strong>🌏 Lokasi Terdekat:</strong><br/>
                      {nearestData.lokasi_terdekat.desa}, {nearestData.lokasi_terdekat.kecamatan}<br/>
                      {nearestData.lokasi_terdekat.kotkab}, {nearestData.lokasi_terdekat.provinsi}<br/><br/>
                      
                      <strong>🌡️ Kondisi Cuaca Saat Ini</strong><br/>
                      🌡 Suhu: {nearestData.lokasi_terdekat.cuaca_saat_ini?.suhu ?? 'N/A'}°C<br/>
                      💧 Kelembapan: {nearestData.lokasi_terdekat.cuaca_saat_ini?.kelembapan ?? 'N/A'}%<br/>
                      ☁️ Cuaca: {nearestData.lokasi_terdekat.cuaca_saat_ini?.cuaca || 'Tidak ada data'}<br/><br/>
                      
                      <strong>✅ Rekomendasi Terbaik (Skor ≥ 70)</strong><br/>
                      🐄 <strong>Hewan:</strong><br/>
                      {(nearestData.penilaian?.hewan || []).filter(h => h.skor >= 70).length > 0
                        ? (
                          <div style={{ fontSize: '12px', marginLeft: '8px' }}>
                            {nearestData.penilaian.hewan
                              .filter(h => h.skor >= 70)
                              .map((h, idx) => (
                                <div key={`hewan-${idx}`}>
                                  • {h.nama} (Skor: {h.skor}) - {h.alasan_skor}
                                </div>
                              ))
                            }
                          </div>
                        )
                        : <span style={{ fontSize: '12px', color: '#666' }}>Tidak ada yang sangat cocok</span>
                      }<br/>
                      
                      🥬 <strong>Sayuran:</strong><br/>
                      {(nearestData.penilaian?.sayuran || []).filter(s => s.skor >= 70).length > 0
                        ? (
                          <div style={{ fontSize: '12px', marginLeft: '8px' }}>
                            {nearestData.penilaian.sayuran
                              .filter(s => s.skor >= 70)
                              .map((s, idx) => (
                                <div key={`sayur-${idx}`}>
                                  • {s.nama} (Skor: {s.skor}) - {s.alasan_skor}
                                </div>
                              ))
                            }
                          </div>
                        )
                        : <span style={{ fontSize: '12px', color: '#666' }}>Tidak ada yang sangat cocok</span>
                      }
                      
                      <br/>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                        💡 Data diambil dari stasiun cuaca terdekat
                      </div>
                    </>
                  )}
                  
                  {!nearestData && !isLoading && !error && (
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      📡 Menunggu data lokasi terdekat...
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      <div className="map-controls-overlay" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }}>
        <motion.button
          onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #4a90e2',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {mapType === 'standard' ? '🛰️ Satelit' : '🗺️ Peta Jalan'}
        </motion.button>
      </div>
      
      {/* Server status indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 1000
      }}>
        🌐 Server: bisakah.pythonanywhere.com
      </div>
    </div>
  );
}