import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolRecommendationCard } from '@/components/SchoolRecommendationCard';
import { Navigation } from '@/components/Navigation';
import { SchoolRecommendationsService, SchoolRecommendation } from '@/services/schoolRecommendationsService';
import { 
  Target, 
  Star, 
  Shield, 
  BookOpen,
  Brain,
  ArrowLeft
} from 'lucide-react';

export default function CollegeRecommendations() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await SchoolRecommendationsService.getSchoolRecommendations(user?.uid);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizedRecommendations = SchoolRecommendationsService.categorizeRecommendations(recommendations);

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view recommendations</h2>
          <Button onClick={() => setLocation('/')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || '', email: user.email || '' }} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered School Recommendations</h1>
              <p className="text-gray-600">
                Personalized recommendations based on your profile and preferences
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold text-purple-600">{categorizedRecommendations.reach.length}</span>
                </div>
                <p className="text-sm text-gray-600">Reach Schools</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-600">{categorizedRecommendations.match.length}</span>
                </div>
                <p className="text-sm text-gray-600">Match Schools</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-600">{categorizedRecommendations.safety.length}</span>
                </div>
                <p className="text-sm text-gray-600">Safety Schools</p>
              </CardContent>
            </Card>
          </div>
        </div>



        {/* Recommendations */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your personalized recommendations...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                All ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="reach" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Reach ({categorizedRecommendations.reach.length})
              </TabsTrigger>
              <TabsTrigger value="match" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Match ({categorizedRecommendations.match.length})
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety ({categorizedRecommendations.safety.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6">
                {recommendations.map((recommendation, index) => (
                  <SchoolRecommendationCard
                    key={`${recommendation.name}-${index}`}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reach" className="mt-6">
              <div className="grid gap-6">
                {categorizedRecommendations.reach.map((recommendation, index) => (
                  <SchoolRecommendationCard
                    key={`reach-${recommendation.name}-${index}`}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="match" className="mt-6">
              <div className="grid gap-6">
                {categorizedRecommendations.match.map((recommendation, index) => (
                  <SchoolRecommendationCard
                    key={`match-${recommendation.name}-${index}`}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="safety" className="mt-6">
              <div className="grid gap-6">
                {categorizedRecommendations.safety.map((recommendation, index) => (
                  <SchoolRecommendationCard
                    key={`safety-${recommendation.name}-${index}`}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations available</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to get personalized school recommendations.
            </p>
            <Button onClick={() => setLocation('/profile-builder')}>
              Complete Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}