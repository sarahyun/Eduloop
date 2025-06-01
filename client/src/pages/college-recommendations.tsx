import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Star, 
  TrendingUp, 
  Shield, 
  Heart, 
  MapPin, 
  Users, 
  DollarSign,
  BookOpen,
  Sparkles,
  RefreshCw,
  Filter,
  SortAsc,
  ArrowLeft,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';

// Mock data structure for brainstorming
interface CollegeRecommendation {
  id: string;
  name: string;
  location: string;
  matchScore: number;
  category: 'reach' | 'match' | 'safety';
  reasoning: string;
  highlights: string[];
  stats: {
    acceptanceRate: number;
    averageGPA: number;
    satRange: string;
    tuition: string;
    enrollment: number;
  };
  programs: string[];
  campusLife: string[];
  financialAid: {
    averageAid: string;
    needMet: number;
  };
  whyMatch: {
    academicFit: string;
    culturalFit: string;
    careerOutcomes: string;
  };
}

interface ProfileInsight {
  type: 'strength' | 'growth_area' | 'recommendation' | 'strategy';
  title: string;
  description: string;
  actionItems: string[];
}

export default function CollegeRecommendations() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  // Mock data for UI brainstorming
  const [recommendations] = useState<CollegeRecommendation[]>([
    {
      id: "1",
      name: "Stanford University",
      location: "Stanford, CA",
      matchScore: 85,
      category: "reach",
      reasoning: "Your strong academic performance and interest in computer science align perfectly with Stanford's innovative programs. Your leadership experience and community involvement make you a competitive candidate.",
      highlights: ["Top CS Program", "Innovation Hub", "Strong Alumni Network"],
      stats: {
        acceptanceRate: 4,
        averageGPA: 3.96,
        satRange: "1470-1570",
        tuition: "$56,169",
        enrollment: 17249
      },
      programs: ["Computer Science", "Engineering", "Entrepreneurship"],
      campusLife: ["Tech Incubators", "Research Opportunities", "Silicon Valley Connections"],
      financialAid: {
        averageAid: "$53,346",
        needMet: 100
      },
      whyMatch: {
        academicFit: "Your 4.0 GPA and advanced coursework align with their academic standards",
        culturalFit: "Innovation-focused environment matches your entrepreneurial interests",
        careerOutcomes: "95% job placement rate in tech, average starting salary $120k+"
      }
    },
    {
      id: "2", 
      name: "University of California, Berkeley",
      location: "Berkeley, CA",
      matchScore: 92,
      category: "match",
      reasoning: "UC Berkeley's strong engineering programs and diverse campus culture are an excellent match for your academic profile and personal values. Your test scores fall within their middle 50% range.",
      highlights: ["Public Ivy", "Research Excellence", "Diverse Community"],
      stats: {
        acceptanceRate: 17,
        averageGPA: 3.89,
        satRange: "1330-1530",
        tuition: "$14,226 (in-state)",
        enrollment: 45057
      },
      programs: ["Engineering", "Computer Science", "Business"],
      campusLife: ["Research Labs", "Student Organizations", "Bay Area Access"],
      financialAid: {
        averageAid: "$18,993",
        needMet: 85
      },
      whyMatch: {
        academicFit: "Your academic profile matches their admitted student averages",
        culturalFit: "Values-driven education aligns with your community service background",
        careerOutcomes: "Strong placement in tech and graduate programs"
      }
    },
    {
      id: "3",
      name: "Cal Poly San Luis Obispo", 
      location: "San Luis Obispo, CA",
      matchScore: 96,
      category: "safety",
      reasoning: "Cal Poly's hands-on approach to engineering education and your practical project experience make this an excellent safety school with outstanding career outcomes.",
      highlights: ["Learn by Doing", "High Job Placement", "Beautiful Campus"],
      stats: {
        acceptanceRate: 28,
        averageGPA: 4.0,
        satRange: "1240-1450", 
        tuition: "$9,816 (in-state)",
        enrollment: 22013
      },
      programs: ["Engineering", "Architecture", "Agriculture"],
      campusLife: ["Hands-on Learning", "Student Projects", "Outdoor Activities"],
      financialAid: {
        averageAid: "$9,405",
        needMet: 65
      },
      whyMatch: {
        academicFit: "Your stats exceed their averages, ensuring strong admission chances",
        culturalFit: "Practical, hands-on learning style matches your project-based interests",
        careerOutcomes: "96% job placement rate, strong industry connections"
      }
    }
  ]);
  
  const [insights] = useState<ProfileInsight[]>([
    {
      type: "strength",
      title: "Strong Academic Foundation",
      description: "Your 4.0 GPA and rigorous coursework demonstrate excellent academic preparation for competitive colleges.",
      actionItems: ["Continue challenging yourself with advanced courses", "Maintain academic excellence in senior year"]
    },
    {
      type: "growth_area", 
      title: "Standardized Test Scores",
      description: "While your SAT scores are solid, increasing them could strengthen applications to reach schools.",
      actionItems: ["Consider retaking SAT/ACT if time permits", "Focus on test prep for weaker sections"]
    },
    {
      type: "recommendation",
      title: "Leadership Experience",
      description: "Your leadership roles show strong potential, but expanding these experiences could further strengthen your profile.",
      actionItems: ["Seek additional leadership opportunities", "Document impact of your leadership roles"]
    }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<CollegeRecommendation | null>(null);
  const [savedColleges, setSavedColleges] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<'all' | 'reach' | 'match' | 'safety'>('all');
  const [sortBy, setSortBy] = useState<'match' | 'name' | 'location'>('match');

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

  const generateRecommendations = async () => {
    setIsGenerating(true);
    // TODO: API call to generate recommendations
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const toggleSaveCollege = (collegeId: string) => {
    const newSaved = new Set(savedColleges);
    if (newSaved.has(collegeId)) {
      newSaved.delete(collegeId);
    } else {
      newSaved.add(collegeId);
    }
    setSavedColleges(newSaved);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reach': return 'bg-red-100 text-red-800 border-red-200';
      case 'match': return 'bg-green-100 text-green-800 border-green-200';
      case 'safety': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reach': return <TrendingUp className="w-4 h-4" />;
      case 'match': return <Target className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || 'User', email: user.email || '' }} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Matching
            </Badge>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Personalized College Recommendations
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Based on your profile, interests, and goals, here are colleges that could be perfect for you
            </p>
          </div>

          {/* Generate/Regenerate Button */}
          {recommendations.length === 0 ? (
            <div className="text-center">
              <Button 
                onClick={generateRecommendations}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Your Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Recommendations
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button 
                onClick={generateRecommendations}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Recommendations
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Analyzing Your Perfect Matches
                </h3>
                <p className="text-blue-700 mb-4">
                  Our AI is reviewing thousands of colleges to find the best fits for your unique profile
                </p>
                <Progress value={33} className="w-64 mx-auto" />
                <p className="text-sm text-blue-600 mt-2">
                  Analyzing academic fit, campus culture, and career outcomes...
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Content */}
        {recommendations.length > 0 && !isGenerating && (
          <div className="space-y-8">
            {/* Profile Insights Section */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Profile Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.actionItems.length > 0 && (
                          <ul className="text-xs text-gray-500 space-y-1">
                            {insight.actionItems.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="reach">Reach Schools</option>
                    <option value="match">Match Schools</option>
                    <option value="safety">Safety Schools</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <SortAsc className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="match">Match Score</option>
                    <option value="name">School Name</option>
                    <option value="location">Location</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {recommendations.length} schools found
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((college) => (
                <Card key={college.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getCategoryColor(college.category)}>
                            {getCategoryIcon(college.category)}
                            <span className="ml-1 capitalize">{college.category}</span>
                          </Badge>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium ml-1">{college.matchScore}%</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {college.name}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {college.location}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveCollege(college.id);
                        }}
                        className={savedColleges.has(college.id) ? 'text-red-600 hover:text-red-700' : 'text-gray-400 hover:text-red-600'}
                      >
                        <Heart className={`w-4 h-4 ${savedColleges.has(college.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {college.reasoning}
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-gray-400" />
                        <span>{college.stats.acceptanceRate}% admit</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                        <span>{college.stats.tuition}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1 text-gray-400" />
                        <span>GPA: {college.stats.averageGPA}</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-1 text-gray-400" />
                        <span>SAT: {college.stats.satRange}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {college.highlights.slice(0, 3).map((highlight, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                        {college.highlights.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{college.highlights.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedCollege(college)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open college website
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* College Detail Modal/Sidebar would go here */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* College detail content would go here */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedCollege.name}</h2>
                <Button variant="ghost" onClick={() => setSelectedCollege(null)}>
                  ×
                </Button>
              </div>
              {/* More detailed content would be here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}