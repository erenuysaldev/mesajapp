// Channel.js
import React, { useState } from 'react';
import './Channel.css';

function Channel({ onChannelSelect }) {
    const [showModal, setShowModal] = useState(false);
    const [channels, setChannels] = useState({
        text: [],
        voice: []
    });
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [channelName, setChannelName] = useState('');

    const createChannel = (type) => {
        if (channelName.trim()) {
            const newChannel = {
                id: Date.now(),
                name: channelName,
                type: type
            };
            setChannels(prev => ({
                ...prev,
                [type]: [...prev[type], newChannel]
            }));
            setChannelName('');
            setShowModal(false);
        }
    };

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel);
        onChannelSelect(channel); // Seçilen kanalı üst bileşene bildir
    };

    return (
        <div className="channel-container">
            <h2>Kanallar</h2>
            <button onClick={() => setShowModal(true)}>Kanal Oluştur</button>
            {showModal && (
                <div>
                    <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="Kanal adı"
                    />
                    <button onClick={() => createChannel('text')}>Metin Kanalı</button>
                    <button onClick={() => createChannel('voice')}>Ses Kanalı</button>
                </div>
            )}
            <div>
                <h3>Metin Kanalları</h3>
                {channels.text.map(channel => (
                    <div key={channel.id} onClick={() => handleChannelSelect(channel)}>
                        #{channel.name}
                    </div>
                ))}
            </div>
            <div>
                <h3>Ses Kanalları</h3>
                {channels.voice.map(channel => (
                    <div key={channel.id} onClick={() => handleChannelSelect(channel)}>
                        🔊 {channel.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Channel;