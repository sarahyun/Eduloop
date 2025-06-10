import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { questionsData, type Question, getSectionConfig } from '@/data/questionsData';
import { useToast } from '@/hooks/use-toast';
import { AIChat } from '@/components/AIChat';
import { sendMessage, getMessages, type Message } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

// Type for individual questions
interface Answer {
  question_id: string;
  question_text: string;
  answer: string;
}

interface FormResponse {
  response_id?: string;
  user_id: string;
  form_id: string;
  submitted_at?: string;
  responses: Answer[];
}

const SectionForm: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Track the current section in state so component re-renders when URL changes
  const [section, setSection] = useState<string | null>(null);
  
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Filter out context messages from chat display
  const filteredChatMessages = chatMessages.filter(message => {
    // Filter out messages that contain the context prompt
    if (message.role === 'user' && message.content.includes('CONTEXT: You are a helpful college counselor')) {
      return false;
    }
    return true;
  });

  // Function to get section from URL
  const getSectionFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    return sectionParam ? decodeURIComponent(sectionParam) : null;
  };

  // Update section when component mounts and when URL changes
  useEffect(() => {
    const updateSection = () => {
      const currentSection = getSectionFromUrl();
      setSection(currentSection);
    };

    // Set initial section
    updateSection();

    // Listen for URL changes (back/forward buttons)
    const handlePopState = () => {
      updateSection();
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(updateSection, 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(updateSection, 0);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Get current section and questions from shared data
  const currentSection = section && questionsData[section as keyof typeof questionsData] 
    ? {
        id: section,
        title: section,
        description: getDescriptionForSection(section),
        questions: questionsData[section as keyof typeof questionsData] as Question[]
      }
    : null;

  const sectionQuestions = currentSection?.questions || [];
  const formId = section?.toLowerCase().replace(/\s+/g, '_') || '';

  // Helper function to get description for each section
  function getDescriptionForSection(sectionId: string): string {
    const descriptions: Record<string, string> = {
      "Introduction": "Tell us about yourself and your goals",
      "Academic Information": "Your academic interests and performance", 
      "Extracurriculars and Interests": "Your activities and passions outside the classroom",
      "Personal Reflections": "Deeper insights into who you are",
      "College Preferences": "What you're looking for in your college experience"
    };
    return descriptions[sectionId] || "Complete this section";
  }

  // Load existing responses when section changes
  useEffect(() => {
    const loadResponses = async () => {
      if (!user?.uid || !formId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setResponses({}); // Clear previous responses
      setHasChanges(false);
      setLastSaved(null);

      try {
        const response = await fetch(`${API_BASE_URL}/responses/${user.uid}/${formId}`);
        if (response.ok) {
          const data: FormResponse = await response.json();
          const responseMap: Record<string, string> = {};
          
          data.responses.forEach((answer) => {
            responseMap[answer.question_id] = answer.answer;
          });
          
          setResponses(responseMap);
          setLastSaved(new Date(data.submitted_at || ''));
        } else if (response.status !== 404) {
          console.error('Failed to load responses');
        }
      } catch (error) {
        console.error('Error loading responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [user?.uid, formId, section]); // Add section as dependency

  // Load completion status for all sections
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user?.uid) return;

      const completed = new Set<string>();
      
      for (const sectionId of Object.keys(questionsData)) {
        const sectionFormId = sectionId.toLowerCase().replace(/\s+/g, '_');
        const sectionQuestions = questionsData[sectionId as keyof typeof questionsData] as Question[];
        const sectionConfig = getSectionConfig(sectionId);
        
        try {
          const response = await fetch(`${API_BASE_URL}/responses/${user.uid}/${sectionFormId}`);
          if (response.ok) {
            const data: FormResponse = await response.json();
            
            // Check completion based on section configuration
            if (data.responses && data.responses.length > 0) {
              const answeredQuestionIds = new Set(data.responses.map(r => r.question_id));
              const allQuestionIds = sectionQuestions.map(q => q.id.toString());
              
              // Count questions with non-empty answers
              const answeredCount = allQuestionIds.filter(questionId => {
                const response = data.responses.find(r => r.question_id === questionId);
                return response && response.answer.trim().length > 0;
              }).length;
              
              // Use section-specific completion threshold
              const completionThreshold = Math.ceil(allQuestionIds.length * sectionConfig.completionThreshold);
              if (answeredCount >= completionThreshold) {
                completed.add(sectionId);
              }
            }
          } else if (sectionConfig.isOptional) {
            // Optional sections are considered complete even if no responses exist
            // This allows users to skip them entirely
            // Note: We don't auto-mark them as complete here to maintain user choice
          }
        } catch (error) {
          console.error(`Error loading completion status for ${sectionId}:`, error);
        }
      }
      
      setCompletedSections(completed);
    };

    loadCompletionStatus();
  }, [user?.uid]);

  // Autosave functionality with debouncing
  useEffect(() => {
    if (!hasChanges || !user?.uid) return;

    const timeoutId = setTimeout(async () => {
      await saveResponses(true); // true = autosave
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [responses, hasChanges, user?.uid]);

  const saveResponses = async (isAutosave = false) => {
    if (!user?.uid || !formId) return;

    setIsSaving(true);
    
    try {
      const answersArray: Answer[] = sectionQuestions
        .filter((q) => responses[q.id.toString()]?.trim())
        .map((q) => ({
          question_id: q.id.toString(),
          question_text: q.question,
          answer: responses[q.id.toString()].trim()
        }));

      const payload: Omit<FormResponse, 'response_id' | 'submitted_at'> = {
        user_id: user.uid,
        form_id: formId,
        responses: answersArray
      };

      const response = await fetch(`${API_BASE_URL}/responses/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHasChanges(false);
        setLastSaved(new Date());
        
        // Update completion status based on section-specific threshold
        const totalQuestions = sectionQuestions.length;
        const sectionConfig = getSectionConfig(section || '');
        const completionThreshold = Math.ceil(totalQuestions * sectionConfig.completionThreshold);
        const isNowComplete = answersArray.length >= completionThreshold;
        
        if (isNowComplete) {
          setCompletedSections(prev => new Set([...prev, section || '']));
        } else {
          setCompletedSections(prev => {
            const newSet = new Set(prev);
            newSet.delete(section || '');
            return newSet;
          });
        }

        if (!isAutosave) {
          toast({
            title: "Success",
            description: sectionConfig.isOptional 
              ? `Your responses have been saved. This section is optional and ${isNowComplete ? 'marked as complete' : 'can be completed anytime'}.`
              : `Your responses have been saved. ${isNowComplete ? 'Section completed!' : `${completionThreshold - answersArray.length} more answers needed to complete this section.`}`,
          });
        }
      } else {
        throw new Error('Failed to save responses');
      }
    } catch (error) {
      console.error('Error saving responses:', error);
      toast({
        title: "Error",
        description: "Failed to save responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    setHasChanges(true);
  };

  const handleSectionSwitch = (newSection: string) => {
    // Save current changes before switching
    if (hasChanges) {
      saveResponses(true);
    }
    
    // Navigate to new section with proper URL encoding
    navigate(`/section-form?section=${encodeURIComponent(newSection)}`);
    
    // Immediately update the section state
    setSection(newSection);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return `Last saved: ${lastSaved.toLocaleTimeString()}`;
  };

  const handleSendMessage = async (content: string) => {
    setIsChatLoading(true);
    try {
      let messageToSend = content;
      let isProfileCompletionRequest = false;
      
      // Check if this is a profile completion request
      if (content.toLowerCase().includes('help me complete my profile') || 
          content.toLowerCase().includes('complete my profile')) {
        isProfileCompletionRequest = true;
        // Create context for profile completion
        const unansweredQuestions = sectionQuestions
          .filter((_, index) => !responses[index] || responses[index].trim() === '')
          .map((q, originalIndex) => `○ ${q.question} (Not yet answered)`)
          .join('\n');

        messageToSend = `CONTEXT: You are a helpful college counselor helping a student complete their "${section}" profile section.

SECTION QUESTIONS:
${unansweredQuestions}

INSTRUCTIONS:
- Ask questions one at a time in a conversational way
- Focus on unanswered questions first
- You may ask ONE thoughtful follow-up question if relevant
- Be encouraging and help the student think through their answers
- If they've answered everything, congratulate them and suggest they can always update answers

STUDENT MESSAGE: ${content}`;
      }

      const result = await sendMessage(1, 'user', messageToSend);
      
      // For profile completion requests, only show the AI response, not the context message
      if (isProfileCompletionRequest) {
        // Add the original user message (not the context) and AI response
        const userMessage: Message = {
          id: Date.now(),
          conversationId: 1,
          role: 'user',
          content: content, // Use original content, not the context
          createdAt: new Date().toISOString()
        };
        
        const newMessages = [userMessage, result.aiMessage].filter(Boolean) as Message[];
        setChatMessages(prev => [...prev, ...newMessages]);
      } else {
        // For regular chat, add both user message and AI response
        const newMessages = [result.userMessage, result.aiMessage].filter(Boolean) as Message[];
        setChatMessages(prev => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your responses...</p>
        </div>
      </div>
    );
  }

  if (!section || !currentSection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Section not found</h2>
          <Button onClick={() => navigate('/profile-builder')}>
            Return to Profile Builder
          </Button>
        </div>
      </div>
    );
  }

  const allSectionIds = Object.keys(questionsData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile-builder')}
              className="mb-6 w-full justify-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile Builder
            </Button>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Sections</h2>
              <div className="text-sm text-gray-600 mb-2">
                {completedSections.size} of {allSectionIds.length} sections completed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSections.size / allSectionIds.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              {allSectionIds.map((sectionId) => {
                const isCompleted = completedSections.has(sectionId);
                const isCurrent = section === sectionId;
                
                return (
                  <button
                    key={sectionId}
                    onClick={() => handleSectionSwitch(sectionId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 border-primary/20 border text-primary'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{sectionId}</div>
                        <div className="text-xs text-gray-500 mt-1">{getDescriptionForSection(sectionId)}</div>
                      </div>
                      {isCompleted && (
                        <div className="h-4 w-4 text-green-500 ml-2 flex-shrink-0">✓</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-8 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{currentSection.title}</h1>
              <p className="text-gray-600 mt-2">{currentSection.description}</p>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>Progress: {sectionQuestions.filter(q => responses[q.id.toString()]?.trim()).length} of {sectionQuestions.length} questions answered</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(sectionQuestions.filter(q => responses[q.id.toString()]?.trim()).length / sectionQuestions.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">Questions</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Responses are autosaved</span>
                    {isSaving ? (
                      <div className="flex items-center gap-2 text-primary">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        <span>Saving...</span>
                      </div>
                    ) : lastSaved ? (
                      <span className="text-green-600 text-xs">{formatLastSaved()}</span>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {sectionQuestions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {question.question}
                    </label>
                    <Textarea
                      value={responses[question.id.toString()] || ''}
                      onChange={(e) => handleInputChange(question.id.toString(), e.target.value)}
                      placeholder="Share your thoughts..."
                      className="min-h-[100px] resize-none"
                      disabled={isSaving}
                    />
                  </div>
                ))}
                
                {/* Navigation */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      {allSectionIds.findIndex(s => s === section) > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentIndex = allSectionIds.findIndex(s => s === section);
                            const previousSection = allSectionIds[currentIndex - 1];
                            handleSectionSwitch(previousSection);
                          }}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Previous Section
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Section {allSectionIds.findIndex(s => s === section) + 1} of {allSectionIds.length}
                    </div>
                    <div>
                      {allSectionIds.findIndex(s => s === section) < allSectionIds.length - 1 && (
                        <Button
                          onClick={() => {
                            const currentIndex = allSectionIds.findIndex(s => s === section);
                            const nextSection = allSectionIds[currentIndex + 1];
                            handleSectionSwitch(nextSection);
                          }}
                        >
                          Next Section
                          <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Status */}
            {isSaving && (
              <div className="fixed bottom-4 right-4 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-primary text-sm">Saving...</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionForm;