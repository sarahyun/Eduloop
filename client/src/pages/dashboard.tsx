import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { GuidanceHelper, ProgressTracker } from "@/components/GuidanceHelper";
import { User, Star, ArrowRight, Clock, Sparkles, MessageCircle, GraduationCap, ChevronLeft, ChevronRight, MapPin, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { questionsData, type Question, getSectionConfig } from '@/data/questionsData';
import { SchoolRecommendationsService, SchoolRecommendation } from '@/services/schoolRecommendationsService';
import { API_BASE_URL } from '@/lib/config';


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
  const { user } = useAuth();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      fetchUserResponses();
      loadRecommendations();
    }
  }, [user]);

  const fetchUserResponses = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/responses/user/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setResponses(Array.isArray(data) ? data : []);
      } else {
        console.log('No existing responses found for user');
        setResponses([]);
      }
    } catch (error) {
      console.error('Error fetching user responses:', error);
      setError('Failed to load your responses');
      setResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user?.uid) return;

    try {
      const schoolService = new SchoolRecommendationsService();
      const userRecommendations = await schoolService.getUserRecommendations(user.uid);
      
      if (userRecommendations && userRecommendations.length > 0) {
        setRecommendations(userRecommendations);
        setHasRealRecommendations(true);
      } else {
        setRecommendations([]);
        setHasRealRecommendations(false);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
      setHasRealRecommendations(false);
    }
  };

  const getCompletedSections = () => {
    const completedSections = new Set<string>();
    
    responses.forEach(response => {
      const sectionId = response.form_id;
      const sectionQuestions = questionsData[sectionId as keyof typeof questionsData] || [];
      const answeredQuestions = response.responses || [];
      const answeredQuestionIds = answeredQuestions.map(r => r.question_id);
      
      const totalQuestions = sectionQuestions.length;
      const answeredCount = sectionQuestions.filter(q => 
        answeredQuestionIds.includes(q.id.toString())
      ).length;
      
      if (answeredCount > 0) {
        completedSections.add(sectionId);
      }
    });

    return completedSections;
  };

  const hasCompletedIntroduction = () => {
    // Check both cases since API might return different case than expected  
    const introResponse = responses.find(r => 
      r.form_id === 'Introduction' || r.form_id === 'introduction'
    );
    
    if (!introResponse || !introResponse.responses) {
      return false;
    }
    
    const answeredQuestions = introResponse.responses || [];
    return answeredQuestions.length > 0; // Any answered question in intro marks it as started/completed
  };

  const calculateProfileCompletion = () => {
    const completedSections = getCompletedSections();
    const totalSections = Object.keys(questionsData).length;
    return Math.round((completedSections.size / totalSections) * 100);
  };

  const hasProfileData = () => {
    return responses.length > 0 && responses.some(r => r.responses && r.responses.length > 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const completedSections = getCompletedSections();
  const profileCompletion = calculateProfileCompletion();
  const introCompleted = hasCompletedIntroduction();
  const isNewUser = !introCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={{ name: user.displayName || user.email || '', email: user.email || '' }} 
        hasProfileData={hasProfileData()}
        hasRealRecommendations={hasRealRecommendations}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* New User Onboarding Guidance */}
        {isNewUser && (
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to CollegeNavigate AI!
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Let's start with a quick introduction to understand your background and goals. 
                    This will help us provide personalized college recommendations just for you.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/onboarding'}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Your Journey
                  </Button>
                  <p className="text-sm text-gray-600">Takes about 5 minutes to complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isNewUser 
              ? `Welcome, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`
              : `Welcome back, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`
            }
          </h1>
          <p className="text-gray-600 mb-6">
            {isNewUser 
              ? "Ready to discover your perfect college matches? Let's get started!"
              : "Find colleges that match your interests and goals."
            }
          </p>
          
          {/* Smart Profile Completion Banner - only show for existing users */}
          {!isNewUser && (
            <ProfileCompletionBanner 
              completionPercentage={profileCompletion}
              isFullyComplete={profileCompletion >= 100}
              className="mb-6"
            />
          )}
        </div>

        {/* Smart Guidance for Next Steps */}
        {!isNewUser && profileCompletion < 100 && (
          <div className="mb-8">
            <GuidanceHelper 
              currentStep={
                !hasCompletedIntroduction() 
                  ? 'onboarding' 
                  : profileCompletion < 80 
                    ? 'profile' 
                    : 'chat'
              }
            />
          </div>
        )}

        {/* Main Dashboard Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile Building */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Build Profile</h3>
                  <p className="text-gray-600 text-sm">Complete your student profile</p>
                  <p className="text-blue-600 text-sm font-medium">{profileCompletion}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Mentor Chat */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/chat'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Mentor</h3>
                  <p className="text-gray-600 text-sm">Get personalized guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Recommendations */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/college-recommendations'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">College Matches</h3>
                  <p className="text-gray-600 text-sm">Find your perfect fit</p>
                  {hasRealRecommendations && recommendations.length > 0 && (
                    <p className="text-green-600 text-sm font-medium">{recommendations.length} matches found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explore Schools */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/explore'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Explore Schools</h3>
                  <p className="text-gray-600 text-sm">Browse college database</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}