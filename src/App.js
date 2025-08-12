import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ✅ tambahkan ini
import 'leaflet/dist/leaflet.css';

// Import CSS files
import './styles/App.css';
import './styles/MapComponents.css';
import './styles/ProjectDescription.css';

// Import the new components
import MapComponent from './MapComponent';
import ChatbotSidebar from './ChatbotSidebar';
import ReportModal from './ReportModal';
import ProjectDescription from './ProjectDescription';

export default function App() {
    const API = process.env.REACT_APP_BACKEND_URL || '';
// API akan menjadi "https://bisakah.pythonanywhere.com"


    const [showMainApp, setShowMainApp] = useState(false);
    const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);

    const [allLokasi, setAllLokasi] = useState([]);
    const [allLaporan, setAllLaporan] = useState([]);
    const [mapType, setMapType] = useState('standard');
    const [myLocation, setMyLocation] = useState(null);
    const [searchedLocation, setSearchedLocation] = useState(null);

    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
        lokasi: '', kategori: '', deskripsi: '', waktu: '', kontak: '',
        lat: '', lon: '', setuju: false
    });

    const [searchLocationInput, setSearchLocationInput] = useState('');

    const geocodeLocation = async (locationName) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: locationName,
                    format: 'json',
                    limit: 1,
                    countrycodes: 'id'
                }
            });

            if (response.data && response.data.length > 0) {
                const { lat, lon, display_name } = response.data[0];
                return { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name };
            }
            return null;
        } catch (error) {
            console.error('Error geocoding location:', error);
            return null;
        }
    };

    useEffect(() => {
        if (!showMainApp) return;

        const fetchAllLokasi = async () => {
            try {
                const res = await axios.get(`${API}/api/all`);
                setAllLokasi(res.data.lokasi || []);
            } catch (e) {
                console.error('Gagal fetch lokasi:', e);
                setChatHistory(prev => [...prev, { type: 'bot', text: "offline" }]);
            }
        };

        fetchAllLokasi();
        const interval = setInterval(fetchAllLokasi, 10000);
        return () => clearInterval(interval);
    }, [showMainApp, API]);

    useEffect(() => {
        if (!showMainApp) return;

        const fetchAllLaporan = async () => {
            try {
                const res = await axios.get(`${API}/api/all_laporan`);
                setAllLaporan(res.data.laporan || []);
            } catch (e) {
                console.error('Gagal fetch laporan:', e);
            }
        };

        fetchAllLaporan();
        const interval = setInterval(fetchAllLaporan, 10000);
        return () => clearInterval(interval);
    }, [showMainApp, API]);

    const handleFindMe = useCallback((isBotInitiated = false) => {
        if ("geolocation" in navigator) {
            setChatLoading(true);
            if (!isBotInitiated) {
                setChatHistory(prev => [...prev, { type: 'user', text: "Temukan lokasi saya." }]);
            }

            navigator.geolocation.getCurrentPosition(
                pos => {
                    const userLat = pos.coords.latitude;
                    const userLon = pos.coords.longitude;
                    setMyLocation({ lat: userLat, lon: userLon });
                    setSearchedLocation(null);
                    setChatHistory(prev => [...prev, { type: 'bot', text: "📍 Lokasi kamu sudah ditemukan!" }]);
                    setChatLoading(false);
                },
                err => {
                    console.error("Gagal mengambil lokasi:", err);
                    setChatHistory(prev => [...prev, { type: 'bot', text: "❌ Gagal mengambil lokasi. Pastikan izin lokasi diberikan." }]);
                    setChatLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setChatHistory(prev => [...prev, { type: 'bot', text: "Peramban Anda tidak mendukung geolokasi." }]);
            setChatLoading(false);
        }
    }, []);

    const handleStartApp = () => {
        setShowWelcomeOverlay(true);
        setTimeout(() => {
            setShowWelcomeOverlay(false);
            setShowMainApp(true);
        }, 2000);
    };

    const initialMapCenter = [-2, 118];
    const initialMapZoom = 5;

    return (
        <BrowserRouter> {/* ✅ tambahkan wrapper Router */}
            <AnimatePresence>
                {showWelcomeOverlay && (
                    <motion.div
                        className="welcome-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="welcome-overlay-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        ></motion.div>

                        <motion.div
                            className="welcome-message"
                            initial={{ scale: 0.7, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: -50 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                duration: 1.0
                            }}
                        >
                            Selamat Datang di Wargabantuin
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Routes> {/* ✅ tambahkan ini */}
                <Route path="/" element={
                    <>
                        <div className={`main-container ${showWelcomeOverlay ? 'blur-background' : ''}`}>
                            <ChatbotSidebar
                                showMainApp={showMainApp}
                                showWelcomeOverlay={showWelcomeOverlay}
                                chatInput={chatInput}
                                setChatInput={setChatInput}
                                chatHistory={chatHistory}
                                setChatHistory={setChatHistory}
                                chatLoading={chatLoading}
                                setChatLoading={setChatLoading}
                                handleFindMe={handleFindMe}
                                geocodeLocation={geocodeLocation}
                                setSearchedLocation={setSearchedLocation}
                                setMyLocation={setMyLocation}
                                searchLocationInput={searchLocationInput}
                                setSearchLocationInput={setSearchLocationInput}
                                setShowReportModal={setShowReportModal}
                                handleStartApp={handleStartApp}
                            />

                            <div className="right-content">
                                {!showMainApp ? (
                                    <ProjectDescription />
                                ) : (
                                    <MapComponent
                                        myLocation={myLocation}
                                        searchedLocation={searchedLocation}
                                        allLokasi={allLokasi}
                                        allLaporan={allLaporan}
                                        mapType={mapType}
                                        setMapType={setMapType}
                                        initialMapCenter={initialMapCenter}
                                        initialMapZoom={initialMapZoom}
                                    />
                                )}
                            </div>
                        </div>

                        <ReportModal
                            showReportModal={showReportModal}
                            setShowReportModal={setShowReportModal}
                            reportData={reportData}
                            setReportData={setReportData}
                            geocodeLocation={geocodeLocation}
                            initialMapCenter={initialMapCenter}
                            setAllLaporan={setAllLaporan}
                        />
                    </>
                } />
              <Route 
  path="/map" 
  element={
    <MapComponent
      myLocation={myLocation}
      searchedLocation={searchedLocation}
      allLokasi={allLokasi}
      allLaporan={allLaporan}
      mapType={mapType}
      setMapType={setMapType}
      initialMapCenter={initialMapCenter}
      initialMapZoom={initialMapZoom}
    />
  }
/>

                <Route path="/description" element={<ProjectDescription />} />
                <Route path="/logout" element={<div style={{ padding: '2rem' }}>✅ Kamu sudah logout.</div>} />
            </Routes>
        </BrowserRouter>
    );
}
