import React, { useState } from 'react';

const Voting = ({ socket, room }) => {
    const [votedFor, setVotedFor] = useState(null);

    const handleVote = (targetId) => {
        if (votedFor) return;
        setVotedFor(targetId);
        socket.emit('vote_player', { code: room.code, targetId });
    };

    // We need to show sentences associated with players
    // room.sentences might be [{ playerId, sentence }]
    // But we want to show Names.
    // Let's assume room.players has sentence inside it or we map it.

    return (
        <div className="card">
            <h2>Voting Phase</h2>
            <p>Who is the Impostor? Read carefully!</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                {room.players.map(p => (
                    <div key={p.id} style={{ width: '100%' }}>
                        <button
                            onClick={() => handleVote(p.id)}
                            disabled={votedFor !== null}
                            style={{
                                width: '100%',
                                background: votedFor === p.id ? 'var(--accent)' : 'var(--glass-bg)',
                                border: '1px solid white',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontSize: '0.9em', color: '#ccc' }}>{p.name}</div>
                            <div style={{ fontSize: '1.2em', fontStyle: 'italic' }}>"{p.sentence}"</div>
                        </button>
                    </div>
                ))}
            </div>

            {votedFor && <p>Vote submitted. Waiting for others...</p>}
        </div>
    );
};

export default Voting;
