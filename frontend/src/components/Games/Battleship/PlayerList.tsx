import { useBattleshipStore } from '@/store/battleshipStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Ship, 
  Target,
  Trophy,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  isCurrentPlayer: boolean;
  hits: number;
  misses: number;
  totalShots: number;
  accuracy: number;
  shipsDestroyed: number;
  score: number;
  board: {
    ships: Array<{ isDestroyed: boolean }>;
  };
  isReady: boolean;
}

export function PlayerList() {
  const { 
    currentGame,
    getCurrentPlayer
  } = useBattleshipStore();

  if (!currentGame) return null;

  const currentPlayer = getCurrentPlayer();
  const isSetupPhase = currentGame.gamePhase === 'setup';
  const isBattlePhase = currentGame.gamePhase === 'playing';
  const isGameFinished = currentGame.gamePhase === 'finished';

  const getPlayerStatusIcon = (player: Player) => {
    if (isSetupPhase) {
      return player.isReady ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Clock className="w-4 h-4 text-orange-600" />
      );
    }
    
    if (isBattlePhase) {
      return player.id === currentGame.currentPlayer ? (
        <Target className="w-4 h-4 text-red-600" />
      ) : (
        <Clock className="w-4 h-4 text-gray-400" />
      );
    }

    if (isGameFinished) {
      return player.id === currentGame.winner ? (
        <Trophy className="w-4 h-4 text-yellow-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      );
    }

    return null;
  };

  const getPlayerStatusText = (player: Player) => {
    if (isSetupPhase) {
      return player.isReady ? 'Ready' : 'Setting up';
    }
    
    if (isBattlePhase) {
      return player.id === currentGame.currentPlayer ? 'Active' : 'Waiting';
    }

    if (isGameFinished) {
      return player.id === currentGame.winner ? 'Winner' : 'Defeated';
    }

    return 'Waiting';
  };

  const getPlayerStatusColor = (player: Player) => {
    if (isSetupPhase) {
      return player.isReady 
        ? 'bg-green-100 text-green-800 border-green-300'
        : 'bg-orange-100 text-orange-800 border-orange-300';
    }
    
    if (isBattlePhase) {
      return player.id === currentGame.currentPlayer
        ? 'bg-red-100 text-red-800 border-red-300'
        : 'bg-gray-100 text-gray-800 border-gray-300';
    }

    if (isGameFinished) {
      return player.id === currentGame.winner
        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
        : 'bg-red-100 text-red-800 border-red-300';
    }

    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Players Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br p-2 py-1 from-gray-100 to-gray-200">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between text-lg text-gray-900">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Players
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
              {currentGame.players.length} / {currentGame.maxPlayers}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Player List */}
      <div className="space-y-3">
        {currentGame.players.map((player) => {
          const isCurrentUser = player.id === currentPlayer?.id;
          const isHost = player.id === currentGame.host;
          
          return (
            <Card 
              key={player.id} 
              className={`border-0 p-1 shadow-lg transition-all ${
                isCurrentUser 
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 border-2 border-gray-300">
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                      {getPlayerInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {player.name}
                        {isCurrentUser && (
                          <span className="text-blue-600 text-sm ml-1">(You)</span>
                        )}
                      </span>
                      
                      {/* Host Crown */}
                      {isHost && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mt-1">
                      {getPlayerStatusIcon(player)}
                      <Badge className={`text-xs ${getPlayerStatusColor(player)}`}>
                        {getPlayerStatusText(player)}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right text-sm">
                    {(isBattlePhase || isGameFinished) && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Ship className="w-3 h-3" />
                          <span>{player.board.ships.filter(ship => !ship.isDestroyed).length}/5</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Target className="w-3 h-3" />
                          <span>{player.totalShots || 0}</span>
                        </div>
                        {player.accuracy !== undefined && (
                          <div className="text-xs text-gray-500">
                            {Math.round(player.accuracy * 100)}% acc
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isSetupPhase && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Ship className="w-3 h-3" />
                        <span>{player.board.ships.length}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Stats for Battle/Finished Phase */}
                {(isBattlePhase || isGameFinished) && (
                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div className="text-center">
                        <div className="text-gray-500">Hits</div>
                        <div className="text-red-600 font-semibold">{player.hits || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Misses</div>
                        <div className="text-blue-600 font-semibold">{player.misses || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Ships Sunk</div>
                        <div className="text-green-600 font-semibold">{player.shipsDestroyed || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Score</div>
                        <div className="text-yellow-600 font-semibold">{player.score || 0}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Waiting for Players */}
      {currentGame.players.length < currentGame.maxPlayers && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-2 text-orange-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Waiting for {currentGame.maxPlayers - currentGame.players.length} more player(s) to join...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Phase Instructions */}
      {isSetupPhase && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
          <CardContent className="px-4 py-0">
            <div className="text-blue-700 text-sm space-y-2">
              <div className="font-semibold">Setup Phase</div>
              <div className="text-xs opacity-75">
                All players must place their ships before the battle can begin.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isBattlePhase && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-100 to-red-200 border-red-300">
          <CardContent className="px-4 py-0">
            <div className="text-red-700 text-sm space-y-2">
              <div className="font-semibold">Battle Phase</div>
              <div className="text-xs opacity-75">
                Take turns firing at enemy positions. First to sink all ships wins!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGameFinished && currentGame.winner && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300">
          <CardContent className="p-4">
            <div className="text-yellow-700 text-sm space-y-2">
              <div className="font-semibold">Game Finished!</div>
              <div className="text-xs opacity-75">
                {currentGame.winner === currentPlayer?.id 
                  ? '🎉 Congratulations! You won!'
                  : `${currentGame.players.find(p => p.id === currentGame.winner)?.name} won the battle!`
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
