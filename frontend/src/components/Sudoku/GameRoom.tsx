// import { SudokuBoard } from './SudokuBoard';
// import { PlayerList } from './PlayerList';
// import { GameControls } from './GameControls';
// import { ChatPanel } from '../Games/ChatPanel';
// import { Leaderboard } from './Leaderboard';
// import { useSudokuStore } from '@/store/sudokuStore';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Gamepad2, Users, Trophy } from 'lucide-react';

// export function GameRoom() {
//   const { currentGame } = useSudokuStore();

//   if (!currentGame) return null;

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case 'easy': return 'bg-green-100 text-green-800';
//       case 'medium': return 'bg-yellow-100 text-yellow-800';
//       case 'hard': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'waiting': return 'bg-blue-100 text-blue-800';
//       case 'playing': return 'bg-green-100 text-green-800';
//       case 'paused': return 'bg-yellow-100 text-yellow-800';
//       case 'finished': return 'bg-purple-100 text-purple-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Gamepad2 className="w-6 h-6 text-blue-600" />
//               <h1 className="text-2xl font-bold text-gray-800">Multiplayer Sudoku</h1>
//             </div>
//             <div className="flex items-center gap-2">
//               <Badge className={getDifficultyColor(currentGame.difficulty)}>
//                 {currentGame.difficulty}
//               </Badge>
//               <Badge className={getStatusColor(currentGame.gameState)}>
//                 {currentGame.gameState}
//               </Badge>
//             </div>
//           </div>
//           <p className="text-gray-600 mt-1">Game ID: {currentGame.gameId}</p>
//         </div>

//         <div className="grid lg:grid-cols-4 gap-6">
//           {/* Main Game Area - Left Side */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Game Stats */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   <Trophy className="w-5 h-5" />
//                   Game Stats
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <div className="text-xl font-bold text-blue-600">
//                       {currentGame.players.length}
//                     </div>
//                     <div className="text-sm text-gray-600">Players</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xl font-bold text-green-600">
//                       {currentGame.moveHistory?.length || 0}
//                     </div>
//                     <div className="text-sm text-gray-600">Total Moves</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xl font-bold text-purple-600">
//                       {currentGame.startTime ? 
//                         Math.floor((Date.now() - currentGame.startTime) / 60000) : 0}
//                     </div>
//                     <div className="text-sm text-gray-600">Minutes</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xl font-bold text-orange-600">
//                       {currentGame.winner ? '🏆' : '⏳'}
//                     </div>
//                     <div className="text-sm text-gray-600">Status</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Game Controls */}
//             <GameControls />

//             {/* Sudoku Board */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-center">Sudoku Puzzle</CardTitle>
//               </CardHeader>
//               <CardContent className="flex justify-center">
//                 <SudokuBoard />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Sidebar */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Players */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   Players ({currentGame.players.length}/{currentGame.maxPlayers})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <PlayerList />
//               </CardContent>
//             </Card>

//             {/* Leaderboard */}
//             {currentGame.gameState !== 'waiting' && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Trophy className="w-5 h-5" />
//                     Leaderboard
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <Leaderboard />
//                 </CardContent>
//               </Card>
//             )}

//             {/* Chat */}
//             <Card className="flex-1">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   Chat
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ChatPanel />
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
