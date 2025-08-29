import { useBattleshipStore } from '@/store/battleshipStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Ship,
    RotateCw,
    Check,
    Shuffle,
    Play
} from 'lucide-react';

export function ShipPlacement() {

    const {
        currentGame,
        getCurrentPlayer,
        selectedShip,
        shipOrientation,
        setSelectedShip,
        setShipOrientation,
        placeRandomShips,
        startGame,
        isReady
    } = useBattleshipStore();

    if (!currentGame || currentGame.gamePhase !== 'setup') {
        return null;
    }

    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return null;

    const ships = [
        { name: 'carrier', size: 5, displayName: 'Carrier', icon: '🚢' },
        { name: 'battleship', size: 4, displayName: 'Battleship', icon: '⚓' },
        { name: 'cruiser', size: 3, displayName: 'Cruiser', icon: '🛥️' },
        { name: 'submarine', size: 3, displayName: 'Submarine', icon: '🚤' },
        { name: 'destroyer', size: 2, displayName: 'Destroyer', icon: '🛳️' }
    ];

    // Check which ships are already placed
    const placedShips = currentPlayer.board.ships.map(ship => ship.name);
    const availableShips = ships.filter(ship => !placedShips.includes(ship.name));

    // Calculate placement progress
    const totalShips = ships.length;
    const placedCount = placedShips.length;
    const progress = (placedCount / totalShips) * 100;

    const handleShipSelect = (ship: typeof ships[0]) => {
        setSelectedShip({ name: ship.name, size: ship.size, count: 1 });
    };

    const toggleOrientation = () => {
        setShipOrientation(shipOrientation === 'horizontal' ? 'vertical' : 'horizontal');
    };

    const handleRandomPlacement = () => {
        placeRandomShips();
    };

    const handleStartGame = () => {
        if (placedCount === totalShips) {
            startGame();
        }
    };

    const allShipsPlaced = placedCount === totalShips;
    const canStart = allShipsPlaced && isReady();

    return (
        <div className="space-y-2">
            {/* Header */}
            <Card className="border-0 gap-1 shadow-lg bg-gradient-to-br  from-slate-100/90 to-slate-200/90">
                <CardHeader className="">
                    <CardTitle className="flex items-center justify-between text-xl font-bold text-black">
                        <div className="flex items-center gap-2">
                            <Ship className="w-5 h-5 text-blue-400" />
                            Deploy Your Fleet
                        </div>
                        <Badge className="bg-blue-500/20 text-black border-blue-500/30">
                            Setup Phase
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm text-black">
                            <span>Ships Deployed</span>
                            <span>{placedCount} / {totalShips}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ship Selection */}
            <Card className="border-0 gap-1 shadow-lg bg-gradient-to-br from-slate-100/90 to-slate-200/90">
                <CardHeader className="">
                    <CardTitle className="text-lg font-semibold text-black">
                        Select Ship to Place
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Available Ships */}
                    <div className="grid gap-1">
                        {ships.map((ship) => {
                            const isPlaced = placedShips.includes(ship.name);
                            const isSelected = selectedShip?.name === ship.name;

                            return (
                                <div
                                    key={ship.name}
                                    className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${isPlaced
                                            ? 'bg-green-500/20 border-green-500/50 text-whitye-800'
                                            : isSelected
                                                ? 'bg-blue-500/30 border-blue-400 text-blue-800'
                                                : 'bg-slate-200/50 border-slate-600 text-black hover:bg-slate-300/50 hover:border-slate-500'
                                        }`}
                                    onClick={() => !isPlaced && handleShipSelect(ship)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{ship.icon}</span>
                                            <div>
                                                <div className="font-semibold">{ship.displayName}</div>
                                                <div className="text-sm opacity-75">
                                                    Size: {ship.size} cells
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isPlaced && (
                                                <Badge className="bg-green-500/20 text-green-800 border-green-500/50">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Placed
                                                </Badge>
                                            )}
                                            {isSelected && !isPlaced && (
                                                <Badge className="bg-blue-500/20 text-blue-800 border-blue-500/50">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Orientation Control */}
                    {selectedShip && (
                        <div className="pt-4 border-t border-slate-600">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-black">Ship Orientation</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleOrientation}
                                    className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
                                >
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    {shipOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                                </Button>
                            </div>

                            {/* Visual orientation indicator */}
                            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                                <div className="text-xs text-slate-800 mb-2">Preview:</div>
                                <div className={`flex gap-1 ${shipOrientation === 'vertical' ? 'flex-col w-fit' : ''}`}>
                                    {Array.from({ length: selectedShip.size }, (_, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 bg-blue-500/50 border border-blue-400 rounded flex items-center justify-center"
                                        >
                                            <Ship className="w-3 h-3 text-blue-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-0 gap-1 p-1 shadow-lg bg-gradient-to-br px-2 py-1 from-slate-100/90 to-slate-200/90">
                <CardContent className="px-4 py-1">
                    <div className="text-sm text-black space-y-2">
                        <div className="font-semibold text-black">Instructions:</div>
                        <ul className="space-y-1 text-xs list-disc list-inside opacity-75">
                            <li>Select a ship from the list above</li>
                            <li>Choose horizontal or vertical orientation</li>
                            <li>Click on your board to place the ship</li>
                            <li>Ships cannot overlap or go off the board</li>
                            <li>All ships must be placed before starting the battle</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
                <Button
                    variant="outline"
                    onClick={handleRandomPlacement}
                    className="flex-1 border-slate-600 bg-slate-700 text-white hover:text-white hover:bg-black"
                    disabled={allShipsPlaced}
                >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Random Placement
                </Button>

                <Button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className={`flex-1 font-semibold ${canStart
                            ? 'bg-gradient-to-r bg-blue-600 text-white hover:from-blue-700 hover:to-blue-700 '
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <Play className="w-4 h-4 mr-2" />
                    {allShipsPlaced ? 'Start Battle!' : `Place ${totalShips - placedCount} more ships`}
                </Button>
            </div>

            {/* Status Messages */}
            {selectedShip && availableShips.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br p-1 from-blue-500/10 to-blue-600/10 border-blue-500/30">
                    <CardContent className="px-4 py-1">
                        <div className="flex items-center gap-2 text-blue-800">
                            <Ship className="w-4 h-4" />
                            <span className="text-sm">
                                Click on your board to place the selected ship ({selectedShip.size} cells, {shipOrientation})
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {allShipsPlaced && (
                <Card className="border-0 shadow-lg bg-gradient-to-br p-1 from-green-500/10 to-green-600/10 border-green-500/30">
                    <CardContent className="px-4 py-1">
                        <div className="flex items-center gap-2 text-green-800">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-semibold">
                                All ships deployed! Ready for battle.
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
