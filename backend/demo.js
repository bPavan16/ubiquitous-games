const io = require('socket.io-client');

// Demo script showing multiplayer Sudoku functionality
class SudokuDemo {
  constructor() {
    this.players = [];
    this.gameId = null;
  }

  async runDemo() {
    console.log('🎮 Starting Multiplayer Sudoku Demo\n');

    // Create first player (host)
    const player1 = this.createPlayer('Alice');
    this.players.push(player1);

    // Wait a bit then create second player
    setTimeout(() => {
      const player2 = this.createPlayer('Bob');
      this.players.push(player2);

      // Player 2 joins the game
      setTimeout(() => {
        player2.emit('joinGame', {
          gameId: this.gameId,
          playerName: 'Bob'
        });
      }, 1000);

    }, 2000);
  }

  createPlayer(name) {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log(`✅ ${name} connected (${socket.id})`);

      if (name === 'Alice') {
        // Alice creates the game
        console.log(`🎮 ${name} creating game...`);
        socket.emit('createGame', {
          playerName: name,
          difficulty: 'easy'
        });
      }
    });

    socket.on('gameCreated', (data) => {
      this.gameId = data.gameId;
      console.log(`✅ ${name} created game: ${data.gameId}`);
      console.log(`📋 Players: ${data.gameState.players.length}/${data.gameState.maxPlayers}`);
    });

    socket.on('gameJoined', (data) => {
      console.log(`✅ ${name} joined game`);
      console.log(`📋 Players: ${data.gameState.players.length}/${data.gameState.maxPlayers}`);
    });

    socket.on('playerJoined', (data) => {
      const newPlayer = data.gameState.players[data.gameState.players.length - 1];
      console.log(`👋 ${newPlayer.name} joined the game`);
      console.log(`📋 Players: ${data.gameState.players.length}/${data.gameState.maxPlayers}`);
      
      // If Alice (host) and we have enough players, start the game
      if (name === 'Alice' && data.gameState.players.length >= 2) {
        setTimeout(() => {
          console.log(`🚀 ${name} (host) starting the game...`);
          socket.emit('startGame');
        }, 1000);
      }
    });

    socket.on('gameStarted', (data) => {
      console.log(`🚀 Game started! State: ${data.gameState.gameState}`);
      console.log(`🧩 Puzzle difficulty: ${data.gameState.difficulty}`);
      
      // Players make some demo moves
      setTimeout(() => {
        this.makeDemoMoves(socket, name);
      }, 1000);
    });

    socket.on('moveUpdate', (data) => {
      const symbol = data.isCorrect ? '✅' : '❌';
      console.log(`${symbol} ${data.playerName} placed ${data.value} at (${data.row + 1}, ${data.col + 1}) - Score: ${data.score}`);
    });

    socket.on('hintUsed', (data) => {
      console.log(`💡 ${name} used hint: ${data.value} at (${data.row + 1}, ${data.col + 1}) - Hints left: ${data.hintsLeft}`);
    });

    socket.on('gameFinished', (data) => {
      console.log(`🎉 Game finished! Winner: ${data.winnerName}`);
      console.log(`🏆 Final leaderboard:`);
      data.gameState.leaderboard.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.name} - Score: ${player.score}, Completion: ${player.completion}%`);
      });
      
      // Disconnect after showing results
      setTimeout(() => {
        socket.disconnect();
      }, 2000);
    });

    socket.on('error', (error) => {
      console.error(`❌ ${name} error:`, error.message);
    });

    return socket;
  }

  makeDemoMoves(socket, playerName) {
    // Simulate some moves
    const moves = [
      { row: 0, col: 1, value: 7 },
      { row: 1, col: 0, value: 3 },
      { row: 0, col: 7, value: 6 },
      { row: 2, col: 2, value: 1 }
    ];

    moves.forEach((move, index) => {
      setTimeout(() => {
        console.log(`🎯 ${playerName} making move...`);
        socket.emit('makeMove', move);
      }, index * 2000);
    });

    // Use a hint after moves
    setTimeout(() => {
      console.log(`💡 ${playerName} using hint...`);
      socket.emit('useHint', { row: 3, col: 3 });
    }, moves.length * 2000 + 1000);
  }
}

// Run the demo
const demo = new SudokuDemo();
demo.runDemo();

// Cleanup after 30 seconds
setTimeout(() => {
  console.log('\n🔚 Demo completed!');
  process.exit(0);
}, 30000);
