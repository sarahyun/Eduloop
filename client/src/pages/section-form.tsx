import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PROFILE_SECTIONS, getSectionById } from '@/data/profileSections';
import { useToast } from '@/hooks/use-toast';

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
  
  // Get section from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const currentSection = getSectionById(section || '');
  const sectionQuestions = currentSection?.questions || [];
  const formId = section?.toLowerCase().replace(/\s+/g, '_') || '';

  // Load existing responses on component mount
  useEffect(() => {
    const loadResponses = async () => {
      if (!user?.uid || !formId) return;

      try {
        const response = await fetch(`/api/responses/${user.uid}/${formId}`);
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
  }, [user?.uid, formId]);

  // Load completion status for all sections
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user?.uid) return;

      const completed = new Set<string>();
      
      for (const profileSection of PROFILE_SECTIONS) {
        const sectionFormId = profileSection.id.toLowerCase().replace(/\s+/g, '_');
        try {
          const response = await fetch(`/api/responses/${user.uid}/${sectionFormId}`);
          if (response.ok) {
            const data: FormResponse = await response.json();
            // Consider section completed if it has at least one response
            if (data.responses && data.responses.length > 0) {
              completed.add(profileSection.id);
            }
          }
        } catch (error) {
          console.error(`Error loading completion status for ${profileSection.id}:`, error);
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
        .filter((q) => responses[q.id]?.trim())
        .map((q) => ({
          question_id: q.id,
          question_text: q.question,
          answer: responses[q.id].trim()
        }));

      const payload: Omit<FormResponse, 'response_id' | 'submitted_at'> = {
        user_id: user.uid,
        form_id: formId,
        responses: answersArray
      };

      const response = await fetch('/api/responses/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHasChanges(false);
        setLastSaved(new Date());
        
        // Update completion status
        if (answersArray.length > 0 && section) {
          setCompletedSections(prev => new Set([...prev, section]));
        }
        
        if (!isAutosave) {
          toast({
            title: "Success",
            description: "Your responses have been saved.",
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
    
    // Navigate to new section
    navigate(`/section-form?section=${encodeURIComponent(newSection)}`);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return `Last saved: ${lastSaved.toLocaleTimeString()}`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Enhanced Sidebar Navigation */}
        <div className="w-96 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-blue-200 min-h-screen">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile-builder')}
              className="mb-6 w-full justify-start text-primary hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile Builder
            </Button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary mb-2">Profile Sections</h2>
              <div className="text-sm text-blue-600">
                {completedSections.size} of {PROFILE_SECTIONS.length} sections completed
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSections.size / PROFILE_SECTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              {PROFILE_SECTIONS.map((profileSection, index) => {
                const isCompleted = completedSections.has(profileSection.id);
                const isCurrent = section === profileSection.id;
                const isNext = !isCompleted && PROFILE_SECTIONS.slice(0, index).every(s => completedSections.has(s.id));
                
                return (
                  <button
                    key={profileSection.id}
                    onClick={() => handleSectionSwitch(profileSection.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                      isCurrent
                        ? 'bg-primary border-primary text-white shadow-lg transform scale-105'
                        : isCompleted
                        ? 'bg-white border-green-300 text-gray-800 hover:shadow-md'
                        : isNext
                        ? 'bg-white border-blue-300 text-gray-800 hover:bg-blue-50 hover:border-blue-400'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                    disabled={!isCompleted && !isNext && !isCurrent}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCurrent
                          ? 'bg-white text-primary'
                          : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : isNext
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm leading-tight ${
                          isCurrent ? 'text-white' : 'text-gray-900'
                        }`}>
                          {profileSection.title}
                        </div>
                        <div className={`text-xs mt-1 leading-relaxed ${
                          isCurrent ? 'text-red-100' : 'text-gray-600'
                        }`}>
                          {profileSection.description}
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Completed
                          </div>
                        )}
                        {isNext && !isCurrent && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            → Up next
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Progress Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{completedSections.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-red-600">{PROFILE_SECTIONS.length - completedSections.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium text-red-600">
                    {Math.round((completedSections.size / PROFILE_SECTIONS.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 py-8 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Header with Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-red-900">{currentSection.title}</h1>
                  <p className="text-gray-600 mt-2 text-lg">{currentSection.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Section Progress</div>
                  <div className="text-2xl font-bold text-red-600">
                    {sectionQuestions.filter(q => responses[q.id]?.trim()).length} / {sectionQuestions.length}
                  </div>
                </div>
              </div>
              
              {/* Section Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(sectionQuestions.filter(q => responses[q.id]?.trim()).length / sectionQuestions.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Enhanced Form Card */}
            <Card className="border-2 border-red-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-red-900">Questions</h2>
                    <p className="text-sm text-red-600 mt-1">Take your time and be thoughtful - you can always come back to edit</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {isSaving ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        <span className="font-medium">Saving...</span>
                      </div>
                    ) : lastSaved ? (
                      <span className="text-green-600 text-xs font-medium">{formatLastSaved()}</span>
                    ) : (
                      <span className="text-gray-500">Autosave enabled</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {sectionQuestions.map((question, index) => {
                    const hasResponse = responses[question.id]?.trim();
                    const wordCount = responses[question.id]?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
                    
                    return (
                      <div key={question.id} className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        hasResponse 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50 hover:border-red-300'
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            hasResponse 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {hasResponse ? '✓' : index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <label className="block text-lg font-semibold text-gray-900 leading-relaxed">
                              {question.question}
                            </label>
                            <Textarea
                              value={responses[question.id] || ''}
                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                              placeholder={question.placeholder || "Share your thoughts in detail..."}
                              className="min-h-[120px] resize-none text-base leading-relaxed border-2 focus:border-red-400 focus:ring-red-200"
                              disabled={isSaving}
                            />
                            <div className="flex justify-between items-center text-sm">
                              <span className={`${hasResponse ? 'text-green-600' : 'text-gray-500'}`}>
                                {hasResponse ? `✓ Response saved (${wordCount} words)` : 'No response yet'}
                              </span>
                              {wordCount > 0 && (
                                <span className="text-gray-400">
                                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Section Navigation */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      {PROFILE_SECTIONS.findIndex(s => s.id === section) > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentIndex = PROFILE_SECTIONS.findIndex(s => s.id === section);
                            const previousSection = PROFILE_SECTIONS[currentIndex - 1];
                            handleSectionSwitch(previousSection.id);
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Previous Section
                        </Button>
                      )}
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-sm text-gray-600">
                        Section {PROFILE_SECTIONS.findIndex(s => s.id === section) + 1} of {PROFILE_SECTIONS.length}
                      </div>
                    </div>
                    <div>
                      {PROFILE_SECTIONS.findIndex(s => s.id === section) < PROFILE_SECTIONS.length - 1 && (
                        <Button
                          onClick={() => {
                            const currentIndex = PROFILE_SECTIONS.findIndex(s => s.id === section);
                            const nextSection = PROFILE_SECTIONS[currentIndex + 1];
                            handleSectionSwitch(nextSection.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white"
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

            {/* Floating Save Status */}
            {isSaving && (
              <div className="fixed bottom-6 right-6 bg-red-500 text-white rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">Saving your responses...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionForm;