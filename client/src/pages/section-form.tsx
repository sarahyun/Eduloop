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
      const initialAnswers: Record<string, string> = {};
      const profileData = profile as any;
      
      // Map profile fields to question IDs for each section
      if (currentSection === 'Academic Information') {
        initialAnswers['1'] = profileData.favoriteClasses || '';
        initialAnswers['2'] = profileData.strugglingSubjects || '';
        initialAnswers['3'] = profileData.academicFascinations || '';
      } else if (currentSection === 'Extracurriculars and Interests') {
        initialAnswers['1'] = profileData.proudOfOutsideAcademics || '';
        initialAnswers['2'] = profileData.fieldsToExplore || '';
        initialAnswers['3'] = profileData.freeTimeActivities || '';
      } else if (currentSection === 'Personal Reflections') {
        initialAnswers['1'] = profileData.whatMakesHappy || '';
        initialAnswers['2'] = profileData.challengeOvercome || '';
        initialAnswers['3'] = profileData.rememberedFor || '';
        initialAnswers['4'] = profileData.importantLesson || '';
      } else if (currentSection === 'College Preferences') {
        initialAnswers['1'] = profileData.collegeExperience || '';
        initialAnswers['2'] = profileData.schoolSize || '';
        initialAnswers['3'] = profileData.locationExperiences || '';
        initialAnswers['4'] = profileData.parentsExpectations || '';
        initialAnswers['5'] = profileData.communityEnvironment || '';
      }
      
      setAnswers(initialAnswers);
    }
  }, [profile, currentSection]);

  // Save section mutation
  const saveSectionMutation = useMutation({
    mutationFn: async (sectionAnswers: Record<string, string>) => {
      // Map question IDs back to profile field names
      const profileUpdates: Record<string, string> = {};
      
      if (currentSection === 'Academic Information') {
        if (sectionAnswers['1']) profileUpdates.favoriteClasses = sectionAnswers['1'];
        if (sectionAnswers['2']) profileUpdates.strugglingSubjects = sectionAnswers['2'];
        if (sectionAnswers['3']) profileUpdates.academicFascinations = sectionAnswers['3'];
      } else if (currentSection === 'Extracurriculars and Interests') {
        if (sectionAnswers['1']) profileUpdates.proudOfOutsideAcademics = sectionAnswers['1'];
        if (sectionAnswers['2']) profileUpdates.fieldsToExplore = sectionAnswers['2'];
        if (sectionAnswers['3']) profileUpdates.freeTimeActivities = sectionAnswers['3'];
      } else if (currentSection === 'Personal Reflections') {
        if (sectionAnswers['1']) profileUpdates.whatMakesHappy = sectionAnswers['1'];
        if (sectionAnswers['2']) profileUpdates.challengeOvercome = sectionAnswers['2'];
        if (sectionAnswers['3']) profileUpdates.rememberedFor = sectionAnswers['3'];
        if (sectionAnswers['4']) profileUpdates.importantLesson = sectionAnswers['4'];
      } else if (currentSection === 'College Preferences') {
        if (sectionAnswers['1']) profileUpdates.collegeExperience = sectionAnswers['1'];
        if (sectionAnswers['2']) profileUpdates.schoolSize = sectionAnswers['2'];
        if (sectionAnswers['3']) profileUpdates.locationExperiences = sectionAnswers['3'];
        if (sectionAnswers['4']) profileUpdates.parentsExpectations = sectionAnswers['4'];
        if (sectionAnswers['5']) profileUpdates.communityEnvironment = sectionAnswers['5'];
      }

      const response = await fetch('/api/profile/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          ...profileUpdates
        })
      });
      if (!response.ok) throw new Error('Failed to save answers');
      return response.json();
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({
        title: "Section saved",
        description: "Your answers have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSectionMutation.mutate(answers);
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
                  disabled={saveSectionMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveSectionMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {regularQuestions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={String(question.id)} className="text-base font-medium">
                  {index + 1}. {question.question}
                </Label>
                <Textarea
                  id={String(question.id)}
                  value={answers[String(question.id)] || ''}
                  onChange={(e) => handleAnswerChange(String(question.id), e.target.value)}
                  placeholder="Share your thoughts here..."
                  className="min-h-[100px]"
                />
              </div>
            ))}


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