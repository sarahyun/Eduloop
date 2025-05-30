import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, GraduationCap } from "lucide-react";
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
    career?: string;
    dreamSchools?: string;
    freeTime?: string;
    collegeExperience?: string;
    extracurriculars?: string;
    academicInfo?: string;
    gpa?: number;
    satScore?: number;
    actScore?: number;
  };
}

export default function ChatOnboarding() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to help you discover colleges that would be a great fit for you. I'll ask you some questions to get to know you better.\n\nWhat should I call you?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    step: 0,
    data: {}
  });
  const [isComplete, setIsComplete] = useState(false);
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [academicData, setAcademicData] = useState({
    gpa: '',
    satScore: '',
    actScore: ''
  });
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
      
      if (data.showAcademicForm) {
        setShowAcademicForm(true);
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-3rem)]">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl h-full flex flex-col shadow-2xl border border-white/20 dark:border-gray-700/50">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200/50 dark:border-gray-700/50 rounded-t-3xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  College Discovery
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered guidance</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-6" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[75%] px-5 py-4 text-base leading-relaxed transition-all duration-300 hover:scale-[1.02] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl rounded-br-lg shadow-lg hover:shadow-blue-500/25'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-3xl rounded-bl-lg shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-600'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {generateResponseMutation.isPending && (
                <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-gray-700 px-5 py-4 rounded-3xl rounded-bl-lg shadow-lg border border-gray-100 dark:border-gray-600">
                    <TypingIndicator isVisible={true} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Academic Form */}
          {showAcademicForm && (
            <div className="px-6 py-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-gray-700/30">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Information</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Help us find the right academic fit</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gpa" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        GPA (on 4.0 scale)
                      </Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={academicData.gpa}
                        onChange={(e) => setAcademicData(prev => ({ ...prev, gpa: e.target.value }))}
                        placeholder="e.g., 3.75"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          SAT Score (optional)
                        </Label>
                        <Input
                          id="sat"
                          type="number"
                          min="400"
                          max="1600"
                          value={academicData.satScore}
                          onChange={(e) => setAcademicData(prev => ({ ...prev, satScore: e.target.value }))}
                          placeholder="e.g., 1350"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="act" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ACT Score (optional)
                        </Label>
                        <Input
                          id="act"
                          type="number"
                          min="1"
                          max="36"
                          value={academicData.actScore}
                          onChange={(e) => setAcademicData(prev => ({ ...prev, actScore: e.target.value }))}
                          placeholder="e.g., 30"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        const academicInfo = `GPA: ${academicData.gpa || 'Not provided'}, SAT: ${academicData.satScore || 'Not provided'}, ACT: ${academicData.actScore || 'Not provided'}`;
                        setOnboardingState(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            academicInfo,
                            gpa: academicData.gpa ? parseFloat(academicData.gpa) : undefined,
                            satScore: academicData.satScore ? parseInt(academicData.satScore) : undefined,
                            actScore: academicData.actScore ? parseInt(academicData.actScore) : undefined
                          }
                        }));
                        setShowAcademicForm(false);
                        generateResponseMutation.mutate(academicInfo);
                      }}
                      disabled={!academicData.gpa}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-300"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-6 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-3xl bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-gray-700/30">
            <div className="max-w-3xl mx-auto">
              {!isComplete && !showAcademicForm ? (
                <div className="flex items-end space-x-4">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share your thoughts..."
                      disabled={generateResponseMutation.isPending}
                      className="w-full px-6 py-4 pr-14 rounded-full border-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 text-base shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || generateResponseMutation.isPending}
                      size="icon"
                      className="absolute right-2 top-2 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : isComplete ? (
                <div className="text-center py-8 animate-in fade-in duration-1000">
                  <div className="relative">
                    <div className="inline-flex items-center space-x-3 text-green-600 dark:text-green-400 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold">Profile Complete!</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Ready to explore your personalized college recommendations
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}