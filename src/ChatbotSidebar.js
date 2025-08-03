import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown'; // Impor yang benar
import './styles/ChatbotSidebar.css';

// Component untuk merender pesan chat
const ChatMessage = ({ type, text }) => {
    if (type === 'bot') {
        return (
            <div className={`chat-msg ${type}`}>
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        );
    }
    return (
        <div className={`chat-msg ${type}`}>
            {text}
        </div>
    );
};

export default function ChatbotSidebar({
    showMainApp,
    showWelcomeOverlay,
    chatInput,
    setChatInput,
    chatHistory,
    setChatHistory,
    chatLoading,
    setChatLoading,
    handleFindMe,
    geocodeLocation,
    setSearchedLocation,
    setMyLocation,
    searchLocationInput,
    setSearchLocationInput,
    setShowReportModal,
    handleStartApp
}) {
    const chatBodyRef = useRef(null);
    const [showQuickSearchSuggestions, setShowQuickSearchSuggestions] = useState(true);

const quickSearchSuggestions = [
  "Dimana letak [nama_lokasi]",
  "Di mana posisi [nama_lokasi]",
  "Lokasi [nama_lokasi]",
  "Koordinat [nama lokasi]",
  "Posisi [nama lokasi]",
  "Data provinsi apa saja yang tersedia",
  "Data kota/kotkab apa saja yang tersedia",
  "Kecamatan apa saja yang tersedia",
  "Desa apa saja yang tersedia",
  "Bagaimana cuaca di [nama lokasi]",
  "Cuaca saat ini di [nama lokasi]",
  "Suhu tertinggi di [nama lokasi]",
  "Suhu maksimum di [nama lokasi]",
  "Suhu max... di [nama lokasi]",
  "Suhu terendah di [nama lokasi]",
  "Suhu minimum di [nama lokasi]",
  "Suhu min... di [nama lokasi]",
  "Kelembapan di [nama lokasi]",
  "Kelembapan saat ini di [nama lokasi]",
  "Ringkasan cuaca di [nama lokasi]",
  "Summary cuaca [nama lokasi]",
  "Cuaca dominan hari ini di [nama lokasi]",
  "Desa mana saja di [nama provinsi] yang cuacanya cerah hari ini",
  "Kecamatan mana saja yang cuaca dominannya mendung hari ini",
  "Berapa suhu rata-rata di [nama kabupaten] hari ini",
  "Bagaimana suhu maksimum, minimum, rata-rata, dan kelembapan rata-rata di [nama lokasi]",
  "Suhu tertinggi dan terendah di [nama lokasi] berapa?",
  "Suhu maksimum hari ini di [nama kota/kabupaten] berapa?",
  "Kelembapan rata-rata harian di [nama desa] berapa?",
  "Desa mana saja di [nama provinsi] yang suhunya paling rendah hari ini",
  "Desa mana saja yang suhu maksimumnya paling tinggi hari ini",
  "Kabupaten mana yang kelembapan rata-ratanya paling rendah",
  "Apa saja hewan yang dapat dicek",
  "Apa saja hewan yang bisa dicek",
  "Daftar hewan",
  "Daftar sayuran",
  "Sayuran apa saja",
  "Apakah suhu saat ini di [nama lokasi] cocok untuk [nama hewan]",
  "Hewan apa saja yang cocok diternak di [nama lokasi] berdasarkan suhu rata-rata harian dan kelembapan rata-rata",
  "Hewan apa saja yang cocok dipelihara di [nama lokasi] berdasarkan suhu rata-rata harian dan kelembapan rata-rata",
  "Lokasi mana saja yang kelembapannya sesuai untuk [nama hewan]",
 
 
 

];


    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        const userMessage = chatInput.trim();
        if (!userMessage) return;

        if (userMessage.toLowerCase() === "clear chat" || userMessage.toLowerCase() === "hapus chat") {
            handleClearChat();
            setChatInput('');
            return;
        }

        setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
        setChatInput('');
        setShowQuickSearchSuggestions(true);
        setChatLoading(true);

        try {
            if (userMessage.toLowerCase().includes("lokasi saya") || userMessage.toLowerCase().includes("temukan saya")) {
                handleFindMe(true);
            }

            const res = await axios.post('/api/chatbot', { keyword: userMessage });
            const botResponseText = res.data.jawaban;

            setChatHistory(prev => [...prev, { type: 'bot', text: botResponseText }]);

        } catch (error) {
            console.error('Error fetching chatbot response:', error);
            setChatHistory(prev => [...prev, { type: 'bot', text: "Maaf, terjadi kesalahan saat berkomunikasi dengan chatbot. Mohon coba lagi nanti." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleFindLocationDirectly = async (e) => {
        e.preventDefault();
        if (searchLocationInput.trim() === '') return;

        const locationToSearch = searchLocationInput.trim();
        setChatHistory(prev => [...prev, { type: 'user', text: `Mencari lokasi: ${locationToSearch}` }]);
        setSearchLocationInput('');
        setChatLoading(true);

        try {
            const geoResult = await geocodeLocation(locationToSearch);
            if (geoResult) {
                setSearchedLocation(geoResult);
                setMyLocation(null);
                setChatHistory(prev => [...prev, { type: 'bot', text: `📍 Lokasi "${geoResult.name}" ditemukan. (Lat: ${geoResult.lat.toFixed(4)}, Lon: ${geoResult.lon.toFixed(4)})` }]);
            } else {
                setChatHistory(prev => [...prev, { type: 'bot', text: `❌ Lokasi "${locationToSearch}" tidak ditemukan. Coba nama lokasi yang lebih spesifik.` }]);
            }
        } catch (error) {
            console.error('Error geocoding location:', error);
            setChatHistory(prev => [...prev, { type: 'bot', text: "Terjadi kesalahan saat mencari lokasi. Mohon coba lagi." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        setChatInput('');
        setSearchLocationInput('');
        setChatLoading(false);
        setSearchedLocation(null);
        setMyLocation(null);
        setShowQuickSearchSuggestions(true);
    };

    const handleQuickSearchClick = (suggestion) => {
        setChatInput(suggestion);
        setShowQuickSearchSuggestions(false);
    };

    return (
        <motion.div
            className={`sidebar ${!showMainApp ? 'start-screen-chatbot-wrapper' : 'main-sidebar-active'}`}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: showWelcomeOverlay ? 'none' : 'flex' }}
        >
            <div className="chat-header">
                <h1 className="app-title">Wargabantuin</h1>
                {showMainApp && (
                    <div className="header-buttons">
                        <motion.button
                            onClick={() => setShowReportModal(true)}
                            className="report-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📝 Buat Laporan
                        </motion.button>
                        <motion.button
                            onClick={() => handleFindMe()}
                            className="find-me-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📍 Temukan Saya
                        </motion.button>
                        <motion.button
                            onClick={handleClearChat}
                            className="clear-chat-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🧹 Hapus Chat
                        </motion.button>
                    </div>
                )}
            </div>

            {showMainApp && (
                <form onSubmit={handleFindLocationDirectly} className="location-search-area">
                    <input
                        type="text"
                        placeholder="Cari lokasi (contoh: Binjai, Jakarta)..."
                        value={searchLocationInput}
                        onChange={(e) => setSearchLocationInput(e.target.value)}
                        disabled={chatLoading || showWelcomeOverlay}
                    />
                    <motion.button
                        type="submit"
                        disabled={chatLoading || showWelcomeOverlay}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Temukan
                    </motion.button>
                </form>
            )}

            <div className="chat-body" ref={chatBodyRef}>
                {chatHistory.map((msg, index) => (
                    <ChatMessage key={index} type={msg.type} text={msg.text} />
                ))}
                {chatLoading && <div className="chat-msg bot loading">⏳ AI sedang menjawab...</div>}
            </div>

            {showQuickSearchSuggestions && chatInput.trim() === '' && (
                <div className="quick-search-suggestions">
                    {quickSearchSuggestions.map((suggestion, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleQuickSearchClick(suggestion)}
                            className="quick-search-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={chatLoading || showWelcomeOverlay}
                        >
                            {suggestion}
                        </motion.button>
                    ))}
                </div>
            )}

            <form onSubmit={handleChatSubmit} className="chat-input-area">
                <input
                    type="text"
                    placeholder="Tanya apa saja..."
                    value={chatInput}
                    onChange={(e) => {
                        setChatInput(e.target.value);
                        if (e.target.value.trim() === '') {
                            setShowQuickSearchSuggestions(true);
                        } else {
                            setShowQuickSearchSuggestions(false);
                        }
                    }}
                    disabled={chatLoading || showWelcomeOverlay}
                />
                <motion.button
                    type="submit"
                    disabled={chatLoading || showWelcomeOverlay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Kirim
                </motion.button>
            </form>

            {!showMainApp && (
                <motion.button
                    className="start-button-in-sidebar"
                    onClick={handleStartApp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={chatLoading || showWelcomeOverlay}
                >
                    Masuk
                </motion.button>
            )}
        </motion.div>
    );
}