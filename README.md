# Mongolian Impostor Word Game

A browser-based multiplayer word game inspired by Among Us / Impostor, built with React and Node.js.

## How to Run

### Prerequisites
- Node.js installed

### 1. Start the Server
Open a terminal in the root directory:
```bash
cd server
npm install
node index.js
```
Server runs on `http://localhost:3000`.

### 2. Start the Client
Open a second terminal in the root directory:
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

### 3. Play
1. Open `http://localhost:5173` in multiple browser tabs (use Incognito mode or separate profiles for best results).
2. **Host**: Enter name and click "Create Room".
3. **Others**: Enter name, Room Code, and click "Join Room".
4. Once 4+ players join, Host can start the game.

## Tech Stack
- Frontend: React + Vite + Vanilla CSS
- Backend: Node.js + Express + Socket.io
- State: In-memory (Reset on server restart)
