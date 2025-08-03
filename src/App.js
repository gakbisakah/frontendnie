import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Import CSS files
import './styles/App.css';
import './styles/MapComponents.css';
import './styles/ProjectDescription.css';
// Pastikan ChatbotSidebar.css diimpor di dalam ChatbotSidebar.js itu sendiri.

// Import the new components
import MapComponent from './MapComponent';
import ChatbotSidebar from './ChatbotSidebar';
import ReportModal from './ReportModal';
import ProjectDescription from './ProjectDescription';

export default function App() {
    const API = process.env.REACT_APP_BACKEND_URL || '';

    // State baru untuk mengontrol visibilitas sidebar di mobile
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

    // Fungsi untuk menggeser sidebar (digunakan oleh tombol)
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <>
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

            {/* Kontainer utama aplikasi */}
            <div className={`main-container ${showWelcomeOverlay ? 'blur-background' : ''}`}>
                {/* Pembungkus (wrapper) sidebar dengan properti transform untuk animasi geser */}
                <div 
                    className="sidebar-wrapper" 
                    style={{ transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)' }}
                >
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
                </div>

                {/* Konten kanan (peta) */}
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

            {/* Tombol yang hanya muncul di tampilan mobile */}
            {/* KODE BARU */}
            <button 
                className={`toggle-map-button ${isSidebarVisible ? '' : 'hidden'}`}
                onClick={toggleSidebar}
            >
                &gt;
            </button>
            {/* AKHIR KODE BARU */}

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
    );
}