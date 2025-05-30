import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send, Sparkles, Heart, Brain, Star } from "lucide-react";
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
  const [markMood, setMarkMood] = useState<'neutral' | 'happy' | 'curious' | 'excited' | 'thinking'>('neutral');
  const [showFloatingEmoji, setShowFloatingEmoji] = useState<string | null>(null);

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

        // Update Mark's mood based on response content
        updateMarkMood(data.response);

        // Check if onboarding is complete
        if (data.isComplete) {
          setMarkMood('excited');
          setTimeout(() => onComplete(data.finalProfile), 2000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMarkMood = (response: string) => {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('exciting') || lowerResponse.includes('amazing') || lowerResponse.includes('wonderful')) {
      setMarkMood('excited');
      setShowFloatingEmoji('✨');
    } else if (lowerResponse.includes('curious') || lowerResponse.includes('tell me more') || lowerResponse.includes('?')) {
      setMarkMood('curious');
      setShowFloatingEmoji('🤔');
    } else if (lowerResponse.includes('great') || lowerResponse.includes('fantastic') || lowerResponse.includes('love')) {
      setMarkMood('happy');
      setShowFloatingEmoji('💙');
    } else if (lowerResponse.includes('thinking') || lowerResponse.includes('consider')) {
      setMarkMood('thinking');
      setShowFloatingEmoji('💭');
    } else {
      setMarkMood('neutral');
    }

    // Clear floating emoji after animation
    if (showFloatingEmoji) {
      setTimeout(() => setShowFloatingEmoji(null), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOwlEmoji = () => {
    switch (markMood) {
      case 'happy': return '🦉😊';
      case 'curious': return '🦉🤔';
      case 'excited': return '🦉✨';
      case 'thinking': return '🦉💭';
      default: return '🦉';
    }
  };

  const getMarkExpression = () => {
    switch (markMood) {
      case 'happy': return 'animate-bounce';
      case 'curious': return 'animate-pulse';
      case 'excited': return 'animate-spin';
      case 'thinking': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Mark's Avatar */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className={`w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all duration-500 ${getMarkExpression()}`}>
              {getOwlEmoji()}
            </div>
            
            {/* Status indicator */}
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
            }`}>
              {isLoading ? (
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Floating emoji */}
            {showFloatingEmoji && (
              <div className="absolute -top-4 -right-4 text-2xl animate-bounce">
                {showFloatingEmoji}
              </div>
            )}

            {/* Mood-based decorative elements */}
            {markMood === 'excited' && (
              <div className="absolute inset-0 animate-ping">
                <div className="w-32 h-32 bg-yellow-200 rounded-full opacity-20"></div>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-3">Mark</h2>
          <p className="text-gray-600 text-sm">Your College Counselor Owl</p>
          
          {/* Mood indicator */}
          <div className="flex justify-center mt-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              markMood === 'happy' ? 'bg-green-100 text-green-800' :
              markMood === 'curious' ? 'bg-blue-100 text-blue-800' :
              markMood === 'excited' ? 'bg-yellow-100 text-yellow-800' :
              markMood === 'thinking' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {markMood === 'happy' ? '😊 Happy to help' :
               markMood === 'curious' ? '🤔 Curious to learn more' :
               markMood === 'excited' ? '✨ Excited about your journey' :
               markMood === 'thinking' ? '💭 Processing your thoughts' :
               '🦉 Ready to chat'}
            </div>
          </div>
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
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground animate-slideInRight'
                        : 'bg-gray-100 text-gray-800 animate-slideInLeft'
                    }`}
                  >
                    {message.role === 'mark' && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs mr-1">🦉</span>
                        <span className="text-xs font-medium text-gray-600">Mark</span>
                      </div>
                    )}
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

        {/* Progress Indicator with topic hints */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-4 py-2 text-sm text-gray-600 backdrop-blur">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>
              {currentTopic === 'name' ? 'Getting to know you...' :
               currentTopic === 'career' ? 'Exploring your passions...' :
               currentTopic === 'values' ? 'Understanding what matters to you...' :
               currentTopic === 'college' ? 'Discussing your ideal college...' :
               currentTopic === 'activities' ? 'Learning about your interests...' :
               'Having a conversation with Mark...'}
            </span>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-3 space-x-2">
            {['name', 'career', 'values', 'college', 'activities'].map((topic, index) => (
              <div
                key={topic}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTopic === topic ? 'bg-primary' :
                  index < ['name', 'career', 'values', 'college', 'activities'].indexOf(currentTopic) ? 'bg-green-400' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}