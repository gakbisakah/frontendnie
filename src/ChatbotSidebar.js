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
        // NOTE: The line below was removed to keep suggestions visible
        // setShowQuickSearchSuggestions(false); 
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
                    const rekomendasiHewan = res.data.rekomendasi.hewan.join(', ') || 'Tidak ada';
                    const rekomendasiSayuran = res.data.rekomendasi.sayuran.join(', ') || 'Tidak ada';

                    responseText = `**📍 Lokasi Terdekat dari posisi Anda:**
- **Nama Lokasi:** ${nearestLocationData.nama}
- **Provinsi:** ${nearestLocationData.provinsi}
- **Kota/Kabupaten:** ${nearestLocationData.kotakab}
- **Kecamatan:** ${nearestLocationData.kecamatan}
- **Desa:** ${nearestLocationData.desa}

**🌱 Rekomendasi Pertanian:**
- **Hewan:** ${rekomendasiHewan}
- **Sayuran:** ${rekomendasiSayuran}
`;
                } else {
                    responseText = "❌ Gagal menemukan lokasi Anda. Pastikan layanan lokasi diaktifkan.";
                }
            } else {
                const res = await axios.post('https://bisakah.pythonanywhere.com/api/chatbot', { keyword: userMessage });
                responseText = res.data.jawaban;
            }

            // Set the full response text to trigger the typing effect
            setBotResponseText(responseText);
        } catch (error) {
            console.error('Error fetching chatbot response or nearest location:', error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                // Remove the last empty bot message and add the error message
                newHistory.pop();
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

        try {
            const geoResult = await geocodeLocation(locationToSearch);
            if (geoResult) {
                setSearchedLocation(geoResult);
                setMyLocation(null);

                // Buat pesan bot sementara untuk animasi
                setChatHistory(prev => [...prev, { type: 'bot', text: '' }]);

                const res = await axios.get(`https://bisakah.pythonanywhere.com/api/nearest-location?lat=${geoResult.lat}&lon=${geoResult.lon}`);
                
                const nearestLocationData = res.data.lokasi_terdekat;
                // Mengambil data penilaian dari respons API
                const penilaianHewan = res.data.penilaian.hewan;
                const penilaianSayuran = res.data.penilaian.sayuran;

                // Membentuk teks respons yang lebih detail
                let responseText = `**📍 Lokasi "${nearestLocationData.nama}" ditemukan!**
- **Provinsi:** ${nearestLocationData.provinsi}
- **Kota/Kabupaten:** ${nearestLocationData.kotakab}
- **Kecamatan:** ${nearestLocationData.kecamatan}
- **Desa:** ${nearestLocationData.desa}

---

**🌱 5 Rekomendasi Hewan Teratas:**
${penilaianHewan.length > 0
    ? penilaianHewan.slice(0, 5).map(item => `- **${item.nama}** (Skor: ${item.skor}) - *${item.alasan_skor}*`).join('\n')
    : "Tidak ada rekomendasi hewan yang cocok."
}

---

**🌿 5 Rekomendasi Sayuran Teratas:**
${penilaianSayuran.length > 0
    ? penilaianSayuran.slice(0, 5).map(item => `- **${item.nama}** (Skor: ${item.skor}) - *${item.alasan_skor}*`).join('\n')
    : "Tidak ada rekomendasi sayuran yang cocok."
}
`;
                
                // Menggunakan setBotResponseText untuk memicu efek mengetik
                setBotResponseText(responseText);

            } else {
                const responseText = `❌ Lokasi "${locationToSearch}" tidak ditemukan. Coba nama lokasi yang lebih spesifik.`;
                setChatHistory(prev => [...prev, { type: 'bot', text: responseText }]);
            }
        } catch (error) {
            console.error('Error geocoding location or fetching nearest location:', error);
            // Hapus pesan bot kosong sementara jika ada
            setChatHistory(prev => {
                const newHistory = [...prev];
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'bot' && newHistory[newHistory.length - 1].text === '') {
                    newHistory.pop();
                }
                newHistory.push({ type: 'bot', text: "Terjadi kesalahan saat mencari lokasi atau mengambil data. Mohon coba lagi." });
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
        // NOTE: The line below was removed to keep suggestions visible
        // setShowQuickSearchSuggestions(false);
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

            {/* Always show quick search suggestions */}
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