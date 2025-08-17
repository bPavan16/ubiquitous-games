import { useSudokuStore } from '@/store/sudokuStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Lightbulb, Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GameControls() {
  const { 
    currentGame, 
    startGame, 
    pauseGame, 
    resumeGame, 
    selectedCell,

    leaveGame
  } = useSudokuStore();

  if (!currentGame) return null;

  const socket = useSudokuStore.getState().socket;
  const currentPlayer = currentGame.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;

  const handleHint = () => {
    if (selectedCell && currentPlayer && currentPlayer.hints > 0) {
      const store = useSudokuStore.getState();
      store.useHint(selectedCell.row, selectedCell.col);
    }
  };

  const handleLeaveGame = () => {
    leaveGame();
  };

  return (
    <Card className=''>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Game Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Host Controls */}
          {isHost && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Host Controls</h4>
              <div className="flex gap-2">
                {currentGame.gameState === 'waiting' && (
                  <Button onClick={startGame} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                )}
                {currentGame.gameState === 'playing' && (
                  <Button onClick={pauseGame} variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                {currentGame.gameState === 'paused' && (
                  <Button onClick={resumeGame} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Player Controls */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Player Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleHint}
                disabled={
                  !selectedCell || 
                  !currentPlayer || 
                  currentPlayer.hints <= 0 || 
                  currentGame.gameState !== 'playing'
                }
                variant="outline"
                className="flex-1"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint ({currentPlayer?.hints || 0})
              </Button>
              <Button
                onClick={handleLeaveGame}
                variant="destructive"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>

          {/* Game Status Info */}
          {currentGame.gameState === 'waiting' && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Waiting for {isHost ? 'you to' : 'host to'} start the game...
              </span>
            </div>
          )}

          {currentGame.gameState === 'paused' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <Pause className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Game is paused
              </span>
            </div>
          )}

          {currentGame.gameState === 'finished' && currentGame.winner && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <span className="text-sm text-green-800">
                {currentGame.players.find(p => p.id === currentGame.winner)?.name} wins!
              </span>
            </div>
          )}

          {/* Selected Cell Info */}
          {selectedCell && currentGame.gameState === 'playing' && (
            <div className="text-center text-sm text-gray-600 p-2 bg-gray-50 rounded">
              Selected: Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
            </div>
          )}

          {/* Navigation */}
          <div className="pt-2 border-t border-gray-200">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full gap-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
