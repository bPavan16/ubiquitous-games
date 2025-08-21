import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTicTacToeStore } from '@/store/ticTacToeStore';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToePlayerList } from './TicTacToePlayerList';
import { ChatPanel } from '../../ChatPanel';
import { 
  Trophy, 
  Users, 
  Play, 
  LogOut, 
  MessageSquare,
  BarChart3,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function TicTacToeGameRoom() {
  const {
    currentGame,
    leaveGame,
    startGame,
    chatMessages,
    sendChatMessage,
    isConnected,
    playAgain
  } = useTicTacToeStore();

  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!currentGame) {
    return null;
  }

  const isHost = currentGame.players.some(p => p.isHost && p.id === currentGame.host);
  const canStart = currentGame.players.length === 2 && currentGame.gameState === 'waiting';

  // Transform chat messages to match ChatPanel interface
  const transformedMessages = chatMessages.map((msg, index) => ({
    id: `${msg.playerId}-${msg.timestamp}-${index}`,
    playerId: msg.playerId,
    playerName: msg.playerName,
    message: msg.message,
    timestamp: new Date(msg.timestamp),
    type: 'message' as const
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/tictactoe">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Lobby
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-600" />
                Tic Tac Toe Game
              </h1>
              <p className="text-gray-600 mt-1">
                Game ID: {currentGame.gameId.slice(-8)} • Status: 
                <Badge variant="secondary" className="ml-2">
                  {currentGame.gameState}
                </Badge>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
              </Button>
              
              <Button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                variant="outline"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Stats
              </Button>
              
              <Button
                onClick={leaveGame}
                variant="destructive"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Game
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board - Takes up most space */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Game Board</span>
                  {currentGame.gameState === 'waiting' && isHost && (
                    <Button
                      onClick={startGame}
                      disabled={!canStart}
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentGame.gameState === 'waiting' ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      Waiting for Players
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Need {2 - currentGame.players.length} more player{2 - currentGame.players.length !== 1 ? 's' : ''} to start
                    </p>
                    {!isHost && (
                      <p className="text-sm text-gray-400">
                        Waiting for host to start the game...
                      </p>
                    )}
                  </div>
                ) : (
                  <TicTacToeBoard />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players */}
            <TicTacToePlayerList />

            {/* Game Status */}
            {currentGame.gameState === 'playing' && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Current Turn</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentGame.currentPlayer ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {currentGame.players.find(p => p.id === currentGame.currentPlayer)?.symbol}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {currentGame.players.find(p => p.id === currentGame.currentPlayer)?.name}'s Turn
                        </div>
                        <div className="text-sm text-gray-500">
                          Playing as {currentGame.players.find(p => p.id === currentGame.currentPlayer)?.symbol}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Waiting for game to start...</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Game Result */}
            {currentGame.gameState === 'finished' && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Game Over
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentGame.winner ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        🎉 {currentGame.players.find(p => p.id === currentGame.winner)?.name} Wins!
                      </div>
                      <div className="text-gray-600 mb-4">
                        Playing as {currentGame.players.find(p => p.id === currentGame.winner)?.symbol}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600 mb-2">
                        🤝 It's a Draw!
                      </div>
                      <div className="text-gray-500 mb-4">
                        Great game, everyone!
                      </div>
                    </div>
                  )}
                  
                  {/* Play Again Button - Only show for host */}
                  {isHost && (
                    <div className="flex flex-col items-center mt-4 space-y-2">
                      <div className="text-sm text-gray-600 text-center">
                        Symbols will switch for the next round
                      </div>
                      <Button
                        onClick={playAgain}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Play Again (Switch Sides)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chat Panel */}
            {showChat && (
              <div className="lg:col-span-1">
                <ChatPanel
                  messages={transformedMessages}
                  onSendMessage={sendChatMessage}
                  playerCount={currentGame?.players.length || 0}
                  isConnected={isConnected}
                />
              </div>
            )}

            {/* Leaderboard */}
            {showLeaderboard && currentGame.leaderboard && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Player Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentGame.leaderboard.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">
                              {player.wins}W • {player.losses}L • {player.draws}D
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
