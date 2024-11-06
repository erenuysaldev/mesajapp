import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import ProfileCard from './ProfileCard';

const socket = io('http://localhost:5000');

function Chat({ username }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [file, setFile] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = () => {
        const timestamp = new Date().toLocaleTimeString();
        const msgWithTimestamp = { text: message, time: timestamp, user: username, file: file };
        
        socket.emit('message', msgWithTimestamp);
        setMessage('');
        setFile(null);
    };

    const editMessage = (index) => {
        setMessage(messages[index].text);
        setEditIndex(index);
    };

    const deleteMessage = (index) => {
        const updatedMessages = messages.filter((_, i) => i !== index);
        setMessages(updatedMessages);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const closeProfileCard = () => {
        setSelectedUser(null);
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <p onClick={() => handleUserClick(msg.user)} style={{ cursor: 'pointer' }}>
                            <strong>{msg.user}:</strong> {msg.text} <span style={{ fontSize: '0.8em', color: 'gray' }}>({msg.time})</span>
                        </p>
                        {msg.file && <img src={URL.createObjectURL(msg.file)} alt="Gönderilen dosya" style={{ maxWidth: '200px' }} />}
                        {msg.file && msg.file.type.startsWith('video/') && <video controls style={{ maxWidth: '200px' }}><source src={URL.createObjectURL(msg.file)} /></video>}
                        <button onClick={() => editMessage(index)}>Düzenle</button>
                        <button onClick={() => deleteMessage(index)}>Sil</button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesajınızı yazın"
            />
            <input type="file" onChange={handleFileChange} />
            <button onClick={sendMessage}>Gönder</button>

            {selectedUser && <ProfileCard user={{ username: selectedUser, profileImage: null, about: '' }} onClose={closeProfileCard} />}
        </div>
    );
}

export default Chat; 