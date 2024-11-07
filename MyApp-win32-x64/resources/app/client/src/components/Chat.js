// Chat.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat({ username, channelId }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        // Kanal mesajlarını dinle
        socket.on(`message-${channelId}`, (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Kanalda katıl
        socket.emit('join-channel', channelId);

        // Temizlik işlemleri
        return () => {
            socket.off(`message-${channelId}`);
            socket.emit('leave-channel', channelId);
        };
    }, [channelId]);

    const sendMessage = () => {
        if (message.trim()) {
            const msgWithTimestamp = {
                text: message,
                user: { username, avatarUrl: '/path/to/avatar' }, // Avatar URL’yi buraya ekleyin
                channelId,
                timestamp: new Date().toISOString(),
            };
            socket.emit('channel-message', msgWithTimestamp);
            setMessages((prevMessages) => [...prevMessages, msgWithTimestamp]); // Mesajı hemen arayüze ekle
            setMessage('');
        }
    };

    const sendImage = () => {
        if (image) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageMsg = {
                    user: { username, avatarUrl: '/path/to/avatar' }, // Avatar URL’yi buraya ekleyin
                    image: reader.result,
                    channelId,
                    timestamp: new Date().toISOString(),
                };
                socket.emit('channel-image', imageMsg);
                setMessages((prevMessages) => [...prevMessages, imageMsg]); // Resmi hemen arayüze ekle
                setImage(null);
            };
            reader.readAsDataURL(image);
        }
    };

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <img src={msg.user.avatarUrl || '/default-avatar.png'} alt="Avatar" width="30" height="30" />
                        <strong>{msg.user.username}:</strong> {msg.text}
                        {msg.image && <img src={msg.image} alt="Gönderilen resim" style={{ maxWidth: '200px' }} />}
                        {msg.timestamp && <span className="timestamp">({new Date(msg.timestamp).toLocaleTimeString()})</span>}
                    </div>
                ))}
            </div>
            <div className="message-input-container">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    className="message-input"
                />
                <input type="file" onChange={handleImageUpload} accept="image/*" />
                <button onClick={sendMessage} className="send-button">Gönder</button>
                <button onClick={sendImage} className="send-button">Resim Gönder</button>
            </div>
        </div>
    );
}

export default Chat;