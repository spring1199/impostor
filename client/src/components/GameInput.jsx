import React, { useState } from 'react';

const GameInput = ({ socket, room, player }) => {
    const [sentence, setSentence] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Find my role info from room.players if needed, or use player prop
    const myPlayer = room.players.find(p => p.id === socket.id);
    const role = myPlayer?.role;
    const word = room.word; // Note: server should only send word if not impostor, or handle here. 
    // In our plan: server sends word depending on role.
    // Actually, room.word might be hidden for impostor. 
    // Let's assume server logic handles hiding, OR we check role.

    const displayWord = role === 'impostor' ? "???" : word;

    const submitSentence = () => {
        if (!sentence) return;
        socket.emit('submit_sentence', { code: room.code, sentence });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="card">
                <h3>Waiting for others...</h3>
                <p>You wrote: "{sentence}"</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="role-reveal">
                You are: <span className={role === 'impostor' ? 'impostor-text' : 'crew-text'}>
                    {role === 'impostor' ? 'THE IMPOSTOR' : 'CREW'}
                </span>
            </div>

            <h2>Secret Word: <span style={{ textDecoration: 'underline' }}>{displayWord}</span></h2>

            <p>{role === 'impostor' ? "Try to blend in! Guess the topic." : "Write a sentence using this word (or related to it)!"}</p>

            <input
                placeholder="Write your sentence here..."
                value={sentence}
                onChange={e => setSentence(e.target.value)}
            />
            <button onClick={submitSentence}>Submit</button>
        </div>
    );
};

export default GameInput;
