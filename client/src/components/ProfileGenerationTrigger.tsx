import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle, ArrowRight, Clock } from 'lucide-react';

interface ProfileGenerationTriggerProps {
  sectionId: string;
  sectionTitle: string;
  isComplete: boolean;
  overallCompletion: number;
  totalSections: number;
  completedSections: number;
}

export function ProfileGenerationTrigger({ 
  sectionId, 
  sectionTitle, 
  isComplete, 
  overallCompletion,
  totalSections,
  completedSections 
}: ProfileGenerationTriggerProps) {
  const [, setLocation] = useLocation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const isFullyComplete = overallCompletion >= 100;
  const isNearComplete = overallCompletion >= 85;

  useEffect(() => {
    if (isComplete && !justCompleted) {
      setJustCompleted(true);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, justCompleted]);

  const handleGenerateProfile = () => {
    setLocation('/profile-generation');
  };

  const handleContinueBuilding = () => {
    setLocation('/profile-builder');
  };

  if (!isComplete && !isNearComplete) {
    return null;
  }

  return (
    <Card className={`mt-6 border-2 transition-all duration-300 ${
      showCelebration 
        ? 'border-green-400 bg-green-50 shadow-lg scale-105' 
        : isFullyComplete 
          ? 'border-green-200 bg-green-50' 
          : 'border-blue-200 bg-blue-50'
    }`}>
      <CardContent className="p-6">
        {showCelebration && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3 animate-bounce">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              Great job completing "{sectionTitle}"!
            </h3>
            <p className="text-green-700 text-sm">
              You're {completedSections} of {totalSections} sections complete
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isFullyComplete ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isFullyComplete ? (
                <Brain className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {isFullyComplete 
                    ? 'Ready for AI Profile Generation!' 
                    : `${100 - overallCompletion}% away from AI profile generation`
                  }
                </h3>
                <Badge variant={isFullyComplete ? 'default' : 'secondary'} className={
                  isFullyComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }>
                  {overallCompletion}% Complete
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                {isFullyComplete 
                  ? 'Transform your responses into a comprehensive college readiness profile'
                  : `Complete ${totalSections - completedSections} more sections to unlock AI analysis`
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isFullyComplete && (
              <Button 
                onClick={handleContinueBuilding}
                variant="outline"
                size="sm"
              >
                Continue Building
              </Button>
            )}
            
            {isFullyComplete && (
              <Button 
                onClick={handleGenerateProfile}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              >
                <Brain className="mr-2 h-4 w-4" />
                Generate Profile
                <Sparkles className="ml-2 h-4 w-4" />
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {isFullyComplete && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-700 mb-2">
                Your responses will be analyzed to create insights about:
              </p>
              <div className="flex justify-center gap-6 text-xs text-green-600">
                <span>Academic Strengths</span>
                <span>Growth Areas</span>
                <span>College Fit</span>
                <span>Personalized Recommendations</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}