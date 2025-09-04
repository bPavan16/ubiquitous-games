import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTypingStore } from '@/store/typingStore';
import { Users, Play, Plus, Keyboard, Trophy, Clock, RefreshCw, ArrowLeft, Zap, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function TypingGameLobby() {
  const navigate = useNavigate();
  const {
    playerName,
    setPlayerName,
    availableGames,
    createGame,
    joinGame,
    getAvailableGames,
    isConnected,
    currentGame
  } = useTypingStore();

  const [selectedMode, setSelectedMode] = useState<'text-race' | 'word-sprint'>('text-race');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  // Load available games when component mounts and when connected
  useEffect(() => {
    if (isConnected) {
      getAvailableGames();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        if (isConnected) {
          getAvailableGames();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isConnected, getAvailableGames]);

  // Clear joining state when successfully joined (redirected to game room)
  useEffect(() => {
    if (currentGame && currentGame.gameId) {
      setJoiningGameId(null);
      // Redirect to game room
      navigate(`/typing/room/${currentGame.gameId}`);
    }
  }, [currentGame, navigate]);

  const handleRefresh = async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    getAvailableGames();
    
    // Visual feedback for refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleCreateGame = () => {
    if (playerName.trim()) {
      createGame(playerName.trim(), selectedMode);
    }
  };

  const handleJoinGame = (gameId: string) => {
    if (playerName.trim()) {
      setJoiningGameId(gameId);
      joinGame(gameId, playerName.trim());
      
      // Clear loading state after timeout (in case of error)
      setTimeout(() => {
        setJoiningGameId(null);
      }, 5000);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'text-race': return 'bg-blue-100 text-blue-800';
      case 'word-sprint': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text-race': return <Target className="w-4 h-4" />;
      case 'word-sprint': return <Zap className="w-4 h-4" />;
      default: return <Keyboard className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-2">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Keyboard className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Speed Typing Arena</h1>
          </div>
          <p className="text-lg text-gray-600">Race against friends in real-time typing challenges</p>
        </div>

        {/* Player Name Input */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Player Setup
            </CardTitle>
            <CardDescription>Enter your name to join or create typing races</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="flex-1"
                  maxLength={20}
                />
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              {!playerName.trim() && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  ⚠️ Please enter your name to create or join games
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Game */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Race
              </CardTitle>
              <CardDescription>Start a new multiplayer typing challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Choose Game Mode
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedMode('text-race')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMode === 'text-race'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">Text Race</span>
                    </div>
                    <p className="text-sm text-gray-600">Race to type an entire paragraph accurately</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMode('word-sprint')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMode === 'word-sprint'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Word Sprint</span>
                    </div>
                    <p className="text-sm text-gray-600">Type as many words as possible in 60 seconds</p>
                  </button>
                </div>
              </div>
              <Button
                onClick={handleCreateGame}
                disabled={!playerName.trim() || !isConnected}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Create Race
              </Button>
            </CardContent>
          </Card>

          {/* Join Game */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join Race ({availableGames.length} available)
                </CardTitle>
                <CardDescription>Join an existing typing challenge</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={!isConnected || isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {!isConnected ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <p>Not connected to server</p>
                    <p className="text-sm">Please check your connection</p>
                  </div>
                ) : availableGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No races available</p>
                    <p className="text-sm">Create a new race to get started!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-3"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  availableGames.map((game) => (
                    <div
                      key={game.gameId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{game.host}'s Race</span>
                          <Badge className={getModeColor(game.mode)}>
                            <div className="flex items-center gap-1">
                              {getModeIcon(game.mode)}
                              {game.mode === 'text-race' ? 'Text Race' : 'Word Sprint'}
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {game.playerCount}/{game.maxPlayers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Waiting
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinGame(game.gameId)}
                        disabled={!playerName.trim() || !isConnected || joiningGameId === game.gameId}
                        className="min-w-[80px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {joiningGameId === game.gameId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Joining...</span>
                          </div>
                        ) : (
                          'Join'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Typing Arena Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{availableGames.length}</div>
                <div className="text-sm text-gray-600">Active Races</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {availableGames.reduce((acc, game) => acc + game.playerCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Typists Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Game Modes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Max Players</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
