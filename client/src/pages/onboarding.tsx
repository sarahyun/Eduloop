import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, BookOpen, Target, Heart, Zap, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertStudentProfileSchema } from "../../../shared/schema";
import { z } from "zod";

const profileSchema = insertStudentProfileSchema.extend({
  academicInterests: z.array(z.string()).optional(),
  careerGoals: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  extracurriculars: z.array(z.string()).optional(),
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
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userId: 1, // This would come from auth context
      academicInterests: [],
      careerGoals: [],
      values: [],
      extracurriculars: [],
      learningStyle: "",
      gpa: undefined,
      satScore: undefined,
      actScore: undefined,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => api.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: "Profile created successfully!" });
      // Redirect to dashboard or next step
    },
  });

  const academicInterests = [
    "Computer Science", "Engineering", "Business", "Medicine", "Law", "Psychology",
    "Biology", "Chemistry", "Physics", "Mathematics", "History", "English Literature",
    "Art", "Music", "Theater", "Environmental Science", "Economics", "Political Science",
    "Philosophy", "Sociology", "Anthropology", "International Relations"
  ];

  const careerGoals = [
    "Software Engineer", "Doctor", "Lawyer", "Teacher", "Entrepreneur", "Research Scientist",
    "Engineer", "Artist", "Writer", "Psychologist", "Business Executive", "Consultant",
    "Non-profit Leader", "Government Official", "Journalist", "Designer", "Architect",
    "Data Scientist", "Marketing Professional", "Finance Professional"
  ];

  const addCustomGoal = () => {
    if (customGoalInput.trim() && !customGoals.includes(customGoalInput.trim()) && customGoals.length + selectedGoals.length < 3) {
      setCustomGoals([...customGoals, customGoalInput.trim()]);
      setCustomGoalInput("");
    }
  };

  const removeCustomGoal = (goal: string) => {
    setCustomGoals(customGoals.filter(g => g !== goal));
  };

  const getAllSelectedGoals = () => [...selectedGoals, ...customGoals];

  const personalValues = [
    "Innovation", "Collaboration", "Leadership", "Social Impact", "Financial Success",
    "Work-Life Balance", "Creativity", "Intellectual Growth", "Community Service",
    "Diversity & Inclusion", "Sustainability", "Global Perspective", "Academic Excellence",
    "Personal Development", "Making a Difference", "Problem Solving"
  ];

  const extracurriculars = [
    "Student Government", "Debate Team", "Drama Club", "Music Band/Orchestra", "Sports Teams",
    "Volunteer Work", "Research Projects", "Internships", "Part-time Job", "Art Club",
    "Science Olympiad", "Model UN", "Robotics Club", "Environmental Club", "Writing/Journalism",
    "Gaming/Esports", "Photography", "Dance", "Martial Arts", "Coding Club"
  ];

  const learningStyles = [
    { value: "visual", label: "Visual - I learn best with charts, diagrams, and visual aids" },
    { value: "auditory", label: "Auditory - I learn best through listening and discussion" },
    { value: "kinesthetic", label: "Hands-on - I learn best by doing and experiencing" },
    { value: "reading", label: "Reading/Writing - I learn best through reading and writing" },
    { value: "mixed", label: "Mixed - I use different approaches depending on the subject" }
  ];

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void, max?: number) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else if (!max || (list === selectedGoals ? getAllSelectedGoals().length < max : list.length < max)) {
      setList([...list, item]);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const formValues = form.getValues();
    const formData = {
      userId: 1,
      academicInterests: selectedInterests,
      careerGoals: getAllSelectedGoals(),
      values: selectedValues,
      extracurriculars: selectedActivities,
      learningStyle: formValues.learningStyle || null,
      gpa: formValues.gpa || null,
      satScore: formValues.satScore || null,
      actScore: formValues.actScore || null,
    };
    createProfileMutation.mutate(formData);
  };

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to CollegeNavigate AI!",
      subtitle: "Let's create your personalized college discovery journey",
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to find your perfect college match?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We'll ask you a few friendly questions to understand who you are, what you love, 
              and what you're looking for in your college experience. This should take about 5 minutes.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What makes us different:</strong> We look beyond just test scores to understand 
              your complete story, interests, and aspirations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "academics",
      title: "What subjects spark your curiosity?",
      subtitle: "Select up to 5 academic areas that genuinely interest you",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Don't worry about being "practical" - choose what actually excites you to learn about!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedInterests.length}/5
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {academicInterests.map((interest) => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "secondary"}
                className={`cursor-pointer p-3 text-center transition-all hover:scale-105 ${
                  selectedInterests.includes(interest) 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${selectedInterests.length >= 5 && !selectedInterests.includes(interest) ? "opacity-50" : ""}`}
                onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests, 5)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "career",
      title: "What's your dream career direction?",
      subtitle: "Choose from common paths or add your own unique aspirations",
      icon: <Target className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Think about what kind of work would make you excited to get up in the morning.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {getAllSelectedGoals().length}/3
            </p>
          </div>

          {/* Custom Goal Input */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label htmlFor="customGoal" className="text-sm font-medium text-gray-700 mb-2 block">
              Add your own career goal:
            </Label>
            <div className="flex space-x-2">
              <Input
                id="customGoal"
                placeholder="e.g., Marine Biologist, Film Director, Social Worker..."
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
                className="flex-1"
                disabled={getAllSelectedGoals().length >= 3}
              />
              <Button 
                type="button"
                size="sm"
                onClick={addCustomGoal}
                disabled={!customGoalInput.trim() || getAllSelectedGoals().length >= 3}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Custom Goals Display */}
          {customGoals.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Your custom career goals:</Label>
              <div className="flex flex-wrap gap-2">
                {customGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="default"
                    className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm flex items-center space-x-1"
                  >
                    <span>{goal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeCustomGoal(goal)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Career Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Or choose from common career paths:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {careerGoals.map((goal) => (
                <Badge
                  key={goal}
                  variant={selectedGoals.includes(goal) ? "default" : "secondary"}
                  className={`cursor-pointer p-3 text-center transition-all hover:scale-105 ${
                    selectedGoals.includes(goal) 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${getAllSelectedGoals().length >= 3 && !selectedGoals.includes(goal) ? "opacity-50" : ""}`}
                  onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals, 3)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "values",
      title: "What matters most to you?",
      subtitle: "Choose up to 4 values that guide your decisions",
      icon: <Heart className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              These values will help us find colleges with cultures and communities that align with who you are.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedValues.length}/4
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {personalValues.map((value) => (
              <Badge
                key={value}
                variant={selectedValues.includes(value) ? "default" : "secondary"}
                className={`cursor-pointer p-3 text-center transition-all hover:scale-105 ${
                  selectedValues.includes(value) 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${selectedValues.length >= 4 && !selectedValues.includes(value) ? "opacity-50" : ""}`}
                onClick={() => toggleSelection(value, selectedValues, setSelectedValues, 4)}
              >
                {value}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "activities",
      title: "How do you spend your time outside class?",
      subtitle: "Select your current or interested extracurricular activities",
      icon: <Zap className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Include activities you're passionate about - they show who you are beyond academics.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {extracurriculars.map((activity) => (
              <Badge
                key={activity}
                variant={selectedActivities.includes(activity) ? "default" : "secondary"}
                className={`cursor-pointer p-3 text-center transition-all hover:scale-105 ${
                  selectedActivities.includes(activity) 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => toggleSelection(activity, selectedActivities, setSelectedActivities)}
              >
                {activity}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "learning",
      title: "How do you learn best?",
      subtitle: "Understanding your learning style helps us recommend the right college environments",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-4">
          {learningStyles.map((style) => (
            <div
              key={style.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                form.watch("learningStyle") === style.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => form.setValue("learningStyle", style.value)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  form.watch("learningStyle") === style.value
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                }`} />
                <span className="font-medium text-gray-900">{style.label}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "academics-scores",
      title: "Academic Information (Optional)",
      subtitle: "Help us provide better recommendations - you can always update this later",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              While test scores don't define you, they help us suggest realistic options. 
              Feel free to skip any you haven't taken yet.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="gpa" className="text-sm font-medium text-gray-700">
                Current GPA (optional)
              </Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                placeholder="3.8"
                className="mt-1"
                {...form.register("gpa", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500 mt-1">On a 4.0 scale</p>
            </div>
            <div>
              <Label htmlFor="satScore" className="text-sm font-medium text-gray-700">
                SAT Score (optional)
              </Label>
              <Input
                id="satScore"
                type="number"
                min="400"
                max="1600"
                placeholder="1450"
                className="mt-1"
                {...form.register("satScore", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500 mt-1">Out of 1600</p>
            </div>
            <div>
              <Label htmlFor="actScore" className="text-sm font-medium text-gray-700">
                ACT Score (optional)
              </Label>
              <Input
                id="actScore"
                type="number"
                min="1"
                max="36"
                placeholder="32"
                className="mt-1"
                {...form.register("actScore", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500 mt-1">Out of 36</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're all set!",
      subtitle: "Let's start discovering your perfect college matches",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      component: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your profile is ready!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Based on your responses, we'll provide personalized college recommendations, 
              connect you with your AI mentor, and help you explore schools that align with your goals.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>What's next:</strong> Explore your dashboard to see recommendations, 
              chat with your AI mentor, and start building your college list!
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
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

            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={createProfileMutation.isPending}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-dark hover:to-purple-600"
              >
                {createProfileMutation.isPending ? (
                  <span>Creating Profile...</span>
                ) : (
                  <>
                    <span>Start My Journey</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}