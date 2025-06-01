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
            
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Sections</h2>
            
            <div className="space-y-2">
              {PROFILE_SECTIONS.map((profileSection) => (
                <button
                  key={profileSection.id}
                  onClick={() => handleSectionSwitch(profileSection.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    section === profileSection.id
                      ? 'bg-blue-50 border-blue-200 border text-blue-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{profileSection.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{profileSection.description}</div>
                    </div>
                    {completedSections.has(profileSection.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
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
            </div>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">Questions</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Responses are autosaved</span>
                    {isSaving ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
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
                      value={responses[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder || "Share your thoughts..."}
                      className="min-h-[100px] resize-none"
                      disabled={isSaving}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Save Status */}
            {isSaving && (
              <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 text-sm">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionForm;