class SudokuGenerator {
  static generatePuzzle(difficulty = 'medium') {
    // Create a complete solved puzzle
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    this.fillGrid(grid);
    
    // Remove numbers to create puzzle based on difficulty
    const puzzle = [...grid.map(row => [...row])];
    let cellsToRemove;
    
    switch (difficulty) {
      case 'easy':
        cellsToRemove = 35;
        break;
      case 'medium':
        cellsToRemove = 45;
        break;
      case 'hard':
        cellsToRemove = 55;
        break;
      default:
        cellsToRemove = 45;
    }
    
    for (let i = 0; i < cellsToRemove; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      } while (puzzle[row][col] === 0);
      
      puzzle[row][col] = 0;
    }
    
    return {
      puzzle,
      solution: grid
    };
  }

  static fillGrid(grid) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (this.isValidMove(grid, i, j, num)) {
              grid[i][j] = num;
              if (this.fillGrid(grid)) {
                return true;
              }
              grid[i][j] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  static isValidMove(grid, row, col, num) {
    // Check row
    for (let j = 0; j < 9; j++) {
      if (grid[row][j] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  static solvePuzzle(grid) {
    const solution = [...grid.map(row => [...row])];
    this.solve(solution);
    return solution;
  }

  static solve(grid) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, i, j, num)) {
              grid[i][j] = num;
              if (this.solve(grid)) {
                return true;
              }
              grid[i][j] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  static isValidSudoku(grid) {
    // Check rows
    for (let i = 0; i < 9; i++) {
      const row = new Set();
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== 0) {
          if (row.has(grid[i][j])) return false;
          row.add(grid[i][j]);
        }
      }
    }

    // Check columns
    for (let j = 0; j < 9; j++) {
      const col = new Set();
      for (let i = 0; i < 9; i++) {
        if (grid[i][j] !== 0) {
          if (col.has(grid[i][j])) return false;
          col.add(grid[i][j]);
        }
      }
    }

    // Check 3x3 boxes
    for (let box = 0; box < 9; box++) {
      const boxSet = new Set();
      const startRow = Math.floor(box / 3) * 3;
      const startCol = (box % 3) * 3;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const value = grid[startRow + i][startCol + j];
          if (value !== 0) {
            if (boxSet.has(value)) return false;
            boxSet.add(value);
          }
        }
      }
    }

    return true;
  }

  static isPuzzleComplete(grid) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return false;
      }
    }
    return this.isValidSudoku(grid);
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = SudokuGenerator;
