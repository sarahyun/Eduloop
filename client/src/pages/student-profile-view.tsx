import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BookOpen, 
  Trophy, 
  Heart, 
  Target, 
  GraduationCap,
  ArrowLeft,
  Edit,
  TrendingUp,
  Star,
  Users,
  Lightbulb,
  Calendar,
  Award,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  MessageSquare,
  Scale,
  Compass,
  Rocket,
  School
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { API_BASE_URL } from '@/lib/config';

interface ProfileSection {
  section_id: string;
  title: string;
  type: 'paragraph' | 'bullets' | 'table';
  content: string | string[] | { [key: string]: any };
}

interface ProfileData {
  student_profile: {
    student_profile: ProfileSection[];
  };
  created_at: string;
  updated_at: string;
  status: string;
  user_id: string;
}

interface StudentProfileViewProps {
  userId?: string;
}

export function StudentProfileView({ userId: propUserId }: StudentProfileViewProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const userId = propUserId || user?.uid;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();
  const [hasProfileData, setHasProfileData] = useState(false);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching profile for userId:', userId);
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      
      console.log('🔍 Profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Profile API response data:', data);
        if (data && data.student_profile && data.student_profile.student_profile) {
          // Check if this is a placeholder/dummy profile
          const sections = data.student_profile.student_profile;
          const isPlaceholder = sections.length === 1 && 
            (sections[0].section_id === 'no_data' || 
             sections[0].content === 'No profile data available.' ||
             sections[0].title === 'Complete Your Profile');
          
          if (isPlaceholder) {
            console.log('🔍 Detected placeholder profile - showing empty state');
            setProfileData(null);
          } else {
            setProfileData(data);
          }
        } else {
          // No profile data found - this is normal for new users
          setProfileData(null);
        }
      } else {
        // Any non-success response means no profile exists yet - show empty state
        console.log(`🔍 No profile found (${response.status}) - showing empty state`);
        setProfileData(null);
      }
    } catch (err) {
      console.error('🔍 Network or server error:', err);
      // For profile endpoint, treat any error as "no profile exists yet"
      console.log('🔍 Network error - treating as no profile, showing empty state');
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  const regenerateProfile = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }
    
    try {
      setIsRegenerating(true);
      setError(null);
      setGenerationProgress('Starting profile generation...');
      
      console.log('🔍 Regenerating profile for userId:', userId);
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Profile regeneration started:', result);
        
        // Start polling for completion
        pollForCompletion();
      } else {
        throw new Error('Failed to start profile regeneration');
      }
    } catch (err) {
      console.error('Failed to regenerate profile:', err);
      setError('Failed to start profile regeneration. Please try again.');
      setIsRegenerating(false);
      setGenerationProgress('');
    }
  };

  const pollForCompletion = async () => {
    if (!userId) return;
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('🔍 Polling status for userId:', userId);
        const response = await fetch(`${API_BASE_URL}/profile/${userId}/status`);
        if (response.ok) {
          const status = await response.json();
          
          if (status.status === 'generating') {
            setGenerationProgress('Generating your profile...');
          } else if (status.status === 'completed') {
            clearInterval(pollInterval);
            setGenerationProgress('Profile generated successfully!');
            // Refresh the profile data
            await fetchProfileData();
            setIsRegenerating(false);
            setGenerationProgress('');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setError(status.error || 'Profile generation failed');
            setIsRegenerating(false);
            setGenerationProgress('');
          }
        }
      } catch (error) {
        console.error('Failed to check generation status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isRegenerating) {
        setError('Profile generation timed out. Please try again.');
        setIsRegenerating(false);
        setGenerationProgress('');
      }
    }, 300000);
  };

  // Add early return if no userId
  if (!userId && !authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User ID Required</h2>
          <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
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

  const getSectionIcon = (sectionId: string) => {
    const iconMap: { [key: string]: any } = {
      'core_snapshot': User,
      'academic_profile': GraduationCap,
      'intellectual_identity': BookOpen,
      'growth': TrendingUp,
      'extracurriculars': Trophy,
      'initiative_and_contribution': Target,
      'voice_and_expression': MessageSquare,
      'hidden_strengths': Heart,
      'contrasts_and_tensions': Scale,
      'core_values_and_drives': Compass,
      'blind_spots_for_growth': AlertCircle,
      'college_fit': School,
      'future_aspiration': Rocket,
      'final_insight': Star,
    };
    return iconMap[sectionId] || BookOpen;
  };

  const renderSectionContent = (section: ProfileSection) => {
    switch (section.type) {
      case 'paragraph':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{section.content as string}</p>
          </div>
        );
      
      case 'bullets':
        const items = Array.isArray(section.content) ? section.content : [section.content];
        return (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{String(item)}</span>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        const tableData = section.content as { [key: string]: any };
        return (
          <div className="space-y-3">
            {Object.entries(tableData).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        );
      
      default:
        return <p className="text-gray-700">{String(section.content)}</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Profile</h3>
              <p className="text-gray-600">Fetching your personalized college readiness profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full border-2 border-red-100 bg-red-50/50 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-3">Profile Not Available</h3>
                <p className="text-red-700 mb-6 leading-relaxed">{error}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={fetchProfileData} 
                    variant="outline" 
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={regenerateProfile}
                    disabled={isRegenerating}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                  >
                    {isRegenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Profile'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Return to Dashboard Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2 hover:bg-white/50 text-gray-600 hover:text-gray-900 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </div>

          <div className="text-center space-y-8">
            {/* Main Illustration */}
            <div className="relative">
              <div className="relative w-48 h-48 mx-auto mb-8">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
                
                {/* Main circle */}
                <div className="absolute inset-4 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-xl border border-gray-100 flex items-center justify-center">
                  <div className="relative">
                    <User className="h-16 w-16 text-gray-400" />
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-8 left-8 animate-bounce delay-100">
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="absolute top-12 right-4 animate-bounce delay-300">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                    <Trophy className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <div className="absolute bottom-8 left-4 animate-bounce delay-500">
                  <div className="w-7 h-7 bg-indigo-200 rounded-full flex items-center justify-center">
                    <Target className="h-3 w-3 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Profile Awaits
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Let AI create a comprehensive profile that reveals your unique strengths, 
                  growth areas, and college readiness insights.
                </p>
              </div>

              {/* Features preview */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Academic Identity</h3>
                    <p className="text-sm text-gray-600">Discover your learning style and intellectual strengths</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hidden Strengths</h3>
                    <p className="text-sm text-gray-600">Uncover talents you might not even realize you have</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Rocket className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Future Direction</h3>
                    <p className="text-sm text-gray-600">Get insights on your college and career path</p>
                  </CardContent>
                </Card>
              </div>

              {/* What you'll get */}
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    What you'll discover
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-left">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Personalized academic profile analysis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Growth opportunities and blind spots</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">College fit recommendations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Future aspirations and pathway insights</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action button */}
              <div className="pt-4">
                <Button 
                  onClick={regenerateProfile}
                  disabled={isRegenerating}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Generating Your Profile...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-5 w-5 mr-3" />
                      Generate Your Profile
                    </>
                  )}
                </Button>
                
                {!isRegenerating && (
                  <p className="text-sm text-gray-500 mt-3">
                    Takes about 2-3 minutes to analyze your responses
                  </p>
                )}
              </div>

              {/* Generation Progress */}
              {generationProgress && (
                <div className="max-w-md mx-auto">
                  <Card className="border-2 border-blue-200 bg-blue-50/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        <span className="text-blue-800 font-medium">{generationProgress}</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Return to Dashboard Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shadow-sm">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Your Student Profile
              </h1>
              <p className="text-lg text-gray-600 mt-2">AI-generated insights based on your responses</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Updated {new Date(profileData.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">Profile Complete</span>
            </div>
            <Button
              onClick={regenerateProfile}
              disabled={isRegenerating}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Profile
                </>
              )}
            </Button>
          </div>

          {/* Generation Progress */}
          {generationProgress && (
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">{generationProgress}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Profile Sections */}
        <div className="grid gap-6">
          {profileData.student_profile.student_profile?.map((section, index) => {
            const IconComponent = getSectionIcon(section.section_id);
            
            // Color variations for different sections
            const getColorTheme = (sectionId: string, index: number) => {
              const themes = [
                { bg: 'bg-gradient-to-r from-purple-50 to-pink-50', icon: 'text-purple-600', border: 'border-purple-100' },
                { bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
                { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', icon: 'text-amber-600', border: 'border-amber-100' },
                { bg: 'bg-gradient-to-r from-slate-50 to-gray-50', icon: 'text-slate-600', border: 'border-slate-100' },
                { bg: 'bg-gradient-to-r from-indigo-50 to-blue-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
                { bg: 'bg-gradient-to-r from-rose-50 to-red-50', icon: 'text-rose-600', border: 'border-rose-100' },
              ];
              return themes[index % themes.length];
            };
            
            const colorTheme = getColorTheme(section.section_id, index);
            
            return (
              <Card key={section.section_id || index} className={`overflow-hidden border-2 ${colorTheme.border} hover:shadow-lg transition-all duration-200`}>
                <CardHeader className={`${colorTheme.bg} border-b border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm">
                      <IconComponent className={`h-5 w-5 ${colorTheme.icon}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  {renderSectionContent(section)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 leading-relaxed">
              This profile is generated using AI analysis of your responses across all questionnaire sections. 
              It provides insights into your academic strengths, interests, and college readiness to help guide 
              your educational journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileView;