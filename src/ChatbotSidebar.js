import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import './styles/ChatbotSidebar.css';

// Component untuk merender pesan chat
const ChatMessage = ({ type, text, isTyping }) => {
    if (type === 'bot') {
        return (
            <div className={`chat-msg ${type} ${isTyping ? 'typing' : ''}`}>
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
    handleStartApp,
    myLocation
}) {
    const chatBodyRef = useRef(null);
    const [showQuickSearchSuggestions, setShowQuickSearchSuggestions] = useState(true);
    const [botResponseText, setBotResponseText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

    const quickSearchSuggestions = [
        "Data provinsi apa saja yang tersedia",
        "Data kota/kotkab apa saja yang tersedia",
        "Kecamatan apa saja yang tersedia",
        "Desa apa saja yang tersedia",
        "Apa saja hewan yang dapat dicek",
        "Daftar sayuran",
        "[Nama Hewan] cocok di mana?",
        "[Nama Sayuran] cocok di mana?",
        "Dimana letak [nama_lokasi]",
        "Di mana posisi [nama_lokasi]",
        "Koordinat [nama lokasi]",
        "Bagaimana cuaca di [nama lokasi]",
        "Suhu tertinggi di [nama lokasi]",
        "Suhu terendah di [nama lokasi]",
        "Kelembapan di [nama lokasi]",
        "Ringkasan cuaca di [nama lokasi]",
    ];

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory, botResponseText]);

    // Handle typing animation
    useEffect(() => {
        if (!botResponseText) return;

        let i = 0;
        let displayedText = '';
        setIsTyping(true);

        const typingInterval = setInterval(() => {
            if (i < botResponseText.length) {
                displayedText += botResponseText.charAt(i);
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    // Find the last message and update it
                    if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'bot') {
                        newHistory[newHistory.length - 1].text = displayedText;
                    } else {
                        newHistory.push({ type: 'bot', text: displayedText });
                    }
                    return newHistory;
                });
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
                setBotResponseText(''); // Reset typing text
            }
        }, 30); // Kecepatan mengetik

        return () => clearInterval(typingInterval);
    }, [botResponseText, setChatHistory]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        const userMessage = chatInput.trim();
        if (!userMessage || isTyping) return;

        if (userMessage.toLowerCase() === "clear chat" || userMessage.toLowerCase() === "hapus chat") {
            handleClearChat();
            setChatInput('');
            return;
        }

        setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
        setChatInput('');
        setChatLoading(true);

        // Add a temporary bot message to the history for the typing animation
        setChatHistory(prev => [...prev, { type: 'bot', text: '' }]);

        try {
            let responseText = '';
            if (userMessage.toLowerCase().includes("lokasi saya") || userMessage.toLowerCase().includes("temukan saya")) {
                const location = await handleFindMe(true);
                if (location) {
                    const res = await axios.get(`https://bisakah.pythonanywhere.com/api/nearest-location?lat=${location.lat}&lon=${location.lon}`);
                    const nearestLocationData = res.data.lokasi_terdekat;
                    const penilaianHewan = res.data.penilaian.hewan;
                    const penilaianSayuran = res.data.penilaian.sayuran;

                    responseText = `**📍 Lokasi Terdekat dari posisi Anda: ${nearestLocationData.nama || 'Tidak diketahui'}**
- **Provinsi:** ${nearestLocationData.provinsi || 'Tidak diketahui'}
- **Kota/Kabupaten:** ${nearestLocationData.kotakab || 'Tidak diketahui'}
- **Kecamatan:** ${nearestLocationData.kecamatan || 'Tidak diketahui'}
- **Desa:** ${nearestLocationData.desa || 'Tidak diketahui'}

---

**🌱 5 Rekomendasi Hewan Teratas:**
${penilaianHewan.length > 0
    ? penilaianHewan.slice(0, 5).map(item => `- **${item.nama || 'Tidak diketahui'}** (Skor: ${item.skor || 0}) - *${item.alasan_skor || 'Tidak ada alasan'}*`).join('\n')
    : "Tidak ada rekomendasi hewan yang cocok."
}

---

**🌿 5 Rekomendasi Sayuran Teratas:**
${penilaianSayuran.length > 0
    ? penilaianSayuran.slice(0, 5).map(item => `- **${item.nama || 'Tidak diketahui'}** (Skor: ${item.skor || 0}) - *${item.alasan_skor || 'Tidak ada alasan'}*`).join('\n')
    : "Tidak ada rekomendasi sayuran yang cocok."
}
`;
                } else {
                    responseText = "❌ Gagal menemukan lokasi Anda. Pastikan layanan lokasi diaktifkan.";
                }
            } else {
                const res = await axios.post('https://bisakah.pythonanywhere.com/api/chatbot', { keyword: userMessage });
                responseText = res.data.jawaban;
            }

            setBotResponseText(responseText);
        } catch (error) {
            console.error('Error fetching chatbot response or nearest location:', error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory.pop(); // Hapus pesan bot kosong
                newHistory.push({ type: 'bot', text: "Maaf, terjadi kesalahan saat berkomunikasi. Mohon coba lagi nanti." });
                return newHistory;
            });
        } finally {
            setChatLoading(false);
        }
    };

    const handleFindLocationDirectly = async (e) => {
        e.preventDefault();
        if (searchLocationInput.trim() === '' || isTyping) return;

        const locationToSearch = searchLocationInput.trim();
        setChatHistory(prev => [...prev, { type: 'user', text: `Mencari lokasi: ${locationToSearch}` }]);
        setSearchLocationInput('');
        setChatLoading(true);

        // Buat pesan bot sementara untuk animasi
        setChatHistory(prev => [...prev, { type: 'bot', text: '' }]);

        try {
            // Panggil API baru untuk mendapatkan semua lokasi
            const res = await axios.get(`https://bisakah.pythonanywhere.com/api/all`);
            
            const allLocations = res.data.lokasi || [];
            
            let responseText = '';
            if (allLocations.length > 0) {
                responseText = `**📍 Daftar Lokasi yang Tersedia:**\n\n`;
                allLocations.forEach((loc, index) => {
                    const {
                        desa,
                        kecamatan,
                        kotakab,
                        provinsi,
                        suhu_realtime,
                        kelembapan_realtime,
                        weather_desc,
                        suhu_hari_ini,
                        rata2_suhu,
                        rata2_hu,
                        pilihan_tepat,
                        cocok_untuk
                    } = loc;

                    responseText += `---
### ${index + 1}. **${desa || 'N/A'}, ${kecamatan || 'N/A'}, ${kotakab || 'N/A'}, ${provinsi || 'N/A'}**
🌡 Suhu Saat Ini: ${suhu_realtime != null ? `${suhu_realtime}°C` : 'N/A'}
💧 Kelembapan Saat Ini: ${kelembapan_realtime != null ? `${kelembapan_realtime}%` : 'N/A'}
☁️ Kondisi Cuaca: ${weather_desc || 'Tidak ada data'}

📅 Suhu Hari Ini:
- Rata-rata: ${suhu_hari_ini?.rata2 != null ? `${suhu_hari_ini.rata2}°C` : 'N/A'}
- Maksimum: ${suhu_hari_ini?.max != null ? `${suhu_hari_ini.max}°C` : 'N/A'}
- Minimum: ${suhu_hari_ini?.min != null ? `${suhu_hari_ini.min}°C` : 'N/A'}

📊Periode Rata-rata (2 hari kedepan):
🌡 Suhu rata-rata periode: ${rata2_suhu != null ? `${rata2_suhu}°C` : 'N/A'}
💧 Kelembapan rata-rata periode: ${rata2_hu != null ? `${rata2_hu}%` : 'N/A'}

🐄 Rekomendasi Hewan (Skor > 70):
${pilihan_tepat?.hewan?.length > 0 ? pilihan_tepat.hewan.join(', ') : 'Tidak ada data'}
🥬 Rekomendasi Sayuran (Skor > 70):
${pilihan_tepat?.sayuran?.length > 0 ? pilihan_tepat.sayuran.join(', ') : 'Tidak ada data'}

**Penilaian:**
🐄 Hewan:
${(cocok_untuk?.hewan || []).length > 0
    ? cocok_untuk.hewan.map(item => `- ${item.nama || 'N/A'} (Skor: ${item.skor ?? 'N/A'}, ${item.alasan_skor || ''})`).join('\n')
    : 'Tidak ada'}
🥬 Sayuran:
${(cocok_untuk?.sayuran || []).length > 0
    ? cocok_untuk.sayuran.map(item => `- ${item.nama || 'N/A'} (Skor: ${item.skor ?? 'N/A'}, ${item.alasan_skor || ''})`).join('\n')
    : 'Tidak ada'}
---
`;
                });
            } else {
                responseText = `❌ Tidak ada data lokasi yang tersedia.`;
            }
                
            setBotResponseText(responseText);

        } catch (error) {
            console.error('Error fetching all locations:', error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory.pop(); // Hapus pesan bot kosong
                newHistory.push({ type: 'bot', text: "Terjadi kesalahan saat mengambil data lokasi. Mohon coba lagi." });
                return newHistory;
            });
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
        setBotResponseText('');
        setIsTyping(false);
    };

    const handleQuickSearchClick = (suggestion) => {
        setChatInput(suggestion);
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
                        <motion.button
                            onClick={() => navigate("/map")}
                            className="report-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🗺️ Wargabantuin Peta
                        </motion.button>
                        <motion.button
                            onClick={() => navigate("/description")}
                            className="report-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📄 Wargabantuin Tentang
                        </motion.button>
                        <motion.button
                            onClick={() => navigate("/logout")}
                            className="exit-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🚪 Keluar
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
                        disabled={chatLoading || isTyping || showWelcomeOverlay}
                    />
                    <motion.button
                        type="submit"
                        disabled={chatLoading || isTyping || showWelcomeOverlay}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Temukan
                    </motion.button>
                </form>
            )}

            <div className="chat-body" ref={chatBodyRef}>
                {chatHistory.map((msg, index) => (
                    <ChatMessage
                        key={index}
                        type={msg.type}
                        text={msg.text}
                        isTyping={index === chatHistory.length - 1 && isTyping}
                    />
                ))}
                {chatLoading && <div className="chat-msg bot loading">⏳ AI sedang menjawab...</div>}
            </div>

            <div className="quick-search-suggestions">
                {quickSearchSuggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        onClick={() => handleQuickSearchClick(suggestion)}
                        className="quick-search-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={chatLoading || isTyping || showWelcomeOverlay}
                    >
                        {suggestion}
                    </motion.button>
                ))}
            </div>

            <form onSubmit={handleChatSubmit} className="chat-input-area">
                <input
                    type="text"
                    placeholder="Tanya apa saja..."
                    value={chatInput}
                    onChange={(e) => {
                        setChatInput(e.target.value);
                    }}
                    disabled={chatLoading || isTyping || showWelcomeOverlay}
                />
                <motion.button
                    type="submit"
                    disabled={chatLoading || isTyping || showWelcomeOverlay}
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
                    disabled={chatLoading || isTyping || showWelcomeOverlay}
                >
                    Masuk
                </motion.button>
            )}
        </motion.div>
    );
}

