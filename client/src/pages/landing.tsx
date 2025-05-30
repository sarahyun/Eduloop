import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, BookOpen, Target, ArrowRight, Star, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

export default function LandingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("");

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      confirmPassword: ""
    }
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign up');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to your college discovery journey.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSignUp = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  const onSignIn = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CollegeNavigate</span>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setActiveTab("signin")}
              >
                Log in
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="bg-cover bg-center bg-gray-900 text-white min-h-[500px] flex items-end rounded-3xl mx-4 mt-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="p-8 max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Get the college application insights you need.
            </h1>
            <p className="text-xl mb-6 text-gray-100">
              Get started with our free college matching tool. We'll help you find best-fit schools, based on your unique profile. We'll give personalized insights to help you stand out.
            </p>
            <div className="flex items-center bg-white rounded-lg p-2 max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-0 flex-1"
                value={signUpForm.watch("email")}
                onChange={(e) => signUpForm.setValue("email", e.target.value)}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white ml-2"
                onClick={() => setActiveTab("signup")}
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How we help you succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Applying to college is more competitive, expensive, and stressful than ever. 
            Gain a competitive edge with actionable insights and personalized guidance for a standout application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Self-Reflection Guidance',
              description: 'Engage with guided questionnaires that help you uncover personal strengths, passions, and areas for growth, informing your college and career path.',
              icon: <Users className="w-6 h-6" />
            },
            {
              title: 'School Recommendations',
              description: 'Receive tailored school suggestions that match your interests, goals, and values, streamlining your search process.',
              icon: <Target className="w-6 h-6" />
            },
            {
              title: 'Find Your Unique Angle',
              description: 'Access strategic advice on identifying the approach to showcase your unique profile effectively.',
              icon: <BookOpen className="w-6 h-6" />
            },
            {
              title: 'Interests Mapping',
              description: 'Explore potential majors, extracurriculars, and resources that align with your interests and career aspirations, helping you explore your interests deeply.',
              icon: <CheckCircle className="w-6 h-6" />
            },
            {
              title: 'Strengths and Weaknesses',
              description: "Get a detailed breakdown of what you're doing well and where you need to improve through personalized insights and data analysis.",
              icon: <GraduationCap className="w-6 h-6" />
            },
            {
              title: 'Real-Time Progress Tracking',
              description: 'Monitor your application milestones, reflection completions, and goal achievements in one easy-to-use dashboard.',
              icon: <ArrowRight className="w-6 h-6" />
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 border border-gray-200 bg-gray-50 h-64">
              <div className="text-gray-900 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Auth Modal/Overlay */}
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
                  : "Start your personalized college discovery journey"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "signin" ? (
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signInForm.register("email")}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
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
                      <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      {...signUpForm.register("fullName")}
                    />
                    {signUpForm.formState.errors.fullName && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.fullName.message}</p>
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
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
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
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
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
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={signUpMutation.isPending}
                  >
                    {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}