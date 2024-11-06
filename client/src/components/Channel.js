import React, { useState } from 'react';

function Channel() {
    const [channelName, setChannelName] = useState('');
    const [channels, setChannels] = useState([]);

    const createChannel = () => {
        setChannels((prevChannels) => [...prevChannels, channelName]);
        setChannelName('');
    };

    const deleteChannel = (index) => {
        const updatedChannels = channels.filter((_, i) => i !== index);
        setChannels(updatedChannels);
    };

    return (
        <div>
            <h2>Kanal Yönetimi</h2>
            <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Kanal adı"
            />
            <button onClick={createChannel}>Kanal Oluştur</button>
            <ul>
                {channels.map((channel, index) => (
                    <li key={index}>
                        {channel}
                        <button onClick={() => deleteChannel(index)}>Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Channel; 