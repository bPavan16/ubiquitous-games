# Battleship Game Backend API

## Overview
The Battleship game is a classic naval strategy game for 2 players where each player places ships on a 10x10 grid and tries to sink their opponent's fleet by guessing coordinates.

## Game Flow

### 1. Setup Phase
- Each player must place 5 ships on their board:
  - Carrier (5 cells)
  - Battleship (4 cells)
  - Cruiser (3 cells)
  - Submarine (3 cells)
  - Destroyer (2 cells)

### 2. Battle Phase
- Players take turns firing shots at enemy coordinates
- Hit = continue turn, Miss = switch to opponent
- First player to sink all enemy ships wins

## Socket Events

### Client to Server Events

#### Game Management
- `createGame` - Create a new Battleship game
- `joinGame` - Join an existing game
- `startGame` - Start the game (host only)
- `leaveGame` - Leave the current game

#### Ship Placement (Setup Phase)
```javascript
socket.emit('placeShip', {
    shipName: 'Carrier',        // Ship name from available ships
    startRow: 0,                // Starting row (0-9)
    startCol: 0,                // Starting column (0-9)
    orientation: 'horizontal'   // 'horizontal' or 'vertical'
});
```

#### Battle Actions
```javascript
socket.emit('makeMove', {
    targetRow: 5,               // Target row (0-9)
    targetCol: 3                // Target column (0-9)
});

// Alternative event for clarity
socket.emit('fireShot', {
    targetRow: 5,
    targetCol: 3
});
```

#### Utility
- `getOpponentBoard` - Get opponent's board state (shows only hits/misses/destroyed ships)
- `resetBattleshipGame` - Reset the game (host only)

### Server to Client Events

#### Game State Updates
- `gameCreated` - Game successfully created
- `gameJoined` - Successfully joined a game
- `playerJoined` - Another player joined
- `playerLeft` - A player left the game

#### Ship Placement
```javascript
// Your ship was placed successfully
'shipPlaced': {
    shipName: 'Carrier',
    startRow: 0,
    startCol: 0,
    orientation: 'horizontal',
    shipsRemaining: 4,          // Ships left to place
    isReady: false,             // Are you ready for battle?
    gameState: {...}
}

// Opponent placed a ship (position hidden)
'playerShipPlaced': {
    playerId: 'player-id',
    playerName: 'Player Name',
    shipName: 'Carrier',
    isReady: false,
    gameState: {...}
}

// Both players ready, battle begins
'battlePhaseStarted': {
    gameState: {...}
}
```

#### Battle Actions
```javascript
// Shot fired by any player
'shotFired': {
    playerId: 'player-id',
    playerName: 'Player Name',
    targetRow: 5,
    targetCol: 3,
    hit: true,                  // Was it a hit?
    shipHit: 'Destroyer',       // Ship that was hit (if any)
    shipDestroyed: true,        // Was the ship completely destroyed?
    continuesTurn: true,        // Does the player continue (hit = continue)
    nextPlayer: 'player-id',    // Who goes next
    gameState: {...}
}

// Game finished
'gameFinished': {
    winner: 'player-id',
    winnerName: 'Player Name',
    reason: 'All enemy ships destroyed',
    gameState: {...}
}
```

#### Board State
```javascript
'opponentBoardState': {
    opponentBoard: {
        ships: [...],           // Only destroyed ships visible
        hits: [{row: 5, col: 3}],
        misses: [{row: 2, col: 7}],
        // ... other board data
    }
}
```

#### Errors
```javascript
'error': {
    message: 'Invalid ship placement'
}

'invalidMove': {
    targetRow: 5,
    targetCol: 3,
    reason: 'Already shot at this position'
}
```

## Game State Structure

```javascript
{
    gameId: 'uuid',
    gameType: 'battleship',
    gamePhase: 'setup',         // 'setup', 'playing', 'finished'
    gameState: 'waiting',       // 'waiting', 'playing', 'finished'
    currentPlayer: 'player-id', // Who's turn it is (battle phase)
    boardSize: 10,              // Grid size (10x10)
    availableShips: [...],      // Ship types and sizes
    shotHistory: [...],         // All shots fired in the game
    playersReady: [...],        // Player IDs that are ready
    players: [
        {
            id: 'player-id',
            name: 'Player Name',
            isCurrentPlayer: true,
            hits: 15,               // Successful hits
            misses: 8,              // Missed shots
            totalShots: 23,         // Total shots fired
            accuracy: 65.2,         // Hit percentage
            shipsDestroyed: 2,      // Enemy ships sunk
            score: 250,             // Game score
            board: {                // Player's own board
                ships: [...],       // All placed ships
                hits: [...],        // Where player was hit
                misses: [...],      // Where player was missed
                // ...
            },
            isReady: true           // Ready for battle phase
        }
    ],
    // ... other base game properties
}
```

## Ship Placement Rules

1. Ships cannot overlap
2. Ships must fit entirely on the 10x10 grid
3. Ships can be placed horizontally or vertically
4. All 5 ships must be placed before battle phase begins

## Battle Rules

1. Players alternate turns firing shots
2. If you hit an enemy ship, you get another turn
3. If you miss, turn switches to opponent
4. Game ends when all of one player's ships are destroyed
5. You cannot fire at the same coordinates twice

## Error Handling

The game validates all moves and ship placements. Common errors include:
- Invalid coordinates (outside 0-9 range)
- Ship placement overlaps or out of bounds
- Shooting at already targeted coordinates
- Making moves when it's not your turn
- Placing ships during battle phase

## Example Usage

```javascript
// Create and join game
socket.emit('createGame', {
    playerName: 'Admiral Nelson',
    gameType: 'battleship'
});

// Place ships
socket.emit('placeShip', {
    shipName: 'Carrier',
    startRow: 0,
    startCol: 0,
    orientation: 'horizontal'
});

// Fire shots
socket.emit('makeMove', {
    targetRow: 5,
    targetCol: 5
});

// Listen for results
socket.on('shotFired', (data) => {
    if (data.hit) {
        console.log(`Hit! Destroyed: ${data.shipDestroyed}`);
    } else {
        console.log('Miss!');
    }
});
```
