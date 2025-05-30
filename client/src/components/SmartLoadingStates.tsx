import { useState, useEffect } from "react";
import { MessageCircle, Brain, Search, Sparkles, Clock } from "lucide-react";

interface SmartLoadingProps {
  type: 'chat' | 'recommendations' | 'search' | 'thinking' | 'followup';
  isLoading: boolean;
  className?: string;
}

const loadingMessages = {
  chat: [
    "Reading your message...",
    "Thinking about your situation...",
    "Considering your options...",
    "Crafting a thoughtful response...",
    "Almost ready with advice..."
  ],
  recommendations: [
    "Analyzing your profile...",
    "Exploring college databases...",
    "Matching you with schools...",
    "Calculating fit scores...",
    "Preparing personalized suggestions..."
  ],
  search: [
    "Searching through colleges...",
    "Finding the best matches...",
    "Comparing programs...",
    "Analyzing your criteria...",
    "Gathering results..."
  ],
  thinking: [
    "Processing your response...",
    "Understanding your interests...",
    "Considering your goals...",
    "Analyzing what you shared..."
  ],
  followup: [
    "Thinking of a thoughtful question...",
    "Considering what to ask next...",
    "Preparing a follow-up...",
    "Understanding your interests deeper..."
  ]
};

const icons = {
  chat: MessageCircle,
  recommendations: Sparkles,
  search: Search,
  thinking: Brain,
  followup: MessageCircle
};

export function SmartLoading({ type, isLoading, className = "" }: SmartLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState("");
  
  const messages = loadingMessages[type];
  const Icon = icons[type];

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      setDots("");
      return;
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    // Progress through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev >= messages.length - 1) return prev;
        return prev + 1;
      });
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, messages.length]);

  if (!isLoading) return null;

  return (
    <div className={`flex items-center space-x-3 text-gray-600 ${className}`}>
      <Icon className="w-5 h-5 animate-pulse text-primary" />
      <span className="text-sm">
        {messages[currentMessageIndex]}{dots}
      </span>
    </div>
  );
}

interface TypingIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export function TypingIndicator({ isVisible, className = "" }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={`flex items-center space-x-2 p-3 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-500">AI is typing...</span>
    </div>
  );
}

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressiveLoading({ steps, currentStep, className = "" }: ProgressiveLoadingProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              isCompleted ? 'bg-green-500 text-white' :
              isCurrent ? 'bg-primary text-white animate-pulse' :
              'bg-gray-200'
            }`}>
              {isCompleted ? '✓' : isCurrent ? '•' : ''}
            </div>
            <span className={`text-sm ${
              isCompleted ? 'text-green-600' :
              isCurrent ? 'text-primary font-medium' :
              'text-gray-400'
            }`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ThinkingBubbleProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function ThinkingBubble({ isVisible, message = "Thinking...", className = "" }: ThinkingBubbleProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isVisible) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 ${className}`}>
      <Brain className="w-4 h-4 text-gray-500 animate-pulse" />
      <span className="text-sm text-gray-600">{message}{dots}</span>
    </div>
  );
}