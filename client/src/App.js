import React, { useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Chat from './components/Chat';
import Channel from './components/Channel';
import Profile from './components/Profile';
import VoiceChat from './components/VoiceChat';
import OnlineUsers from './components/OnlineUsers';
import Notifications from './components/Notifications';
import AudioSettings from './components/AudioSettings';
import PushToTalk from './components/PushToTalk';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notification, setNotification] = useState('');
    const [selectedMicrophone, setSelectedMicrophone] = useState('');
    const [volume, setVolume] = useState(100);

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/api/register', { username, password });
            setMessage('Kayıt başarılı!');
        } catch (error) {
            console.error('Kayıt hatası:', error.response ? error.response.data : error.message);
            setMessage(error.response ? error.response.data : 'Kayıt hatası');
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password });
            localStorage.setItem('token', response.data.token);
            setIsLoggedIn(true);
            socket.emit('user-joined', username);
            setMessage('Giriş başarılı!');
        } catch (error) {
            setMessage('Giriş başarısız!');
        }
    };

    socket.on('message', (msg) => {
        setNotification(`Yeni mesaj: ${msg.text}`);
        setTimeout(() => setNotification(''), 3000); // 3 saniye sonra bildirimi kaldır
    });

    return (
        <div>
            <h1>Discord Benzeri Uygulama</h1>
            {notification && <Notifications message={notification} />}
            {!isLoggedIn ? (
                <>
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleRegister}>Kayıt Ol</button>
                    <button onClick={handleLogin}>Giriş Yap</button>
                    <p>{message}</p>
                </>
            ) : (
                <>
                    <Profile username={username} />
                    <OnlineUsers />
                    <AudioSettings 
                        onMicrophoneChange={setSelectedMicrophone} 
                        onVolumeChange={setVolume} 
                    />
                    <PushToTalk onTalkStart={handleTalkStart} onTalkStop={handleTalkStop} />
                    <Chat username={username} />
                    <Channel />
                    <VoiceChat />
                </>
            )}
        </div>
    );
}

export default App;