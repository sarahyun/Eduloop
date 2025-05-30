import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BookOpen, Target, Heart, Zap, GraduationCap, ArrowLeft, ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { SmartLoading } from "@/components/SmartLoadingStates";
import { InterestBubbles, StoryPrompt, ProgressMilestone, PersonalityInsight } from "@/components/InteractiveElements";
import { insertStudentProfileSchema } from "../../../shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

// Simple debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const profileSchema = insertStudentProfileSchema.extend({
  learningStyle: z.string().optional(),
  gpa: z.number().optional(),
  satScore: z.number().optional(),
  actScore: z.number().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    careerMajor: "",
    dreamSchools: "",
    freeTime: "",
    collegeExperience: "",
    extracurriculars: "",
  });
  const [dynamicSteps, setDynamicSteps] = useState<OnboardingStep[]>([]);
  const [followUpResponses, setFollowUpResponses] = useState<{[key: string]: string}>({});
  const [isGeneratingNextStep, setIsGeneratingNextStep] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userId: 1,
      learningStyle: undefined,
      gpa: undefined,
      satScore: undefined,
      actScore: undefined,
    },
  });

  // Load existing profile data to pre-populate form
  const { data: existingProfile } = useQuery({
    queryKey: ['/api/profile', 1],
    queryFn: async () => {
      const response = await fetch('/api/profile/1');
      if (!response.ok) return null;
      return response.json();
    }
  });

  // Update responses when profile data loads
  useEffect(() => {
    if (existingProfile) {
      console.log('Loading existing profile:', existingProfile);
      setResponses({
        careerMajor: existingProfile.careerMajor || "",
        dreamSchools: existingProfile.dreamSchools || "",
        freeTime: existingProfile.freeTimeActivities || "",
        collegeExperience: existingProfile.collegeExperience || "",
        extracurriculars: existingProfile.extracurricularsAdditionalInfo || "",
      });
      
      // Update form values too
      form.reset({
        userId: 1,
        learningStyle: existingProfile.learningStyle,
        gpa: existingProfile.gpa || undefined,
        satScore: existingProfile.satScore || undefined,
        actScore: existingProfile.actScore || undefined,
      });
    }
  }, [existingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // First, try to update existing profile
      try {
        const response = await fetch(`/api/profile/${data.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          return response.json();
        }
        // If update fails, try creating new profile
        return api.createProfile(data);
      } catch (error) {
        // If update fails, try creating new profile
        return api.createProfile(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const learningStyles = [
    { value: "visual", label: "Visual - I learn best with charts, diagrams, and visual aids" },
    { value: "auditory", label: "Auditory - I learn best through listening and discussion" },
    { value: "kinesthetic", label: "Hands-on - I learn best by doing and experiencing" },
    { value: "reading", label: "Reading/Writing - I learn best through reading and writing" },
    { value: "mixed", label: "Mixed - I use different approaches depending on the subject" }
  ];

  const getProgressPercentage = () => {
    const allSteps = [...baseSteps, ...dynamicSteps];
    return ((currentStep + 1) / allSteps.length) * 100;
  };

  const handleNext = () => {
    const allSteps = [...baseSteps, ...dynamicSteps];
    
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateFollowUpStep = async (stepId: string, response: string) => {
    if (!response.trim() || response.length < 20) return;
    

    setIsGeneratingNextStep(true);
    try {
      const result = await fetch('/api/generate-followup-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stepId, 
          response,
          previousResponses: responses
        })
      });
      

      if (result.ok) {
        const data = await result.json();
        const { questions } = data;
        if (questions && questions.length > 0) {
          // Create a new step with the first follow-up question
          const followUpStep: OnboardingStep = {
            id: `${stepId}_followup`,
            title: questions[0],
            subtitle: "This helps us understand you better for personalized recommendations",
            icon: <MessageCircle className="w-8 h-8 text-primary" />,
            component: (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Based on what you shared, we'd love to learn more about this aspect of your interests.
                  </p>
                </div>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={followUpResponses[`${stepId}_followup`] || ''}
                    onChange={(e) => setFollowUpResponses(prev => ({ ...prev, [`${stepId}_followup`]: e.target.value }))}
                    className="min-h-32 text-base"
                  />
                </div>
              </div>
            )
          };
          
          // Insert the follow-up step after the current step
          setDynamicSteps(prev => {
            const newSteps = [...prev];
            newSteps.push(followUpStep); // Add to end of dynamic steps
            console.log('Added follow-up step:', followUpStep.title);
            console.log('Dynamic steps now:', newSteps.length);
            return newSteps;
          });
          
          // Advance to the follow-up step
          setTimeout(() => {
            console.log('Advancing to next step, current:', currentStep);
            setCurrentStep(currentStep + 1);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error generating follow-up question:', error);
    } finally {
      setIsGeneratingNextStep(false);
    }
  };

  const handleSubmit = () => {
    const formValues = form.getValues();
    
    // Combine main responses with follow-up responses
    const allResponses = Object.keys(responses).map(key => {
      let mainResponse = responses[key as keyof typeof responses];
      const followUpAnswer = followUpResponses[`${key}_followup`];
      if (followUpAnswer) {
        mainResponse += '\n\nAdditional details:\n' + followUpAnswer;
      }
      return mainResponse;
    }).filter(Boolean);

    const formData = {
      userId: 1,
      careerMajor: responses.careerMajor || null,
      dreamSchools: responses.dreamSchools || null,
      freeTimeActivities: responses.freeTime || null,
      collegeExperience: responses.collegeExperience || null,
      extracurricularsAdditionalInfo: responses.extracurriculars || null,
      gpa: formValues.gpa || null,
      satScore: formValues.satScore || null,
      actScore: formValues.actScore || null,
    };
    console.log('Onboarding submitting data:', { responses, formValues, formData });
    createProfileMutation.mutate(formData);
  };

  // Question definitions for onboarding
  const onboardingQuestions = {
    careerMajor: "What do you want to study or what career interests you?",
    dreamSchools: "What are some schools you're excited about?", 
    freeTime: "What do you like to do outside of school?",
    collegeExperience: "What are you looking for in your college experience? Any worries about the process?",
    extracurriculars: "Tell us about your extracurricular activities and involvement."
  };

  // Autosave state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Autosave mutation using question response model
  const autosaveMutation = useMutation({
    mutationFn: async (allResponses: { [key: string]: string }) => {
      setIsSaving(true);
      const responsePayload = {
        response_id: `1-onboarding`,
        user_id: 1,
        form_id: "onboarding",
        submitted_at: new Date().toISOString(),
        responses: Object.entries(allResponses)
          .filter(([key, value]) => value && value.trim() !== '')
          .map(([questionId, answer]) => ({
            question_id: questionId,
            question_text: onboardingQuestions[questionId as keyof typeof onboardingQuestions] || '',
            answer: answer
          }))
      };

      const response = await fetch('/api/question-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload)
      });
      if (!response.ok) throw new Error('Failed to autosave responses');
      return response.json();
    },
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
    },
    onError: () => {
      setIsSaving(false);
    }
  });

  // Debounced autosave to prevent too many API calls
  const debouncedAutosave = useCallback(
    debounce((allResponses: { [key: string]: string }) => {
      autosaveMutation.mutate(allResponses);
    }, 1000),
    []
  );

  const updateResponse = (key: string, value: string) => {
    console.log('Updating response:', key, '=', value);
    setResponses(prev => {
      const updated = { ...prev, [key]: value };
      console.log('Updated responses state:', updated);
      
      // Pass all responses to autosave, not just the changed field
      debouncedAutosave(updated);
      
      return updated;
    });
  };

  const updateFollowUpResponse = (key: string, value: string) => {
    setFollowUpResponses(prev => ({ ...prev, [key]: value }));
  };

  const baseSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Your College Journey!",
      subtitle: "Let's get to know you better through a friendly conversation",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      component: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
            <p className="text-lg text-gray-700 leading-relaxed">
              We're here to help you discover colleges that truly fit who you are and what you want to achieve. 
              This isn't about having the "right" answers - it's about getting to know the real you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="font-medium">Honest & Open</div>
              <div className="text-gray-600">Share what genuinely interests you</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-medium">No Pressure</div>
              <div className="text-gray-600">It's okay not to have everything figured out</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="font-medium">Your Voice</div>
              <div className="text-gray-600">Tell us in your own words</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "career",
      title: "Do you have a career or major in mind?",
      subtitle: "No worries if not - this helps us understand your direction",
      icon: <Target className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Think about what kind of work interests you, or what you might want to study. It's totally fine if you're unsure!
            </p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="careerMajor" className="text-base font-medium text-gray-900">
              Tell us about any career ideas or majors you're considering:
            </Label>
            <Textarea
              id="careerMajor"
              placeholder="I'm thinking about medicine because I love helping people, or maybe computer science since I enjoy coding... or honestly, I have no idea yet and that's okay!"
              value={responses.careerMajor}
              onChange={(e) => updateResponse('careerMajor', e.target.value)}
              className="min-h-32 text-base"
            />
            <p className="text-sm text-gray-500">
              Feel free to mention multiple interests, uncertainty, or anything that comes to mind.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "dreamSchools",
      title: "Got any dream schools in mind?",
      subtitle: "If so, what draws you to these schools?",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Maybe you've heard about certain colleges or visited some campuses. What appeals to you about them?
            </p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="dreamSchools" className="text-base font-medium text-gray-900">
              Tell us about any schools that interest you and why:
            </Label>
            <Textarea
              id="dreamSchools"
              placeholder="I love Stanford because of their innovation culture and Silicon Valley connections. NYU appeals to me for the city experience and their strong business program. Or maybe I haven't really thought about specific schools yet..."
              value={responses.dreamSchools}
              onChange={(e) => updateResponse('dreamSchools', e.target.value)}
              className="min-h-32 text-base"
            />
            <p className="text-sm text-gray-500">
              Share what you know or admit if you're still exploring - both are perfectly fine!
            </p>
          </div>
        </div>
      )
    },
    {
      id: "freeTime",
      title: "How do you spend your free time?",
      subtitle: "Aside from hanging out with friends, what do you enjoy doing?",
      icon: <Zap className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Tell us about your hobbies, interests, or activities that you genuinely enjoy outside of school.
            </p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="freeTime" className="text-base font-medium text-gray-900">
              What do you like to do outside of school?
            </Label>
            <Textarea
              id="freeTime"
              placeholder="I love playing guitar and writing music. I'm really into photography and often go on nature walks to take pictures. I volunteer at the animal shelter on weekends. I spend way too much time playing video games but I love the strategy aspect..."
              value={responses.freeTime}
              onChange={(e) => updateResponse('freeTime', e.target.value)}
              className="min-h-32 text-base"
            />
            <p className="text-sm text-gray-500">
              Include anything from hobbies to volunteer work to things you do just for fun.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "collegeExperience",
      title: "What are you looking for in college?",
      subtitle: "What excites you? What worries you about this process?",
      icon: <Heart className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Help us understand what kind of college experience you're hoping for and any concerns you might have.
            </p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="collegeExperience" className="text-base font-medium text-gray-900">
              What are you looking for in your college experience? Any worries about the process?
            </Label>
            <Textarea
              id="collegeExperience"
              placeholder="I want a place where I can explore different subjects before declaring a major. I'm excited about meeting people from diverse backgrounds. I'm worried about the cost and whether I'll get into a good school. I want strong research opportunities but also a fun social scene..."
              value={responses.collegeExperience}
              onChange={(e) => updateResponse('collegeExperience', e.target.value)}
              className="min-h-32 text-base"
            />
            <p className="text-sm text-gray-500">
              Be honest about both your hopes and concerns - this helps us provide better guidance.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "extracurriculars",
      title: "Tell us about your activities",
      subtitle: "Share your extracurriculars, achievements, or experiences",
      icon: <Zap className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              If you have a resume or list of activities, feel free to paste it here. Or just tell us about what you've been involved in.
            </p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="extracurriculars" className="text-base font-medium text-gray-900">
              List your extracurriculars, achievements, work experience, or other activities:
            </Label>
            <Textarea
              id="extracurriculars"
              placeholder="Student Council - President (Junior & Senior year)
Varsity Soccer - Captain, led team to regional championships
Part-time job at local bookstore (15 hrs/week)
Volunteer tutor for elementary students (2 years)
National Honor Society member
Started a coding club at school..."
              value={responses.extracurriculars}
              onChange={(e) => updateResponse('extracurriculars', e.target.value)}
              className="min-h-40 text-base font-mono"
            />
            <p className="text-sm text-gray-500">
              Include leadership roles, awards, jobs, volunteer work, or anything meaningful to you.
            </p>
          </div>
        </div>
      )
    },

    {
      id: "academics",
      title: "Academic Background",
      subtitle: "Help us understand your academic performance (all optional)",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      component: (
        <Form {...form}>
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                These details help us suggest colleges that match your academic level. All fields are optional.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPA (if known)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        placeholder="3.5"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="satScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SAT Score (if taken)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min="400"
                        max="1600"
                        placeholder="1350"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ACT Score (if taken)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        placeholder="28"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      )
    }
  ];

  const allSteps = [...baseSteps, ...dynamicSteps];
  const currentStepData = allSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {allSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getProgressPercentage())}% complete
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-lg text-gray-600">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {currentStepData.component}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between items-center px-8 pb-8">
            <Button 
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === allSteps.length - 1 ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">Profile Complete!</span>
                </div>
                <p className="text-gray-600">Your responses have been automatically saved. You can now explore your dashboard.</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary-dark hover:to-purple-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={isGeneratingNextStep}
                className="flex items-center space-x-2"
              >
                {isGeneratingNextStep ? (
                  <SmartLoading type="followup" isLoading={true} />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}