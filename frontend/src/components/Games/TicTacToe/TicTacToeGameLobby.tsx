import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTicTacToeStore } from '@/store/ticTacToeStore';
import { Users, Play, Plus, Trophy, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TicTacToeGameLobby() {
    const {
        availableGames,
        playerName,
        showCreateDialog,
        showJoinDialog,
        setPlayerName,
        createGame,
        joinGame,
        setShowCreateDialog,
        setShowJoinDialog,
        getAvailableGames
    } = useTicTacToeStore();

    const [selectedGameId, setSelectedGameId] = useState('');

    useEffect(() => {
        // Get available games when the component mounts
        getAvailableGames();

        // Set up interval to refresh games every 5 seconds
        const interval = setInterval(() => {
            getAvailableGames();
        }, 5000);

        return () => clearInterval(interval);
    }, [getAvailableGames]);

    const handleCreateGame = () => {
        if (playerName.trim()) {
            createGame();
        }
    };

    const handleJoinGame = () => {
        if (playerName.trim() && selectedGameId) {
            joinGame(selectedGameId);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-6xl mx-auto">
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
                            <h1 className="text-4xl font-bold text-gray-800">Tic Tac Toe Lobby</h1>
                        </div>
                        <p className="text-lg text-gray-600">Create or join a multiplayer game</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Player Setup */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Player Setup
                            </CardTitle>
                            <CardDescription>
                                Enter your name to start playing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Your Name
                                </label>
                                <Input
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="w-full"
                                    maxLength={20}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowCreateDialog(true)}
                                    disabled={!playerName.trim()}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Game
                                </Button>

                                <Button
                                    onClick={() => setShowJoinDialog(true)}
                                    disabled={!playerName.trim() || availableGames.length === 0}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Join Game
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Games */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="w-5 h-5" />
                                        Available Games
                                    </CardTitle>
                                    <CardDescription>
                                        Join an existing game or create a new one
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={getAvailableGames}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {availableGames.length === 0 ? (
                                <div className="text-center py-8">
                                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-2">No games available</p>
                                    <p className="text-sm text-gray-400">Create a new game to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableGames.map((game) => (
                                        <Card
                                            key={game.gameId}
                                            className={`cursor-pointer transition-all hover:shadow-md ${selectedGameId === game.gameId ? 'ring-2 ring-green-500 bg-green-50' : ''
                                                }`}
                                            onClick={() => setSelectedGameId(game.gameId)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-800">
                                                            {game.host}'s Game
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Game ID: {game.gameId.slice(-8)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {game.playerCount}/{game.maxPlayers}
                                                        </Badge>
                                                        {selectedGameId === game.gameId && (
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleJoinGame();
                                                                }}
                                                                disabled={!playerName.trim()}
                                                                size="sm"
                                                                className="bg-gradient-to-r from-green-500 to-emerald-600"
                                                            >
                                                                Join
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>


            </div>

            {/* Create Game Dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Create New Game</CardTitle>
                            <CardDescription>
                                Start a new Tic Tac Toe game and invite others to join
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Your Name
                                </label>
                                <Input
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowCreateDialog(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateGame}
                                    disabled={!playerName.trim()}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                >
                                    Create Game
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Join Game Dialog */}
            {showJoinDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Join Game</CardTitle>
                            <CardDescription>
                                Select a game to join from the available options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Your Name
                                </label>
                                <Input
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Select Game
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {availableGames.map((game) => (
                                        <Card
                                            key={game.gameId}
                                            className={`cursor-pointer transition-all ${selectedGameId === game.gameId ? 'ring-2 ring-green-500 bg-green-50' : ''
                                                }`}
                                            onClick={() => setSelectedGameId(game.gameId)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{game.host}'s Game</div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {game.gameId.slice(-8)}
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {game.playerCount}/{game.maxPlayers}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setShowJoinDialog(false);
                                        setSelectedGameId('');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleJoinGame}
                                    disabled={!playerName.trim() || !selectedGameId}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                >
                                    Join Game
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
