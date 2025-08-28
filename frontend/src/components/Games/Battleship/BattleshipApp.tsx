import { Routes, Route } from 'react-router-dom';
import { BattleshipGameLobby } from './BattleshipGameLobby';
import { BattleshipGameRoom } from './BattleshipGameRoom';

export function BattleshipApp() {
    return (
        <Routes>
            <Route path="/" element={<BattleshipGameLobby />} />
            <Route path="/room/:gameId" element={<BattleshipGameRoom />} />
        </Routes>
    );
}
