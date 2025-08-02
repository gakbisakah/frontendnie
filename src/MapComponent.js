import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';

import { MapController } from './MapController'; // Import MapController from its new file

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
  // Custom Icon untuk Marker Leaflet - default blue icon
  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });
  const yellowIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
  const greenIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

  // Function to get dynamic weather icon
  const getWeatherIcon = (iconUrl) => {
    if (iconUrl) {
      return new L.Icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
        iconSize: [40, 40], // Adjust size as needed for weather icons
        iconAnchor: [20, 40], // Adjust anchor point
        popupAnchor: [0, -40], // Adjust popup anchor
        shadowSize: [41, 41]
      });
    }
    return blueIcon; // Fallback to default blue icon if no specific weather icon
  };

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
          ? <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
          : <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />}

        {searchedLocation && (
          <Marker position={[searchedLocation.lat, searchedLocation.lon]} icon={yellowIcon}>
            <Popup>📍 Lokasi yang Anda cari: {searchedLocation.name || 'Lokasi Ditemukan'}</Popup>
          </Marker>
        )}

    {allLokasi.filter(r => r.lat != null && r.lon != null).map((r, i) => (
  <Marker
    key={r.adm4 || `lokasi-${i}`}
    position={[r.lat, r.lon]}
    icon={getWeatherIcon(r.weather_icon_url)}
  >
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

     
        📊Periode Rata-rata (mingguan/bulanan):<br></br>
        🌡 Suhu rata-rata periode: {r.rata2_suhu != null ? `${r.rata2_suhu}°C` : 'N/A'}<br />
        💧 Kelembapan rata-rata periode: {r.rata2_hu != null ? `${r.rata2_hu}%` : 'N/A'}<br /><br />

        🐄 Rekomendasi Hewan<br></br>
          ✅ Sangat Cocok (Skor diatas 70 ) <br />
        {r.pilihan_tepat?.hewan?.length > 0
          ? <> {r.pilihan_tepat.hewan.join(', ')}<br /></>
          : '🐄 Hewan: Tidak ada data'}<br />
                 

            🥬 Rekomendasi Sayuran<br></br>
           ✅ Sangat Cocok (Skor diatas 70 ) <br />
        {r.pilihan_tepat?.sayuran?.length > 0
          ? <>{r.pilihan_tepat.sayuran.join(', ')}<br /></>
          : '🥬 Sayuran: Tidak ada data'}<br /><br />

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
          : 'Tidak ada'}<br />
      </div>
    </Popup>
  </Marker>
))}


        {allLaporan.filter(lap => lap.lat != null && lap.lon != null).map((lap, idx) => (
          <Marker key={`lap-${lap.waktu}-${idx}`} position={[lap.lat, lap.lon]} icon={greenIcon}>
            <Popup>
              📍 <b>{lap.lokasi || 'Lokasi Tidak Diketahui'}</b><br />
              🗑 Kategori: {lap.kategori || '-'}<br />
              🕒 Waktu: {new Date(lap.waktu).toLocaleString()}<br />
              📞 Kontak: {lap.kontak || '-'}<br />
              📝 Deskripsi: {lap.deskripsi || '-'}
            </Popup>
          </Marker>
        ))}

        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lon]} icon={yellowIcon}>
            <Popup>📍 Ini lokasi kamu sekarang</Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="map-controls-overlay">
        <motion.button className="toggle-map-button"
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