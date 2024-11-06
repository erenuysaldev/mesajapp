import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function OnlineUsers() {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        socket.on('user-joined', (userId) => {
            setOnlineUsers((prevUsers) => [...prevUsers, userId]);
        });

        socket.on('user-left', (userId) => {
            setOnlineUsers((prevUsers) => prevUsers.filter((user) => user !== userId));
        });

        return () => {
            socket.off('user-joined');
            socket.off('user-left');
        };
    }, []);

    return (
        <div>
            <h2>Çevrimiçi Kullanıcılar</h2>
            <ul>
                {onlineUsers.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
            </ul>
        </div>
    );
}

export default OnlineUsers; 