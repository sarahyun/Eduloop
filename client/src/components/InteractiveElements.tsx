import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { ChevronRight, Sparkles, Heart, Brain, Target } from "lucide-react";

interface InterestBubbleProps {
  interests: string[];
  selectedInterests: string[];
  onToggle: (interest: string) => void;
  onCustomAdd: (interest: string) => void;
}

export function InterestBubbles({ interests, selectedInterests, onToggle, onCustomAdd }: InterestBubbleProps) {
  const [customInterest, setCustomInterest] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      onCustomAdd(customInterest.trim());
      setCustomInterest("");
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Badge
            key={interest}
            variant={selectedInterests.includes(interest) ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedInterests.includes(interest) 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10"
            }`}
            onClick={() => onToggle(interest)}
          >
            {interest}
          </Badge>
        ))}
        
        <Badge
          variant="outline"
          className="cursor-pointer border-dashed hover:bg-primary/10"
          onClick={() => setShowCustom(true)}
        >
          + Add your own
        </Badge>
      </div>

      {showCustom && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="What interests you?"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
          />
          <Button size="sm" onClick={addCustomInterest}>Add</Button>
        </div>
      )}
    </div>
  );
}

interface StoryPromptProps {
  prompt: string;
  examples: string[];
  value: string;
  onChange: (value: string) => void;
}

export function StoryPrompt({ prompt, examples, value, onChange }: StoryPromptProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">{prompt}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedExample === example ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setSelectedExample(example);
              onChange(example);
            }}
          >
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">{example}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Or write your own story:</p>
        <Textarea
          value={selectedExample === value ? "" : value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedExample(null);
          }}
          placeholder="Share your unique perspective..."
          className="min-h-24"
        />
      </div>
    </div>
  );
}

interface ProgressMilestoneProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressMilestone({ currentStep, totalSteps, stepTitles }: ProgressMilestoneProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-primary font-medium">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Milestone markers */}
        <div className="flex justify-between mt-2">
          {stepTitles.slice(0, 5).map((title, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                index <= currentStep ? "bg-primary" : "bg-gray-300"
              }`} />
              <span className="text-xs text-gray-500 mt-1 max-w-16 text-center">
                {title.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PersonalityInsightProps {
  responses: Record<string, string>;
  currentStep: number;
}

export function PersonalityInsight({ responses, currentStep }: PersonalityInsightProps) {
  if (currentStep < 2) return null;

  const insights = [];
  
  if (responses.careerMajor) {
    if (responses.careerMajor.toLowerCase().includes('medicine') || responses.careerMajor.toLowerCase().includes('doctor')) {
      insights.push({ icon: Heart, text: "You have a caring nature and interest in helping others", color: "text-red-500" });
    }
    if (responses.careerMajor.toLowerCase().includes('engineer') || responses.careerMajor.toLowerCase().includes('tech')) {
      insights.push({ icon: Brain, text: "You enjoy problem-solving and technical challenges", color: "text-blue-500" });
    }
    if (responses.careerMajor.toLowerCase().includes('art') || responses.careerMajor.toLowerCase().includes('design')) {
      insights.push({ icon: Sparkles, text: "You have a creative and expressive personality", color: "text-blue-500" });
    }
  }

  if (responses.dreamSchools && responses.dreamSchools.toLowerCase().includes('ivy')) {
    insights.push({ icon: Target, text: "You're ambitious and driven to achieve excellence", color: "text-green-500" });
  }

  if (insights.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-none">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-800">What we're learning about you</span>
        </div>
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${insight.color}`} />
                <span className="text-sm text-gray-700">{insight.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}