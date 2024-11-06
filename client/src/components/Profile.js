import React, { useState } from 'react';

function Profile({ username }) {
    const [newUsername, setNewUsername] = useState(username);
    const [profileImage, setProfileImage] = useState(null);
    const [about, setAbout] = useState('');

    const updateProfile = () => {
        console.log('Profil güncellendi:', newUsername, about);
    };

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    return (
        <div>
            <h2>Profil Yönetimi</h2>
            <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Yeni kullanıcı adı"
            />
            <input type="file" onChange={handleImageChange} />
            {profileImage && <img src={URL.createObjectURL(profileImage)} alt="Profil Resmi" style={{ maxWidth: '100px', borderRadius: '50%' }} />}
            <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Hakkında"
                rows="4"
                style={{ width: '100%', marginTop: '10px' }}
            />
            <button onClick={updateProfile}>Güncelle</button>
        </div>
    );
}

export default Profile; 