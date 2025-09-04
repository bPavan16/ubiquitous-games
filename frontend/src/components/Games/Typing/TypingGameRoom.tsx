import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTypingStore } from '@/store/typingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Keyboard, 
  Users, 
  Trophy, 
  ArrowLeft, 
  Target, 
  Zap,
  Timer,
  Play
} from 'lucide-react';

export function TypingGameRoom() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const {
    currentGame,
    leaveGame,
    getCurrentPlayer,
    getOpponents,
    updateTypingProgress,
    startGame,
    currentInput
  } = useTypingStore();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!currentGame && gameId) {
      // If we don't have a current game but have a gameId, redirect to lobby
      navigate('/typing');
    }
  }, [currentGame, gameId, navigate]);

  // Timer for word sprint mode
  useEffect(() => {
    if (currentGame?.mode === 'word-sprint' && 
        currentGame?.gameState === 'playing' && 
        currentGame?.timeRemaining !== null && 
        currentGame?.timeRemaining !== undefined) {
      
      const interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime === null) return currentGame.timeRemaining!;
          const newTime = Math.max(0, prevTime - 1);
          if (newTime <= 0) {
            clearInterval(interval);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentGame]);

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-200/50">
          <Keyboard className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-purple-900 mb-2">Loading Typing Arena...</h1>
          <p className="text-purple-600">Connecting to the race</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const opponents = getOpponents();
  const isWaiting = currentGame.gameState === 'waiting';
  const isPlaying = currentGame.gameState === 'playing';
  const isFinished = currentGame.gameState === 'finished';
  const isHost = currentPlayer?.isHost;

  const handleLeaveGame = () => {
    leaveGame();
    navigate('/typing');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying) return;
    
    const value = e.target.value;
    updateTypingProgress(value);
  };

  const handleStartGame = () => {
    if (isHost) {
      startGame();
    }
  };

  const getGameModeInfo = () => {
    if (currentGame.mode === 'text-race') {
      return {
        title: 'Text Race',
        icon: <Target className="w-5 h-5" />,
        description: 'Type the entire text as fast and accurately as possible',
        color: 'from-blue-500 to-indigo-600'
      };
    } else {
      return {
        title: 'Word Sprint',
        icon: <Zap className="w-5 h-5" />,
        description: 'Type as many words correctly as possible',
        color: 'from-purple-500 to-pink-600'
      };
    }
  };

  const modeInfo = getGameModeInfo();

  const renderTextToType = () => {
    if (currentGame.mode === 'text-race' && currentGame.text) {
      const text = currentGame.text;
      const typedLength = currentInput.length;
      
      return (
        <div className="text-lg leading-relaxed font-mono p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <span className="bg-green-200 text-green-800">
            {text.substring(0, typedLength)}
          </span>
          <span className="bg-yellow-200">
            {text.charAt(typedLength)}
          </span>
          <span className="text-gray-600">
            {text.substring(typedLength + 1)}
          </span>
        </div>
      );
    } else if (currentGame.mode === 'word-sprint' && currentGame.words) {
      const words = currentGame.words;
      const typedWords = currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      
      return (
        <div className="text-lg leading-relaxed font-mono p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          {words.map((word, index) => {
            let className = 'mr-2 px-2 py-1 rounded';
            
            if (index < typedWords.length) {
              className += typedWords[index] === word 
                ? ' bg-green-200 text-green-800' 
                : ' bg-red-200 text-red-800';
            } else if (index === typedWords.length) {
              className += ' bg-yellow-200 text-yellow-800';
            } else {
              className += ' bg-gray-200 text-gray-600';
            }
            
            return (
              <span key={index} className={className}>
                {word}
              </span>
            );
          })}
        </div>
      );
    }
    
    return <div className="text-center text-gray-500 p-8">Waiting for game to start...</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleLeaveGame}
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Race
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {modeInfo.icon}
              <h1 className="text-2xl font-bold text-gray-800">{modeInfo.title}</h1>
            </div>
            <p className="text-gray-600">{modeInfo.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {currentGame.players.length}/4 Players
            </Badge>
            {isPlaying && currentGame.mode === 'word-sprint' && timeLeft !== null && (
              <Badge className="px-3 py-1 bg-red-500 text-white">
                <Timer className="w-3 h-3 mr-1" />
                {timeLeft}s
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Typing Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Text to Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  {currentGame.mode === 'text-race' ? 'Text to Type' : 'Words to Type'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTextToType()}
              </CardContent>
            </Card>

            {/* Typing Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Your Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isWaiting ? (
                  <div className="text-center py-8">
                    <Keyboard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 mb-4">Waiting for race to start...</p>
                    {isHost && (
                      <Button
                        onClick={handleStartGame}
                        className={`bg-gradient-to-r ${modeInfo.color} text-white`}
                        disabled={currentGame.players.length < 2}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Race
                      </Button>
                    )}
                    {!isHost && (
                      <p className="text-sm text-gray-400">Waiting for host to start the race</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={currentInput}
                    onChange={handleInputChange}
                    disabled={!isPlaying}
                    placeholder={isPlaying ? "Start typing here..." : "Race finished!"}
                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-purple-500 focus:outline-none resize-none"
                    autoFocus={isPlaying}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Players Panel */}
          <div className="space-y-4">
            {/* Current Player Stats */}
            {currentPlayer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{currentPlayer.wmp}</div>
                      <div className="text-xs text-gray-600">WPM</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{currentPlayer.accuracy}%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                  </div>
                  
                  {currentGame.mode === 'text-race' && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(currentPlayer.progress)}%</span>
                      </div>
                      <Progress value={currentPlayer.progress} className="h-2" />
                    </div>
                  )}
                  
                  {currentGame.mode === 'word-sprint' && (
                    <div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{currentPlayer.progress}</div>
                        <div className="text-xs text-gray-600">Words Completed</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Other Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Other Racers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opponents.map((player) => (
                  <div key={player.playerId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{player.playerName}</span>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {player.wmp} WPM
                        </span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">
                          {player.accuracy}%
                        </span>
                      </div>
                    </div>
                    
                    {currentGame.mode === 'text-race' && (
                      <Progress value={player.progress} className="h-1" />
                    )}
                    
                    {currentGame.mode === 'word-sprint' && (
                      <div className="text-center text-sm text-gray-600">
                        {player.progress} words
                      </div>
                    )}
                  </div>
                ))}
                
                {opponents.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for other players...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Results */}
            {isFinished && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Race Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentGame.players
                      .sort((a, b) => {
                        if (currentGame.mode === 'text-race') {
                          return b.progress - a.progress || b.wmp - a.wmp;
                        } else {
                          return b.progress - a.progress;
                        }
                      })
                      .map((player, index) => (
                        <div
                          key={player.playerId}
                          className={`flex items-center justify-between p-2 rounded ${
                            index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${index === 0 ? 'text-yellow-800' : 'text-gray-600'}`}>
                              #{index + 1}
                            </span>
                            <span className="font-medium">{player.playerName}</span>
                            {index === 0 && <Trophy className="w-4 h-4 text-yellow-600" />}
                          </div>
                          <div className="text-right text-sm">
                            <div>{player.wmp} WPM</div>
                            <div className="text-xs text-gray-500">{player.accuracy}% accuracy</div>
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
