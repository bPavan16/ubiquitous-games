import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattleshipStore } from '@/store/battleshipStore';
import { BattleshipBoard } from './BattleshipBoard';
import { ShipPlacement } from './ShipPlacement';
import { GameControls } from './GameControls';
import { PlayerList } from './PlayerList';
import { ChatPanel } from '../ChatPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ship, 
  Users, 
  MessageCircle, 
  Copy, 
  ArrowLeft,
  Target,
  Timer,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

export function BattleshipGameRoom() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    currentGame, 
    leaveGame, 
    getCurrentPlayer, 
    getOpponent,
    isMyTurn
  } = useBattleshipStore();

  useEffect(() => {
    if (!currentGame && gameId) {
      // If we don't have a current game but have a gameId, redirect to lobby
      navigate('/battleship');
    }
  }, [currentGame, gameId, navigate]);

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-200/50">
          <Ship className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Loading Naval Command...</h1>
          <p className="text-blue-600">Establishing connection to fleet headquarters</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();
  const isSetupPhase = currentGame.gamePhase === 'setup';
  const isBattlePhase = currentGame.gamePhase === 'playing';
  const isGameFinished = currentGame.gameState === 'finished';

  const copyGameId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      toast.success('Game ID copied to clipboard!');
    }
  };

  const handleLeaveGame = () => {
    leaveGame();
    navigate('/battleship');
  };

  const getGamePhaseInfo = () => {
    if (isSetupPhase) {
      if (currentPlayer?.isReady) {
        return {
          title: 'Fleet Deployed',
          description: 'Waiting for opponent to deploy their fleet...',
          color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300 shadow-sm'
        };
      } else {
        return {
          title: 'Deploy Your Fleet',
          description: 'Place all 5 ships on your board to begin battle',
          color: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-300 shadow-sm'
        };
      }
    } else if (isBattlePhase) {
      const myTurn = isMyTurn();
      return {
        title: myTurn ? 'Your Turn' : `${opponent?.name}'s Turn`,
        description: myTurn ? 'Fire at enemy coordinates!' : 'Waiting for enemy to fire...',
        color: myTurn 
          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-300 shadow-sm'
          : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300 shadow-sm'
      };
    } else if (isGameFinished) {
      const isWinner = currentGame.winner === currentPlayer?.id;
      return {
        title: isWinner ? 'Victory!' : 'Defeat',
        description: isWinner 
          ? 'You have successfully sunk all enemy ships!' 
          : 'Your fleet has been destroyed!',
        color: isWinner 
          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-300 shadow-sm'
          : 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border border-rose-300 shadow-sm'
      };
    }
    return {
      title: 'Preparing for Battle',
      description: 'Waiting for players...',
      color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-300 shadow-sm'
    };
  };

  const gamePhaseInfo = getGamePhaseInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100">
      <div className="container mx-auto px-3 py-1">
        {/* Header */}
        <div className="mb-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
               
                  
                  <div className="h-4 w-px bg-slate-200" />
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded-md">
                      <Ship className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      Battleship
                    </h1>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-sm border">
                      {gameId?.slice(-8)}
                    </code>
                    <Button
                      onClick={copyGameId}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`px-2 py-1 text-xs font-medium ${gamePhaseInfo.color}`}>
                    {gamePhaseInfo.title}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 text-xs font-medium text-blue-700 border-blue-200 bg-blue-50">
                    {currentGame.players.length}/2
                  </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleLeaveGame}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Leave
                  </Button>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Ship Placement & Controls */}
          <div className="xl:col-span-3 space-y-3">

            
            
            {/* Ship Placement Panel (Setup Phase) */}
            {isSetupPhase && (
              <Card className="shadow-xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-blue-900">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                      <Ship className="w-4 h-4 text-white" />
                    </div>
                    Fleet Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ShipPlacement />
                </CardContent>
              </Card>
            )}

            {/* Game Controls */}
            {(isBattlePhase || isGameFinished) && (
              <Card className="shadow-xl bg-gradient-to-br gap-1  from-white to-amber-50/50 border border-amber-100/60">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-amber-900">
                    <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h1 className='font-bold text-amber-900 text-2xl'>Battle Control</h1>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <GameControls />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center - Game Boards */}
          <div className="xl:col-span-6">
            <BattleshipBoard />
          </div>

          {/* Right Sidebar - Chat & Info Tabs */}
          <div className="xl:col-span-3">
            <Card className="shadow-xl bg-gradient-to-br min-h-[700px] from-white to-indigo-50/50 border border-indigo-200/60 h-[500px] max-w-full flex flex-col">
              <CardContent className="flex-1 min-h-0 p-0">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                  <TabsList className="grid w-full  max-w-[90%] grid-cols-3 self-center mb-0">
                    <TabsTrigger value="chat" className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="players" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Players
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      Stats
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 min-h-0 m-0 p-3 pt-0">
                    <div className="h-full">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Battle Communications
                        </h3>
                      </div>
                      <div className="h-[calc(100%-2rem)]">
                        <ChatPanel />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Players Tab */}
                  <TabsContent value="players" className="flex-1 min-h-0 m-0 p-3 pt-0">
                    <div className="h-full">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Fleet Admirals ({currentGame.players.length}/2)
                        </h3>
                      </div>
                      <div className="h-[calc(100%-2rem)] overflow-y-auto">
                        <PlayerList />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Battle Statistics Tab */}
                  <TabsContent value="stats" className="flex-1 min-h-0 m-0 p-3 pt-0">
                    <div className="h-full">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Battle Statistics
                        </h3>
                      </div>
                      <div className="h-[calc(100%-2rem)] overflow-y-auto space-y-3">
                        {currentPlayer && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-2 rounded-lg text-center shadow-sm">
                              <div className="text-lg font-bold text-emerald-700">{currentPlayer.hits}</div>
                              <div className="text-xs text-emerald-600 font-medium">Hits</div>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-2 rounded-lg text-center shadow-sm">
                              <div className="text-lg font-bold text-rose-700">{currentPlayer.misses}</div>
                              <div className="text-xs text-rose-600 font-medium">Misses</div>
                            </div>
                            <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 p-2 rounded-lg text-center shadow-sm">
                              <div className="text-lg font-bold text-sky-700">{currentPlayer.accuracy}%</div>
                              <div className="text-xs text-sky-600 font-medium">Accuracy</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-2 rounded-lg text-center shadow-sm">
                              <div className="text-lg font-bold text-orange-700">{currentPlayer.shipsDestroyed}</div>
                              <div className="text-xs text-orange-600 font-medium">Ships Sunk</div>
                            </div>
                          </div>
                        )}
                        
                        {currentGame.startTime && (
                          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 text-violet-700">
                              <Timer className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Battle Duration: {Math.floor((Date.now() - currentGame.startTime) / 60000)}m
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Opponent Stats if available */}
                        {opponent && (isBattlePhase || isGameFinished) && (
                          <div className="mt-4">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Opponent Stats</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-2 rounded-lg text-center shadow-sm">
                                <div className="text-lg font-bold text-red-700">{opponent.hits}</div>
                                <div className="text-xs text-red-600 font-medium">Their Hits</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-2 rounded-lg text-center shadow-sm">
                                <div className="text-lg font-bold text-green-700">{opponent.misses}</div>
                                <div className="text-xs text-green-600 font-medium">Their Misses</div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-2 rounded-lg text-center shadow-sm">
                                <div className="text-lg font-bold text-blue-700">{opponent.accuracy}%</div>
                                <div className="text-xs text-blue-600 font-medium">Their Accuracy</div>
                              </div>
                              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-2 rounded-lg text-center shadow-sm">
                                <div className="text-lg font-bold text-yellow-700">{opponent.shipsDestroyed}</div>
                                <div className="text-xs text-yellow-600 font-medium">Ships They Sunk</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
