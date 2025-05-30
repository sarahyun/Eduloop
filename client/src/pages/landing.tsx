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
  const [activeTab, setActiveTab] = useState("signin");

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
      window.location.href = "/onboarding";
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
      window.location.href = "/dashboard";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <GraduationCap className="w-8 h-8" />
                <span className="font-semibold text-lg">Your College Journey Companion</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Colleges That
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Fit You</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Chat with AI to build your student profile, discover colleges through natural language search, and get personalized recommendations based on your interests, goals, and preferences - not just test scores.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Chat Profile Builder</h3>
                  <p className="text-sm text-gray-600">Answer questions about your interests, goals, and preferences to build your student profile</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart College Search</h3>
                  <p className="text-sm text-gray-600">Search like "small liberal arts school with strong poetry program" and get ranked results</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Recommendations</h3>
                  <p className="text-sm text-gray-600">Get college suggestions based on fit, not just rankings - academic, social, and financial match</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI College Counselor</h3>
                  <p className="text-sm text-gray-600">24/7 guidance for college planning, application strategy, and decision making</p>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">★</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      "Access is power. Every student deserves guidance."
                    </p>
                    <p className="text-xs text-gray-600">
                      Supporting students in multiple languages, regardless of zip code or family background
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Begin Your Journey</CardTitle>
                <CardDescription>
                  Start growing with your AI companion who learns about you and evolves alongside your story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4 mt-6">
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
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={signInMutation.isPending}
                      >
                        {signInMutation.isPending ? "Signing In..." : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-6">
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
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={signUpMutation.isPending}
                      >
                        {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}