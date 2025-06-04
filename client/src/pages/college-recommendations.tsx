import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SchoolRecommendationCard } from '@/components/SchoolRecommendationCard';
import { Navigation } from '@/components/Navigation';
import { SchoolRecommendationsService, SchoolRecommendation } from '@/services/schoolRecommendationsService';
import { 
  Target, 
  Star, 
  Shield, 
  BookOpen,
  Brain,
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';

export default function CollegeRecommendations() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('fit-score');
  const [filterType, setFilterType] = useState('all');

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

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || rec.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'fit-score':
        return SchoolRecommendationsService.calculateFitScore(b.fit) - SchoolRecommendationsService.calculateFitScore(a.fit);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        const typeOrder = { 'Safety': 0, 'Match': 1, 'Reach': 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      default:
        return 0;
    }
  });

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-orange-600">
                    {recommendations.length > 0 
                      ? Math.round(recommendations.reduce((sum, rec) => 
                          sum + SchoolRecommendationsService.calculateFitScore(rec.fit), 0) / recommendations.length)
                      : 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Avg. Fit Score</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Reach">Reach Schools</SelectItem>
              <SelectItem value="Match">Match Schools</SelectItem>
              <SelectItem value="Safety">Safety Schools</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit-score">Sort by Fit Score</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="type">Sort by Type</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={loadRecommendations}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                {sortedRecommendations.map((recommendation, index) => (
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
        {!isLoading && sortedRecommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Complete your profile to get personalized recommendations.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setLocation('/profile-builder')}>
                Complete Profile
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}