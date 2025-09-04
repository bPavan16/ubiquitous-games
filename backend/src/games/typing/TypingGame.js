import BaseGame from '../base/BaseGame.js';

class TypingGame extends BaseGame {
  constructor(gameId, host, mode = 'text-race', options = {}) {
    super(gameId, host, 'typing');
    
    this.maxPlayers = 8; // Override default maxPlayers
    this.mode = mode; // 'text-race' or 'word-sprint'
    this.duration = options.duration || (mode === 'word-sprint' ? 60 : 120); // seconds
    this.wordCount = options.wordCount || 50; // for word-sprint mode
    
    // Game content
    this.text = '';
    this.words = [];
    this.currentText = '';
    
    // Game state
    this.isStarted = false;
    this.isFinished = false;
    
    // Player progress tracking
    this.playerProgress = new Map(); // playerId -> { position: 0, wpm: 0, accuracy: 0, finished: false, finishTime: null }
    this.playerStats = new Map(); // playerId -> { keystrokes: 0, errors: 0, timeStarted: null }
    
    // Initialize game content
    this.generateContent();
  }

  generateContent() {
    if (this.mode === 'text-race') {
      // Predefined texts for racing
      const texts = [
        `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps develop muscle memory and finger coordination while ensuring all keys on the keyboard are utilized.",
        "In the heart of every winter lies a vibrant spring, and behind every night awaits a radiant dawn. Life is a series of seasons, each bringing its own beauty and challenges. Embrace the cold moments, for they make the warm ones even more precious.",
        "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our future. The digital age has connected people across the globe, creating opportunities that were once unimaginable.",
        "The art of programming requires patience, logic, and creativity. Writing clean, efficient code is like crafting poetry with purpose. Every function, every variable, every line contributes to a larger symphony of digital innovation and problem-solving.",
        "Nature teaches us valuable lessons about resilience and adaptation. Trees bend with the wind but rarely break, rivers find ways around obstacles, and seasons change in perfect rhythm. We can learn much from observing the natural world around us.`
      ];
      this.text = texts[Math.floor(Math.random() * texts.length)];
      this.currentText = this.text;
    } else {
      // Word sprint mode - generate random words
      const commonWords = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he',
        'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
        'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
        'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
        'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
        'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been',
        'has', 'had', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'if', 'up',
        'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into'
      ];
      
      this.words = [];
      for (let i = 0; i < this.wordCount; i++) {
        this.words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
      }
      this.currentText = this.words.join(' ');
    }
  }

  addPlayer(playerId, playerName) {
    const success = super.addPlayer(playerId, playerName);
    
    if (success) {
      // Initialize player progress
      this.playerProgress.set(playerId, {
        position: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishTime: null,
        currentWord: 0
      });
      
      this.playerStats.set(playerId, {
        keystrokes: 0,
        errors: 0,
        timeStarted: null,
        lastUpdateTime: null
      });
    }
    
    return success;
  }

  removePlayer(playerId) {
    super.removePlayer(playerId);
    this.playerProgress.delete(playerId);
    this.playerStats.delete(playerId);
  }

  startGame() {
    if (this.players.size < 2) {
      return false;
    }
    
    const success = super.startGame();
    
    if (success) {
      this.isStarted = true;
      
      // Initialize player stats
      this.playerStats.forEach(stats => {
        stats.timeStarted = this.startTime;
        stats.lastUpdateTime = this.startTime;
      });
      
      // Set game timer for word-sprint mode
      if (this.mode === 'word-sprint') {
        setTimeout(() => {
          this.endGame();
        }, this.duration * 1000);
      }
    }
    
    return success;
  }

  updatePlayerProgress(playerId, input) {
    if (!this.isStarted || this.isFinished) {
      return { success: false, message: 'Game is not active' };
    }
    
    const progress = this.playerProgress.get(playerId);
    const stats = this.playerStats.get(playerId);
    
    if (!progress || !stats) {
      return { success: false, message: 'Player not found' };
    }
    
    if (progress.finished) {
      return { success: false, message: 'Player already finished' };
    }
    
    const currentTime = Date.now();
    const timeElapsed = (currentTime - stats.timeStarted) / 1000; // seconds
    
    // Update keystroke count
    stats.keystrokes++;
    stats.lastUpdateTime = currentTime;
    
    // Calculate current position and accuracy
    const correctChars = this.calculateCorrectChars(input, this.currentText);
    const totalErrors = input.length - correctChars;
    
    progress.position = correctChars;
    stats.errors = totalErrors;
    
    // Calculate accuracy
    if (stats.keystrokes > 0) {
      progress.accuracy = Math.max(0, Math.round(((stats.keystrokes - stats.errors) / stats.keystrokes) * 100));
    }
    
    // Calculate WPM (words per minute)
    if (timeElapsed > 0) {
      const wordsTyped = correctChars / 5; // Standard: 5 characters = 1 word
      progress.wpm = Math.round((wordsTyped / timeElapsed) * 60);
    }
    
    // Check if player finished
    if (this.mode === 'text-race' && input.trim() === this.currentText.trim()) {
      progress.finished = true;
      progress.finishTime = currentTime;
      progress.position = this.currentText.length;
      
      // Check if this is the first player to finish
      const finishedPlayers = Array.from(this.playerProgress.values()).filter(p => p.finished);
      if (finishedPlayers.length === 1) {
        // First player finished - end game
        this.endGame();
      }
    } else if (this.mode === 'word-sprint') {
      // Update current word position for word-sprint
      const typedWords = input.trim().split(/\s+/).filter(word => word.length > 0);
      progress.currentWord = Math.min(typedWords.length, this.words.length);
    }
    
    return { 
      success: true, 
      progress: {
        position: progress.position,
        wpm: progress.wpm,
        accuracy: progress.accuracy,
        finished: progress.finished,
        currentWord: progress.currentWord || 0
      }
    };
  }

  calculateCorrectChars(input, target) {
    let correct = 0;
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) {
        correct++;
      } else {
        break; // Stop counting at first mistake
      }
    }
    return correct;
  }

  endGame() {
    if (this.isFinished) return;
    
    this.isFinished = true;
    
    // Calculate final results
    const results = this.calculateFinalResults();
    
    // Set winner to player with highest WPM
    if (results.length > 0) {
      super.endGame(results[0].playerId);
      
      // Update player scores
      results.forEach((result, index) => {
        const player = this.players.get(result.playerId);
        if (player) {
          player.score = result.wpm; // Use WPM as score
        }
      });
    } else {
      super.endGame();
    }
    
    return results;
  }

  // Required BaseGame abstract methods
  makeMove(playerId, moveData) {
    return this.updatePlayerProgress(playerId, moveData.input);
  }

  isValidMove(playerId, moveData) {
    return this.isStarted && !this.isFinished && 
           this.players.has(playerId) && 
           !this.playerProgress.get(playerId)?.finished;
  }

  checkWinCondition() {
    if (this.mode === 'text-race') {
      // Check if any player finished the text
      for (const [playerId, progress] of this.playerProgress) {
        if (progress.finished) {
          return playerId;
        }
      }
    } else if (this.mode === 'word-sprint') {
      // Word sprint ends after timer, winner is determined by WPM
      if (this.isFinished) {
        const results = this.calculateFinalResults();
        return results.length > 0 ? results[0].playerId : null;
      }
    }
    return null;
  }

  calculateFinalResults() {
    const results = [];
    const totalTime = (this.endTime - this.startTime) / 1000; // seconds
    
    this.playerProgress.forEach((progress, playerId) => {
      const stats = this.playerStats.get(playerId);
      const player = Array.from(this.players.values()).find(p => p.id === playerId);
      
      if (player && stats) {
        const finalWpm = progress.wpm;
        const finalAccuracy = progress.accuracy;
        const position = progress.finished ? progress.position : progress.position;
        const completionTime = progress.finishTime ? 
          (progress.finishTime - this.startTime) / 1000 : totalTime;
        
        results.push({
          playerId,
          playerName: player.name,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          position,
          finished: progress.finished,
          completionTime: Math.round(completionTime * 100) / 100,
          keystrokes: stats.keystrokes,
          errors: stats.errors
        });
      }
    });
    
    // Sort by WPM (descending), then by accuracy (descending)
    results.sort((a, b) => {
      if (a.wpm !== b.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    
    return results;
  }

  getGameState() {
    const baseState = super.getGameState();
    
    return {
      ...baseState,
      mode: this.mode,
      duration: this.duration,
      wordCount: this.wordCount,
      text: this.currentText,
      words: this.words,
      isStarted: this.isStarted,
      isFinished: this.isFinished,
      startTime: this.startTime,
      timeRemaining: this.mode === 'word-sprint' && this.startTime ? 
        Math.max(0, this.duration - Math.floor((Date.now() - this.startTime) / 1000)) : null,
      playerProgress: Object.fromEntries(this.playerProgress),
      results: this.isFinished ? this.calculateFinalResults() : null
    };
  }

  getPublicGameInfo() {
    const baseInfo = super.getPublicGameInfo();
    
    return {
      ...baseInfo,
      mode: this.mode,
      duration: this.duration,
      wordCount: this.wordCount,
      isStarted: this.isStarted,
      playerCount: this.players.size
    };
  }
}

export default TypingGame;
