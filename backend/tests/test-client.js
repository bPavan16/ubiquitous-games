import io from 'socket.io-client';

// Test client to verify Socket.IO functionality
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Test creating a game
  console.log('🎮 Creating a test game...');
  socket.emit('createGame', {
    playerName: 'TestPlayer',
    difficulty: 'easy'
  });
});

socket.on('gameCreated', (data) => {
  console.log('✅ Game created successfully!');
  console.log('Game ID:', data.gameId);
  console.log('Puzzle preview:', data.gameState.puzzle[0]); // First row
  
  // Test starting the game
  console.log('🚀 Starting the game...');
  socket.emit('startGame');
});

socket.on('gameStarted', (data) => {
  console.log('✅ Game started successfully!');
  console.log('Game state:', data.gameState.gameState);
  
  // Test making a move
  console.log('🎯 Making a test move...');
  socket.emit('makeMove', {
    row: 0,
    col: 0,
    value: 1
  });
});

socket.on('moveUpdate', (data) => {
  console.log('✅ Move update received!');
  console.log('Move:', `${data.playerName} placed ${data.value} at (${data.row}, ${data.col})`);
  console.log('Is correct:', data.isCorrect);
  console.log('Score:', data.score);
  
  // Test using a hint
  console.log('💡 Using a hint...');
  socket.emit('useHint', {
    row: 1,
    col: 1
  });
});

socket.on('hintUsed', (data) => {
  console.log('✅ Hint used successfully!');
  console.log('Hint:', `Value ${data.value} at (${data.row}, ${data.col})`);
  console.log('Hints left:', data.hintsLeft);
  
  // Test complete - disconnect
  console.log('🎉 All tests passed! Disconnecting...');
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from server');
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timeout');
  process.exit(1);
}, 10000);
