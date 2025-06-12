import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Target, Users, BookOpen } from 'lucide-react';

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionUrl: string;
  icon: React.ComponentType<any>;
  completed?: boolean;
}

interface GuidanceHelperProps {
  currentStep?: string;
  className?: string;
}

export function GuidanceHelper({ currentStep, className = "" }: GuidanceHelperProps) {
  const guidanceSteps: GuidanceStep[] = [
    {
      id: 'onboarding',
      title: 'Complete Introduction',
      description: 'Share your interests and goals to get personalized recommendations',
      actionText: 'Start Introduction',
      actionUrl: '/onboarding',
      icon: Lightbulb,
      completed: false
    },
    {
      id: 'profile',
      title: 'Build Your Profile',
      description: 'Complete detailed sections about academics, activities, and preferences',
      actionText: 'Build Profile',
      actionUrl: '/profile',
      icon: Users,
      completed: false
    },
    {
      id: 'recommendations',
      title: 'Get College Matches',
      description: 'Generate AI-powered recommendations based on your profile',
      actionText: 'View Matches',
      actionUrl: '/college-recommendations',
      icon: Target,
      completed: false
    },
    {
      id: 'chat',
      title: 'Get Guidance',
      description: 'Chat with our AI mentor for personalized college counseling',
      actionText: 'Start Chat',
      actionUrl: '/chat',
      icon: BookOpen,
      completed: false
    }
  ];

  const currentStepIndex = guidanceSteps.findIndex(step => step.id === currentStep);
  const nextStep = currentStepIndex >= 0 ? guidanceSteps[currentStepIndex + 1] : guidanceSteps[0];

  if (!nextStep) return null;

  const Icon = nextStep.icon;

  return (
    <Card className={`border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Next: {nextStep.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {nextStep.description}
            </p>
            <Button 
              onClick={() => window.location.href = nextStep.actionUrl}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="sm"
            >
              {nextStep.actionText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressTrackerProps {
  completedSteps: string[];
  className?: string;
}

export function ProgressTracker({ completedSteps, className = "" }: ProgressTrackerProps) {
  const allSteps = [
    { id: 'onboarding', name: 'Introduction', required: true },
    { id: 'profile-basic', name: 'Basic Info', required: true },
    { id: 'profile-academic', name: 'Academics', required: true },
    { id: 'profile-activities', name: 'Activities', required: false },
    { id: 'profile-preferences', name: 'Preferences', required: true },
    { id: 'recommendations', name: 'Get Matches', required: false }
  ];

  const completedCount = allSteps.filter(step => completedSteps.includes(step.id)).length;
  const requiredCount = allSteps.filter(step => step.required).length;
  const requiredCompleted = allSteps.filter(step => step.required && completedSteps.includes(step.id)).length;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Your Progress</h4>
          <span className="text-xs text-gray-500">
            {completedCount}/{allSteps.length} completed
          </span>
        </div>
        
        <div className="space-y-2">
          {allSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = !isCompleted && completedSteps.includes(allSteps[index - 1]?.id || 'start');
            
            return (
              <div key={step.id} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                }`} />
                <span className={`text-xs ${
                  isCompleted 
                    ? 'text-green-700 font-medium' 
                    : isActive 
                      ? 'text-blue-700 font-medium' 
                      : 'text-gray-500'
                }`}>
                  {step.name}
                  {step.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            );
          })}
        </div>
        
        {requiredCompleted === requiredCount && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-green-600 font-medium">
              ✓ Ready for college recommendations!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}