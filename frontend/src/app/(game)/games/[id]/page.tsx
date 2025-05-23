"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast"; // Replace Shadcn toast with react-hot-toast
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// Remove: import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/auth-store";
import SudokuBoard from "@/components/game/sudoku-board";
import PlayersList from "@/components/game/players-list";
import ChatPanel from "@/components/game/chat-panel";
import GameService from "@/services/game-service";

// Initialize socket outside of the component to prevent multiple connections
let socket: Socket | null = null;

export default function GamePage() {
    const { id } = useParams();
    // Remove: const { toast } = useToast();
    const { user, token, isAuthenticated } = useAuthStore();

    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [highlightedCells, setHighlightedCells] = useState<any[]>([]);

    // Connect to socket and join game
    useEffect(() => {
        if (!isAuthenticated || !user || !token) return;

        // Setup socket connection
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

        if (!socket) {
            socket = io(SOCKET_URL);
        }

        // Load game data
        const fetchGame = async () => {
            try {
                const gameData = await GameService.getGame(id as string);
                setGame(gameData);
            } catch (error: any) {
                // Replace Shadcn toast with react-hot-toast
                toast.error(error.message || "Could not load game data");
            } finally {
                setLoading(false);
            }
        };

        fetchGame();

        // Join the game room
        socket.emit("join-game", {
            gameId: id,
            userId: user.id,
            username: user.username,
        });

        // Socket event listeners
        socket.on("player-joined", (data) => {
            // Replace Shadcn toast with react-hot-toast
            toast.success(`${data.username} has joined the game`);

            // Update players list
            if (game) {
                setGame((prev: any) => ({
                    ...prev,
                    players: data.players,
                }));
            }
        });

        socket.on("game-state", (gameState) => {
            setGame(gameState);
        });

        socket.on("move-made", (data) => {
            const { userId, position, value, players } = data;
            const row = Math.floor(position / 9);
            const col = position % 9;

            // Highlight the cell temporarily
            setHighlightedCells([{ row, col }]);
            setTimeout(() => setHighlightedCells([]), 1500);

            // Update game state
            setGame((prev: any) => {
                const newBoard = [...prev.board];
                newBoard[row][col] = value;
                return {
                    ...prev,
                    board: newBoard,
                    players: players,
                };
            });

            // Show toast for other players' moves
            if (userId !== user.id) {
                const playerName = game?.players.find((p: any) => p.userId === userId)?.username || "A player";
                // Replace Shadcn toast with react-hot-toast
                toast(`${playerName} placed ${value} at position [${row + 1},${col + 1}]`);
            }
        });

        socket.on("invalid-move", (data) => {
            // Replace Shadcn toast with react-hot-toast
            toast.error("That move is not valid");
        });

        socket.on("hint", (data) => {
            // Replace Shadcn toast with react-hot-toast
            toast.success(`The correct value is ${data.value}`);
        });

        socket.on("game-complete", (data) => {
            // Replace Shadcn toast with react-hot-toast
            toast.success(`Game complete! Winner: ${data.winners[0].username}`);
        });

        socket.on("new-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("error", (error) => {
            // Replace Shadcn toast with react-hot-toast
            toast.error(error.message);
        });

        // Cleanup function
        return () => {
            if (socket) {
                socket.off("player-joined");
                socket.off("game-state");
                socket.off("move-made");
                socket.off("invalid-move");
                socket.off("hint");
                socket.off("game-complete");
                socket.off("new-message");
                socket.off("error");
            }
        };
    }, [id, isAuthenticated, user, token]);

    // Handle cell value change
    const handleCellValueChange = useCallback((row: number, col: number, value: number) => {
        if (!socket || !game) return;

        const position = row * 9 + col;

        socket.emit("make-move", {
            gameId: id,
            userId: user?.id,
            position,
            value,
        });
    }, [game, id, user?.id]);

    // Request a hint
    const requestHint = useCallback((row: number, col: number) => {
        if (!socket || !game) return;

        const position = row * 9 + col;

        socket.emit("request-hint", {
            gameId: id,
            userId: user?.id,
            position,
        });
    }, [game, id, user?.id]);

    // Send a chat message
    const sendMessage = useCallback((message: string) => {
        if (!socket || !game || !user) return;

        socket.emit("send-message", {
            gameId: id,
            userId: user.id,
            username: user.username,
            message,
        });
    }, [game, id, user]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading game...</div>;
    }

    if (!game) {
        return <div className="flex justify-center items-center min-h-[60vh]">Game not found</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{game.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <SudokuBoard
                            board={game.board}
                            initialBoard={game.initialBoard}
                            onCellValueChange={handleCellValueChange}
                            highlightedCells={highlightedCells}
                        />
                    </CardContent>
                </Card>
            </div>

            <div>
                <Tabs defaultValue="players">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="players">Players</TabsTrigger>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="players">
                        <Card>
                            <CardContent className="pt-6">
                                <PlayersList players={game.players} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="chat">
                        <Card>
                            <CardContent className="pt-6 h-[400px]">
                                <ChatPanel messages={messages} onSendMessage={sendMessage} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            if (game.selectedCell) {
                                requestHint(game.selectedCell.row, game.selectedCell.col);
                            } else {
                                // Replace Shadcn toast with react-hot-toast
                                toast("Please select a cell to get a hint for");
                            }
                        }}
                    >
                        Get Hint (Costs Points)
                    </Button>
                </div>
            </div>
        </div>
    );
}