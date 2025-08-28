import { useBattleshipStore } from '@/store/battleshipStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RotateCw, 
  Target, 
  Ship, 
  Pause, 
  Play, 
  RefreshCw,
  Home,
  Timer
} from 'lucide-react';

export function GameControls() {
  
  const { 
    currentGame,
    getCurrentPlayer,
    getOpponent,
    targetMode,
    setTargetMode,
    resetGame,
    leaveGame,
    isMyTurn
  } = useBattleshipStore();

  if (!currentGame) return null;

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();
  const isSetupPhase = currentGame.gamePhase === 'setup';
  const isBattlePhase = currentGame.gamePhase === 'playing';
  const isGameFinished = currentGame.gamePhase === 'finished';

  const toggleTargetMode = () => {
    setTargetMode(!targetMode);
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all ships and start over.')) {
      resetGame();
    }
  };

  const handleLeaveGame = () => {
    if (window.confirm('Are you sure you want to leave the game?')) {
      leaveGame();
    }
  };

  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="status" className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Status
        </TabsTrigger>
        <TabsTrigger value="fleet" className="flex items-center gap-1">
          <Ship className="w-3 h-3" />
          Fleet
        </TabsTrigger>
        {isBattlePhase && (
          <TabsTrigger value="battle" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Battle
          </TabsTrigger>
        )}
        <TabsTrigger value="actions" className="flex items-center gap-1">
          <RotateCw className="w-3 h-3" />
          Actions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="status" className="space-y-2 mt-4">
        {/* Game Status */}
        <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
          <CardHeader className="pb-0 mb-0">
            <CardTitle className="flex items-center gap-2 pb-0 text-lg text-slate-800">
              <Timer className="w-5 h-5 text-blue-500" />
              Game Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Game Phase */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Phase:</span>
              <Badge className={`${
                isSetupPhase 
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : isBattlePhase
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-green-100 text-green-700 border-green-200'
              }`}>
                {isSetupPhase && 'Setup'}
                {isBattlePhase && 'Battle'}
                {isGameFinished && 'Finished'}
              </Badge>
            </div>

            {/* Turn Indicator */}
            {isBattlePhase && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Turn:</span>
                <Badge className={`${
                  isMyTurn() 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                  {isMyTurn() ? 'Your Turn' : 'Enemy Turn'}
                </Badge>
              </div>
            )}

            {/* Player Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Players:</span>
              <span className="text-sm text-slate-800 font-semibold">
                {currentGame.players.length} / 2
              </span>
            </div>

            {/* Game ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Game ID:</span>
              <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {currentGame.gameId}
              </code>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fleet" className="space-y-2 mt-4">
        {/* Ship Status */}
        {currentPlayer && (
          <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Ship className="w-5 h-5 text-green-500" />
                Your Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ships:</span>
                  <span className="text-slate-800 font-semibold">
                    {currentPlayer.board.ships.length} / 5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Hits Taken:</span>
                  <span className="text-red-700 font-semibold">
                    {currentPlayer.board.hits.length}
                  </span>
                </div>
              </div>

              {/* Ship Health */}
              {currentPlayer.board.ships.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Fleet Status:</div>
                  <div className="space-y-1">
                    {currentPlayer.board.ships.map((ship, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 capitalize">{ship.name}</span>
                        <Badge className={`text-xs ${
                          ship.isDestroyed
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-green-100 text-green-700 border-green-300'
                        }`}>
                          {ship.isDestroyed ? 'SUNK' : 'ACTIVE'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enemy Status */}
        {opponent && isBattlePhase && (
          <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Target className="w-5 h-5 text-red-500" />
                Enemy Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ships Sunk:</span>
                  <span className="text-red-700 font-semibold">
                    {opponent.board.ships.filter(ship => ship.isDestroyed).length} / 5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Your Shots:</span>
                  <span className="text-blue-700 font-semibold">
                    {currentPlayer?.board.shots.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {isBattlePhase && (
        <TabsContent value="battle" className="space-y-2 mt-4">
          {/* Battle Controls */}
          <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Target className="w-5 h-5 text-red-500" />
                Battle Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {/* Target Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-800">Targeting Mode:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTargetMode}
                  className={`border-slate-300 ${
                    targetMode
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {targetMode ? 'ON' : 'OFF'}
                </Button>
              </div>

              {/* Turn Status */}
              {isMyTurn() ? (
                <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Your turn! Select enemy waters to fire.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Pause className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Waiting for opponent's move...
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="actions" className="space-y-2 mt-4">
        {/* Game Actions */}
        <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <RotateCw className="w-5 h-5 text-purple-500" />
              Game Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Reset Game */}
            <Button
              variant="outline"
              onClick={handleResetGame}
              className="w-full border-slate-300 bg-slate-200 text-slate-700 hover:bg-slate-300"
              disabled={isGameFinished}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Game
            </Button>

            {/* Leave Game */}
            <Button
              variant="outline"
              onClick={handleLeaveGame}
              className="w-full border-red-300 bg-red-100 text-red-700 hover:bg-red-200 hover:border-red-400"
            >
              <Home className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card className="border-1 border-black shadow-lg bg-gradient-to-br from-white to-slate-100">
          <CardContent className="p-1 px-4">
            <div className="text-xs text-slate-500 space-y-2">
              <div className="font-semibold text-slate-700">How to Play:</div>
              {isSetupPhase && (
                <ul className="space-y-1 list-disc list-inside">
                  <li>Place all 5 ships on your board</li>
                  <li>Ships cannot overlap or go off the board</li>
                  <li>Wait for opponent to finish setup</li>
                </ul>
              )}
              {isBattlePhase && (
                <ul className="space-y-1 list-disc list-inside">
                  <li>Take turns firing at enemy waters</li>
                  <li>First to sink all enemy ships wins</li>
                  <li>Red = Hit, Blue = Miss</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
