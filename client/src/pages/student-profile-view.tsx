import { useState } from 'react';
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
  Award
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
// Import the actual mock data
import mockStudentProfileData from '@/data/mockStudentProfileData';

interface ProfileSection {
  section_id: string;
  title: string;
  type: 'paragraph' | 'bullets' | 'key_value' | 'timeline' | 'table';
  content: string | string[] | Record<string, any>[] | Record<string, string>;
}

export default function StudentProfileView() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Load the mock data
  const profileData = mockStudentProfileData.student_profile as ProfileSection[];

  // Show loading state while auth is loading
  if (loading) {
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

  const renderContent = (section: ProfileSection) => {
    switch (section.type) {
      case 'paragraph':
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {section.content as string}
            </p>
          </div>
        );
      
      case 'bullets':
        return (
          <ul className="space-y-4">
            {(section.content as string[]).map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </li>
            ))}
          </ul>
        );
      
      case 'table':
        return (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(section.content as Record<string, string>).map(([key, value], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 leading-relaxed">{value}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'key_value':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {(section.content as Record<string, any>[]).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">{item.key}</h4>
                <p className="text-gray-700 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        );
      
      case 'timeline':
        return (
          <div className="space-y-4">
            {(section.content as Record<string, any>[]).map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{item.timeframe}</p>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <p className="text-gray-700">{section.content as string}</p>;
    }
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'core_snapshot': return <User className="w-5 h-5" />;
      case 'academic_profile': return <BookOpen className="w-5 h-5" />;
      case 'intellectual_interests': return <Lightbulb className="w-5 h-5" />;
      case 'extracurriculars': return <Trophy className="w-5 h-5" />;
      case 'core_values_and_drives': return <Heart className="w-5 h-5" />;
      case 'hidden_strengths': return <Star className="w-5 h-5" />;
      case 'college_fit': return <GraduationCap className="w-5 h-5" />;
      case 'future_direction': return <Target className="w-5 h-5" />;
      case 'final_insight': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  // Group sections by category for better organization
  const academicSections = profileData.filter(section => 
    ['academic_profile', 'intellectual_interests'].includes(section.section_id)
  );
  
  const personalSections = profileData.filter(section => 
    ['core_snapshot', 'core_values_and_drives', 'hidden_strengths'].includes(section.section_id)
  );
  
  const extracurricularSections = profileData.filter(section => 
    ['extracurriculars'].includes(section.section_id)
  );
  
  const futureSections = profileData.filter(section => 
    ['college_fit', 'future_direction', 'final_insight'].includes(section.section_id)
  );
  


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || 'User', email: user.email || '' }} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" className="text-gray-600">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Profile Overview
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive view of your academic journey and personal growth
            </p>
          </div>

          {/* Profile Completion */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-900">Profile Completion</h3>
                <Badge className="bg-green-100 text-green-800">95% Complete</Badge>
              </div>
              <Progress value={95} className="mb-2" />
              <p className="text-sm text-green-700">
                Your profile is comprehensive and ready for college recommendations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="future">Future</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {profileData.slice(0, 4).map((section) => (
                <Card key={section.section_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        {getSectionIcon(section.section_id)}
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(section)}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Academic Growth</h4>
                    <p className="text-sm text-gray-600">3.0 → 3.92 GPA trajectory</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Leadership</h4>
                    <p className="text-sm text-gray-600">Multiple leadership roles</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Creative</h4>
                    <p className="text-sm text-gray-600">Multi-faceted interests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <div className="space-y-6">
              {academicSections.length > 0 ? academicSections.map((section) => (
                <Card key={section.section_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getSectionIcon(section.section_id)}
                      <span className="ml-2">{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(section)}
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Information</h3>
                    <p className="text-gray-600">Academic profile details will be displayed here once available.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="space-y-6">
              {personalSections.length > 0 ? personalSections.map((section) => (
                <Card key={section.section_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getSectionIcon(section.section_id)}
                      <span className="ml-2">{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(section)}
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Growth</h3>
                    <p className="text-gray-600">Personal development and growth information will be shown here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="space-y-6">
              {extracurricularSections.length > 0 ? extracurricularSections.map((section) => (
                <Card key={section.section_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getSectionIcon(section.section_id)}
                      <span className="ml-2">{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(section)}
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Extracurricular Activities</h3>
                    <p className="text-gray-600">Leadership roles and extracurricular activities will be listed here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Future Tab */}
          <TabsContent value="future" className="space-y-6">
            <div className="space-y-6">
              {futureSections.length > 0 ? futureSections.map((section) => (
                <Card key={section.section_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getSectionIcon(section.section_id)}
                      <span className="ml-2">{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(section)}
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Future Plans</h3>
                    <p className="text-gray-600">College preferences and career aspirations will be displayed here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/recommendations')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Star className="w-4 h-4 mr-2" />
            Get College Recommendations
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile-builder')}>
            <Edit className="w-4 h-4 mr-2" />
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}