import { useEffect } from 'react';
import { GameLobby } from './GameLobby';
import { GameRoom } from './GameRoom';
import { useSudokuStore } from '@/store/sudokuStore';
import { Toaster } from '@/components/ui/sonner';

export function SudokuApp() {
  const { connect, currentGame, isConnected, disconnect } = useSudokuStore();

  useEffect(() => {
    // Connect when the Sudoku app mounts
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Show loading state while connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to Sudoku server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="SudokuApp">
      {currentGame ? <GameRoom /> : <GameLobby />}
      <Toaster richColors position="top-right" />
    </div>
  );
}
