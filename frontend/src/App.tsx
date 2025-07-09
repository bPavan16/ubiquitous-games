import { useEffect } from 'react';
import { GameLobby } from './components/GameLobby';
import { GameRoom } from './components/GameRoom';
import { useSudokuStore } from './store/sudokuStore';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { connect, currentGame, isConnected } = useSudokuStore();

  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      const { disconnect } = useSudokuStore.getState();
      disconnect();
    };
  }, [connect]);

  // Show loading state while connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentGame ? <GameRoom /> : <GameLobby />}
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;