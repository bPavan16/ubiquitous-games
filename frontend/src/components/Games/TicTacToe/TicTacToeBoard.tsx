import { useTicTacToeStore } from '@/store/ticTacToeStore';
import { Button } from '@/components/ui/button';

export function TicTacToeBoard() {
    const { currentGame, makeMove } = useTicTacToeStore();

    if (!currentGame) {
        return null;
    }

    const handleCellClick = (row: number, col: number) => {
        if (currentGame.gameState === 'playing' && currentGame.board[row][col] === null) {
            makeMove(row, col);
        }
    };

    const getCellContent = (row: number, col: number) => {
        const cellValue = currentGame.board[row][col];
        if (!cellValue) return '';

        return cellValue === 'X' ? (
            <span className="text-4xl font-bold text-blue-600">X</span>
        ) : (
            <span className="text-4xl font-bold text-red-600">O</span>
        );
    };

    const isCellClickable = (row: number, col: number) => {
        return currentGame.gameState === 'playing' &&
            currentGame.board[row][col] === null;
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="grid grid-cols-3 gap-2 bg-gray-200 p-4 rounded-lg">
                {[0, 1, 2].map(row =>
                    [0, 1, 2].map(col => (
                        <Button
                            key={`${row}-${col}`}
                            onClick={() => handleCellClick(row, col)}
                            disabled={!isCellClickable(row, col)}
                            className={`
                w-20 h-20 text-2xl font-bold bg-white hover:bg-gray-50 border-2 border-gray-300 
                ${isCellClickable(row, col) ? 'cursor-pointer hover:border-green-400' : 'cursor-not-allowed'}
                ${currentGame.board[row][col] ? 'bg-gray-50' : ''}
              `}
                            variant="outline"
                        >
                            {getCellContent(row, col)}
                        </Button>
                    ))
                )}
            </div>
        </div>
    );
}
