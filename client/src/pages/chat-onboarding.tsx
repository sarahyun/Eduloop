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
  // Get section from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const targetSection = urlParams.get('section');
  
  // Sample previous answers - in real app this would come from user's profile
  const previousAnswers = {
    name: "Sarah",
    career: "Maybe something in engineering or computer science",
    dreamSchools: "Stanford because of their tech programs, MIT for engineering",
    freeTime: "I love coding side projects and playing guitar",
    collegeExperience: "Want a collaborative environment with good research opportunities",
    extracurriculars: "Robotics club president, guitar lessons, volunteer coding tutor",
    gpa: 3.8,
    satScore: 1450
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: getInitialMessage(),
      timestamp: new Date()
    }
  ]);

  function getInitialMessage() {
    switch (targetSection) {
      case 'Academic Information':
        return `Hi Sarah! Let's dive into your academic experience to help me understand what drives your intellectual curiosity.\n\nWhat are your 3 favorite classes you've taken so far? Tell me what makes them special to you.`;
      
      case 'Extracurriculars and Interests':
        return `Hi Sarah! Now I'd love to learn about what you're passionate about outside the classroom.\n\nWhat are you most proud of outside of academics? This could be an accomplishment, project, or something you've worked hard on.`;
      
      case 'Personal Reflections':
        return `Hi Sarah! Let's explore what makes you uniquely you and what drives you.\n\nWhat makes you happy? I'd love to understand what brings you joy and fulfillment.`;
      
      case 'College Preferences':
        return `Hi Sarah! Let's talk about what you're looking for in your college experience.\n\nWhat do you want in your college experience? Think about the environment, opportunities, and community you're hoping to find.`;
      
      default:
        return `Hi Sarah! I have your previous answers from our introduction. Let me recap what I know about you:\n\n🎯 **Career interests**: ${previousAnswers.career}\n🏫 **Dream schools**: ${previousAnswers.dreamSchools}\n⏰ **Free time**: ${previousAnswers.freeTime}\n🎓 **College experience**: ${previousAnswers.collegeExperience}\n📋 **Activities**: ${previousAnswers.extracurriculars}\n📊 **Academics**: GPA ${previousAnswers.gpa}, SAT ${previousAnswers.satScore}\n\nHas anything changed since we last talked? Would you like to update or expand on any of these answers?`;
    }
  }
  
  const [showExpandButton, setShowExpandButton] = useState(true);
  
  const [input, setInput] = useState("");
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    step: targetSection ? getInitialStepForSection(targetSection) : 0,
    data: previousAnswers
  });

  function getInitialStepForSection(section: string) {
    switch (section) {
      case 'Academic Information':
        return 10;
      case 'Extracurriculars and Interests':
        return 20;
      case 'Personal Reflections':
        return 30;
      case 'College Preferences':
        return 40;
      default:
        return 0;
    }
  }

  // Calculate progress for current section
  const getSectionProgress = () => {
    const step = onboardingState.step;
    if (step === 0) return { section: "Introduction Review", progress: 0, total: 1 };
    if (step >= 1 && step <= 2) return { section: "Updates & Clarifications", progress: step - 1, total: 2 };
    if (step >= 10 && step <= 12) return { section: "Academic Interests", progress: step - 10, total: 3 };
    if (step >= 20 && step <= 21) return { section: "Interest Expansion", progress: step - 20, total: 2 };
    return { section: "Complete", progress: 1, total: 1 };
  };

  const { section, progress, total } = getSectionProgress();
  const progressPercentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const [isComplete, setIsComplete] = useState(false);
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showProfileInsights, setShowProfileInsights] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
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
      getResponse: (response: string, state: OnboardingState) => {
        if (state.step === 0) {
          // Initial response - check if user wants to update anything
          const lowerResponse = response.toLowerCase();
          
          if (lowerResponse.includes('expand') || lowerResponse.includes('more detail') || lowerResponse.includes('tell me more')) {
            const newState = { ...state, step: 20 };
            return {
              response: `Great! I'd love to learn more about you. Let me ask some follow-up questions about your interests.\n\nYou mentioned you're interested in ${state.data.career}. What specifically draws you to this field? Is there a particular problem you'd love to help solve or a project that excites you?`,
              newState,
              isComplete: false
            };
          } else if (lowerResponse.includes('update') || lowerResponse.includes('change') || lowerResponse.includes('career') || lowerResponse.includes('school') || lowerResponse.includes('activity') || lowerResponse.includes('gpa') || lowerResponse.includes('test')) {
            const newState = { ...state, step: 1 };
            return {
              response: `Great! What would you like to update or tell me more about? You can mention:\n\n• Your career interests\n• Dream schools and why they appeal to you\n• How you spend your free time\n• What you want in your college experience\n• Your extracurriculars and activities\n• Your academic information (GPA, test scores)\n\nJust let me know what you'd like to focus on!`,
              newState,
              isComplete: false
            };
          } else if (lowerResponse.includes('no') || lowerResponse.includes('same') || lowerResponse.includes('good') || lowerResponse.includes('continue')) {
            const newState = { ...state, step: 10 };
            return {
              response: `Perfect! Since your information looks good, let's move on to some deeper questions to help me understand you even better.\n\nWhat are your 3 favorite classes you've taken so far, and what makes them special to you?`,
              newState,
              isComplete: false
            };
          } else {
            // User gave a general response, ask for clarification
            const newState = { ...state, step: 1 };
            return {
              response: `Thanks for that! To make sure I give you the best recommendations, would you like to update any of your previous answers, or should we move on to some new questions to learn more about you?`,
              newState,
              isComplete: false
            };
          }
        } else if (state.step === 1) {
          // User wants to update something - parse their response
          const newState = { ...state, step: 2 };
          return {
            response: `Got it! I've noted your updates. Is there anything else you'd like to change or expand on from your introduction, or are you ready to dive into some new questions?`,
            newState,
            isComplete: false
          };
        } else if (state.step === 2) {
          // Move to academics section
          const newState = { ...state, step: 10 };
          return {
            response: `Excellent! Now let's explore your academic interests more deeply.\n\nWhat are your 3 favorite classes you've taken so far, and what makes them special to you?`,
            newState,
            isComplete: false
          };
        } else if (state.step === 10) {
          // Start academics questions
          const newState = { ...state, step: 11, data: { ...state.data, favoriteClasses: response } };
          return {
            response: `Those sound like fascinating classes! It's great to see what sparks your curiosity.\n\nAre there any subjects you find particularly challenging or struggle with? It's totally normal - we all have different strengths!`,
            newState,
            isComplete: false
          };
        } else if (state.step === 11) {
          const newState = { ...state, step: 12, data: { ...state.data, strugglingSubjects: response } };
          return {
            response: `Thanks for being honest about that. Understanding your challenges helps me find colleges with the right support systems.\n\nWhat academic topics, problems in the world, or questions fascinate you most? What keeps you thinking even after class ends?`,
            newState,
            isComplete: false
          };
        } else if (state.step === 12) {
          const newState = { ...state, step: 13, data: { ...state.data, academicFascinations: response } };
          return {
            response: `I love hearing about what genuinely excites you intellectually! This gives me great insight into programs and research opportunities you might thrive in.\n\nThis is a great start to building your profile. To give you the best college recommendations, I'll need to learn more about your personal interests, values, and preferences. You can continue building your profile or you can begin exploring.\n\nI can help you:\n• Create personalized college recommendations based on your unique profile\n• Find schools that match your academic passions and career aspirations\n• Discover programs with research opportunities in your areas of interest\n• Answer questions about specific colleges, majors, and application processes\n• Guide you through building a comprehensive student profile\n• Search for colleges using natural language queries\n• Provide insights about what makes you stand out as an applicant\n• Help you understand college cultures and find your best fit`,
            newState,
            isComplete: true,
            showContinueButton: true
          };
        
        // Extracurriculars and Interests section (steps 20-22)
        } else if (state.step === 20) {
          const newState = { ...state, step: 21, data: { ...state.data, proudOfOutsideAcademics: response } };
          return {
            response: `That's really impressive! It's great to see what you're passionate about outside the classroom.\n\nWhat fields or problems do you want to explore/solve in the world? This could be anything from environmental issues to technology challenges to social causes.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 21) {
          const newState = { ...state, step: 22, data: { ...state.data, fieldsToExplore: response } };
          return {
            response: `I love hearing about the impact you want to make! That really helps me understand your motivations.\n\nAside from hanging out with friends, how do you like to spend your free time? What activities bring you joy or help you recharge?`,
            newState,
            isComplete: false
          };
        } else if (state.step === 22) {
          const newState = { ...state, step: 23, data: { ...state.data, freeTimeActivities: response } };
          return {
            response: `Thank you for sharing about your interests and passions! This gives me great insight into what environments and opportunities would help you thrive.\n\nThis section is complete. You can continue building your profile with other sections or start exploring colleges based on what I've learned about you so far.`,
            newState,
            isComplete: true,
            showContinueButton: true
          };
        
        // Personal Reflections section (steps 30-33)
        } else if (state.step === 30) {
          const newState = { ...state, step: 31, data: { ...state.data, whatMakesHappy: response } };
          return {
            response: `It's wonderful to hear about what brings you joy! Understanding what makes you happy helps me find colleges where you'll truly thrive.\n\nDescribe a time you overcame a challenge. This could be academic, personal, or anything that required you to grow and persevere.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 31) {
          const newState = { ...state, step: 32, data: { ...state.data, challengeOvercome: response } };
          return {
            response: `Thank you for sharing that - it takes courage to reflect on challenges and even more to overcome them. That shows real character.\n\nIf you could be remembered for one thing, what would it be? Think about the legacy or impact you'd want to leave behind.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 32) {
          const newState = { ...state, step: 33, data: { ...state.data, rememberedFor: response } };
          return {
            response: `That's a powerful vision for your impact on the world.\n\nWhat's the most important lesson you've learned in high school? This could be academic, social, or personal.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 33) {
          const newState = { ...state, step: 34, data: { ...state.data, importantLesson: response } };
          return {
            response: `Thank you for sharing these deep reflections about yourself. This gives me incredible insight into your values, resilience, and aspirations.\n\nThis section is complete. You can continue building your profile with other sections or start exploring colleges based on what I've learned about you.`,
            newState,
            isComplete: true,
            showContinueButton: true
          };
        
        // College Preferences section (steps 40-44)
        } else if (state.step === 40) {
          const newState = { ...state, step: 41, data: { ...state.data, collegeExperience: response } };
          return {
            response: `That sounds like a great vision for your college experience! Understanding what you want helps me find the right fit.\n\nDo you prefer small, medium, or large schools? Think about class sizes, campus feel, and community dynamics.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 41) {
          const newState = { ...state, step: 42, data: { ...state.data, schoolSize: response } };
          return {
            response: `Good to know your preference! School size really does impact the overall experience.\n\nWhat location experiences matter to you (arts, nature, city life, sports, etc)? Think about the environment that would energize and inspire you.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 42) {
          const newState = { ...state, step: 43, data: { ...state.data, locationExperiences: response } };
          return {
            response: `Those location preferences will really help narrow down great options for you.\n\nWhat are your parents' expectations for college? Understanding family perspectives helps me consider the full picture.`,
            newState,
            isComplete: false
          };
        } else if (state.step === 43) {
          const newState = { ...state, step: 44, data: { ...state.data, parentsExpectations: response } };
          return {
            response: `Thanks for sharing about your family's perspective - that's always important to consider.\n\nDescribe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?`,
            newState,
            isComplete: false
          };
        } else if (state.step === 44) {
          const newState = { ...state, step: 45, data: { ...state.data, communityEnvironment: response } };
          return {
            response: `Perfect! I now have a comprehensive understanding of what you're looking for in your college experience.\n\nThis section is complete. You can continue building your profile with other sections or start exploring colleges based on your preferences.`,
            newState,
            isComplete: true,
            showContinueButton: true
          };
        } else if (state.step === 20) {
          // Expand on career interests - determine if we need more info or can move on
          const responseLength = response.trim().length;
          
          if (responseLength < 50) {
            // Brief response, ask one focused follow-up
            const newState = { ...state, step: 21, data: { ...state.data, careerDetails: response } };
            return {
              response: `I'd love to understand what specifically draws you to ${state.data.career}. Is there a particular problem you'd want to solve or aspect that excites you most?`,
              newState,
              isComplete: false
            };
          } else {
            // Detailed response, move to academics
            const newState = { ...state, step: 10, data: { ...state.data, careerDetails: response } };
            return {
              response: `Thank you for sharing that detail about your career interests. That gives me great insight into what programs might excite you.\n\nNow let's explore your academic experience. What are your 3 favorite classes you've taken so far, and what makes them special to you?`,
              newState,
              isComplete: false
            };
          }
        } else if (state.step === 21) {
          // Single follow-up, then move to academics
          const newState = { ...state, step: 10, data: { ...state.data, careerExpansion: response } };
          return {
            response: `Perfect! That gives me a much clearer picture of your goals and motivations.\n\nNow let's dive into your academic interests. What are your 3 favorite classes you've taken so far, and what makes them special to you?`,
            newState,
            isComplete: false
          };
        }
        
        return {
          response: "Thank you for sharing! Let me process this information.",
          newState: state,
          isComplete: true
        };
      }
    }
  ];

  const generateResponseMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const currentFlow = conversationFlow[0];
      const response = currentFlow.getResponse(userMessage, onboardingState);
      return response;
    },
    onSuccess: (data: any) => {
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
      
      if (data.showProfileInsights) {
        setShowProfileInsights(true);
      }
      
      if (data.showContinueButton) {
        setShowContinueButton(true);
      }
      
      if (data.isComplete) {
        setIsComplete(true);
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
      // Profile saved successfully - user can navigate manually when ready
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
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
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
            <div className="flex items-center justify-center space-x-3 mb-4">
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
            
            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium">{section}</span>
                <span className="text-gray-500 dark:text-gray-400">{progressPercentage}% complete</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Building your profile to find the perfect college matches
              </p>
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
                    
                    {/* Show expand button for first message */}
                    {message.role === 'assistant' && index === 0 && showExpandButton && (
                      <div className="mt-4 space-y-2">
                        <Button 
                          onClick={() => {
                            const expandMessage = "I'd like to expand on my answers";
                            generateResponseMutation.mutate(expandMessage);
                            setShowExpandButton(false);
                          }}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Expand on my answers
                        </Button>
                      </div>
                    )}

                    {/* Show academic form in the chat bubble if this is the academic step */}
                    {message.role === 'assistant' && showAcademicForm && index === messages.length - 1 && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-3">
                          <GraduationCap className="w-5 h-5 text-purple-500" />
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Academic Information</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="gpa-chat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              GPA (required) *
                            </Label>
                            <Input
                              id="gpa-chat"
                              type="number"
                              step="0.01"
                              min="0"
                              max="4"
                              value={academicData.gpa}
                              onChange={(e) => setAcademicData(prev => ({ ...prev, gpa: e.target.value }))}
                              placeholder="e.g., 3.75"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="sat-chat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                SAT Score (optional)
                              </Label>
                              <Input
                                id="sat-chat"
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
                              <Label htmlFor="act-chat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                ACT Score (optional)
                              </Label>
                              <Input
                                id="act-chat"
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
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
                          >
                            Submit Academic Info
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show continue button at the end */}
                    {message.role === 'assistant' && showContinueButton && index === messages.length - 1 && (
                      <div className="mt-4 text-center">
                        <Button
                          onClick={() => {
                            window.location.href = '/dashboard';
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Let's go
                        </Button>
                      </div>
                    )}
                    
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