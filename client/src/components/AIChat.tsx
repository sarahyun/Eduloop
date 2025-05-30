import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Cpu, Send, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Message, Conversation } from "@/lib/api";

interface AIChatProps {
  conversation?: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  user?: { fullName: string };
}

export function AIChat({ 
  conversation, 
  messages, 
  onSendMessage, 
  isLoading = false,
  isExpanded = false,
  onToggleExpanded,
  user 
}: AIChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const content = inputValue.trim();
      setInputValue("");
      await onSendMessage(content);
    }
  };

  const quickActions = [
    "Compare schools",
    "Application tips", 
    "Career guidance",
    "Essay help"
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Mentor</h3>
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </div>
          </div>
        </div>
        {onToggleExpanded && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleExpanded}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${isExpanded ? 'max-h-96' : 'max-h-64'} mb-4`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Start a conversation with your AI mentor!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-tr-md'
                    : 'bg-gray-100 text-gray-800 rounded-tl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span 
                  className={`text-xs mt-1 block ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.createdAt)}
                </span>
              </div>

              {message.role === 'user' && user && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Ask me anything about colleges..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit"
          size="sm"
          className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-colors"
          disabled={isLoading || !inputValue.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-gray-200 transition-colors text-xs"
            onClick={() => {
              setInputValue(action);
            }}
          >
            {action}
          </Badge>
        ))}
      </div>
    </div>
  );
}
