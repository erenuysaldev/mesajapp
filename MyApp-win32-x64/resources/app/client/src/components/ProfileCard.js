import React from 'react';

function ProfileCard({ user, onClose }) {
    return (
        <div style={styles.card}>
            <button onClick={onClose} style={styles.closeButton}>X</button>
            <h2>{user.username}</h2>
            {user.profileImage && <img src={URL.createObjectURL(user.profileImage)} alt="Profil Resmi" style={styles.image} />}
            <p><strong>Hakkında:</strong> {user.about || 'Bu kullanıcı hakkında bilgi yok.'}</p>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '8px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '300px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
    image: {
        maxWidth: '100px',
        borderRadius: '50%',
    },
};

export default ProfileCard; 