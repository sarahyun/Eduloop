import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PROFILE_SECTIONS } from '@shared/questions';
import { useToast } from '@/hooks/use-toast';

export default function SectionForm() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get section from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section') || 'Academic Information';
  
  const [currentSection, setCurrentSection] = useState(sectionParam);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Get user profile data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile/1'],
  });

  // Populate answers from existing profile data
  useEffect(() => {
    if (profile && PROFILE_SECTIONS[currentSection as keyof typeof PROFILE_SECTIONS]) {
      const questions = PROFILE_SECTIONS[currentSection as keyof typeof PROFILE_SECTIONS];
      const initialAnswers: Record<string, string> = {};
      
      questions.forEach(question => {
        if (question.id !== 'additionalInfo') {
          initialAnswers[question.id] = profile[question.id] || '';
        }
      });
      
      setAnswers(initialAnswers);
    }
  }, [profile, currentSection]);

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const response = await fetch('/api/profile/1/answer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer })
      });
      if (!response.ok) throw new Error('Failed to save answer');
      return response.json();
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({
        title: "Answer saved",
        description: "Your response has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your answer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (answer.trim()) {
        saveAnswerMutation.mutate({ questionId, answer });
      }
    });
  };

  const questions = PROFILE_SECTIONS[currentSection as keyof typeof PROFILE_SECTIONS] || [];
  const regularQuestions = questions.filter(q => !q.question.includes('Additional information'));
  const additionalInfoQuestion = questions.find(q => q.question.includes('Additional information'));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile-builder')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSection}</h1>
          <p className="text-gray-600">
            Answer these questions to help us understand your profile better. Your responses are automatically saved.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(PROFILE_SECTIONS).map((section) => (
              <Button
                key={section}
                variant={section === currentSection ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(section)}
              >
                {section}
              </Button>
            ))}
          </div>
        </div>

        {/* Questions Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Questions</span>
              {hasChanges && (
                <Button 
                  onClick={handleSave}
                  disabled={saveAnswerMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveAnswerMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {regularQuestions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id} className="text-base font-medium">
                  {index + 1}. {question.question}
                </Label>
                <Textarea
                  id={question.id}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Share your thoughts here..."
                  className="min-h-[100px]"
                />
              </div>
            ))}

            {/* Additional Information Section */}
            {additionalInfoQuestion && (
              <div className="border-t pt-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor={additionalInfoQuestion.id} className="text-base font-medium">
                    {additionalInfoQuestion.question}
                  </Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Anything else you'd like to share about this topic? This section is updated automatically as you chat with our AI.
                  </p>
                  <Textarea
                    id={additionalInfoQuestion.id}
                    value={answers[additionalInfoQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(additionalInfoQuestion.id, e.target.value)}
                    placeholder="Additional insights will appear here from your conversations..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/dashboard')} size="lg">
            View My Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}