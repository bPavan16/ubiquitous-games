// A simple implementation for generating Sudoku puzzles

// Check if a number can be placed in a given position
function isValid(board, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  let boxRow = Math.floor(row / 3) * 3;
  let boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

// Solve a sudoku board using backtracking
function solve(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            
            if (solve(board)) {
              return true;
            }
            
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Create an empty 9x9 board
function createEmptyBoard() {
  const board = [];
  for (let i = 0; i < 9; i++) {
    board.push(Array(9).fill(0));
  }
  return board;
}

// Generate a solved sudoku board
function generateSolvedBoard() {
  const board = createEmptyBoard();
  
  // Fill the diagonal 3x3 boxes first (they're independent of each other)
  for (let box = 0; box < 3; box++) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(nums);
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[box * 3 + i][box * 3 + j] = nums.pop();
      }
    }
  }
  
  // Solve the rest of the board
  solve(board);
  
  return board;
}

// Remove numbers from the board to create a puzzle
function createPuzzle(solution, difficulty) {
  // Create a deep copy of the solution
  const puzzle = JSON.parse(JSON.stringify(solution));
  
  // Determine how many cells to remove based on difficulty
  let cellsToRemove;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 35; // ~46 clues
      break;
    case 'medium':
      cellsToRemove = 45; // ~36 clues
      break;
    case 'hard':
      cellsToRemove = 55; // ~26 clues
      break;
    case 'expert':
      cellsToRemove = 60; // ~21 clues
      break;
    default:
      cellsToRemove = 45; // Medium by default
  }
  
  // Randomly remove cells
  let removedCells = 0;
  while (removedCells < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removedCells++;
    }
  }
  
  return puzzle;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Main function to generate a sudoku puzzle
export function generateSudoku(difficulty = 'medium') {
  const solution = generateSolvedBoard();
  const puzzle = createPuzzle(solution, difficulty);
  
  return {
    puzzle,
    solution
  };
}

// Function to validate a completed sudoku board
export function validateSudoku(board) {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const rowSet = new Set();
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
      rowSet.add(board[row][col]);
    }
    if (rowSet.size !== 9) return false;
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const colSet = new Set();
    for (let row = 0; row < 9; row++) {
      colSet.add(board[row][col]);
    }
    if (colSet.size !== 9) return false;
  }
  
  // Check boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          boxSet.add(board[boxRow * 3 + i][boxCol * 3 + j]);
        }
      }
      if (boxSet.size !== 9) return false;
    }
  }
  
  return true;
}