// OnlineUsers.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function OnlineUsers() {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Sunucudan çevrimiçi kullanıcı listesini alın
        socket.emit('requestOnlineUsers');

        // Kullanıcılar güncellendiğinde yeni listeyi alın
        socket.on('updateOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        // Kullanıcı katıldığında veya ayrıldığında güncelleme
        socket.on('user-joined', (user) => {
            setOnlineUsers((prevUsers) => [...prevUsers, user]);
        });

        socket.on('user-left', (userId) => {
            setOnlineUsers((prevUsers) => prevUsers.filter((user) => user.username !== userId));
        });

        return () => {
            socket.off('updateOnlineUsers');
            socket.off('user-joined');
            socket.off('user-left');
        };
    }, []);

    return (
        <div>
            <h2>Çevrimiçi Kullanıcılar</h2>
            <ul>
                {onlineUsers.map((user, index) => (
                    <li key={index}>
                        <img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" width="30" height="30" />
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default OnlineUsers;