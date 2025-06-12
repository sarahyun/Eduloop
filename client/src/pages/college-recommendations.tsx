import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolRecommendationCard } from '@/components/SchoolRecommendationCard';
import { Navigation } from '@/components/Navigation';
import { SchoolRecommendationsService, SchoolRecommendation, GenerationStatus } from '@/services/schoolRecommendationsService';
import { 
  Target, 
  Star, 
  Shield, 
  BookOpen,
  Brain,
  ArrowLeft,
  Lightbulb,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CollegeRecommendations() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasProfileData, setHasProfileData] = useState(false);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);
  
  // Use ref to track generation state for setTimeout closure
  const isGeneratingRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update ref whenever isGenerating changes
  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (user?.uid) {
      // Initialize page state properly on load/refresh
      initializePage();
    }
  }, [user?.uid]);

  // Check for profile data and recommendations availability
  useEffect(() => {
    const checkDataAvailability = async () => {
      if (!user?.uid) return;

      try {
        // Check for profile data
        const profileResponse = await fetch(`https://web-production-bb19.up.railway.app/profiles/status/${user.uid}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setHasProfileData(profileData.status === 'completed');
        }

        // Check for recommendations
        const recResponse = await fetch(`https://web-production-bb19.up.railway.app/recommendations/status/${user.uid}`);
        if (recResponse.ok) {
          const recData = await recResponse.json();
          setHasRealRecommendations(recData.status === 'completed' && recData.recommendation_count > 0);
        }
      } catch (error) {
        console.error('Error checking data availability:', error);
      }
    };

    checkDataAvailability();
  }, [user?.uid]);

  const initializePage = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // First, check generation status
      const status = await SchoolRecommendationsService.getGenerationStatus(user.uid);
      setGenerationStatus(status);
      
      const isCurrentlyGenerating = status.status === 'generating';
      
      // Set generation state immediately based on status
      if (isCurrentlyGenerating) {
        setIsGenerating(true);
        setStatusMessage('Generation in progress... This may take 1-2 minutes.');
        
        // Start polling for this ongoing generation
        startPolling();
      } else {
        setIsGenerating(false);
        
        // Set appropriate status message based on status
        if (status.status === 'completed') {
          setStatusMessage('Your personalized recommendations are ready!');
        } else if (status.status === 'failed') {
          setStatusMessage('Previous generation failed. You can try generating new recommendations.');
        } else {
          // not_found status - will be updated by loadRecommendations if needed
          setStatusMessage('No recommendations found. Generate your first set of personalized recommendations!');
        }
      }
      
      // Then load recommendations
      await loadRecommendationsWithoutStatusUpdate();
      
    } catch (error) {
      console.error('Error initializing page:', error);
      setIsGenerating(false);
      setStatusMessage('Unable to check generation status.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendationsWithoutStatusUpdate = async () => {
    try {
      const data = await SchoolRecommendationsService.getSchoolRecommendations(user?.uid);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Don't update status message here - let the generation status control it
    }
  };

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await SchoolRecommendationsService.getSchoolRecommendations(user?.uid);
      setRecommendations(data.recommendations);
      
      // Only update status message if we're not in a generating state
      // This prevents overwriting generation status messages
      if (!isGenerating && (!generationStatus || generationStatus.status !== 'generating')) {
        if (data.recommendations.length > 0 && user?.uid) {
          setStatusMessage('Showing your personalized recommendations');
        } else {
          setStatusMessage('Showing sample recommendations - generate yours for personalized matches');
        }
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Only show error message if not generating
      if (!isGenerating && (!generationStatus || generationStatus.status !== 'generating')) {
        setStatusMessage('Error loading recommendations, showing sample data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (!user?.uid) return;
    
    // Stop any existing polling before starting new one
    stopPolling();
    
    // Start polling for completion every 10 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updatedStatus = await SchoolRecommendationsService.getGenerationStatus(user.uid);
        setGenerationStatus(updatedStatus);
        
        if (updatedStatus.status === 'completed') {
          setIsGenerating(false);
          stopPolling();
          await loadRecommendations(); // Reload recommendations
          setStatusMessage('New recommendations generated successfully!');
        } else if (updatedStatus.status === 'failed') {
          setIsGenerating(false);
          stopPolling();
          // Check if the error indicates a timeout/deadlock
          const errorMessage = updatedStatus.error && updatedStatus.error.includes('deadlock detected') 
            ? 'Generation timed out after taking too long. Please try generating again.' 
            : 'Generation failed. Please try again.';
          setStatusMessage(errorMessage);
        } else if (updatedStatus.status === 'generating') {
          // Still generating - update message to show it's still working
          setStatusMessage('Still generating your personalized recommendations...');
        }
      } catch (error) {
        console.error('Error polling generation status:', error);
        setIsGenerating(false);
        stopPolling();
        setStatusMessage('Unable to check generation status. Please refresh to see if recommendations are ready.');
      }
    }, 10000);
    
    // Clear interval after 5 minutes to prevent infinite polling
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      if (isGeneratingRef.current) {
        setIsGenerating(false);
        setStatusMessage('Generation taking longer than expected. Please refresh the page to check status.');
      }
    }, 300000);
  };

  const checkGenerationStatus = async () => {
    if (!user?.uid) return;
    
    try {
      const status = await SchoolRecommendationsService.getGenerationStatus(user.uid);
      setGenerationStatus(status);
      
      if (status.status === 'generating') {
        // Set state immediately when we detect ongoing generation
        setIsGenerating(true);
        setStatusMessage('Generation in progress... This may take 1-2 minutes.');
        
        startPolling();
      } else if (status.status === 'completed') {
        setIsGenerating(false);
        setStatusMessage('Your personalized recommendations are ready!');
      } else if (status.status === 'failed') {
        setIsGenerating(false);
        // Check if the error indicates a timeout/deadlock
        const errorMessage = status.error && status.error.includes('deadlock detected') 
          ? 'Previous generation timed out. You can try generating new recommendations.' 
          : 'Previous generation failed. You can try generating new recommendations.';
        setStatusMessage(errorMessage);
      } else {
        // not_found status
        setIsGenerating(false);
        setStatusMessage('No recommendations found. Generate your first set of personalized recommendations!');
      }
    } catch (error) {
      console.error('Error checking generation status:', error);
      setIsGenerating(false);
      setStatusMessage('Unable to check generation status.');
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!user?.uid) return;
    
    try {
      setIsGenerating(true);
      const result = await SchoolRecommendationsService.generateRecommendations(user.uid);
      
      if (result.success) {
        setStatusMessage(result.message);
        checkGenerationStatus(); // Start polling for status
      } else {
        setStatusMessage(result.message);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setStatusMessage('Failed to start generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleFeedbackSubmit = (feedback: any) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.name === feedback.schoolName 
          ? { ...rec, userFeedback: feedback }
          : rec
      )
    );
    setFeedbackSubmitted(true);
  };

  const handleUpdateRecommendations = async () => {
    handleGenerateRecommendations();
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

  const getStatusIcon = () => {
    if (!generationStatus) return null;
    
    switch (generationStatus.status) {
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={{ name: user.displayName || user.email || '', email: user.email || '' }}
        hasProfileData={hasProfileData}
        hasRealRecommendations={hasRealRecommendations}
      />
      
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
          
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Star className="h-4 w-4" />
              Personalized for You
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Your College Matches
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Based on your profile responses, here are your personalized recommendations. 
                After researching these schools, you can provide feedback to help us refine and improve your matches.
              </p>
              
              {/* Status Message */}
              {statusMessage && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  {getStatusIcon()}
                  {statusMessage}
                </div>
              )}
              
              {/* Generate Button */}
              {!isGenerating && generationStatus?.status !== 'generating' && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleGenerateRecommendations}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {generationStatus?.status === 'not_found' 
                      ? 'Generate Your First Recommendations' 
                      : 'Generate New Recommendations'
                    }
                  </Button>
                </div>
              )}
              
              {/* Generation Status */}
              {(generationStatus?.status === 'generating' || isGenerating) && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                  <Clock className="h-4 w-4 animate-pulse" />
                  Generating your personalized recommendations... This may take 1-2 minutes.
                  <div className="ml-2 text-xs text-blue-600">
                    (Safe to refresh - generation will continue in background)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Update Recommendations Section */}
          {feedbackSubmitted && (
            <div className="flex justify-center mb-8">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Ready for Better Matches?</h3>
                        <p className="text-gray-600">Your feedback helps us find even better college recommendations for you</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleUpdateRecommendations}
                      disabled={isLoading || isGenerating}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3"
                    >
                      {isGenerating ? "Generating..." : "Get Updated Recommendations"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">{categorizedRecommendations.reach.length}</span>
                </div>
                <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Reach Schools</p>
                <p className="text-xs text-gray-600 mt-1">Competitive choices</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">{categorizedRecommendations.match.length}</span>
                </div>
                <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Match Schools</p>
                <p className="text-xs text-gray-600 mt-1">Strong fit options</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-green-600">{categorizedRecommendations.safety.length}</span>
                </div>
                <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Safety Schools</p>
                <p className="text-xs text-gray-600 mt-1">Reliable acceptances</p>
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
                    onFeedbackSubmit={handleFeedbackSubmit}
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
                    onFeedbackSubmit={handleFeedbackSubmit}
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
                    onFeedbackSubmit={handleFeedbackSubmit}
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
                    onFeedbackSubmit={handleFeedbackSubmit}
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