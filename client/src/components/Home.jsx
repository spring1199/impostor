import React from 'react';

const Home = ({ onSelectMode }) => {
    return (
        <div className="card fade-in">
            <h1>Mongolian Impostor</h1>
            <p style={{ fontStyle: 'italic', marginBottom: '30px' }}>Who is the odd one out?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <button onClick={() => onSelectMode('online')}>
                    🌐 Online Multiplayer
                    <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Create/Join Rooms</div>
                </button>

                <button onClick={() => onSelectMode('offline')} style={{ background: 'var(--crew-green)', color: '#000' }}>
                    📱 Offline Pass-and-Play
                    <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Play on this device</div>
                </button>
            </div>
        </div>
    );
};

export default Home;
