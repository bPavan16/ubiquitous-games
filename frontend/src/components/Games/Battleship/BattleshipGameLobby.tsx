import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleshipStore } from '@/store/battleshipStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Anchor, 
  Users, 
  Plus, 
  Play, 
  Clock,
  Waves,
  Ship,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface AvailableGame {
  gameId: string;
  host: string;
  playerCount: number;
  maxPlayers: number;
  startTime: number;
}

export function BattleshipGameLobby() {
  const navigate = useNavigate();
  const { createGame, joinGame, currentGame, isConnected } = useBattleshipStore();
  const [playerName, setPlayerName] = useState('');
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [availableGames] = useState<AvailableGame[]>([]);

  useEffect(() => {
    if (currentGame) {
      navigate(`/battleship/room/${currentGame.gameId}`);
    }
  }, [currentGame, navigate]);

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    createGame(playerName.trim());
  };

  const handleJoinGame = (gameId?: string) => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    const id = gameId || gameIdToJoin;
    if (!id.trim()) {
      toast.error('Please enter a game ID');
      return;
    }
    joinGame(id.trim(), playerName.trim());
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-slate-800 to-indigo-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float">
          <Waves className="w-8 h-8 text-blue-300/20" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delay">
          <Ship className="w-12 h-12 text-blue-400/20" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float">
          <Anchor className="w-10 h-10 text-blue-300/20" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-float-delay">
          <Target className="w-6 h-6 text-blue-400/20" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-3">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Ship className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Battleship Arena
            </h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Command your fleet in the ultimate naval strategy battle. 
            Place your ships, outsmart your opponent, and rule the seas!
          </p>
          
          {/* Connection status */}
          <div className="mt-2">
            <Badge 
              className={`px-4 py-2 text-sm font-medium ${
                isConnected 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}
            >
              {isConnected ? '🟢 Connected to Game Server' : '🔴 Disconnected'}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto ">
          {/* Create/Join Game Section */}
          <Card className="border-0 gap-1 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Start Your Battleship Adventure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Player Name Input */}
              <div className="space-y-2">
                <label className="text-md  font-medium text-blue-200">
                  Player Name
                </label>
                <Input
                  placeholder="Enter your player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  maxLength={20}
                />
              </div>

              <Separator className="bg-slate-700" />

              {/* Create New Game */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-400" />
                  Start Your Game
                </h3>
                <Button
                  onClick={handleCreateGame}
                  disabled={!isConnected || !playerName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Anchor className="w-5 h-5 mr-2" />
                  Deploy New Fleet
                </Button>
              </div>

              <Separator className="bg-slate-700" />

              {/* Join Existing Game */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Join Existing Battle
                </h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Game ID..."
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <Button
                    onClick={() => handleJoinGame()}
                    disabled={!isConnected || !playerName.trim() || !gameIdToJoin.trim()}
                    className="px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules & Info */}
          <Card className="border-0 gap-1 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Rules of Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Overview */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Fleet Composition</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'Carrier', size: 5, icon: '🚢' },
                    { name: 'Battleship', size: 4, icon: '⚓' },
                    { name: 'Cruiser', size: 3, icon: '🛥️' },
                    { name: 'Submarine', size: 3, icon: '🌊' },
                    { name: 'Destroyer', size: 2, icon: '🚤' }
                  ].map((ship) => (
                    <div key={ship.name} className="flex items-center justify-between py-1 px-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ship.icon}</span>
                        <span className="text-white font-medium">{ship.name}</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {ship.size} cells
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Battle Rules */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Battle Protocol</h3>
                <div className="space-y-2 text-sm text-blue-200">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>Place all 5 ships on your 10×10 grid</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>Ships can be placed horizontally or vertically</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>Take turns firing at enemy coordinates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>Hit = continue turn, Miss = opponent's turn</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>First to sink all enemy ships wins!</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Games (if any) */}
        {availableGames.length > 0 && (
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm max-w-6xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                <Users className="w-5 h-5 text-blue-400" />
                Active Naval Battles ({availableGames.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableGames.map((game) => (
                  <div
                    key={game.gameId}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">{game.host}</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {game.playerCount}/{game.maxPlayers} Admirals
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(game.startTime)}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinGame(game.gameId)}
                      disabled={!playerName.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Join Battle
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
