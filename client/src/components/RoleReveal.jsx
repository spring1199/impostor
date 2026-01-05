import React, { useState } from 'react';

const RoleReveal = ({ socket, room }) => {
    const [revealed, setRevealed] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const myPlayer = room.players.find(p => p.id === socket.id);

    // If player somehow not found
    if (!myPlayer) return <div>Loading...</div>;

    // If already confirmed on server side but waiting for others
    if (myPlayer.confirmedRole || confirmed) {
        return (
            <div className="card fade-in">
                <h2>Waiting for others...</h2>
                <p>Ready: {room.state?.playersConfirmed || 0} / {room.players.length}</p>
                <div className="typing-indicator" style={{ marginTop: '20px' }}>
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        );
    }

    const handleConfirm = () => {
        setConfirmed(true);
        socket.emit('confirm_role', { code: room.code });
    };

    if (!revealed) {
        return (
            <div className="card fade-in" style={{ background: 'var(--bg-gradient)' }}>
                <h1>Rule Check</h1>
                <p>Tap to see your role!</p>
                <div style={{ fontSize: '4rem', margin: '20px' }}>🫣</div>
                <button onClick={() => setRevealed(true)} className="pulse-button">
                    Reveal Role
                </button>
            </div>
        );
    }

    return (
        <div className="card rotate-in-center">
            <h1>Your Role</h1>
            <div style={{ margin: '30px 0' }}>
                {myPlayer.role === 'impostor' ? (
                    <>
                        <h2 className="impostor-text" style={{ fontSize: '3rem', margin: '10px 0' }}>THE IMPOSTOR</h2>
                        <p>You don't know the secret word.</p>
                        <p>Try to blend in!</p>

                        {myPlayer.hint && (
                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', border: '1px solid gold' }}>
                                <small style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Secret Hint</small>
                                <div style={{ fontSize: '1.4rem', color: '#ffcc00', fontWeight: 'bold', marginTop: '5px' }}>
                                    {myPlayer.hint}
                                </div>
                            </div>
                        )}
                        {!myPlayer.hint && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No hints for you.</p>}
                    </>
                ) : (
                    <>
                        <h2 className="crew-text" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>You are a CITIZEN</h2>
                        <div style={{ margin: '20px 0', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '15px' }}>
                            <small style={{ color: '#aaa' }}>SECRET WORD</small>
                            <h2 style={{ textDecoration: 'underline', fontSize: '2.5rem', margin: '5px 0', color: '#fff' }}>
                                {myPlayer.word}
                            </h2>
                            {room.categoryName && <p style={{ opacity: 0.7 }}>Category: {room.categoryName}</p>}
                        </div>
                    </>
                )}
            </div>

            <button onClick={handleConfirm} style={{ background: '#4CAF50' }}>
                I'm Ready!
            </button>
        </div>
    );
};

export default RoleReveal;
