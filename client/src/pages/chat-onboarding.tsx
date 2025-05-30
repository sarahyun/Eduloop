import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navigation } from '@/components/Navigation';
import { Send, ArrowLeft } from 'lucide-react';
import { PROFILE_SECTIONS } from '@shared/questions';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export default function ChatOnboarding() {
  // Get section from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const targetSection = urlParams.get('section');
  
  const [user] = useState<User>({ id: 1, username: "sarah", email: "sarah@example.com", fullName: "Sarah Johnson" });
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing profile data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  function getInitialMessage() {
    if (!profile) return "Loading your profile...";
    
    // Check if this section has existing data
    const hasExistingData = getSectionData(targetSection, profile);
    
    if (hasExistingData && Object.values(hasExistingData).some(value => value) && hasUserProvidedData(hasExistingData)) {
      // Section is completed with real user data - show recap
      setShowExpandButton(true);
      return getSectionRecap(targetSection, hasExistingData);
    } else {
      // Section is new - start fresh conversation
      switch (targetSection) {
        case 'Introduction':
          return `Hi! I'm excited to get to know you better. Let's start with some basic information.\n\nWhat's your name?`;
        
        case 'Academic Information':
          return `Hi Sarah! Let's dive into your academic experience to help me understand what drives your intellectual curiosity.\n\nWhat are your 3 favorite classes you've taken so far? Tell me what makes them special to you.`;
        
        case 'Extracurriculars and Interests':
          return `Hi Sarah! Now I'd love to learn about what you're passionate about outside the classroom.\n\nWhat are you most proud of outside of academics? This could be an accomplishment, project, or something you've worked hard on.`;
        
        case 'Personal Reflections':
          return `Hi Sarah! Let's explore what makes you uniquely you and what drives you.\n\nWhat makes you happy? I'd love to understand what brings you joy and fulfillment.`;
        
        case 'College Preferences':
          return `Hi Sarah! Let's talk about what you're looking for in your college experience.\n\nWhat do you want in your college experience? Think about the environment, opportunities, and community you're hoping to find.`;
        
        default:
          return `Hi Sarah! I'm here to help you build your profile. Let's start with some questions to understand you better.`;
      }
    }
  }

  function getSectionData(section: string | null, profileData: any) {
    if (!section || !profileData) return null;
    
    switch (section) {
      case 'Introduction':
        return {
          name: profileData.name,
          grade: profileData.grade,
          school: profileData.school,
          basicInfo: profileData.basicInfo
        };
      case 'Academic Information':
        return {
          favoriteClasses: profileData.favoriteClasses,
          strugglingSubjects: profileData.strugglingSubjects,
          academicFascinations: profileData.academicFascinations
        };
      case 'Extracurriculars and Interests':
        return {
          proudOfOutsideAcademics: profileData.proudOfOutsideAcademics,
          fieldsToExplore: profileData.fieldsToExplore,
          freeTimeActivities: profileData.freeTimeActivities
        };
      case 'Personal Reflections':
        return {
          whatMakesHappy: profileData.whatMakesHappy,
          challengeOvercome: profileData.challengeOvercome,
          rememberedFor: profileData.rememberedFor,
          importantLesson: profileData.importantLesson
        };
      case 'College Preferences':
        return {
          collegeExperience: profileData.collegeExperience,
          schoolSize: profileData.schoolSize,
          locationExperiences: profileData.locationExperiences,
          parentsExpectations: profileData.parentsExpectations,
          communityEnvironment: profileData.communityEnvironment
        };
      default:
        return null;
    }
  }

  function getSectionRecap(section: string | null, data: any) {
    if (!section || !data) return "";
    
    const responses = Object.entries(data).filter(([_, value]) => value);
    if (responses.length === 0) return "";
    
    let recap = `Hi Sarah! I can see you've already shared some great information about your ${section.toLowerCase()}. Here's what you told me:\n\n`;
    
    responses.forEach(([key, value]) => {
      const question = getQuestionForKey(section, key);
      if (question && value) {
        recap += `**${question}**\n${value}\n\n`;
      }
    });
    
    recap += `Would you like to expand on any of these answers or add more details?`;
    return recap;
  }

  function getQuestionForKey(section: string, key: string) {
    const sectionQuestions = PROFILE_SECTIONS[section as keyof typeof PROFILE_SECTIONS];
    if (!sectionQuestions) return null;
    
    const question = sectionQuestions.find(q => q.id === key);
    return question?.question || null;
  }

  function hasUserProvidedData(data: any) {
    if (!data) return false;
    
    // Check if data contains sample/default values that indicate it's not user-provided
    const sampleValues = [
      "Sarah Johnson", 
      "12th", 
      "Lincoln High School", 
      "I'm a senior who loves learning and helping others. I'm interested in technology and healthcare."
    ];
    
    const values = Object.values(data).filter(v => v);
    return !values.some(value => sampleValues.includes(value as string));
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize messages when profile loads
  useEffect(() => {
    if (profile && messages.length === 0) {
      const initialMessage = getInitialMessage();
      setMessages([{
        id: '1',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }]);
    }
  }, [profile]);

  // Generate AI response
  const generateResponseMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/chat/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          section: targetSection,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
          questions: targetSection ? PROFILE_SECTIONS[targetSection as keyof typeof PROFILE_SECTIONS] : []
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.isComplete) {
        setIsComplete(true);
        setShowContinueButton(true);
      }
      
      // Save answers to profile if provided
      if (data.profileUpdates) {
        updateProfileMutation.mutate(data.profileUpdates);
      }
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const response = await fetch('/api/profile/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/profile-builder'}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile Builder
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {targetSection ? `${targetSection} - Chat` : 'Profile Chat'}
          </h1>
          <p className="text-gray-600">
            Have a conversation with our AI to build your profile naturally. Your answers are automatically saved.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[700px] flex flex-col bg-white">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Container */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 bg-white">
              <div className="p-4 space-y-3 bg-white min-h-full">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'user' ? (
                      <div className="max-w-[75%] p-3 rounded-2xl bg-blue-500 text-white">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[75%] p-3 rounded-2xl bg-gray-200">
                        <div className="whitespace-pre-wrap text-sm text-gray-800">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {generateResponseMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Invisible element at the bottom for scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex items-center space-x-2 p-4 border-t bg-white">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                disabled={generateResponseMutation.isPending}
                className="flex-1 rounded-full border-gray-300"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || generateResponseMutation.isPending}
                size="icon"
                className="rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}