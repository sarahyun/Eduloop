import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { User, Star, ArrowRight, Clock, Sparkles, MessageCircle, GraduationCap, ChevronLeft, ChevronRight, MapPin, TrendingUp } from "lucide-react";
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
  const [hasProfileData, setHasProfileData] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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
        console.log('Generation status:', status);
        const hasGenerated = status.status === 'completed';
        setHasRealRecommendations(hasGenerated);

        if (hasGenerated) {
          // Load actual recommendations
          const data = await SchoolRecommendationsService.getSchoolRecommendations(user.uid);
          console.log('Loaded recommendations for dashboard:', data);
          if (data.recommendations && data.recommendations.length > 0) {
            // Store all recommendations for the carousel
            setRecommendations(data.recommendations);
            console.log('Set dashboard recommendations:', data.recommendations);
          }
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      }
    };

    loadRecommendations();
  }, [user?.uid, profileCompletion]);

  // Profile Insights available when forms are 100% complete
  useEffect(() => {
    setHasProfileData(profileCompletion >= 100);
  }, [profileCompletion]);

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

  // Carousel navigation functions for groups of 3
  const schoolsPerPage = 3;
  const totalPages = Math.ceil(recommendations.length / schoolsPerPage);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

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

          {/* Profile Insights */}
          <Card className={`hover:shadow-lg transition-shadow ${hasProfileData ? 'cursor-pointer' : 'opacity-60'}`} 
                onClick={() => hasProfileData && (window.location.href = '/profile-view')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Insights</h3>
                  <p className="text-gray-600 text-sm">
                    {hasProfileData ? 'View your analysis' : 'Complete profile to view insights'}
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
                <div className="space-y-6">
                  {/* Carousel Container */}
                  <div className="relative">
                    {/* Schools Grid */}
                    <div className="overflow-hidden rounded-xl">
                      <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                          <div key={pageIndex} className="w-full flex-shrink-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {recommendations
                                .slice(pageIndex * schoolsPerPage, (pageIndex + 1) * schoolsPerPage)
                                .map((school, schoolIndex) => (
                                <div key={schoolIndex} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                  {/* School Header */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{school.name}</h3>
                                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="text-xs">{school.location}</span>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      school.type === 'Reach' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      school.type === 'Match' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {school.type}
                                    </span>
                                  </div>

                                  {/* Fit Score */}
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Fit Score</span>
                                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{school.fit_score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-700"
                                        style={{ width: `${school.fit_score}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Fit Categories */}
                                  <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center">
                                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                                        school.fit.academic === 'Great' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                        school.fit.academic === 'Good' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      }`}>
                                        <TrendingUp className="h-3 w-3" />
                                      </div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Academic</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{school.fit.academic}</p>
                                    </div>
                                    <div className="text-center">
                                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                                        school.fit.social_cultural === 'Great' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                        school.fit.social_cultural === 'Good' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      }`}>
                                        <User className="h-3 w-3" />
                                      </div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Social</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{school.fit.social_cultural}</p>
                                    </div>
                                    <div className="text-center">
                                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                                        school.fit.financial === 'Great' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                        school.fit.financial === 'Good' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      }`}>
                                        <Star className="h-3 w-3" />
                                      </div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Financial</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{school.fit.financial}</p>
                                    </div>
                                  </div>

                                  {/* Quick Summary */}
                                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                                      {school.overall_fit_rationale[0]}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {totalPages > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Carousel Indicators */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            currentSlide === index
                              ? 'bg-blue-600 dark:bg-blue-400 scale-110'
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Showing {Math.min((currentSlide + 1) * schoolsPerPage, recommendations.length)} of {recommendations.length} matches
                      {totalPages > 1 && ` • Page ${currentSlide + 1} of ${totalPages}`}
                    </p>
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
