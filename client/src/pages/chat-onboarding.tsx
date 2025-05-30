import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const [academicData, setAcademicData] = useState({
    gpa: "",
    satScore: "",
    actScore: ""
  });
  
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
          questions: targetSection ? PROFILE_SECTIONS[targetSection as keyof typeof PROFILE_SECTIONS] : [],
          currentQuestionIndex
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
      
      // Update question index for next question
      if (data.nextQuestionIndex !== undefined) {
        setCurrentQuestionIndex(data.nextQuestionIndex);
      }
      
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

  const handleAcademicFormSubmit = () => {
    if (!academicData.gpa && !academicData.satScore && !academicData.actScore) return;
    
    let formattedResponse = "Here are my academic scores:\n";
    if (academicData.gpa) formattedResponse += `GPA: ${academicData.gpa}\n`;
    if (academicData.satScore) formattedResponse += `SAT: ${academicData.satScore}\n`;
    if (academicData.actScore) formattedResponse += `ACT: ${academicData.actScore}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: formattedResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    generateResponseMutation.mutate(formattedResponse);
    setAcademicData({ gpa: "", satScore: "", actScore: "" });
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

  // Check if we should show the academic form for question 6 (GPA and test scores)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isIntroductionSection = targetSection === 'Introduction';
    const isQuestion6 = currentQuestionIndex === 5; // Question 6 (0-indexed)
    const hasAcademicForm = messages.some(m => m.content === 'ACADEMIC_FORM');
    
    if (isIntroductionSection && isQuestion6 && lastMessage && lastMessage.role === 'assistant' && !hasAcademicForm && lastMessage.content !== 'ACADEMIC_FORM') {
      // Add the academic form as a message in the chat for question 6
      const formMessage: ChatMessage = {
        id: `form-${Date.now()}`,
        role: 'assistant',
        content: 'ACADEMIC_FORM',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, formMessage]);
    }
  }, [messages, currentQuestionIndex, targetSection]);

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
                        {message.content === 'ACADEMIC_FORM' ? (
                          <div className="space-y-4">
                            <div className="text-sm text-gray-800 mb-3">
                              Please fill in your academic information:
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="gpa" className="text-sm font-medium">GPA</Label>
                                <Select value={academicData.gpa} onValueChange={(value) => setAcademicData(prev => ({ ...prev, gpa: value }))}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select GPA" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="4.0">4.0</SelectItem>
                                    <SelectItem value="3.9">3.9</SelectItem>
                                    <SelectItem value="3.8">3.8</SelectItem>
                                    <SelectItem value="3.7">3.7</SelectItem>
                                    <SelectItem value="3.6">3.6</SelectItem>
                                    <SelectItem value="3.5">3.5</SelectItem>
                                    <SelectItem value="3.4">3.4</SelectItem>
                                    <SelectItem value="3.3">3.3</SelectItem>
                                    <SelectItem value="3.2">3.2</SelectItem>
                                    <SelectItem value="3.1">3.1</SelectItem>
                                    <SelectItem value="3.0">3.0</SelectItem>
                                    <SelectItem value="2.9">2.9</SelectItem>
                                    <SelectItem value="2.8">2.8</SelectItem>
                                    <SelectItem value="2.7">2.7</SelectItem>
                                    <SelectItem value="2.6">2.6</SelectItem>
                                    <SelectItem value="2.5">2.5</SelectItem>
                                    <SelectItem value="below_2.5">Below 2.5</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="sat" className="text-sm font-medium">SAT Score</Label>
                                <Select value={academicData.satScore} onValueChange={(value) => setAcademicData(prev => ({ ...prev, satScore: value }))}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select SAT" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1600">1600</SelectItem>
                                    <SelectItem value="1550-1590">1550-1590</SelectItem>
                                    <SelectItem value="1500-1540">1500-1540</SelectItem>
                                    <SelectItem value="1450-1490">1450-1490</SelectItem>
                                    <SelectItem value="1400-1440">1400-1440</SelectItem>
                                    <SelectItem value="1350-1390">1350-1390</SelectItem>
                                    <SelectItem value="1300-1340">1300-1340</SelectItem>
                                    <SelectItem value="1250-1290">1250-1290</SelectItem>
                                    <SelectItem value="1200-1240">1200-1240</SelectItem>
                                    <SelectItem value="1150-1190">1150-1190</SelectItem>
                                    <SelectItem value="1100-1140">1100-1140</SelectItem>
                                    <SelectItem value="1050-1090">1050-1090</SelectItem>
                                    <SelectItem value="1000-1040">1000-1040</SelectItem>
                                    <SelectItem value="below_1000">Below 1000</SelectItem>
                                    <SelectItem value="not_taken">Not taken</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="act" className="text-sm font-medium">ACT Score</Label>
                                <Select value={academicData.actScore} onValueChange={(value) => setAcademicData(prev => ({ ...prev, actScore: value }))}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select ACT" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="36">36</SelectItem>
                                    <SelectItem value="35">35</SelectItem>
                                    <SelectItem value="34">34</SelectItem>
                                    <SelectItem value="33">33</SelectItem>
                                    <SelectItem value="32">32</SelectItem>
                                    <SelectItem value="31">31</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                    <SelectItem value="29">29</SelectItem>
                                    <SelectItem value="28">28</SelectItem>
                                    <SelectItem value="27">27</SelectItem>
                                    <SelectItem value="26">26</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="24">24</SelectItem>
                                    <SelectItem value="23">23</SelectItem>
                                    <SelectItem value="22">22</SelectItem>
                                    <SelectItem value="21">21</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="below_20">Below 20</SelectItem>
                                    <SelectItem value="not_taken">Not taken</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <Button 
                                onClick={handleAcademicFormSubmit}
                                disabled={!academicData.gpa && !academicData.satScore && !academicData.actScore}
                                size="sm"
                              >
                                Submit
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm text-gray-800">
                            {message.content}
                          </div>
                        )}
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