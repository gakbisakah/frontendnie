import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapController } from './MapController'; // pastikan file ada

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
  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });
  const yellowIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png' });
  const greenIcon = new L.Icon({ ...blueIcon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

  const getWeatherIcon = (iconUrl) => {
    if (iconUrl) {
      return new L.Icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
        iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40], shadowSize: [41, 41]
      });
    }
    return blueIcon;
  };

  const [nearestData, setNearestData] = useState(null);
  const [searchedNearestData, setSearchedNearestData] = useState(null);

  useEffect(() => {
    if (myLocation) {
      const fetchNearest = async () => {
        try {
          const res = await fetch(`/api/nearest-location?lat=${myLocation.lat}&lon=${myLocation.lon}`);
          const data = await res.json();
          setNearestData(data);
        } catch (error) {
          console.error('❌ Error fetching nearest location for myLocation:', error);
        }
      };
      fetchNearest();
    }
  }, [myLocation]);

  useEffect(() => {
    if (searchedLocation) {
      const fetchSearchedNearest = async () => {
        try {
          const res = await fetch(`/api/nearest-location?lat=${searchedLocation.lat}&lon=${searchedLocation.lon}`);
          const data = await res.json();
          setSearchedNearestData(data);
        } catch (error) {
          console.error('❌ Error fetching nearest location for searchedLocation:', error);
        }
      };
      fetchSearchedNearest();
    }
  }, [searchedLocation]);

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

        {mapType === 'standard' ?
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' /> :
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri' />
        }

        {searchedLocation && searchedNearestData && (
          <Marker position={[searchedLocation.lat, searchedLocation.lon]} icon={blueIcon}>
            <Popup>
              <div className="popup-content-scrollable" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                Lokasi terdekat: {searchedNearestData.lokasi_terdekat?.desa || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kecamatan || 'N/A'}, {searchedNearestData.lokasi_terdekat?.kotkab || 'N/A'}, {searchedNearestData.lokasi_terdekat?.provinsi || 'N/A'}<br /><br />
                <b>Data Cuaca</b><br />
                🌡 Suhu: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.suhu ?? 'N/A'}°C<br />
                💧 Kelembapan: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.kelembapan ?? 'N/A'}%<br />
                ☁️ Cuaca: {searchedNearestData.lokasi_terdekat?.cuaca_saat_ini?.cuaca || 'Tidak ada data'}<br /><br />
                <b>Rekomendasi Hewan:</b> {searchedNearestData.rekomendasi?.hewan?.join(', ') || 'Tidak ada data'}<br />
                <b>Rekomendasi Sayuran:</b> {searchedNearestData.rekomendasi?.sayuran?.join(', ') || 'Tidak ada data'}
              </div>
            </Popup>
          </Marker>
        )}

        {allLokasi.filter(r => r.lat && r.lon).map((r, i) => (
          <Marker key={r.adm4 || `lokasi-${i}`} position={[r.lat, r.lon]} icon={getWeatherIcon(r.weather_icon_url)}>
            <Popup>
              <div className="popup-content-scrollable">
                📍 Lokasi: {r.desa || 'N/A'}, {r.kecamatan || 'N/A'}, {r.kotkab || 'N/A'}, {r.provinsi || 'N/A'}<br /><br />
                🌡 Suhu: {r.suhu_realtime ?? 'N/A'}°C<br />
                💧 Kelembapan: {r.kelembapan_realtime ?? 'N/A'}%<br />
                ☁️ Cuaca: {r.weather_desc || 'Tidak ada data'}
              </div>
            </Popup>
          </Marker>
        ))}

        {allLaporan.filter(lap => lap.lat && lap.lon).map((lap, idx) => (
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
          <Marker position={[myLocation.lat, myLocation.lon]} icon={yellowIcon}>
            <Popup>
              📍 Ini lokasi kamu sekarang<br/>
              Latitude: {myLocation.lat}<br/>
              Longitude: {myLocation.lon}<br/>
            </Popup>
          </Marker>
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