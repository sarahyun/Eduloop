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
  const [responses, setResponses] = useState({
    careerMajor: "",
    dreamSchools: "",
    freeTime: "",
    collegeExperience: "",
    extracurriculars: "",
  });
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
      academicInterests: responses.careerMajor ? [responses.careerMajor] : undefined,
      careerGoals: responses.careerMajor ? [responses.careerMajor] : undefined,
      values: responses.collegeExperience ? [responses.collegeExperience] : undefined,
      extracurriculars: responses.extracurriculars ? [responses.extracurriculars] : undefined,
      learningStyle: formValues.learningStyle || undefined,
      gpa: formValues.gpa || undefined,
      satScore: formValues.satScore || undefined,
      actScore: formValues.actScore || undefined,
    };
    createProfileMutation.mutate(formData);
  };

  const updateResponse = (key: string, value: string) => {
    setResponses(prev => ({ ...prev, [key]: value }));
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