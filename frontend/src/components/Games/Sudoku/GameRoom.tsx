import { useState } from 'react';
import { SudokuBoard } from './SudokuBoard';
import { PlayerList } from './PlayerList';
import { GameControls } from './GameControls';
import { ChatPanel } from '../ChatPanel';
import { Leaderboard } from './Leaderboard';
import { useSudokuStore } from '@/store/sudokuStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Trophy, MessageCircle, Copy, Settings, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export function GameRoom() {
  const { currentGame } = useSudokuStore();
  
  // State for toggling different sections
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!currentGame) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'playing': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finished': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(currentGame.gameId);
    toast.success('Game ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-6 py-2">
      <div className="max-w-[1800px] mx-auto">
        {/* Enhanced Header */}

        <div className="mb-5">
          <Card className="border-0 py-2 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="px-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Gamepad2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Multiplayer Sudoku
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-600">Game ID:</span>
                      <code className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-sm">
                        {currentGame.gameId}
                      </code>
                      <button
                        onClick={copyGameId}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy Game ID"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  {/* Toggle Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setShowControls(!showControls)}
                      variant="outline"
                      className={`
                        gap-2 border-2 transition-all duration-300 hover:scale-105
                        ${showControls ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-white/50 backdrop-blur-sm'}
                      `}
                    >
                      <Settings className="w-4 h-4" />
                      Controls
                    </Button>
                    
                    <Button
                      onClick={() => setShowChat(!showChat)}
                      variant="outline"
                      className={`
                        gap-2 border-2 transition-all duration-300 hover:scale-105
                        ${showChat ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-white/50 backdrop-blur-sm'}
                      `}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                    
                    <Button
                      onClick={() => setShowLeaderboard(!showLeaderboard)}
                      variant="outline"
                      className={`
                        gap-2 border-2 transition-all duration-300 hover:scale-105
                        ${showLeaderboard ? 'bg-purple-50 border-purple-300 text-purple-700' : 'hover:bg-white/50 backdrop-blur-sm'}
                      `}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Stats
                    </Button>
                  </div>
                  
                  {/* Game Status Badges */}
                  <div className="flex items-center gap-3">
                    <Badge className={`${getDifficultyColor(currentGame.difficulty)} border font-semibold px-4 py-2`}>
                      {currentGame.difficulty.toUpperCase()}
                    </Badge>
                    <Badge className={`${getStatusColor(currentGame.gameState)} border font-semibold px-4 py-2`}>
                      {currentGame.gameState.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Layout - Three Columns */}
        <div className={`grid grid-cols-1 gap-4 ${
          showChat ? 'xl:grid-cols-12' : 'xl:grid-cols-9'
        }`}>

          {/* Left Sidebar - Players & Stats */}
          <div className="xl:col-span-3 space-y-2">
            {/* Players List - Always visible */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Players ({currentGame.players.length}/{currentGame.maxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList />
              </CardContent>
            </Card>

            {/* Game Controls */}
            {showControls && <GameControls />}

            {/* Leaderboard */}
            {showLeaderboard && currentGame.gameState !== 'waiting' && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard />
                </CardContent>
              </Card>
            )}

            {showLeaderboard && (
              <Card className="border-0 py-3 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
                <CardHeader className="mb-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Game Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2  ">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {currentGame.players.length}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Active Players</div>
                    </div>
                    <div className="bg-white/70 p-4 rounded-xl border border-green-100">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {currentGame.moveHistory?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Total Moves</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-xl border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {currentGame.startTime ?
                          Math.floor((Date.now() - currentGame.startTime) / 60000) : 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Minutes Played</div>
                    </div>
                    <div className="bg-white/70 p-4 rounded-xl border border-orange-100">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {currentGame.winner ? '🏆' : '⏳'}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Game Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center - Sudoku Board */}
          <div className={`${showChat ? 'xl:col-span-6' : 'xl:col-span-6'}`}>
            <Card className="border-0 shadow-xl bg-gradient-to-br max-h-[800px] from-white to-gray-50/50 h-full overflow-hidden">

              {/* <CardHeader className="text-center pb-4">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sudoku Puzzle
                </CardTitle>
                <div className="text-sm text-gray-600 font-medium">
                  Click on empty cells to make your move
                </div>
              </CardHeader> */}
              <CardContent className="flex justify-center items-center px-2 py-1">
                <div className="w-full ">
                  <SudokuBoard />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Chat */}
          {showChat && (
            <div className="xl:col-span-3">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/50 h-[600px] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    Game Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  <ChatPanel />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
