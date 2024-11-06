import React, { useEffect, useState } from 'react';

function AudioSettings({ onMicrophoneChange, onVolumeChange }) {
    const [microphones, setMicrophones] = useState([]);
    const [selectedMicrophone, setSelectedMicrophone] = useState('');
    const [volume, setVolume] = useState(100); // Varsayılan ses seviyesi

    useEffect(() => {
        // Mikrofonları al
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const micDevices = devices.filter(device => device.kind === 'audioinput');
            setMicrophones(micDevices);
            if (micDevices.length > 0) {
                setSelectedMicrophone(micDevices[0].deviceId); // İlk mikrofonu seç
            }
        });
    }, []);

    const handleMicrophoneChange = (e) => {
        const micId = e.target.value;
        setSelectedMicrophone(micId);
        onMicrophoneChange(micId); // Ana bileşene mikrofon değişikliğini bildir
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        onVolumeChange(newVolume); // Ana bileşene ses seviyesini bildir
    };

    return (
        <div>
            <h2>Ses Ayarları</h2>
            <label>
                Mikrofon:
                <select value={selectedMicrophone} onChange={handleMicrophoneChange}>
                    {microphones.map((mic) => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || 'Mikrofon'}
                        </option>
                    ))}
                </select>
            </label>
            <br />
            <label>
                Ses Seviyesi:
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                />
                {volume}%
            </label>
        </div>
    );
}

export default AudioSettings; 