// PushToTalk.js
import React, { useState, useEffect } from 'react';

function PushToTalk({ onBack }) {
    const [pushToTalkKey, setPushToTalkKey] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isListening) {
                e.preventDefault();
                setPushToTalkKey(e.code);
                setIsListening(false);
            }
        };

        window .addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isListening]);

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const saveSettings = () => {
        // Ayarları kaydetme işlemi
        console.log('Bas Konuş ayarları kaydedildi');
    };

    return (
        <div className="push-to-talk-settings">
            <h3>Bas Konuş Ayarları</h3>
            <div>
                <button onClick={toggleListening}>
                    {isListening ? 'Tuşa Basmayı Durdur' : 'Tuş Seç'}
                </button>
                {pushToTalkKey && <p>Seçilen Tuş: {pushToTalkKey}</p>}
            </div>
            <div>
                <label>
                    Aktif:
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => setIsActive(!isActive)}
                    />
                </label>
            </div>
            <button onClick={saveSettings}>Kaydet</button>
            <button onClick={onBack}>Geri</button>
        </div>
    );
}

export default PushToTalk;