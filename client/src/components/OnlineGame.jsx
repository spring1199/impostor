import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Lobby from './Lobby';
import GameInput from './GameInput';
import Voting from './Voting';
import Results from './Results';
import RoleReveal from './RoleReveal';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');

const OnlineGame = ({ onBack }) => {
    const [room, setRoom] = useState(null);
    const [player, setPlayer] = useState({ name: '', isHost: false });
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('room_joined', (roomData) => {
            setRoom(roomData);
        });

        socket.on('room_update', (roomData) => {
            setRoom(roomData);
        });

        socket.on('error', (err) => {
            alert(err.message);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room_joined');
            socket.off('room_update');
            socket.off('error');
        };
    }, []);

    if (!isConnected) {
        return <div style={{ color: 'white' }}>Connecting to server...</div>;
    }

    let content;
    if (!room || room.phase === 'lobby') {
        content = <Lobby socket={socket} room={room} setRoom={setRoom} player={player} setPlayer={setPlayer} />;
    } else if (room.phase === 'reveal') {
        content = <RoleReveal socket={socket} room={room} />;
    } else if (room.phase === 'playing') {
        content = <GameInput socket={socket} room={room} player={player} />;
    } else if (room.phase === 'voting') {
        content = <Voting socket={socket} room={room} />;
    } else if (room.phase === 'results') {
        content = <Results socket={socket} room={room} />;
    }

    return (
        <>
            <button onClick={onBack} style={{ position: 'absolute', top: 10, left: 10, padding: '5px 15px', fontSize: '0.8rem' }}>← Back</button>
            {content}
        </>
    );
};

export default OnlineGame;
