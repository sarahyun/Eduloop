import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Brain, Sparkles, User, FileText, ArrowRight, AlertCircle } from 'lucide-react';

interface ProfileGenerationProps {
  userId?: string;
}

interface GenerationStatus {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  error?: string;
  generation_id: string;
}

export function ProfileGeneration(userId: string) {
  const [, setLocation] = useLocation();
  const [generationStep, setGenerationStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generationSteps = [
    { label: "Analyzing your responses", icon: Brain, description: "Processing your answers across all sections" },
    { label: "Identifying key patterns", icon: Sparkles, description: "Finding your unique strengths and interests" },
    { label: "Creating your profile", icon: User, description: "Building your personalized college readiness summary" },
    { label: "Finalizing insights", icon: FileText, description: "Generating actionable recommendations" }
  ];

  // Check for existing profile generation on component mount
  useEffect(() => {
    checkExistingGeneration();
  }, [userId]);

  // Poll for status updates when generating
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (isGenerating && generationStatus?.status === 'generating') {
      pollInterval = setInterval(async () => {
        await checkGenerationStatus();
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isGenerating, generationStatus?.status]);

  // Update UI steps based on generation progress
  useEffect(() => {
    if (isGenerating && generationStep < generationSteps.length) {
      const timer = setTimeout(() => {
        setGenerationStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (generationStep >= generationSteps.length && generationStatus?.status === 'completed') {
      setGenerationComplete(true);
      setIsGenerating(false);
    }
  }, [isGenerating, generationStep, generationStatus?.status]);

  const checkExistingGeneration = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}/status`);
      if (response.ok) {
        const status = await response.json();
        if (status) {
          setGenerationStatus(status);
          if (status.status === 'generating') {
            setIsGenerating(true);
            setGenerationStep(1);
          } else if (status.status === 'completed') {
            setGenerationComplete(true);
            setGenerationStep(generationSteps.length);
          } else if (status.status === 'failed') {
            setError(status.error || 'Profile generation failed');
          }
        }
      }
    } catch (err) {
      console.error('Failed to check existing generation:', err);
    }
  };

  const checkGenerationStatus = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}/status`);
      if (response.ok) {
        const status = await response.json();
        setGenerationStatus(status);
        
        if (status.status === 'completed') {
          setGenerationComplete(true);
          setIsGenerating(false);
          setGenerationStep(generationSteps.length);
        } else if (status.status === 'failed') {
          setError(status.error || 'Profile generation failed');
          setIsGenerating(false);
        }
      }
    } catch (err) {
      console.error('Failed to check generation status:', err);
      setError('Failed to check generation status');
      setIsGenerating(false);
    }
  };

  const startGeneration = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      setGenerationStep(0);
      setGenerationComplete(false);
      
      // Start profile generation with user_id as query parameter
      const response = await fetch(`http://127.0.0.1:8000/profile?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setGenerationStatus(result);
        console.log('Profile generation started:', result);
      } else {
        throw new Error('Failed to start profile generation');
      }
    } catch (err) {
      console.error('Failed to start generation:', err);
      setError('Failed to start profile generation');
      setIsGenerating(false);
    }
  };

  const viewProfile = () => {
    setLocation('/student-profile-view');
  };

  const progress = ((generationStep) / generationSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Profile Generation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your responses are ready to be transformed into a comprehensive college readiness profile.
          </p>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Generation Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <Button 
                onClick={startGeneration} 
                className="mt-4 bg-red-600 hover:bg-red-700"
                disabled={isGenerating}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Profile Builder Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Academic</div>
                <div className="text-sm text-gray-600">8 sections completed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Personal</div>
                <div className="text-sm text-gray-600">6 sections completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Goals</div>
                <div className="text-sm text-gray-600">4 sections completed</div>
              </div>
            </div>
            
            {!isGenerating && !generationComplete && !error && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ready to generate your personalized profile using AI analysis of your responses.
                </p>
                <Button onClick={startGeneration} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Brain className="mr-2 h-5 w-5" />
                  Generate My Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {(isGenerating || generationComplete) && !error && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-blue-500" />
                AI Profile Generation
                {generationStatus && (
                  <span className="text-sm font-normal text-gray-500">
                    Status: {generationStatus.status}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={progress} className="h-3" />
                <div className="text-center mt-2 text-sm text-gray-600">
                  {generationComplete ? 'Complete!' : `${Math.round(progress)}% complete`}
                </div>
              </div>

              <div className="space-y-4">
                {generationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === generationStep - 1 && isGenerating;
                  const isComplete = index < generationStep || generationComplete;
                  const isPending = index >= generationStep && !generationComplete;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : isComplete
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-100 text-blue-600 animate-pulse'
                            : isComplete
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{step.label}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {generationComplete && (
                <div className="mt-8 text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Your Profile is Ready!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your personalized college readiness profile has been generated with insights and recommendations.
                    </p>
                  </div>
                  <Button onClick={viewProfile} size="lg" className="bg-green-600 hover:bg-green-700">
                    View My Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isGenerating && !generationComplete && !error && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <p className="text-blue-700 text-sm">
                Our AI will analyze your responses to create a comprehensive profile highlighting your strengths, 
                growth areas, and personalized college recommendations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}