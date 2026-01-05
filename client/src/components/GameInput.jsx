import React, { useState } from 'react';

const GameInput = ({ socket, room, player }) => {
    const [sentence, setSentence] = useState('');

    const myPlayer = room.players.find(p => p.id === socket.id);
    const role = myPlayer?.role;

    // Server handles word hiding, but double check
    const displayWord = role === 'impostor' ? "???" : room.word;

    // Game State
    const { currentRound, turnIndex, turnOrder } = room.state || { currentRound: 1, turnIndex: 0, turnOrder: [] };
    const totalRounds = room.settings?.totalRounds || 2;

    // Turn Logic
    const currentPlayerId = turnOrder[turnIndex];
    const isMyTurn = currentPlayerId === socket.id;
    const currentPlayer = room.players.find(p => p.id === currentPlayerId);

    const submitSentence = () => {
        if (!sentence || !isMyTurn) return;
        socket.emit('submit_sentence', { code: room.code, sentence });
        setSentence(''); // Clear input after submit
    };

    return (
        <div className="card">
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Round {currentRound} / {totalRounds}</span>
                <span className={role === 'impostor' ? 'impostor-text' : 'crew-text'} style={{ fontWeight: 'bold' }}>
                    {role === 'impostor' ? 'IMPOSTOR' : 'CREW'}
                </span>
            </div>

            <h2>Secret Word: <span style={{ textDecoration: 'underline', color: 'var(--accent)' }}>{displayWord}</span></h2>

            {/* Word History / Board */}
            <div className="game-board" style={{
                margin: '20px 0',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                textAlign: 'left',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444' }}>Game Log</h4>
                {room.players.map(p => {
                    // Collect all words this player has said
                    if (!p.words || p.words.length === 0) return null;
                    return (
                        <div key={p.id} style={{ marginBottom: '8px' }}>
                            <strong style={{ color: p.isHost ? 'gold' : 'white' }}>{p.name}:</strong>
                            {p.words.map((w, i) => (
                                <span key={i} style={{
                                    background: '#333',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginLeft: '5px',
                                    fontSize: '0.9rem'
                                }}>
                                    {w}
                                </span>
                            ))}
                        </div>
                    );
                })}
                {/* Show empty log if no words yet */}
                {room.players.every(p => !p.words || p.words.length === 0) && (
                    <div style={{ fontStyle: 'italic', opacity: 0.5 }}>No words yet...</div>
                )}
            </div>

            {/* Turn Indicator */}
            <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #444', borderRadius: '8px' }}>
                {isMyTurn ? (
                    <div style={{ animation: 'pulse 2s infinite' }}>
                        <h3 style={{ color: 'var(--accent)', margin: 0 }}>🟢 IT'S YOUR TURN!</h3>
                        <p style={{ margin: '5px 0' }}>Write a word related to the topic.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <input
                                autoFocus
                                placeholder="Type your word..."
                                value={sentence}
                                onChange={e => setSentence(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitSentence()}
                                style={{ flex: 1 }}
                            />
                            <button onClick={submitSentence}>Submit</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ opacity: 0.7, margin: 0 }}>🔴 Waiting for {currentPlayer?.name}...</h3>
                        <div className="typing-indicator" style={{ marginTop: '10px', height: '20px' }}>
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                Players: {room.players.map(p => p.name).join(', ')}
            </div>
        </div>
    );
};

export default GameInput;
