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

export function StudentProfileView({ userId = "FPoYbarotyf6QG1OHeZ3MqKlwSE3" }: StudentProfileViewProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the latest completed profile generation
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.student_profile && data.student_profile.student_profile) {
          setProfileData(data);
        } else {
          setError('No profile data found. Please generate your profile first.');
        }
      } else if (response.status === 404) {
        setError('No profile found. Please generate your profile first.');
      } else {
        throw new Error('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Profile Not Available</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={fetchProfileData} 
                    variant="outline" 
                    className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/profile-generation'} 
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Generate Profile
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profile Data</h3>
                <p className="text-gray-600 mb-4">Your profile hasn't been generated yet.</p>
                <Button 
                  onClick={() => window.location.href = '/profile-generation'} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Generate Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Return to Dashboard Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Student Profile</h1>
              <p className="text-gray-600">AI-generated insights based on your responses</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(profileData.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Profile Complete</span>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid gap-6">
          {profileData.student_profile.student_profile?.map((section, index) => {
            const IconComponent = getSectionIcon(section.section_id);
            
            return (
              <Card key={section.section_id || index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
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