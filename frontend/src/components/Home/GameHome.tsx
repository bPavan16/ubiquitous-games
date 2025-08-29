import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Grid3X3, Trophy, Home, Users, Ship, Menu, X } from 'lucide-react';

export function GameHome() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: Grid3X3,
      description: 'Classic number puzzle',
      path: '/sudoku',
      color: 'from-blue-600 to-sky-500',
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
      color: 'from-purple-500 to-indigo-600',
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
        <div className="max-w-6xl w-full mx-auto p-6 py-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-1">Choose Your Game</h2>
            <p className="text-xl text-gray-600">Select a game to play with friends in real-time</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
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
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false);
    };

    return (
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 flex-shrink-0"
              onClick={closeMobileMenu}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Ubiquitous Games
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 leading-tight">Multiplayer Gaming Platform</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Ubiquitous Games
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden lg:inline">Home</span>
                </Button>
              </Link>
              {games.map((game) => (
                <Link key={game.id} to={game.path}>
                  <Button
                    variant={location.pathname.startsWith(game.path) ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 transition-all duration-200 ${
                      location.pathname.startsWith(game.path)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <game.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{game.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'max-h-80 opacity-100 pb-4' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm rounded-lg mx-2 mb-2 shadow-lg border border-gray-200/60">
              <Link to="/" onClick={closeMobileMenu}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === '/'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                  {location.pathname === '/' && (
                    <div className="ml-auto w-2 h-2 bg-white/80 rounded-full"></div>
                  )}
                </div>
              </Link>
              
              {games.map((game) => (
                <Link key={game.id} to={game.path} onClick={closeMobileMenu}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname.startsWith(game.path)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <game.icon className="w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-medium">{game.name}</span>
                      <div className="text-xs opacity-80 mt-0.5">{game.description}</div>
                    </div>
                    {location.pathname.startsWith(game.path) && (
                      <div className="ml-auto w-2 h-2 bg-white/80 rounded-full"></div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
