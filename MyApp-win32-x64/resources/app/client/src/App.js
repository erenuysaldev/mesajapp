import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Chat from './components/Chat';
import Channel from './components/Channel';
import OnlineUsers from './components/OnlineUsers';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
    const [username, setUsername] = useState('');
    const [password , setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notification, setNotification] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);

    useEffect(() => {
        socket.on('message', (msg) => {
            setNotification(`Yeni mesaj: ${msg.text}`);
            setTimeout(() => setNotification(''), 3000);
        });

        socket.on('user-joined', (userId) => {
            setNotification(`${userId} çevrimiçi oldu`);
        });

        socket.on('user-left', (userId) => {
            setNotification(`${userId} çevrimdışı oldu`);
        });

        socket.on('onlineUsers', (users) => {
            // Çevrimiçi kullanıcıları güncelle
            setOnlineUsers(users);
        });

        return () => {
            socket.off('message');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('onlineUsers');
        };
    }, []);

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
            setMessage('Giriş başarılı!');
            setIsLoggedIn(true);
            localStorage.setItem('token', response.data.token);
            
            // Kullanıcı bağlandığında socket'e bilgi gönder
            socket.emit('userConnected', username);
        } catch (error) {
            console.error('Giriş hatası:', error.response ? error.response.data : error.message);
            setMessage(error.response ? error.response.data : 'Giriş hatası');
        }
    };

    const handleLogout = () => {
        socket.emit('user-left', username); // Kullanıcı ayrıldığında socket'e bilgi gönder
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        localStorage.removeItem('token');
    };

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel);
    };

    return (
        <div className="app-container">
            {!isLoggedIn ? (
                <div className="login-container">
                    <h1>Discord Benzeri Uygulama</h1>
                    <div className="login-form">
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
                    </div>
                </div>
            ) : (
                <div className="main-container">
                    {notification && <Notifications message={notification} />}
                    
                    <div className="left-sidebar">
                        <Channel onChannelSelect={handleChannelSelect} />
                    </div>

                    <div className="main-content">
                        {selectedChannel && (
                            <Chat username={username} channelId={selectedChannel.id} />
                        )}
                    </div>

                    <div className="right-sidebar">
                        <OnlineUsers />
                    </div>

                    <div className="bottom-panel">
                        <div className="settings-button">
                            <button onClick={() => setIsSettingsOpen(true)}>⚙️</button>
                        </div>
                        
                        {isSettingsOpen && (
                            <Settings 
                                onClose={() => setIsSettingsOpen(false)} 
                                username={username}
                                onLogout={handleLogout}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;