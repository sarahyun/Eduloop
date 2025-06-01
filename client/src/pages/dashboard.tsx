import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Target, BookOpen, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { questionsData, type Question } from '@/data/questionsData';

interface FormResponse {
  response_id?: string;
  user_id: string;
  form_id: string;
  submitted_at?: string;
  responses: Array<{
    question_id: string;
    question_text: string;
    answer: string;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(true);

  // Load completion status for all sections
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user?.uid) {
        setIsLoadingCompletion(false);
        return;
      }

      setIsLoadingCompletion(true);
      const completed = new Set<string>();
      
      for (const sectionId of Object.keys(questionsData)) {
        const sectionFormId = sectionId.toLowerCase().replace(/\s+/g, '_');
        const sectionQuestions = questionsData[sectionId as keyof typeof questionsData] as Question[];
        
        try {
          const response = await fetch(`/api/responses/${user.uid}/${sectionFormId}`);
          if (response.ok) {
            const data: FormResponse = await response.json();
            
            // Check if at least 50% of questions in the section have been answered
            if (data.responses && data.responses.length > 0) {
              const answeredQuestionIds = new Set(data.responses.map(r => r.question_id));
              const allQuestionIds = sectionQuestions.map(q => q.id.toString());
              
              // Count questions with non-empty answers
              const answeredCount = allQuestionIds.filter(questionId => {
                const response = data.responses.find(r => r.question_id === questionId);
                return response && response.answer.trim().length > 0;
              }).length;
              
              // Section is complete if at least 50% of questions are answered
              const completionThreshold = Math.ceil(allQuestionIds.length * 0.5);
              if (answeredCount >= completionThreshold) {
                completed.add(sectionId);
              }
            }
          }
        } catch (error) {
          console.error(`Error loading completion status for ${sectionId}:`, error);
        }
      }
      
      setCompletedSections(completed);
      setIsLoadingCompletion(false);
    };

    loadCompletionStatus();
  }, [user?.uid]);

  // Calculate completion percentage
  const completedSectionsCount = completedSections.size;
  const totalSections = Object.keys(questionsData).length;
  const profileCompletion = Math.round((completedSectionsCount / totalSections) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h2>
          <Button onClick={() => window.location.href = '/'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || '', email: user.email || '' }} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName ? user.displayName.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-gray-600 mb-4">
            Find colleges that match your interests and goals.
          </p>
          
          {/* Profile Completion Nudge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-900">Complete your profile for better matches</h3>
                  <span className="text-sm font-medium text-blue-700">
                    {isLoadingCompletion ? 'Loading...' : `${profileCompletion}% complete`}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${isLoadingCompletion ? 0 : profileCompletion}%` }}
                  />
                </div>
                <p className="text-sm text-blue-700">
                  Each section is complete when you answer at least 50% of its questions. The more we learn about you, the more helpful our recommendations become.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/profile'}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 ml-4"
              >
                Build Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Build Profile</h3>
                  <p className="text-gray-600 text-sm">Complete your profile to get personalized recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            // Find first incomplete section for chat
            const firstIncompleteSection = Object.keys(questionsData).find(sectionId => !completedSections.has(sectionId));
            const sectionParam = firstIncompleteSection || 'Introduction';
            window.location.href = `/chat-onboarding?section=${encodeURIComponent(sectionParam)}`;
          }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Mentor</h3>
                  <p className="text-gray-600 text-sm">Get personalized guidance from our AI counselor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/explore'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Explore Colleges</h3>
                  <p className="text-gray-600 text-sm">Discover colleges that match your interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* College Recommendations Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your College Matches</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                Complete Profile to Unlock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">
                Build your profile to unlock personalized college recommendations tailored to your interests and goals.
              </p>
              <Button 
                onClick={() => window.location.href = '/profile'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to begin your college journey?</h3>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/onboarding'}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Start Onboarding
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Find first incomplete section for chat
                const firstIncompleteSection = Object.keys(questionsData).find(sectionId => !completedSections.has(sectionId));
                const sectionParam = firstIncompleteSection || 'Introduction';
                window.location.href = `/chat-onboarding?section=${encodeURIComponent(sectionParam)}`;
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask AI Mentor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
