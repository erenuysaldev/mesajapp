import React, { useEffect, useState } from 'react';

function PushToTalk({ onTalkStart, onTalkStop }) {
    const [key, setKey] = useState(''); // Ayarlanan tuş
    const [isTalking, setIsTalking] = useState(false); // Konuşma durumu

    const handleKeyDown = (event) => {
        if (event.key === key) {
            setIsTalking(true);
            onTalkStart(); // Ses iletimi başlat
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === key) {
            setIsTalking(false);
            onTalkStop(); // Ses iletimini durdur
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [key]);

    return (
        <div>
            <h2>Bas ve Konuş Ayarları</h2>
            <label>
                Konuşma Tuşu:
                <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Tuşu girin (örneğin: 'Shift')"
                />
            </label>
            <p>{isTalking ? 'Konuşma Modu Açık' : 'Konuşma Modu Kapalı'}</p>
        </div>
    );
}

export default PushToTalk; 