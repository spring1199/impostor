// In-memory store
const rooms = {};

// Utils
const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const createRoom = (hostId, hostName) => {
    let code = generateRoomCode();
    while (rooms[code]) {
        code = generateRoomCode();
    }

    rooms[code] = {
        code,
        phase: "lobby", // lobby, playing, voting, results
        word: null,
        impostorId: null,
        impostorName: null,
        winner: null,
        players: [
            {
                id: hostId,
                name: hostName,
                avatar: "👤",
                isHost: true,
                role: "crew",
                sentence: "",
                votesReceived: 0,
                hasVoted: false
            }
        ],
    };
    return rooms[code];
};

const joinRoom = (code, playerId, playerName) => {
    const room = rooms[code];
    if (!room) return null;
    if (room.phase !== "lobby") return { error: "Game already started" };
    if (room.players.length >= 8) return { error: "Room full" };

    const existing = room.players.find(p => p.id === playerId);
    if (!existing) {
        room.players.push({
            id: playerId,
            name: playerName,
            avatar: "👤",
            isHost: false,
            role: "crew",
            sentence: "",
            votesReceived: 0,
            hasVoted: false
        });
    }
    return room;
};

const getRoom = (code) => rooms[code];

const removePlayer = (socketId) => {
    for (const code in rooms) {
        const room = rooms[code];
        const index = room.players.findIndex(p => p.id === socketId);
        if (index !== -1) {
            room.players.splice(index, 1);
            if (room.players.length === 0) {
                delete rooms[code];
                return null;
            }
            if (room.players.length > 0 && !room.players.some(p => p.isHost)) {
                room.players[0].isHost = true;
            }
            return room;
        }
    }
    return null;
};

const startGame = (code, wordsList, settings = {}) => {
    const room = rooms[code];
    if (!room) return null;

    // Reset state
    room.phase = 'playing';
    room.winner = null;
    room.settings = {
        totalRounds: settings.rounds || 2, // Default 2 rounds
        ...settings
    };
    room.state = {
        currentRound: 1,
        turnIndex: 0,
        turnOrder: [], // Will store player IDs
    };

    // Shuffle players for turn order
    room.state.turnOrder = room.players.map(p => p.id).sort(() => Math.random() - 0.5);

    room.players.forEach(p => {
        p.sentence = ""; // Keep for legacy/compatibility or current input
        p.words = []; // Store history of words
        p.votesReceived = 0;
        p.hasVoted = false;
        p.role = "crew";
    });

    // Assign roles
    const impostorIndex = Math.floor(Math.random() * room.players.length);
    room.impostorId = room.players[impostorIndex].id;
    room.impostorName = room.players[impostorIndex].name;
    room.players[impostorIndex].role = "impostor";

    // Pick word
    const wordIndex = Math.floor(Math.random() * wordsList.length);
    room.word = wordsList[wordIndex];

    return room;
};

const submitSentence = (code, playerId, sentence) => {
    const room = rooms[code];
    if (!room) return null;

    // Validate turn
    const currentPlayerId = room.state.turnOrder[room.state.turnIndex];
    if (playerId !== currentPlayerId) {
        return room; // Not their turn
    }

    const player = room.players.find(p => p.id === playerId);
    if (player) {
        player.sentence = sentence; // Current word
        player.words.push(sentence); // Add to history
    }

    // Move turn
    room.state.turnIndex++;

    // Check if round is complete
    if (room.state.turnIndex >= room.state.turnOrder.length) {
        // End of round
        if (room.state.currentRound < room.settings.totalRounds) {
            // Next round
            room.state.currentRound++;
            room.state.turnIndex = 0;
            // Clear current 'sentence' field for UI reset if needed, but history is in 'words'
            room.players.forEach(p => p.sentence = "");
        } else {
            // Game Over -> Voting
            room.phase = 'voting';
        }
    }
    return room;
};

const votePlayer = (code, voterId, targetId) => {
    const room = rooms[code];
    if (!room) return null;

    const voter = room.players.find(p => p.id === voterId);
    if (!voter || voter.hasVoted) return room;

    voter.hasVoted = true;
    const target = room.players.find(p => p.id === targetId);
    if (target) {
        target.votesReceived += 1;
    }

    // Check if all voted
    const allVoted = room.players.every(p => p.hasVoted);
    if (allVoted) {
        room.phase = 'results';

        // Calculate winner
        // Find player with max votes
        let maxVotes = -1;
        let mostVotedPlayer = null;
        room.players.forEach(p => {
            if (p.votesReceived > maxVotes) {
                maxVotes = p.votesReceived;
                mostVotedPlayer = p;
            } else if (p.votesReceived === maxVotes) {
                // Tie logic: maybe random or nobody verified?
                // For MVP: if tie, and one is impostor, impostor dies?
                // Let's just keep reference to the first one found for now or handle ties.
                // Tie usually means Impostor survives in Among Us unless...
                // Let's say: strictly > others.
                mostVotedPlayer = null; // Tie -> no ejection
            }
        });

        if (mostVotedPlayer && mostVotedPlayer.id === room.impostorId) {
            room.winner = 'crew';
        } else {
            room.winner = 'impostor';
        }
    }
    return room;
};

const restartGame = (code) => {
    const room = rooms[code];
    if (!room) return null;
    room.phase = 'lobby';
    room.word = null;
    room.impostorId = null;
    room.impostorName = null;
    room.winner = null;
    room.state = null; // Clear game state
    room.settings = null;
    room.players.forEach(p => {
        p.sentence = "";
        p.words = [];
        p.votesReceived = 0;
        p.hasVoted = false;
        p.role = "crew";
    });
    return room;
};

module.exports = {
    rooms,
    createRoom,
    joinRoom,
    getRoom,
    removePlayer,
    startGame,
    submitSentence,
    votePlayer,
    restartGame
};
