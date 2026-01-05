import React, { useState } from 'react';

const Lobby = ({ socket, room, setRoom, player, setPlayer }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [rounds, setRounds] = useState(2); // Default 2 rounds

    const createRoom = () => {
        if (!name) return setError("Enter your name!");
        socket.emit('create_room', { name });
        setPlayer({ ...player, name, isHost: true }); // Optimistic, will confirm on room_joined
    };

    const joinRoom = () => {
        if (!name || !code) return setError("Enter name and code!");
        socket.emit('join_room', { code: code.toUpperCase(), name });
        setPlayer({ ...player, name });
    };

    const startGame = () => {
        socket.emit('start_game', { code: room.code, settings: { rounds: parseInt(rounds) } });
    };

    if (room) {
        return (
            <div className="card fade-in">
                <h2>Room: <span style={{ color: 'var(--accent)' }}>{room.code}</span></h2>
                <h3>Players ({room.players.length}/8)</h3>
                <ul className="player-list">
                    {room.players.map((p, i) => (
                        <li key={i} className="player-item">
                            {p.avatar} {p.name} {p.isHost && "👑"}
                        </li>
                    ))}
                </ul>

                {player.isHost || (room.players.find(p => p.id === socket.id)?.isHost) ? (
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            Rounds:
                            <select
                                value={rounds}
                                onChange={(e) => setRounds(e.target.value)}
                                style={{ marginLeft: '10px', padding: '5px' }}
                            >
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </label>
                        <button onClick={startGame} disabled={room.players.length < 3}>
                            Start Game {room.players.length < 3 && "(Need 4+)"}
                        </button>
                    </div>
                ) : (
                    <p>Waiting for host...</p>
                )}
            </div>
        );
    }

    return (
        <div className="card fade-in">
            <h1>Mongolian Impostor</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
            />

            <div style={{ margin: '20px 0' }}>
                <button onClick={createRoom}>Create Room</button>
            </div>

            <div>
                <p>OR</p>
                <input
                    placeholder="Room Code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={4}
                    style={{ textTransform: 'uppercase' }}
                />
                <br />
                <button onClick={joinRoom}>Join Room</button>
            </div>
        </div>
    );
};

export default Lobby;
