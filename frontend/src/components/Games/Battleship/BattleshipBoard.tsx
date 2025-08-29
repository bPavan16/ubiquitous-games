import { useState } from 'react';
import { useBattleshipStore } from '@/store/battleshipStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Ship, 
  Target, 
  Crosshair,
  Waves,
  Zap
} from 'lucide-react';

export function BattleshipBoard() {
  const { 
    currentGame, 
    getCurrentPlayer, 
    selectedShip, 
    shipOrientation, 
    hoveredCells,
    setHoveredCells,
    placeShip,
    fireShot,
    canPlaceShip,
    isMyTurn
  } = useBattleshipStore();
  
  const [activeBoard, setActiveBoard] = useState<'own' | 'enemy'>('own');

  if (!currentGame) {
    return (
      <Card className="shadow-xl bg-gradient-to-br from-white to-blue-50/80 border border-blue-200/50">
        <CardContent className="p-8 text-center">
          <Ship className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold text-blue-900 mb-2">No Active Battle</h3>
          <p className="text-blue-600">Create or join a game to deploy your fleet and engage in naval warfare.</p>
        </CardContent>
      </Card>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const isSetupPhase = currentGame.gamePhase === 'setup';
  const isBattlePhase = currentGame.gamePhase === 'playing';
  const boardSize = currentGame.boardSize;

  // Check if a cell contains a ship
  const hasShip = (row: number, col: number) => {
    if (!currentPlayer) return false;
    return currentPlayer.board.ships.some(ship =>
      ship.coordinates.some(coord => coord.row === row && coord.col === col)
    );
  };

  // Check if a cell was hit
  const isHit = (row: number, col: number, isEnemyBoard: boolean) => {
    if (isEnemyBoard) {
      // Show our shots on enemy board
      return currentPlayer?.board.shots.some(shot => 
        shot.row === row && shot.col === col && shot.hit
      ) || false;
    } else {
      // Show enemy hits on our board
      return currentPlayer?.board.hits.some(hit => 
        hit.row === row && hit.col === col
      ) || false;
    }
  };

  // Check if a cell was missed
  const isMiss = (row: number, col: number, isEnemyBoard: boolean) => {
    if (isEnemyBoard) {
      // Show our misses on enemy board
      return currentPlayer?.board.shots.some(shot => 
        shot.row === row && shot.col === col && !shot.hit
      ) || false;
    } else {
      // Show enemy misses on our board
      return currentPlayer?.board.misses.some(miss => 
        miss.row === row && miss.col === col
      ) || false;
    }
  };

  // Check if a ship is destroyed at this position
  const isShipDestroyed = (row: number, col: number) => {
    if (!currentPlayer) return false;
    return currentPlayer.board.ships.some(ship =>
      ship.isDestroyed && ship.coordinates.some(coord => coord.row === row && coord.col === col)
    );
  };

  // Check if we can shoot at this position
  const canShoot = (row: number, col: number) => {
    if (!isBattlePhase || !isMyTurn() || !currentPlayer) return false;
    return !currentPlayer.board.shots.some(shot => shot.row === row && shot.col === col);
  };

  // Handle cell hover for ship placement
  const handleCellHover = (row: number, col: number) => {
    if (!isSetupPhase || !selectedShip) return;

    const cells = [];
    for (let i = 0; i < selectedShip.size; i++) {
      const cellRow = shipOrientation === 'vertical' ? row + i : row;
      const cellCol = shipOrientation === 'horizontal' ? col + i : col;
      
      if (cellRow < boardSize && cellCol < boardSize) {
        cells.push({ row: cellRow, col: cellCol });
      }
    }
    setHoveredCells(cells);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isSetupPhase && selectedShip && activeBoard === 'own') {
      // Place ship
      if (canPlaceShip(selectedShip, row, col, shipOrientation)) {
        placeShip(selectedShip.name, row, col, shipOrientation);
        setHoveredCells(null);
      } else {
        // Provide helpful error message
        const endRow = shipOrientation === 'vertical' ? row + selectedShip.size - 1 : row;
        const endCol = shipOrientation === 'horizontal' ? col + selectedShip.size - 1 : col;
        
        if (endRow >= boardSize || endCol >= boardSize) {
          toast.error(`Ship extends beyond board! Try placing closer to the edge.`);
        } else {
          toast.error(`Ship overlaps with existing ship! Choose a different location.`);
        }
      }
    } else if (isBattlePhase && activeBoard === 'enemy' && canShoot(row, col)) {
      // Fire shot
      fireShot(row, col);
    } else if (isSetupPhase && !selectedShip) {
      toast.warning('Select a ship first from the deployment panel!');
    } else if (isSetupPhase && activeBoard === 'enemy') {
      toast.warning('Place ships on your own board (the one currently showing)!');
    }
  };

  // Get cell class names
  const getCellClassName = (row: number, col: number, isEnemyBoard: boolean) => {
    const baseClasses = 'w-8 h-8 border border-slate-600 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold relative rounded-sm shadow-sm';
    
    let classes = baseClasses;
    
    // Background colors
    if (isEnemyBoard) {
      classes += ' bg-gradient-to-br from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100';
      
      if (isHit(row, col, true)) {
        classes += ' !bg-gradient-to-br !from-red-100 !to-red-200 !text-red-800 !border-red-300 !shadow-md';
      } else if (isMiss(row, col, true)) {
        classes += ' !bg-gradient-to-br !from-sky-100 !to-blue-200 !text-sky-800 !border-sky-300 !shadow-md';
      }
    } else {
      if (hasShip(row, col)) {
        if (isHit(row, col, false)) {
          classes += isShipDestroyed(row, col) 
            ? ' !bg-gradient-to-br !from-red-200 !to-red-300 !text-red-900 !border-red-400 !shadow-lg' 
            : ' !bg-gradient-to-br !from-orange-100 !to-orange-200 !text-orange-800 !border-orange-300 !shadow-md';
        } else {
          classes += ' !bg-gradient-to-br !from-emerald-100 !to-emerald-200 !text-emerald-800 !border-emerald-300 !shadow-md';
        }
      } else {
        classes += ' bg-gradient-to-br from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100';
        
        if (isMiss(row, col, false)) {
          classes += ' !bg-gradient-to-br !from-sky-100 !to-blue-200 !text-sky-800 !border-sky-300 !shadow-md';
        }
      }
    }

    // Hover effects for ship placement
    if (isSetupPhase && !isEnemyBoard && hoveredCells?.some(cell => cell.row === row && cell.col === col)) {
      if (selectedShip && canPlaceShip(selectedShip, hoveredCells[0].row, hoveredCells[0].col, shipOrientation)) {
        classes += ' !bg-gradient-to-br !from-green-100 !to-emerald-200 !border-green-400 !shadow-lg !scale-105';
      } else {
        classes += ' !bg-gradient-to-br !from-red-100 !to-rose-200 !border-red-400 !shadow-lg !scale-105';
      }
    }

    // Battle phase targeting
    if (isBattlePhase && isEnemyBoard && canShoot(row, col) && isMyTurn()) {
      classes += ' hover:!bg-gradient-to-br hover:!from-red-50 hover:!to-red-100 hover:!border-red-300 hover:!shadow-lg hover:!scale-105';
    }

    return classes;
  };

  const renderBoard = (isEnemyBoard: boolean) => (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="flex gap-1 justify-center">
        <div className="w-8 h-6"></div> {/* Corner spacer */}
        {Array.from({ length: boardSize }, (_, i) => (
          <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-bold text-blue-700 bg-blue-50/50 rounded border border-blue-200/50">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      
      {/* Board grid */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: boardSize }, (_, row) => (
          <div key={row} className="flex gap-1  items-center">
            {/* Row header */}
            <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-blue-700 bg-blue-50/50 rounded border border-blue-200/50">
              {row + 1}
            </div>
            
            {/* Row cells */}
            {Array.from({ length: boardSize }, (_, col) => (
              <div
                key={`${row}-${col}`}
                className={getCellClassName(row, col, isEnemyBoard)}
                onClick={() => handleCellClick(row, col)}
                onMouseEnter={() => handleCellHover(row, col)}
                onMouseLeave={() => setHoveredCells(null)}
              >
                {/* Cell content */}
                {isEnemyBoard ? (
                  <>
                    {isHit(row, col, true) && <Zap className="w-6 h-6" />}
                    {isMiss(row, col, true) && <Waves className="w-6 h-6" />}
                  </>
                ) : (
                  <>
                    {hasShip(row, col) && !isHit(row, col, false) && (
                      <Ship className="w-6 h-6" />
                    )}
                    {isHit(row, col, false) && <Zap className="w-6 h-6" />}
                    {isMiss(row, col, false) && <Waves className="w-6 h-6" />}
                  </>
                )}
                
                {/* Targeting crosshair for enemy board */}
                {isBattlePhase && isEnemyBoard && canShoot(row, col) && isMyTurn() && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Crosshair className="w-3 h-3 text-red-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Board Toggle (Battle Phase) */}
      {isBattlePhase && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setActiveBoard('own')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-lg ${
              activeBoard === 'own'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-200 border border-emerald-400'
                : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200 shadow-sm'
            }`}
          >
            <Ship className="w-4 h-4 inline mr-2" />
            Your Fleet
          </button>
          <button
            onClick={() => setActiveBoard('enemy')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-lg ${
              activeBoard === 'enemy'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200 border border-red-400'
                : 'bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-sm'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Enemy Waters
          </button>
        </div>
      )}

      {/* Board Display */}
      <Card className="shadow-2xl bg-gradient-to-br from-white/95 to-blue-50/80 border border-blue-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-bold text-blue-900">
            <div className="flex items-center gap-2">
              {(isSetupPhase || activeBoard === 'own') ? (
                <>
                  <Ship className="w-5 h-5 text-emerald-600" />
                  Your Fleet
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 text-red-600" />
                  Enemy Waters
                </>
              )}
            </div>
            
            {/* Status indicators */}
            <div className="flex gap-2  ">
              {isSetupPhase && (
                <Badge className="bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border text-md border-blue-300 shadow-sm">
                  Setup Phase
                </Badge>
              )}
              {isBattlePhase && (
                <Badge className={`shadow-sm text-md ${
                  isMyTurn() 
                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300'
                }`}>
                  {isMyTurn() ? 'Your Turn' : 'Enemy Turn'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isSetupPhase || activeBoard === 'own' 
            ? renderBoard(false) 
            : renderBoard(true)
          }
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/60">
        <CardContent className="py-0">
            <div className="flex justify-center gap-6 items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 rounded-lg flex items-center justify-center shadow-sm">
              <Ship className="w-5 h-5 text-emerald-700" aria-label="Your Ship" />
              </div>
              <span className="text-slate-700 font-medium">Your Ship</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-orange-700" aria-label="Ship Hit" />
              </div>
              <span className="text-slate-700 font-medium">Ship Hit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 border border-red-300 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-red-700" aria-label="Ship Destroyed" />
              </div>
              <span className="text-slate-700 font-medium">Ship Destroyed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-100 to-sky-200 border border-sky-300 rounded-lg flex items-center justify-center shadow-sm">
              <Waves className="w-5 h-5 text-sky-700" aria-label="Miss" />
              </div>
              <span className="text-slate-700 font-medium">Miss</span>
            </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
