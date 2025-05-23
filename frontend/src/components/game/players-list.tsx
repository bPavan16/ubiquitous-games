"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    userId: string;
    username: string;
    message: string;
    timestamp: string | Date;
}

interface ChatPanelProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
}

export default function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage("");
        }
    };

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 h-[320px] pr-4" ref={scrollAreaRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.userId === user?.id;
                            const timestamp = typeof msg.timestamp === 'string'
                                ? new Date(msg.timestamp)
                                : msg.timestamp;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : ""
                                        }`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {msg.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`max-w-[80%] rounded-lg px-3 py-2 ${isCurrentUser
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">
                                                {isCurrentUser ? "You" : msg.username}
                                            </span>
                                            <span className="text-xs opacity-70">
                                                {formatDistanceToNow(timestamp, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="mt-1">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" size="sm">
                    Send
                </Button>
            </form>
        </div>
    );
}