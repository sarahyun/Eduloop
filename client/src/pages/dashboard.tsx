import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { User, Star, ArrowRight, CheckCircle, Clock, Sparkles, MessageCircle, GraduationCap } from "lucide-react";
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
  const { user, loading } = useAuth();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

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

        {/* Three Main Action Cards */}
        <div className="space-y-6">
          
          {/* Step 1: Complete Profile */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {profileCompletion >= 100 ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <User className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Step 1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {profileCompletion >= 100 ? 'Profile Complete!' : 'Complete Your Profile'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {profileCompletion >= 100 
                        ? 'Your profile is ready for college matching'
                        : 'Tell us about yourself, your interests, and goals'
                      }
                    </p>
                    {profileCompletion < 100 && (
                      <div className="flex items-center space-x-4">
                        <Progress value={profileCompletion} className="flex-1 max-w-sm" />
                        <span className="text-sm font-medium text-gray-600">
                          {profileCompletion}% complete
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  {profileCompletion >= 100 ? (
                    <Button 
                      onClick={() => window.location.href = '/profile-view'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => window.location.href = '/profile'}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    >
                      <span>Continue Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: View Profile Insights */}
          <Card className={`relative overflow-hidden border-2 transition-all duration-200 ${
            profileCompletion >= 50 
              ? 'hover:border-purple-300 hover:shadow-lg cursor-pointer' 
              : 'opacity-60 cursor-not-allowed'
          }`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      profileCompletion >= 50 ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Sparkles className={`w-8 h-8 ${
                        profileCompletion >= 50 ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Step 2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      View Your Profile Insights
                    </h3>
                    <p className="text-gray-600">
                      {profileCompletion >= 50 
                        ? 'See your personalized student profile and strengths analysis'
                        : 'Complete at least 50% of your profile to unlock insights'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => profileCompletion >= 50 && (window.location.href = '/profile-view')}
                    disabled={profileCompletion < 50}
                    variant={profileCompletion >= 50 ? "default" : "outline"}
                    className={`flex items-center space-x-2 ${
                      profileCompletion >= 50 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : ''
                    }`}
                  >
                    {profileCompletion >= 50 ? (
                      <>
                        <span>View Insights</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Locked</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Get College Recommendations */}
          <Card className={`relative overflow-hidden border-2 transition-all duration-200 ${
            profileCompletion >= 100 
              ? 'hover:border-green-300 hover:shadow-lg cursor-pointer' 
              : 'opacity-60 cursor-not-allowed'
          }`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      profileCompletion >= 100 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Star className={`w-8 h-8 ${
                        profileCompletion >= 100 ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Step 3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Get College Recommendations
                    </h3>
                    <p className="text-gray-600">
                      {profileCompletion >= 100 
                        ? 'View your personalized college matches based on your profile'
                        : 'Complete your full profile to unlock personalized college matches'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => profileCompletion >= 100 && (window.location.href = '/recommendations')}
                    disabled={profileCompletion < 100}
                    variant={profileCompletion >= 100 ? "default" : "outline"}
                    className={`flex items-center space-x-2 ${
                      profileCompletion >= 100 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : ''
                    }`}
                  >
                    {profileCompletion >= 100 ? (
                      <>
                        <span>View Matches</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Locked</span>
                      </>
                    )}
                  </Button>
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
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Recommendations!</h3>
                <p className="text-gray-600 mb-4">
                  Your profile is complete. Click "View All" above to see your personalized college matches.
                </p>
              </div>
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

        {/* Quick Access Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => {
              const firstIncompleteSection = Object.keys(questionsData).find(sectionId => !completedSections.has(sectionId));
              const sectionParam = firstIncompleteSection || 'Introduction';
              window.location.href = `/chat-onboarding?section=${encodeURIComponent(sectionParam)}`;
            }}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with AI Mentor
          </Button>
          {profileCompletion >= 50 && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/profile-view'}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              View Profile Insights
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
