// VoiceChat.js
import React, { useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function VoiceChat() {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();

    useEffect(() => {
        async function setupMedia() {
            try {
                // Mikrofon erişimi al
                const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                userVideo.current.srcObject = stream;

                // Diğer kullanıcı bağlandığında yeni bir Peer oluştur
                socket.emit('join-voice-channel');
                socket.on('user-joined', (userId) => {
                    const peer = new Peer({ initiator: true, trickle: false, stream });

                    peer.on('signal', (signal) => {
                        socket.emit('sending-signal', { userId, signal });
                    });

                    peer.on('stream', (remoteStream) => {
                        if (partnerVideo.current) {
                            partnerVideo.current.srcObject = remoteStream;
                        }
                    });

                    socket.on('receiving-signal', ({ signal }) => {
                        peer.signal(signal);
                    });

                    peerRef.current = peer;
                });

            } catch (error) {
                console.error("Mikrofon erişim izni alınamadı veya cihaz bulunamadı:", error);
            }
        }

        setupMedia();

        // Kanaldan ayrıldığında temizleme işlemi
        return () => {
            socket.emit('leave-voice-channel');
            if (peerRef.current) peerRef.current.destroy();
            socket.off('user-joined');
            socket.off('receiving-signal');
        };
    }, []);

    return (
        <div>
            <h2>Sesli İletişim</h2>
            <video ref={userVideo} autoPlay muted />
            <video ref={partnerVideo} autoPlay />
        </div>
    );
}

export default VoiceChat;