import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTicTacToeStore } from '@/store/ticTacToeStore';
import { Users, Crown, Trophy } from 'lucide-react';

export function TicTacToePlayerList() {
  const { currentGame } = useTicTacToeStore();

  if (!currentGame) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Players ({currentGame.players.length}/{currentGame.maxPlayers})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentGame.players.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                  {player.symbol}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{player.name}</span>
                  {player.isHost && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Playing as {player.symbol}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {player.wins || 0}W
              </Badge>
              {currentGame.gameState === 'playing' && currentGame.currentPlayer === player.id && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600">
                  Current Turn
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: currentGame.maxPlayers - currentGame.players.length }).map((_, index) => (
          <div key={`empty-${index}`} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gray-300 text-gray-500">
                ?
              </AvatarFallback>
            </Avatar>
            <div className="text-gray-500">
              <div className="font-medium">Waiting for player...</div>
              <div className="text-sm">Share the game ID to invite friends</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
