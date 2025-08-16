import { useState, useRef, useEffect } from 'react';
import { useSudokuStore } from '@/store/sudokuStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

export function ChatPanel() {
  const { chatMessages, sendChatMessage, currentGame } = useSudokuStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentGame) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-h-[80%] space-y-2 p-2 bg-gray-50 rounded-lg mb-3">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} className="bg-white p-2 rounded shadow-sm  overflow-auto ">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-800">
                  {msg.playerName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center p-2 bg-white border-t border-gray-200">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={200}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!message.trim()}
          size="sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
