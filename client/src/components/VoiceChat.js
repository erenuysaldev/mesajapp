import React, { useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function VoiceChat() {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();

    useEffect(() => {
        socket.on('user-joined', (userId) => {
            const peer = new Peer({ initiator: true, trickle: false });
            peer.on('signal', (signal) => {
                socket.emit('sending-signal', { userId, signal });
            });

            peer.on('stream', (stream) => {
                partnerVideo.current.srcObject = stream;
            });

            navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
                userVideo.current.srcObject = stream;
                peer.addStream(stream);
            });

            socket.on('receiving-signal', ({ signal }) => {
                peer.signal(signal);
            });

            peerRef.current = peer;
        });

        return () => {
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