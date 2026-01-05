import React, { useState, useEffect } from 'react';
import { categoriesData, getAllWords } from '../../words';

// Subcomponents
const Setup = ({ onStart }) => {
    const [numPlayers, setNumPlayers] = useState(4);
    const [numImpostors, setNumImpostors] = useState(1);
    const [playerNames, setPlayerNames] = useState({}); // { 0: "Name", ... }

    // New Feature States
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [hintsEnabled, setHintsEnabled] = useState(false);
    const [hintType, setHintType] = useState("Related Word");
    const [customWord, setCustomWord] = useState("");

    // Initialize/Update default names when numPlayers changes
    useEffect(() => {
        const newNames = { ...playerNames };
        for (let i = 0; i < numPlayers; i++) {
            if (!newNames[i]) newNames[i] = `Тоглогч ${i + 1}`;
        }
        setPlayerNames(newNames);
    }, [numPlayers]);

    const handleNameChange = (index, value) => {
        setPlayerNames({ ...playerNames, [index]: value });
    };

    const handleStart = () => {
        // Prepare list of names
        const finalNames = [];
        for (let i = 0; i < numPlayers; i++) {
            finalNames.push(playerNames[i] || `Тоглогч ${i + 1}`);
        }

        onStart({
            numPlayers,
            numImpostors,
            playerNamesList: finalNames,
            settings: {
                category: selectedCategory,
                hints: { enabled: hintsEnabled, type: hintType },
                customWord: customWord.trim()
            }
        });
    };

    return (
        <div className="card fade-in">
            <h2>Тохиргоо</h2>

            <div style={{ margin: '10px 0' }}>
                <label>Тоглогчид: {numPlayers}</label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
                    <button onClick={() => setNumPlayers(Math.max(3, numPlayers - 1))}>-</button>
                    <button onClick={() => setNumPlayers(Math.min(12, numPlayers + 1))}>+</button>
                </div>
            </div>

            {/* Player Name Inputs */}
            <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '10px'
            }}>
                <label style={{ fontSize: '0.9rem', color: '#aaa', display: 'block', marginBottom: '5px' }}>Нэрсээ оруулна уу:</label>
                {Array(numPlayers).fill(null).map((_, i) => (
                    <div key={i} style={{ marginBottom: '5px' }}>
                        <input
                            value={playerNames[i] || ''}
                            onChange={(e) => handleNameChange(i, e.target.value)}
                            placeholder={`Тоглогч ${i + 1}`}
                            style={{ width: '90%', padding: '8px', margin: '2px 0' }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ margin: '10px 0' }}>
                <label>Импостор: {numImpostors}</label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
                    <button onClick={() => setNumImpostors(Math.max(1, numImpostors - 1))}>-</button>
                    <button onClick={() => setNumImpostors(Math.min(Math.floor(numPlayers / 2), numImpostors + 1))}>+</button>
                </div>
            </div>

            <hr style={{ borderColor: 'var(--glass-border)', margin: '20px 0' }} />

            <div style={{ margin: '10px 0', textAlign: 'left' }}>
                <label>Төрөл:</label>
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', marginTop: '5px' }}
                >
                    <option value="All">Бүгд</option>
                    {Object.keys(categoriesData).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div style={{ margin: '10px 0', textAlign: 'left' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={hintsEnabled}
                        onChange={e => setHintsEnabled(e.target.checked)}
                        style={{ width: '20px', margin: 0 }}
                    />
                    Импосторт туслах
                </label>
            </div>

            {hintsEnabled && (
                <div style={{ margin: '10px 0', textAlign: 'left', paddingLeft: '30px' }}>
                    <label>Тусламжийн төрөл:</label>
                    <select
                        value={hintType}
                        onChange={e => setHintType(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '5px' }}
                    >
                        <option value="Related Word">Холбоо үг</option>
                        <option value="Category Name">Төрлийн нэр</option>
                        <option value="Short Clue">Тайлбар</option>
                    </select>
                </div>
            )}

            <hr style={{ borderColor: 'var(--glass-border)', margin: '20px 0' }} />

            <div style={{ margin: '10px 0' }}>
                <label>Өөрийн үг (Сонголттой):</label>
                <input
                    placeholder="Үгээ бичнэ үү (Хоосон орхивол санамсаргүй)"
                    value={customWord}
                    onChange={e => setCustomWord(e.target.value)}
                />
            </div>

            <button onClick={handleStart}>Эхлэх</button>
        </div>
    );
};

const RevealPhase = ({ players, currentPlayerIndex, onNext, onRevealFinish }) => {
    const [revealed, setRevealed] = useState(false);
    const player = players[currentPlayerIndex];

    if (!player) return null;

    if (!revealed) {
        return (
            <div className="card fade-in" style={{ background: 'var(--bg-gradient)' }}>
                <h1>{player.name}</h1>
                <p>Утсаа {player.name}-д дамжуулна уу.</p>
                <button onClick={() => setRevealed(true)}>Харах</button>
            </div>
        );
    }

    return (
        <div className="card fade-in">
            <h1>{player.name}</h1>
            <div style={{ margin: '40px 0' }}>
                {player.role === 'impostor' ? (
                    <>
                        <h2 className="impostor-text" style={{ fontSize: '3rem' }}>ИМПОСТОР</h2>
                        <p>Нууц үгийг мэдэхгүй. Бусдыгаа дага!</p>
                        {player.hint && (
                            <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                <small style={{ color: '#aaa', textTransform: 'uppercase' }}>Зөвлөгөө:</small>
                                <div style={{ fontSize: '1.2rem', color: '#ffcc00' }}>{player.hint}</div>
                            </div>
                        )}
                        {!player.hint && <p style={{ opacity: 0.5 }}>Зөвлөгөө байхгүй</p>}
                    </>
                ) : (
                    <>
                        <h2 style={{ textDecoration: 'underline', fontSize: '2.5rem' }}>{player.word}</h2>
                        <p className="crew-text">Та энгийн иргэн</p>
                    </>
                )}
            </div>
            <button onClick={() => {
                setRevealed(false);
                if (currentPlayerIndex + 1 >= players.length) {
                    onRevealFinish();
                } else {
                    onNext();
                }
            }}>Нуух & Дамжуулах</button>
        </div>
    );
};

const GameplayPhase = ({ onVote, category, players }) => {
    // Determine first player name
    const firstPlayerName = players[0]?.name || "Тоглогч 1";

    return (
        <div className="card fade-in">
            <h2>Тоглолт эхэллээ!</h2>
            {category && <p style={{ color: '#aaa' }}>Төрөл: {category}</p>}
            <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                Утсаа дундаа тавиарай.
                <br /><br />
                <b>{firstPlayerName}</b>-ээс эхлээд цагийн зүүний дагуу:
                <br /><br />
                Үгтэй холбоотой нэг өгүүлбэр хэлнэ үү.
            </p>
            <button onClick={onVote}>Санал хураах</button>
        </div>
    );
};

const VotingPhase = ({ players, onFinishVote }) => {
    const [voterIndex, setVoterIndex] = useState(0);
    const [votes, setVotes] = useState({});

    const voter = players[voterIndex];

    const handleVote = (targetId) => {
        const newVotes = { ...votes, [targetId]: (votes[targetId] || 0) + 1 };

        if (voterIndex + 1 >= players.length) {
            onFinishVote(newVotes);
        } else {
            setVoterIndex(voterIndex + 1);
        }
    };

    if (voterIndex >= players.length) return <div>Тоолж байна...</div>;

    return (
        <div className="card fade-in">
            <h3>{voter.name} саналаа өгнө үү</h3>
            <p>Хэн нь Импостор вэ?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {players.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => handleVote(i)}
                        disabled={i === voterIndex}
                        style={{ opacity: i === voterIndex ? 0.5 : 1 }}
                    >
                        {p.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ResultsPhase = ({ players, votes, word, onRestart, onMenu }) => {
    let maxVotes = -1;
    let mostVotedIndex = -1;

    Object.entries(votes).forEach(([id, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            mostVotedIndex = parseInt(id);
        }
    });

    const ejectedPlayer = players[mostVotedIndex];
    const impostorWon = ejectedPlayer?.role !== 'impostor';

    return (
        <div className="card fade-in">
            <h1 className={!impostorWon ? 'crew-text' : 'impostor-text'}>
                {!impostorWon ? "ИРГЭД ЯЛЛАА!" : "ИМПОСТОР ЯЛЛАА!"}
            </h1>

            <div style={{ margin: '20px 0' }}>
                <h2>Нууц үг: <span style={{ textDecoration: 'underline' }}>{word}</span></h2>

                <h3>Импостор(ууд):</h3>
                {players.filter(p => p.role === 'impostor').map((p, i) => (
                    <div key={i} className="impostor-text" style={{ fontSize: '1.2rem' }}>
                        {p.name}
                    </div>
                ))}
            </div>

            {ejectedPlayer && (
                <p>Хасагдсан: {ejectedPlayer.name} ({ejectedPlayer.role === 'impostor' ? 'Импостор байсан' : 'Энгийн иргэн байсан'})</p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={onRestart}>Дахин тоглох</button>
                <button onClick={onMenu} style={{ background: '#555' }}>Цэс рүү</button>
            </div>
        </div>
    );
};

// Main Container
const BaseGameContainer = ({ onBack }) => {
    const [phase, setPhase] = useState('setup');
    const [players, setPlayers] = useState([]);
    const [word, setWord] = useState('');
    const [categoryName, setCategoryName] = useState(''); // To show in Gameplay
    const [revealIndex, setRevealIndex] = useState(0);
    const [votes, setVotes] = useState({});

    // Keep track of settings for Restart
    const [lastSettings, setLastSettings] = useState(null);

    const startGame = ({ numPlayers, numImpostors, playerNamesList, settings }) => {
        setLastSettings({ numPlayers, numImpostors, playerNamesList, settings });

        let selectedWordObj = null;
        let finalCategoryName = settings.category;

        // 1. Pick Word
        if (settings.customWord) {
            selectedWordObj = { word: settings.customWord, related: "???", hint: "Custom Word" };
            finalCategoryName = "Custom";
        } else {
            let pool = [];
            if (settings.category === "All") {
                pool = getAllWords();
            } else {
                pool = categoriesData[settings.category] || [];
            }

            if (pool.length === 0) pool = getAllWords(); // Fallback
            selectedWordObj = pool[Math.floor(Math.random() * pool.length)];
        }

        setWord(selectedWordObj.word);
        setCategoryName(finalCategoryName);

        // 2. Setup Players
        const newPlayers = Array(numPlayers).fill(null).map((_, i) => ({
            id: i,
            name: playerNamesList[i] || `Тоглогч ${i + 1}`,
            role: 'crew',
            word: selectedWordObj.word,
            hint: null
        }));

        // 3. Assign Impostors & Hints
        let count = 0;
        const usedIndices = new Set();
        while (count < numImpostors) {
            const idx = Math.floor(Math.random() * numPlayers);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                newPlayers[idx].role = 'impostor';
                newPlayers[idx].word = null;

                // Set Hint
                if (settings.hints.enabled) {
                    if (settings.hints.type === "Related Word") {
                        newPlayers[idx].hint = selectedWordObj.related;
                    } else if (settings.hints.type === "Category Name") {
                        newPlayers[idx].hint = finalCategoryName;
                    } else if (settings.hints.type === "Short Clue") {
                        newPlayers[idx].hint = selectedWordObj.hint;
                    }
                }

                count++;
            }
        }

        setPlayers(newPlayers);
        setRevealIndex(0);
        setPhase('reveal');
    };

    const handleRestart = () => {
        if (lastSettings) {
            startGame(lastSettings);
        } else {
            setPhase('setup');
        }
    };

    return (
        <div className="base-game">
            {phase !== 'setup' && (
                <button onClick={onBack} style={{ position: 'absolute', top: 10, left: 10, padding: '5px 15px', fontSize: '0.8rem', zIndex: 100 }}>← Гарах</button>
            )}

            {phase === 'setup' && (
                <>
                    <button onClick={onBack} style={{ position: 'absolute', top: 10, left: 10, padding: '5px 15px', fontSize: '0.8rem' }}>← Буцах</button>
                    <Setup onStart={startGame} />
                </>
            )}

            {phase === 'reveal' && (
                <RevealPhase
                    players={players}
                    currentPlayerIndex={revealIndex}
                    onNext={() => setRevealIndex(revealIndex + 1)}
                    onRevealFinish={() => setPhase('gameplay')}
                />
            )}

            {phase === 'gameplay' && (
                <GameplayPhase onVote={() => setPhase('voting')} category={categoryName} players={players} />
            )}

            {phase === 'voting' && (
                <VotingPhase
                    players={players}
                    onFinishVote={(finalVotes) => {
                        setVotes(finalVotes);
                        setPhase('results');
                    }}
                />
            )}

            {phase === 'results' && (
                <ResultsPhase
                    players={players}
                    votes={votes}
                    word={word}
                    onRestart={handleRestart}
                    onMenu={onBack}
                />
            )}
        </div>
    );
};

export default BaseGameContainer;
