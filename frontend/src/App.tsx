import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameHome } from './components/Home/GameHome';
import { SudokuApp } from './components/Games/Sudoku/SudokuApp';
import { TicTacToeApp } from './components/Games/TicTacToe/TicTacToeApp';
import { BattleshipApp } from './components/Games/Battleship/BattleshipApp';
import { Toaster } from '@/components/ui/sonner';
import Demo from './components/demo';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home page with game selection */}
          <Route path="/" element={<GameHome />} />

          {/* Sudoku game routes */}
          <Route path="/sudoku/*" element={
            <div>
              <GameHome />
              <SudokuApp />
            </div>
          } />

          {/* Tic Tac Toe game routes */}
          <Route path="/tictactoe/*" element={
            <div>
              <GameHome />
              <TicTacToeApp />
            </div>
          } />

          {/* Battleship game routes */}
          <Route path="/battleship/*" element={
            <div>
              <GameHome />
              <BattleshipApp />
            </div>
          } />

          <Route path="/demo" element={<Demo />} />

        </Routes>
          <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

export default App;