import React, { useState } from 'react';
import Profile from './Profile';
import AudioSettings from './AudioSettings';
import PushToTalk from './PushToTalk';
import './Settings.css';

function Settings({ onClose, username }) {
    const [currentPage, setCurrentPage] = useState('main');

    const renderContent = () => {
        switch (currentPage) {
            case 'profile':
                return <Profile username={username} onBack={() => setCurrentPage('main')} />;
            case 'audio':
                return <AudioSettings onBack={() => setCurrentPage('main')} />;
            case 'pushToTalk':
                return <PushToTalk onBack={() => setCurrentPage('main')} />;
            default:
                return (
                    <div className="settings-menu">
                        <div className="settings-sidebar">
                            <div className="settings-categories">
                                <h3>Kullanıcı Ayarları</h3>
                                <button 
                                    className={`settings-option ${currentPage === 'profile' ? 'active' : ''}`}
                                    onClick={() => setCurrentPage('profile')}
                                >
                                    Profil
                                </button>
                                <button 
                                    className={`settings-option ${currentPage === 'audio' ? 'active' : ''}`}
                                    onClick={() => setCurrentPage('audio')}
                                >
                                    Ses Ayarları
                                </button>
                                <button 
                                    className={`settings-option ${currentPage === 'pushToTalk' ? 'active' : ''}`}
                                    onClick={() => setCurrentPage('pushToTalk')}
                                >
                                    Bas Konuş Ayarları
                                </button>
                            </div>
                        </div>
                        <div className="settings-content">
                            <h2>Ayarlar</h2>
                            <p>Soldaki menüden bir kategori seçin</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-container">
                <div className="settings-header">
                    <div className="settings-profile">
                        <Profile username={username} />
                        <div className="gear-icon">
                            <img src="/gear-icon.png" alt="Ayarlar" />
                        </div>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
}

export default Settings;