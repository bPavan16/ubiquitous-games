import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Grid3X3, Trophy, Home, Users, Ship } from 'lucide-react';

export function GameHome() {
  const location = useLocation();

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: Grid3X3,
      description: 'Classic number puzzle',
      path: '/sudoku',
      color: 'from-blue-500 to-indigo-600',
      difficulty: ['Easy', 'Medium', 'Hard'],
      maxPlayers: 4
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      icon: Trophy,
      description: 'Classic X and O strategy',
      path: '/tictactoe',
      color: 'from-green-500 to-emerald-600',
      difficulty: ['Standard'],
      maxPlayers: 2
    },
    {
      id: 'battleship',
      name: 'Battleship',
      icon: Ship,
      description: 'Naval warfare strategy',
      path: '/battleship',
      color: 'from-red-500 to-orange-600',
      difficulty: ['Standard'],
      maxPlayers: 2
    }
  ];

  const isHomePage = location.pathname === '/';

  return (
    <div className={isHomePage ? "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" : ""}>
      {/* Header */}
      {Navbar()}

      {/* Game Selection (Home Page Only) */}
      {isHomePage && (
        <div className="max-w-6xl w-full mx-auto p-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Game</h2>
            <p className="text-xl text-gray-600">Select a game to play with friends in real-time</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {games.map((game) => (
              <Card key={game.id} className="border-0 shadow-xl hover:shadow-2xl pt-0 pb-4 ">
                <CardContent className="p-0">
                  <div className={`p-6 pt-8 bg-gradient-to-br ${game.color} text-white rounded-t-lg`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <game.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{game.name}</h3>
                        <p className="text-white/80">{game.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Up to {game.maxPlayers} players</span>
                      </div>
                      <div className="flex gap-1">
                        {game.difficulty.map((diff) => (
                          <Badge key={diff} variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                            {diff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <Link to={game.path}>
                      <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-300">
                        Play {game.name}
                        <game.icon className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics */}
          
        </div>
      )}
    </div>
  );

  function Navbar() {
    return <div className="bg-white/80 backdrop-blur-sm border-b overflow-hidden border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Ubiquitous Games
              </h1>
              <p className="text-sm text-gray-600">Multiplayer Gaming Platform</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            {games.map((game) => (
              <Link key={game.id} to={game.path}>
                <Button
                  variant={location.pathname.startsWith(game.path) ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <game.icon className="w-4 h-4" />
                  {game.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>;
  }
}
