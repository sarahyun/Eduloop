import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Brain,
  Shield,
  MessageCircle,
  ChevronRight,
  Zap,
  UserCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Form validation schemas
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

function LandingPage() {
  const [activeTab, setActiveTab] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signup, login, user, loading } = useAuth();
  const { toast } = useToast();

  // Redirect authenticated users to dashboard (unless they just signed up)
  useEffect(() => {
    if (user && !loading && !isLoading) {
      // Allow a brief moment for signup redirect to onboarding to take effect
      const timer = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, isLoading]);

  // Form setup
  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const studentQuotes = [
    "I'm overwhelmed by choices and don't know where to start",
    "I feel like just a number, not a person",
    "I want to find my people, but how do I know where I'll fit in?",
    "What if I miss out on opportunities I don't even know exist?",
  ];

  useEffect(() => {
    const currentQuote = studentQuotes[typingIndex];
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < currentQuote.length) {
        setCurrentText(currentQuote.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeChar, 50 + Math.random() * 50); // Variable typing speed
      } else {
        setIsTyping(false);
        setTimeout(() => {
          setIsTyping(true);
          setCurrentText("");
          setTypingIndex((prev) => (prev + 1) % studentQuotes.length);
        }, 2000); // Pause before next quote
      }
    };

    const timeout = setTimeout(typeChar, 500);
    return () => clearTimeout(timeout);
  }, [typingIndex]);

  const handleSignUp = () => {
    setActiveTab("signup");
  };

  const handleSignIn = () => {
    setActiveTab("signin");
  };

  // Form submission handlers
  const onSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      window.location.href = "/dashboard";
    } catch (error) {
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.fullName);
      toast({
        title: "Account created!",
        description: "Welcome to CollegeNavigate. Let's get started!",
      });
      window.location.href = "/onboarding";
    } catch (error) {
      toast({
        title: "Account creation failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">
                  CollegeNavigate
                </span>
                <div className="text-xs text-gray-500">AI-Powered Guidance</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 px-4"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                onClick={handleSignUp}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Crush College Admissions
                  </span>
                  <span className="block text-gray-900">
                    —With Guidance That Gets You
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  AI-powered support to help you find your fit, tell your story,
                  and get noticed—even in the toughest year yet.
                </p>
              </div>

              {/* What Makes This Different */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <Brain className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Someone Who Gets You
                    </div>
                    <div className="text-sm text-gray-600">
                      Our AI and real counselors learn what matters to you—how
                      you think, what motivates you, what sets you apart.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <MessageCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Support When You Need It
                    </div>
                    <div className="text-sm text-gray-600">
                      Late-night essay stress and overwhelm? Decision anxiety?
                      We're here with practical advice.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                    <Target className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Your Competitive Edge
                    </div>
                    <div className="text-sm text-gray-600">
                      No more generic essays. Get a personalized strategy for
                      each school, so you stand out.
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={handleSignUp}
                >
                  Find My College Match
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Right Column - AI Counselor Demo */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      AI Counselor in Action
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                      <div className="text-sm text-purple-700 mb-1">
                        Student says:
                      </div>
                      <div className="font-medium text-purple-900">
                        "I honestly have no idea what I want to major in.
                        Everyone keeps asking and I just freeze. I like math,
                        but I also want to travel. My parents think I should do
                        business or engineering, but that doesn't really feel
                        right."
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 font-medium">
                      AI Counselor responds:
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="text-sm text-blue-900 space-y-2">
                        <p className="font-medium">
                          "That's more common than you think. Most students
                          change majors anyway. Let's look at what excites you,
                          not just what's expected. Since you mentioned math and
                          travel, here are a few paths you might want to check
                          out..."
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          school: "Middlebury College",
                          program: "International Economics",
                          insight: "study abroad, quantitative focus",
                        },
                        {
                          school: "Colorado College",
                          program: "Environmental Science",
                          insight: "field research, data analysis",
                        },
                        {
                          school: "Northeastern",
                          program: "Business + Co-op",
                          insight: "real work experience in different cities",
                        },
                      ].map((match, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {match.school}
                              </div>
                              <div className="text-sm text-blue-600">
                                {match.program}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Worth exploring
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {match.insight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={handleSignUp}
                  >
                    Start Counseling Session
                  </Button>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What Students Feel Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,197,253,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,181,253,0.1),transparent_50%)]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students Feel
            </h2>
            <p className="text-xl text-gray-600">
              The real thoughts behind the stress
            </p>
          </div>

          {/* Interactive typing display */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Message bubble */}
                <div className="flex-1 relative">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <div className="min-h-[60px] flex items-center">
                      <p className="text-2xl text-gray-800 font-medium leading-relaxed">
                        "{currentText}
                        {isTyping && (
                          <span className="inline-block w-0.5 h-6 bg-purple-500 ml-1 animate-pulse"></span>
                        )}
                        "
                      </p>
                    </div>
                  </div>

                  {/* Chat bubble tail */}
                  <div className="absolute left-0 top-6 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-blue-50 transform -translate-x-3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Static display of all quotes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentQuotes.map((quote, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  typingIndex === index
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg transform scale-105"
                    : "bg-white/60 border-gray-200 hover:bg-white/80"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 transition-colors ${
                      typingIndex === index ? "bg-purple-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 bg-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_80%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.05),transparent_80%)]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why College Admissions Are Harder Than Ever
            </h2>
            <p className="text-xl text-gray-300">The data tells the story</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2">
                    8.5M+
                  </div>
                  <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                    Record Competition
                  </div>
                </div>
                <p className="text-gray-300 font-medium leading-relaxed">
                  8.5 million+ applications were submitted last year—a 6% jump.
                  <span className="block mt-2 text-blue-400 font-semibold">
                    Acceptance rates at top schools have dropped below 5%.
                  </span>
                </p>
              </div>
            </div>

            <div className="text-center relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    Beyond
                  </div>
                  <div className="text-2xl font-black text-white">Grades</div>
                  <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                    Authenticity Matters
                  </div>
                </div>
                <p className="text-gray-300 font-medium leading-relaxed">
                  It's not just about grades anymore.
                  <span className="block mt-2 text-purple-400 font-semibold">
                    Colleges want authentic stories, unique perspectives, and
                    cultural fit.
                  </span>
                </p>
              </div>
            </div>

            <div className="text-center relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2">76%</div>
                  <div className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                    High Stakes Stress
                  </div>
                </div>
                <p className="text-gray-300 font-medium leading-relaxed">
                  76% of students say college applications are the most
                  stressful process they've ever faced.
                  <span className="block mt-2 text-red-400 font-semibold">
                    One small mistake can feel like it could derail everything.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Transition Statement */}
          <div className="text-center mt-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
              <p className="text-xl text-gray-200 font-medium">
                The pressure is real. But you don't have to face it alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Transition */}
      <div className="h-16 bg-gradient-to-b from-slate-800 to-gray-50"></div>

      {/* What EduLoop Delivers Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You'll Get with CollegeNavigate
            </h2>
            <p className="text-xl text-gray-600">
              Real support that actually helps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Support When You Need It - First for emotional appeal */}
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl border border-emerald-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Support When You Need It
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      Stuck on an essay or feeling overwhelmed? Get real advice,
                      anytime you need it—no generic tips.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Real answers
                  </span>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-md">
                    24/7 help
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence & Clarity */}
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl border border-violet-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Confidence & Clarity
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      Move forward with confidence—knowing your applications
                      reflect your best self and your future is on track.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-violet-500 text-white rounded-full text-sm font-semibold shadow-md">
                    No second-guessing
                  </span>
                  <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Feel ready
                  </span>
                </div>
              </div>
            </div>

            {/* Someone Who Gets You */}
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl border border-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Someone Who Gets You
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      Our AI and counselors get to know your personality,
                      interests, and goals—so your guidance is truly personal.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Learns your style
                  </span>
                  <span className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Personal guidance
                  </span>
                </div>
              </div>
            </div>

            {/* Your Competitive Edge */}
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl border border-orange-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Your Competitive Edge
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      Get tailored strategies and insights for every
                      application—so you stand out with what makes you unique.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold shadow-md">
                    School-specific strategy
                  </span>
                  <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Stand out
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Step-by-step support for your college journey
            </p>
          </div>

          {/* Vertical Timeline for Mobile, Staggered Horizontal for Desktop */}
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
              {[
                {
                  step: "1",
                  title: "Build Your Profile",
                  description:
                    "Share your interests, values, and goals—beyond grades.",
                  quote: "I discovered colleges that actually fit me.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ),
                  color: "slate",
                  index: 0,
                },
                {
                  step: "2",
                  title: "Get Matched",
                  description:
                    "See schools that align with your strengths and what matters to you.",
                  quote: "The advice was practical and easy to act on.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ),
                  color: "blue",
                  index: 1,
                },
                {
                  step: "3",
                  title: "AI Mentor Chat",
                  description:
                    "Ask questions, get advice, and brainstorm essays—on your schedule.",
                  quote:
                    "Having support whenever I needed it was a game-changer.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  ),
                  color: "emerald",
                  index: 2,
                },
                {
                  step: "4",
                  title: "Stand Out in Applications",
                  description:
                    "Get tailored, school-specific tips to help your application reflect who you are.",
                  quote: "My application actually showed who I am.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  ),
                  color: "orange",
                  index: 3,
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className={`relative group ${index % 2 === 1 ? "lg:mt-12" : ""}`}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Mobile timeline line */}
                  {index < 3 && (
                    <div className="lg:hidden absolute left-6 top-20 w-0.5 h-8 bg-gray-200"></div>
                  )}

                  {/* Desktop timeline connector */}
                  <div
                    className={`hidden lg:block absolute top-20 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 left-1/2 transform -translate-x-1/2 transition-colors duration-300 ${
                      hoveredStep === index
                        ? index === 0
                          ? "bg-slate-500"
                          : index === 1
                            ? "bg-blue-500"
                            : index === 2
                              ? "bg-emerald-500"
                              : "bg-orange-500"
                        : "bg-gray-300"
                    }`}
                  ></div>

                  <div
                    className={`bg-white rounded-xl border border-gray-200 p-8 shadow-sm transition-all duration-300 ${
                      hoveredStep === index
                        ? "shadow-lg -translate-y-1 border-gray-300"
                        : "hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start space-x-4 lg:flex-col lg:space-x-0 lg:text-center">
                      {/* Step number and icon */}
                      <div className="flex-shrink-0 lg:mx-auto lg:mb-6">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            hoveredStep === index
                              ? index === 0
                                ? "bg-slate-500 text-white"
                                : index === 1
                                  ? "bg-blue-500 text-white"
                                  : index === 2
                                    ? "bg-emerald-500 text-white"
                                    : "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {step.icon}
                        </div>
                      </div>

                      <div className="flex-1 lg:text-center">
                        <div
                          className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                            hoveredStep === index
                              ? index === 0
                                ? "text-slate-600"
                                : index === 1
                                  ? "text-blue-600"
                                  : index === 2
                                    ? "text-emerald-600"
                                    : "text-orange-600"
                              : "text-gray-500"
                          }`}
                        >
                          Step {step.step}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Student quote on hover */}
                        <div
                          className={`transition-all duration-500 overflow-hidden ${
                            hoveredStep === index
                              ? "max-h-20 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                              "{step.quote}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet confidence statement */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-700 font-medium">
              You know yourself best. We help colleges see that, too.
            </p>
          </div>
        </div>
      </section>

      {/* Two Powerful Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-zinc-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.08),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.08),transparent_60%)]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two Powerful Advantages
            </h2>
            <p className="text-xl text-gray-600">
              Find where you belong + get accepted there
            </p>
          </div>

          {/* Journey Flow Navigation */}
          <div className="flex justify-center mb-16">
            <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-lg flex items-center">
              <button
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${
                  hoveredBenefit !== 1
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "text-purple-600 hover:bg-purple-50"
                }`}
                onClick={() => setHoveredBenefit(0)}
                onMouseEnter={() => setHoveredBenefit(0)}
              >
                <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Find Your Fit</span>
              </button>

              {/* Arrow connector */}
              <div className="px-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>

              <button
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${
                  hoveredBenefit === 1
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                onClick={() => setHoveredBenefit(1)}
                onMouseEnter={() => setHoveredBenefit(1)}
              >
                <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Get Accepted</span>
              </button>
            </div>
          </div>

          {/* Sequential Flow Content */}
          <div className="space-y-8">
            {/* Step 1: Find Your Fit */}
            <div
              className={`transition-all duration-500 ${
                hoveredBenefit === 1
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="text-center lg:text-left lg:w-1/3">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-xl">
                      <Target className="w-16 h-16 text-white" />
                    </div>
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </span>
                      <h3 className="text-4xl font-bold text-gray-900">
                        Find Your Fit
                      </h3>
                    </div>
                    <p className="text-xl text-purple-600 font-medium">
                      Find your place, your people, your path
                    </p>
                  </div>

                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        ),
                        title: "Colleges that just feel right",
                        description:
                          "Find schools that vibe with your style, not just your stats",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        ),
                        title: "Programs that fit your interests",
                        description:
                          "Explore majors and paths you'll actually want to pursue",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        ),
                        title: "Communities you click with",
                        description:
                          "See where you'll find your people, not just a place to study",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        ),
                        title: "See real financial options",
                        description:
                          "Find scholarships and aid that actually fit your story",
                      },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              {benefit.title}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Flow Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-px h-6 bg-gradient-to-b from-purple-300 to-emerald-300"></div>
                <div className="bg-white rounded-full p-3 border border-gray-200 shadow-lg">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-emerald-300 to-emerald-500"></div>
              </div>
            </div>

            {/* Step 2: Get Accepted */}
            <div
              className={`transition-all duration-500 ${
                hoveredBenefit === 0
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="text-center lg:text-left lg:w-1/3">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-xl">
                      <CheckCircle className="w-16 h-16 text-white" />
                    </div>
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <span className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </span>
                      <h3 className="text-4xl font-bold text-gray-900">
                        Get Accepted
                      </h3>
                    </div>
                    <p className="text-xl text-emerald-600 font-medium">
                      Make your application feel real—and get noticed
                    </p>
                  </div>

                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ),
                        title: "Show colleges who you really are",
                        description:
                          "Share what matters to you, not just what's on your resume",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ),
                        title: "Tips tailored to each school",
                        description:
                          "Every college is different. We help you speak their language",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        ),
                        title: "Apply where you'll thrive",
                        description:
                          "Focus on places where you're more than a number",
                      },
                      {
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        ),
                        title: "See real financial options",
                        description:
                          "Find scholarships and aid that actually fit your story",
                      },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              {benefit.title}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section with Visual Separation */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-stone-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.05),transparent_60%)]"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
              <svg
                className="w-12 h-12 text-purple-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
              </svg>
            </div>
          </div>

          <blockquote className="text-center">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic mb-6">
              "When you apply to schools that truly fit you, your applications
              become authentic and compelling—not generic. That's what gets you
              noticed—and gets you in."
            </p>
            <div className="flex justify-center mt-8">
              <div className="text-lg font-semibold text-gray-800">
                The CollegeNavigate Difference
              </div>
            </div>
          </blockquote>

          {/* Subtle separator */}
          <div className="flex justify-center mt-12">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Final CTA Section with Modern Design */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-green-200/30 rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 md:p-16">
            <div className="text-center space-y-8">
              {/* Icon and headline */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Get guidance that understands you—and a strategy that gets
                    you in.
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Find where you belong—and get accepted there.
                  </p>
                </div>
              </div>

              {/* Action button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg font-semibold"
                  onClick={handleSignUp}
                >
                  <span>Find My College Match</span>
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {(activeTab === "signin" || activeTab === "signup") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("")}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                {activeTab === "signin"
                  ? "Welcome back to your college journey"
                  : "Start your personalized college discovery journey"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "signin" ? (
                <form
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signInForm.register("email")}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      {...signInForm.register("password")}
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <p className="text-sm text-center text-gray-600 mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                      onClick={() => setActiveTab("signup")}
                    >
                      Create one here
                    </button>
                  </p>
                </form>
              ) : (
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUp)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      {...signUpForm.register("fullName")}
                    />
                    {signUpForm.formState.errors.fullName && (
                      <p className="text-sm text-red-600">
                        {signUpForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signUpForm.register("email")}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      {...signUpForm.register("password")}
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      {...signUpForm.register("confirmPassword")}
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <p className="text-sm text-center text-gray-600 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                      onClick={() => setActiveTab("signin")}
                    >
                      Sign in here
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
