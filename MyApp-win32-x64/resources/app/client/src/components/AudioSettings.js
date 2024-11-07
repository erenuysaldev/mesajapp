// AudioSettings.js
import React, { useState, useEffect } from 'react';

function AudioSettings({ onBack }) {
    const [microphones, setMicrophones] = useState([]);
    const [selectedMic, setSelectedMic] = useState('');
    const [volume, setVolume] = useState(100);

    useEffect(() => {
        // Mevcut mikrofonları al
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const mics = devices.filter(device => device.kind === 'audioinput');
                setMicrophones(mics);
            });
    }, []);

    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
        // Ses seviyesini ayarla
    };

    return (
        <div className="audio-settings">
            <div className="microphone-section">
                <h3>Mikrofon</h3>
                <select 
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                >
                    {microphones.map(mic => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || `Mikrofon ${mic.deviceId}`}
                        </option>
                    ))}
                </select>
            </div>
            <div className="volume-section">
                <h3>Ses Seviyesi</h3>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                />
                <span>{volume}%</span>
            </div>
            <button onClick={onBack}>Geri</button>
        </div>
    );
}

export default AudioSettings;