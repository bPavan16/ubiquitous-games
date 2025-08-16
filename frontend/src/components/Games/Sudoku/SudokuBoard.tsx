import { useSudokuStore } from '@/store/sudokuStore';
import { cn } from '@/lib/utils';

export function SudokuBoard() {
  const { 
    currentGame, 
    selectedCell, 
    setSelectedCell, 
    makeMove 
  } = useSudokuStore();

  if (!currentGame) return null;

  const { puzzle, players } = currentGame;
  const currentPlayer = players.find(p => p.id === useSudokuStore.getState().socket?.id);

  const handleCellClick = (row: number, col: number) => {
    // Only allow clicking on empty cells from the original puzzle
    if (puzzle[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (value: number) => {
    if (selectedCell && currentGame.gameState === 'playing') {
      makeMove(selectedCell.row, selectedCell.col, value);
    }
  };

  const getCellValue = (row: number, col: number): number => {
    if (currentPlayer && currentPlayer.progress[row][col] !== 0) {
      return currentPlayer.progress[row][col];
    }
    return puzzle[row][col];
  };

  const getCellStyle = (row: number, col: number): string => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isPuzzleCell = puzzle[row][col] !== 0;
    const isCurrentPlayerCell = currentPlayer && currentPlayer.progress[row][col] !== 0 && puzzle[row][col] === 0;
    
    return cn(
      "w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-semibold cursor-pointer transition-all duration-200",
      {
        // Grid lines
        "border-r-2 border-gray-800": col === 2 || col === 5,
        "border-b-2 border-gray-800": row === 2 || row === 5,
        "border-t-2 border-gray-800": row === 0,
        "border-l-2 border-gray-800": col === 0,
        // Cell states
        "bg-blue-100 border-blue-500": isSelected,
        "bg-gray-100 text-gray-800": isPuzzleCell,
        "bg-white text-blue-600": !isPuzzleCell && !isCurrentPlayerCell,
        "bg-green-50 text-green-700": isCurrentPlayerCell,
        "hover:bg-blue-50": !isPuzzleCell && currentGame.gameState === 'playing',
      }
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Sudoku Grid */}
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 bg-white">
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => {
            const value = getCellValue(row, col);
            return (
              <div
                key={`${row}-${col}`}
                className={getCellStyle(row, col)}
                onClick={() => handleCellClick(row, col)}
              >
                {value !== 0 && value}
              </div>
            );
          })
        )}
      </div>

      {/* Number Input Pad */}
      {selectedCell && currentGame.gameState === 'playing' && (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className={cn(
                "w-12 h-12 rounded-lg border-2 border-gray-300 font-semibold text-lg transition-all duration-200",
                "hover:border-blue-500 hover:bg-blue-50 active:scale-95",
                num === 0 ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-white text-gray-700"
              )}
            >
              {num === 0 ? '✕' : num}
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      {selectedCell && currentGame.gameState === 'playing' && (
        <div className="text-center text-sm text-gray-600">
          <p>Selected cell: ({selectedCell.row + 1}, {selectedCell.col + 1})</p>
          <p>Click a number to place it, or ✕ to clear</p>
        </div>
      )}
    </div>
  );
}
