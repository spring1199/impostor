import React, { useState } from 'react';
import { categoriesData } from '../words';

const Lobby = ({ socket, room, setRoom, player, setPlayer }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    // Game Settings
    const [rounds, setRounds] = useState(2);
    const [category, setCategory] = useState("All");
    const [impostorCount, setImpostorCount] = useState(1);
    const [hintsEnabled, setHintsEnabled] = useState(false);
    const [hintType, setHintType] = useState("Related Word");

    const createRoom = () => {
        if (!name) return setError("Enter your name!");
        socket.emit('create_room', { name });
        setPlayer({ ...player, name, isHost: true });
    };

    const joinRoom = () => {
        if (!name || !code) return setError("Enter name and code!");
        socket.emit('join_room', { code: code.toUpperCase(), name });
        setPlayer({ ...player, name });
    };

    const startGame = () => {
        const settings = {
            rounds: parseInt(rounds),
            category,
            impostorCount: parseInt(impostorCount),
            hints: { enabled: hintsEnabled, type: hintType }
        };
        socket.emit('start_game', { code: room.code, settings });
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
                    <div style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
                        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444' }}>Game Settings</h4>

                        {/* Rounds */}
                        <div style={{ marginBottom: '10px' }}>
                            <label>Rounds: </label>
                            <select value={rounds} onChange={(e) => setRounds(e.target.value)} style={{ padding: '5px' }}>
                                {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
                            </select>
                        </div>

                        {/* Category */}
                        <div style={{ marginBottom: '10px' }}>
                            <label>Category: </label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '5px', width: '100%' }}>
                                <option value="All">All Categories</option>
                                {Object.keys(categoriesData).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Impostor Count */}
                        <div style={{ marginBottom: '10px' }}>
                            <label>Impostors: </label>
                            <button type="button" onClick={() => setImpostorCount(Math.max(1, impostorCount - 1))} style={{ padding: '2px 8px', margin: '0 5px' }}>-</button>
                            {impostorCount}
                            <button type="button" onClick={() => setImpostorCount(Math.min(Math.floor(room.players.length / 2), impostorCount + 1))} style={{ padding: '2px 8px', margin: '0 5px' }}>+</button>
                        </div>

                        {/* Hints */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input type="checkbox" checked={hintsEnabled} onChange={e => setHintsEnabled(e.target.checked)} />
                                Enable Hints for Impostor
                            </label>
                            {hintsEnabled && (
                                <select value={hintType} onChange={(e) => setHintType(e.target.value)} style={{ marginTop: '5px', width: '100%', padding: '5px' }}>
                                    <option value="Related Word">Related Word</option>
                                    <option value="Category Name">Category Name</option>
                                    <option value="Short Clue">Short Clue</option>
                                </select>
                            )}
                        </div>

                        <button onClick={startGame} disabled={room.players.length < 3} style={{ width: '100%', marginTop: '10px' }}>
                            Start Game {room.players.length < 3 && "(Need 3+)"}
                        </button>
                    </div>
                ) : (
                    <p>Waiting for host to configure game...</p>
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
