import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { questionsData, type Question } from '@/data/questionsData';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/config';

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

const OnboardingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Get Introduction questions from questionsData
  const introQuestions = questionsData["Introduction"] || [];
  const formId = "introduction";

  // Load existing responses on component mount
  useEffect(() => {
    const loadResponses = async () => {
      if (!user?.uid) return;

      try {
        const response = await fetch(`${API_BASE_URL}/responses/${user.uid}/${formId}`);
        if (response.ok) {
          const data: FormResponse = await response.json();
          const responseMap: Record<string, string> = {};
          
          data.responses.forEach((answer) => {
            responseMap[answer.question_id] = answer.answer;
          });
          
          setResponses(responseMap);
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

  const saveResponses = async () => {
    if (!user?.uid) return;

    setIsSaving(true);
    
    try {
      const answersArray: Answer[] = introQuestions
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
        toast({
          title: "Success",
          description: "Your responses have been saved.",
        });
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
  };

  const handleNext = () => {
    if (currentQuestionIndex < introQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    await saveResponses();
    setIsCompleted(true);
    
    // Navigate to dashboard after a brief delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / introQuestions.length) * 100;
  };

  const getAnsweredCount = () => {
    return introQuestions.filter(q => responses[q.id.toString()]?.trim()).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Journey!</h1>
          <p className="text-gray-600">
            Your profile has been saved. You're now ready to explore personalized college recommendations and get guidance from our AI mentor.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = introQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {introQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {getAnsweredCount()} answered
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Let's Get to Know You
            </CardTitle>
            <p className="text-lg text-gray-600 mb-4">
              Help us understand your interests and goals
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalized recommendations await
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentQuestion.question}
                </h3>
                <p className="text-gray-600 mb-3">
                  Share your thoughts - there are no wrong answers!
                </p>
                {/* Contextual guidance based on question */}
                {currentQuestion.id === 1 && (
                  <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mx-auto max-w-md">
                    💡 Think about what excites you most in school or outside activities
                  </div>
                )}
                {currentQuestion.id === 2 && (
                  <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mx-auto max-w-md">
                    💡 Consider your dream job, lifestyle, or how you want to impact the world
                  </div>
                )}
                {currentQuestion.id === 3 && (
                  <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mx-auto max-w-md">
                    💡 Think about size, location, campus culture, or academic focus
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Textarea
                  value={responses[currentQuestion.id.toString()] || ''}
                  onChange={(e) => handleInputChange(currentQuestion.id.toString(), e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[120px] resize-none text-base"
                  disabled={isSaving}
                />
                
                <div className="text-sm text-gray-500">
                  Feel free to be as detailed or brief as you'd like. You can always come back and update your answers later.
                </div>
              </div>
            </div>
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between items-center px-8 pb-8">
            <Button 
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1} / {introQuestions.length}
            </div>

            {currentQuestionIndex === introQuestions.length - 1 ? (
              <Button 
                onClick={handleComplete}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary-dark hover:to-purple-600 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Complete</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
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
  );
};

export default OnboardingPage; 