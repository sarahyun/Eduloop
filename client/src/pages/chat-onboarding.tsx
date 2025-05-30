import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { TypingIndicator } from "@/components/SmartLoadingStates";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OnboardingState {
  step: number;
  data: {
    name?: string;
    interests?: string;
    academics?: string;
    goals?: string;
    preferences?: string;
    extracurriculars?: string;
  };
}

export default function ChatOnboarding() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm your college counselor, and I'm here to help you discover the perfect colleges for your journey. Think of this as a friendly conversation where I'll get to know you better. What should I call you?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    step: 0,
    data: {}
  });
  const [isComplete, setIsComplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationFlow = [
    {
      trigger: (response: string) => true,
      getResponse: (response: string) => {
        return `Nice to meet you, ${response}! I'm excited to help you explore colleges that could be a great fit. Let's start with what makes you tick - what subjects, activities, or ideas genuinely excite you? Don't worry about whether they're "academic" enough - I want to know what you're passionate about.`;
      },
      dataKey: 'name'
    },
    {
      trigger: (response: string) => response.length > 10,
      getResponse: (response: string) => {
        const interests = response.toLowerCase();
        let followUp = "That's fascinating! ";
        
        if (interests.includes('science') || interests.includes('research')) {
          followUp += "I can tell you're drawn to discovery and understanding how things work. ";
        }
        if (interests.includes('art') || interests.includes('creative')) {
          followUp += "Your creative side really comes through! ";
        }
        if (interests.includes('help') || interests.includes('people')) {
          followUp += "You seem to have a real drive to make a difference in people's lives. ";
        }
        
        return followUp + "Now, thinking about school - are there any subjects where you find yourself naturally curious or where time just flies by? Or maybe subjects you're struggling with but still find intriguing?";
      },
      dataKey: 'interests'
    },
    {
      trigger: (response: string) => response.length > 5,
      getResponse: (response: string) => {
        return "That gives me great insight into how you learn and what engages you academically. Let's talk about the future - when you imagine yourself in 5-10 years, what kind of impact do you want to be making? What would make you feel fulfilled in your career?";
      },
      dataKey: 'academics'
    },
    {
      trigger: (response: string) => response.length > 10,
      getResponse: (response: string) => {
        return "I love hearing about your aspirations! Now, thinking about college life itself - what kind of environment helps you thrive? Do you prefer intimate discussions or large lectures? Urban energy or peaceful campuses? Are you someone who loves school spirit and traditions, or do you prefer a more low-key academic atmosphere?";
      },
      dataKey: 'goals'
    },
    {
      trigger: (response: string) => response.length > 10,
      getResponse: (response: string) => {
        return "Perfect! That helps me understand what kind of college community would feel like home to you. One last thing - tell me about what you do outside of class. This could be jobs, volunteering, hobbies, family responsibilities, creative projects - anything that's important to your life right now.";
      },
      dataKey: 'preferences'
    },
    {
      trigger: (response: string) => response.length > 5,
      getResponse: (response: string, state: OnboardingState) => {
        return `Thank you for sharing so much about yourself, ${state.data.name}! I now have a wonderful picture of who you are:

🎯 Your passions: ${state.data.interests}
📚 Academic interests: ${state.data.academics}  
🚀 Career goals: ${state.data.goals}
🏫 Campus preferences: ${state.data.preferences}
🌟 Activities: ${response}

I'm going to create your personalized college profile now, and then we can start exploring colleges that would be amazing fits for you. Ready to see what we discover?`;
      },
      dataKey: 'extracurriculars',
      isComplete: true
    }
  ];

  const generateResponseMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const currentStep = conversationFlow[onboardingState.step];
      
      if (currentStep && currentStep.trigger(userMessage)) {
        const newData = { ...onboardingState.data, [currentStep.dataKey]: userMessage };
        const response = currentStep.getResponse(userMessage, { ...onboardingState, data: newData });
        
        return {
          response,
          newState: {
            step: onboardingState.step + 1,
            data: newData
          },
          isComplete: currentStep.isComplete || false
        };
      }
      
      return {
        response: "I'd love to hear more about that. Could you share a bit more detail?",
        newState: onboardingState,
        isComplete: false
      };
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setOnboardingState(data.newState);
      
      if (data.isComplete) {
        setIsComplete(true);
        // Here we could save the profile data
        createProfileMutation.mutate(data.newState.data);
      }
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: OnboardingState['data']) => 
      api.createProfile({
        userId: 1,
        academicInterests: data.academics ? [data.academics] : [],
        careerGoals: data.goals ? [data.goals] : [],
        values: data.preferences ? [data.preferences] : [],
        extracurriculars: data.extracurriculars ? [data.extracurriculars] : [],
        profileCompletion: 100,
      }),
    onSuccess: () => {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  });

  const handleSend = () => {
    if (!input.trim() || generateResponseMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    generateResponseMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[90vh] flex flex-col">
          <CardHeader className="border-b bg-white/80 backdrop-blur">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>College Discovery Chat</CardTitle>
                <p className="text-sm text-gray-600">
                  Let's have a friendly conversation to find your perfect college matches
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                <TypingIndicator isVisible={generateResponseMutation.isPending} />
              </div>
            </ScrollArea>

            {!isComplete ? (
              <div className="border-t p-4 bg-white/80 backdrop-blur">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={generateResponseMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || generateResponseMutation.isPending}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t p-6 bg-white/80 backdrop-blur text-center">
                <div className="flex items-center justify-center space-x-2 text-primary mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Profile Complete!</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Taking you to your personalized dashboard...
                </p>
                <div className="w-8 h-1 bg-primary rounded-full mx-auto animate-pulse"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}