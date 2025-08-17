import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TicTacToeApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-800">Tic Tac Toe</h1>
            </div>
            <p className="text-lg text-gray-600">Classic X and O strategy game</p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Construction className="w-12 h-12 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 text-lg">
              We're working hard to bring you an amazing multiplayer Tic Tac Toe experience.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-gray-800 mb-3">Planned Features:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time multiplayer gameplay
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Room creation and joining
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Live chat during games
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Score tracking and leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Spectator mode
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link to="/">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Explore Other Games
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Meanwhile, Play Sudoku */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Meanwhile, try Sudoku!</h3>
            <p className="text-gray-600 mb-4">
              Our Sudoku game is fully functional with multiplayer support, real-time chat, and multiple difficulty levels.
            </p>
            <Link to="/sudoku">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                Play Sudoku Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
