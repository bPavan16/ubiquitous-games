"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SudokuCell from "./sudoku-cell";

interface SudokuBoardProps {
  board: number[][];
  initialBoard: number[][];
  onCellValueChange: (row: number, col: number, value: number) => void;
  isMyTurn?: boolean;
  highlightedCells?: { row: number; col: number }[];
}

export default function SudokuBoard({
  board,
  initialBoard,
  onCellValueChange,
  isMyTurn = true,
  highlightedCells = [],
}: SudokuBoardProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(
    null
  );
  const [inputMode, setInputMode] = useState<"keyboard" | "numpad">("numpad");

  const handleCellClick = (row: number, col: number) => {
    // Only select cell if it's an editable cell (not part of initial board)
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumpadClick = (value: number) => {
    if (selectedCell && isMyTurn) {
      onCellValueChange(selectedCell.row, selectedCell.col, value);
    }
  };

  const clearSelectedCell = () => {
    if (selectedCell && isMyTurn) {
      onCellValueChange(selectedCell.row, selectedCell.col, 0);
    }
  };

  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCell && isMyTurn && inputMode === "keyboard") {
        if (e.key >= "1" && e.key <= "9") {
          onCellValueChange(selectedCell.row, selectedCell.col, parseInt(e.key));
        } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
          onCellValueChange(selectedCell.row, selectedCell.col, 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, isMyTurn, inputMode, onCellValueChange]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="grid grid-cols-9 gap-0.5 border-2 border-primary p-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              isInitial={initialBoard[rowIndex][colIndex] !== 0}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              isHighlighted={isHighlighted(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              rowIndex={rowIndex}
              colIndex={colIndex}
            />
          ))
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={inputMode === "numpad" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("numpad")}
        >
          Numpad
        </Button>
        <Button
          variant={inputMode === "keyboard" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("keyboard")}
        >
          Keyboard
        </Button>
      </div>

      {inputMode === "numpad" && (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="w-12 h-12 text-xl"
              onClick={() => handleNumpadClick(num)}
              disabled={!isMyTurn}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="w-12 h-12 col-span-3"
            onClick={clearSelectedCell}
            disabled={!isMyTurn}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}