import { useSudokuStore } from '@/store/sudokuStore';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Target, Zap } from 'lucide-react';

export function Leaderboard() {
  const { currentGame } = useSudokuStore();

  if (!currentGame || !currentGame.leaderboard.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No leaderboard data yet</p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-gray-100 text-gray-800';
      case 2:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-3">
      {currentGame.leaderboard.map((player, index) => (
        <div 
          key={player.id} 
          className={`flex items-center justify-between p-3 rounded-lg border-2 ${
            index === 0 
              ? 'border-yellow-200 bg-yellow-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(index)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{player.name}</span>
                <Badge className={getRankBadgeColor(index)}>
                  #{index + 1}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {player.completion}%
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {player.correctMoves} correct
                </span>
                <span className="text-red-500">
                  {player.incorrectMoves} wrong
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
      
      {currentGame.gameState === 'finished' && currentGame.winner && (
        <div className="text-center mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-lg text-gray-800">
            Congratulations {currentGame.leaderboard[0]?.name}!
          </div>
          <div className="text-sm text-gray-600">
            Game completed in {currentGame.startTime && currentGame.endTime ? 
              Math.floor((currentGame.endTime - currentGame.startTime) / 60000) : 0} minutes
          </div>
        </div>
      )}
    </div>
  );
}
