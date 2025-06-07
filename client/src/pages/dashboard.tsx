import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { User, Star, ArrowRight, Clock, Sparkles, MessageCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { questionsData, type Question } from '@/data/questionsData';
import { SchoolRecommendationsService, SchoolRecommendation } from '@/services/schoolRecommendationsService';

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
  const { user, loading } = useAuth();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);

  // Calculate completion percentage
  const completedSectionsCount = completedSections.size;
  const totalSections = Object.keys(questionsData).length;
  const profileCompletion = Math.round((completedSectionsCount / totalSections) * 100);

  // Load recommendations when profile is complete
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.uid || profileCompletion < 100) {
        return;
      }

      try {
        // First check if user has generated recommendations
        const status = await SchoolRecommendationsService.getGenerationStatus(user.uid);
        const hasGenerated = status.status === 'completed';
        setHasRealRecommendations(hasGenerated);

        if (hasGenerated) {
          // Load actual recommendations
          const data = await SchoolRecommendationsService.getSchoolRecommendations(user.uid);
          if (data.recommendations && data.recommendations.length > 0) {
            // Take first 3 recommendations for preview
            setRecommendations(data.recommendations.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      }
    };

    loadRecommendations();
  }, [user?.uid, profileCompletion]);

  // Load completion status for all sections
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user?.uid) {
        return;
      }

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
    };

    loadCompletionStatus();
  }, [user?.uid]);

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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName ? user.displayName.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-gray-600 mb-6">
            Find colleges that match your interests and goals.
          </p>
          
          {/* Smart Profile Completion Banner */}
          <ProfileCompletionBanner 
            completionPercentage={profileCompletion}
            isFullyComplete={profileCompletion >= 100}
            className="mb-6"
          />
        </div>

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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
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
                  <p className="text-gray-600 text-sm">Get personalized guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Insights */}
          <Card className={`hover:shadow-lg transition-shadow ${profileCompletion >= 50 ? 'cursor-pointer' : 'opacity-60'}`} 
                onClick={() => profileCompletion >= 50 && (window.location.href = '/profile-view')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Insights</h3>
                  <p className="text-gray-600 text-sm">
                    {profileCompletion >= 50 ? 'View your analysis' : '50% profile needed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Matches */}
          <Card className={`hover:shadow-lg transition-shadow ${profileCompletion >= 100 ? 'cursor-pointer' : 'opacity-60'}`} 
                onClick={() => profileCompletion >= 100 && (window.location.href = '/recommendations')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">College Matches</h3>
                  <p className="text-gray-600 text-sm">
                    {profileCompletion >= 100 ? 'View recommendations' : 'Complete profile first'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* College Recommendations Preview */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Your College Matches
              </CardTitle>
              {profileCompletion >= 100 ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/recommendations'}
                  className="flex items-center gap-2"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Complete Profile to Unlock
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {profileCompletion >= 100 ? (
              hasRealRecommendations && recommendations.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {recommendations.map((school, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{school.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            school.type === 'Reach' ? 'bg-red-100 text-red-700' :
                            school.type === 'Match' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {school.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">{school.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Fit Score</span>
                          <span className="text-sm font-medium text-blue-600">{school.fit_score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Showing 3 of your top matches</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Recommendations</h3>
                  <p className="text-gray-600 mb-4">
                    Your profile is complete. Visit the recommendations page to generate your personalized college matches.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-gray-600 mb-4">
                  Build your profile to unlock personalized college recommendations tailored to your interests and goals.
                </p>
                <div className="max-w-sm mx-auto mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{profileCompletion}% Complete</span>
                    <span>{Math.ceil((100 - profileCompletion) / (100 / Object.keys(questionsData).length))} sections left</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                <Button 
                  onClick={() => window.location.href = '/profile'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
