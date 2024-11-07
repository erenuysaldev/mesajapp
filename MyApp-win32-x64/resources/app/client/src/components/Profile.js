// Profile.js
import React, { useState } from 'react';
import axios from 'axios';

function Profile({ username }) {
    const [avatar, setAvatar] = useState(null);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('username', username);

            try {
                const response = await axios.post('http://localhost:5000/api/upload-avatar', formData);
                setAvatar(response.data.avatarUrl); // Sunucudan dönen avatar URL'sini ayarla
            } catch (error) {
                console.error("Avatar yüklenemedi:", error);
            }
        }
    };

    return (
        <div className="profile-container">
            <img src={avatar || '/default-avatar.png'} alt="Profil" className="profile-avatar" />
            <span className="username">{username}</span>
            <label htmlFor="avatar-upload" className="upload-button">Profil Resmini Değiştir</label>
            <input 
                id="avatar-upload" 
                type="file" 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="file-input" 
            />
        </div>
    );
}

export default Profile;