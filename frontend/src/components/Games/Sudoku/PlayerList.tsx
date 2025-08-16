import { useSudokuStore } from '@/store/sudokuStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Lightbulb, Target, Zap } from 'lucide-react';

export function PlayerList() {
  const { currentGame } = useSudokuStore();

  if (!currentGame) return null;

  const { players } = currentGame;

  return (
    <div className="space-y-3">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className={`${player.isHost ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-600'}`}>
                {player.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{player.name}</span>
                {player.isHost && (
                  <div className="flex items-center" title="Host">
                    <Crown className="w-4 h-4 text-yellow-600" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {player.completion}%
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {player.score}
                </span>
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {player.hints}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-800">{player.score}</div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
      ))}
    </div>
  );
}
