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
      content: "Hi! I'm your college counselor, and I'm here to help you discover colleges that would be a great fit for you. I'll ask you some questions to get to know you better.\n\nWhat should I call you?",
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
        return `Nice to meet you, ${response}! Let's get started.\n\nDo you have a career or major in mind? No worries if not.`;
      },
      dataKey: 'name'
    },
    {
      trigger: (response: string) => response.length > 3,
      getResponse: (response: string) => {
        let followUp = "";
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('no') || lowerResponse.includes("don't") || lowerResponse.includes('unsure')) {
          followUp = "That's perfectly normal. Many students are still exploring their options. ";
        } else if (lowerResponse.includes('medicine') || lowerResponse.includes('doctor')) {
          followUp = "Medicine is a great field. ";
        } else if (lowerResponse.includes('engineer') || lowerResponse.includes('tech')) {
          followUp = "Engineering and tech offer many exciting opportunities. ";
        } else if (lowerResponse.includes('business') || lowerResponse.includes('entrepreneur')) {
          followUp = "Business is a versatile field with many paths. ";
        } else {
          followUp = "That sounds interesting. ";
        }
        
        return followUp + "Got any dream schools in mind? If so, what's drawing you to them?";
      },
      dataKey: 'career'
    },
    {
      trigger: (response: string) => response.length > 3,
      getResponse: (response: string) => {
        let response_text = "";
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('harvard') || lowerResponse.includes('stanford') || lowerResponse.includes('mit')) {
          response_text = "Those are highly selective schools. We'll make sure to find good fits for you. ";
        } else if (lowerResponse.includes('no') || lowerResponse.includes("don't")) {
          response_text = "That's fine - keeping your options open is smart. ";
        } else {
          response_text = "Good to know you've been thinking about this. ";
        }
        
        return response_text + "Aside from hanging out with friends, how do you like to spend your time outside of school?";
      },
      dataKey: 'dreamSchools'
    },
    {
      trigger: (response: string) => response.length > 5,
      getResponse: (response: string) => {
        let encouragement = "";
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('sleep') || lowerResponse.includes('netflix')) {
          encouragement = "Rest and relaxation are important too. ";
        } else if (lowerResponse.includes('work') || lowerResponse.includes('job')) {
          encouragement = "Working shows responsibility and time management skills. ";
        } else if (lowerResponse.includes('sport') || lowerResponse.includes('music') || lowerResponse.includes('art')) {
          encouragement = "Creative and athletic activities are valuable. ";
        } else {
          encouragement = "That's interesting. ";
        }
        
        return encouragement + "What are you looking for in your college experience? Also, anything that worries you about this process?";
      },
      dataKey: 'freeTime'
    },
    {
      trigger: (response: string) => response.length > 10,
      getResponse: (response: string) => {
        let validation = "";
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('worried') || lowerResponse.includes('scared') || lowerResponse.includes('anxious')) {
          validation = "Thanks for being real with me about your worries - that takes guts, and honestly, everyone feels that way even if they don't admit it. ";
        } else if (lowerResponse.includes('friend') || lowerResponse.includes('social')) {
          validation = "Social connections are huge! College is definitely about the people you meet. ";
        } else if (lowerResponse.includes('academic') || lowerResponse.includes('learn')) {
          validation = "I love that you're thinking about the actual learning part - that's what it's all about! ";
        } else {
          validation = "That's a great way to think about it! ";
        }
        
        return validation + "Okay, last question and then we can start finding your perfect matches - if you have a resume or a list of extracurriculars, feel free to paste or enter them here. Don't stress if it's not super polished - I just want to see what you're involved in!";
      },
      dataKey: 'collegeExperience'
    },
    {
      trigger: (response: string) => response.length > 3,
      getResponse: (response: string) => {
        return "Perfect! And real quick - what's your GPA and any test scores you want to share? This helps me find schools where you'll be competitive. Don't worry if they're not perfect - there are amazing schools for every student! 📊";
      },
      dataKey: 'extracurriculars'
    },
    {
      trigger: (response: string) => response.length > 1,
      getResponse: (response: string, state: OnboardingState) => {
        return `Awesome, ${state.data.name}! 🎊 You've given me such a great picture of who you are. Here's what I've learned about you:

💭 Career thoughts: ${state.data.career}
🎯 Dream schools: ${state.data.dreamSchools}
🎮 Outside interests: ${state.data.freeTime}
🏫 College goals: ${state.data.collegeExperience}
⭐ Activities: ${state.data.extracurriculars}
📈 Academic stats: ${response}

I'm going to create your personalized profile now and then we can start exploring colleges that would be absolutely perfect for you. Ready to find your future home? 🏠✨`;
      },
      dataKey: 'academics',
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
        academicInterests: data.career ? [data.career] : [],
        careerGoals: data.career ? [data.career] : [],
        values: data.collegeExperience ? [data.collegeExperience] : [],
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