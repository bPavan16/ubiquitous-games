import { useEffect } from 'react';
import { TicTacToeGameLobby } from './TicTacToeGameLobby';
import { TicTacToeGameRoom } from './TicTacToeGameRoom';
import { useTicTacToeStore } from '@/store/ticTacToeStore';
import { Toaster } from '@/components/ui/sonner';

export function TicTacToeApp() {
  const { connect, currentGame, isConnected, disconnect } = useTicTacToeStore();

  useEffect(() => {
    // Connect when the TicTacToe app mounts
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Show loading state while connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to TicTacToe server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="TicTacToeApp">
      {currentGame ? <TicTacToeGameRoom /> : <TicTacToeGameLobby />}
      <Toaster richColors position="top-right" />
    </div>
  );
}
