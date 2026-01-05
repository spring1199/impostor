import React from 'react';

const Results = ({ socket, room }) => {
    const isHost = room.players.find(p => p.id === socket.id)?.isHost;

    const restartGame = () => {
        socket.emit('restart_game', { code: room.code });
    };

    return (
        <div className="card">
            <h1 className={room.winner === 'crew' ? 'crew-text' : 'impostor-text'}>
                {room.winner === 'crew' ? "CREW WINS!" : "IMPOSTOR WINS!"}
            </h1>

            <h3>The Impostor was: <span className="impostor-text">{room.impostorName}</span></h3>

            <div style={{ margin: '20px 0' }}>
                {room.players.map(p => (
                    <div key={p.id}>
                        {p.name} received {p.votesReceived} votes.
                    </div>
                ))}
            </div>

            {isHost && (
                <button onClick={restartGame}>Play Again</button>
            )}
        </div>
    );
};

export default Results;
