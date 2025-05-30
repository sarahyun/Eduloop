import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send, Sparkles } from "lucide-react";
import { TypingIndicator } from "./SmartLoadingStates";

interface Message {
  role: 'user' | 'mark';
  content: string;
  timestamp: Date;
}

interface MarkCharacterProps {
  onComplete: (profileData: any) => void;
}

export function MarkCharacter({ onComplete }: MarkCharacterProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'mark',
      content: "Hello there! I'm Mark, your friendly college counselor owl. I'm here to help you discover the perfect colleges for your unique journey. Think of me as your wise guide who's helped thousands of students find their academic home. What's your name?",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [currentTopic, setCurrentTopic] = useState('name');

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Call AI service to get Mark's response
      const response = await fetch('/api/mark-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentTopic,
          profileData
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const markMessage: Message = {
          role: 'mark',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, markMessage]);
        setCurrentTopic(data.nextTopic || currentTopic);
        setProfileData(prev => ({ ...prev, ...data.profileUpdate }));

        // Check if onboarding is complete
        if (data.isComplete) {
          setTimeout(() => onComplete(data.finalProfile), 2000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Mark's Avatar */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
              🦉
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-3">Mark</h2>
          <p className="text-gray-600 text-sm">Your College Counselor Owl</p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              
              <TypingIndicator isVisible={isLoading} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex space-x-3">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message to Mark..."
                  className="flex-1 min-h-[60px] resize-none border-gray-200 focus:border-primary"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="h-[60px] px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-4 py-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Having a conversation with Mark...</span>
          </div>
        </div>
      </div>
    </div>
  );
}