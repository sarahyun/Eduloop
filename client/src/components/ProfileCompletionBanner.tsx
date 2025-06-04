import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, ArrowRight, CheckCircle, Clock } from 'lucide-react';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  isFullyComplete: boolean;
  className?: string;
}

export function ProfileCompletionBanner({ 
  completionPercentage, 
  isFullyComplete, 
  className = "" 
}: ProfileCompletionBannerProps) {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProfile = () => {
    setIsGenerating(true);
    setLocation('/profile-generation');
  };

  if (!isFullyComplete && completionPercentage < 85) {
    return null; // Don't show banner until nearly complete
  }

  return (
    <Card className={`border-2 ${isFullyComplete ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isFullyComplete ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isFullyComplete ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {isFullyComplete ? 'Profile Builder Complete!' : 'Almost Ready!'}
                </h3>
                <Badge variant={isFullyComplete ? 'default' : 'secondary'} className={
                  isFullyComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }>
                  {completionPercentage}% Complete
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                {isFullyComplete 
                  ? 'Your responses are ready to be transformed into a personalized college profile.'
                  : `Complete ${100 - completionPercentage}% more to unlock AI-powered profile generation.`
                }
              </p>
            </div>
          </div>
          
          {isFullyComplete && (
            <Button 
              onClick={handleGenerateProfile}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate My Profile
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
        
        {isFullyComplete && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Academic Profile
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Personal Background
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Future Goals
                </span>
              </div>
              <span className="text-green-600 font-medium">Ready for AI Analysis</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}