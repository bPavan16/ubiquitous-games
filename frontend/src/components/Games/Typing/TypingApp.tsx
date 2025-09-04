import { Routes, Route } from 'react-router-dom';
import { TypingGameLobby } from './TypingGameLobby';
import { TypingGameRoom } from './TypingGameRoom';

export function TypingApp() {
  return (
    <Routes>
      <Route path="/" element={<TypingGameLobby />} />
      <Route path="/room/:roomId" element={<TypingGameRoom />} />
    </Routes>
  );
}
