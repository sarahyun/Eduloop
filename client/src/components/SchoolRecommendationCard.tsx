import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  BookOpen, 
  Users, 
  DollarSign,
  AlertTriangle,
  Lightbulb,
  PenTool,
  Check,
  MapPin
} from 'lucide-react';
import { SchoolRecommendation, SchoolRecommendationsService, SchoolFeedback } from '@/services/schoolRecommendationsService';

interface SchoolRecommendationCardProps {
  recommendation: SchoolRecommendation;
  className?: string;
  onFeedbackSubmit?: (feedback: SchoolFeedback) => void;
}

export function SchoolRecommendationCard({ recommendation, className = "", onFeedbackSubmit }: SchoolRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    interest: 'somewhat-interested' as 'very-interested' | 'somewhat-interested' | 'not-interested',
    rating: 3,
    feedback: '',
    specificConcerns: [] as string[],
    whatAttractsYou: [] as string[]
  });
  
  const fitScore = SchoolRecommendationsService.calculateFitScore(recommendation.fit);
  const typeColor = SchoolRecommendationsService.getTypeColor(recommendation.type);

  const getFitIcon = (fitLevel: string) => {
    switch (fitLevel) {
      case 'Great': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'Good': return <Star className="h-4 w-4 text-blue-500" />;
      case 'Fair': return <Star className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getFitColor = (fitLevel: string) => {
    switch (fitLevel) {
      case 'Great': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className={`group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50/30 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {recommendation.name}
              </CardTitle>
              <Badge className={`${typeColor} font-semibold px-4 py-2 text-sm rounded-full shadow-sm`}>
                {recommendation.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{fitScore}%</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overall Fit</span>
                  <div className="text-sm text-gray-700 font-medium">
                    {fitScore >= 80 ? 'Excellent Match' : fitScore >= 60 ? 'Good Match' : 'Moderate Match'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{recommendation.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getFitColor(recommendation.fit.academic)}`}>
                <BookOpen className="h-4 w-4" />
                <div>
                  <div className="text-xs font-medium opacity-75">Academic</div>
                  <div className="text-sm font-semibold">{recommendation.fit.academic}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getFitColor(recommendation.fit.social_cultural)}`}>
                <Users className="h-4 w-4" />
                <div>
                  <div className="text-xs font-medium opacity-75">Social/Cultural</div>
                  <div className="text-sm font-semibold">{recommendation.fit.social_cultural}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getFitColor(recommendation.fit.financial)}`}>
                <DollarSign className="h-4 w-4" />
                <div>
                  <div className="text-xs font-medium opacity-75">Financial</div>
                  <div className="text-sm font-semibold">{recommendation.fit.financial}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Overall Fit Rationale */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              Why This School Fits You
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {recommendation.overall_fit_rationale[0]}
            </p>
          </div>

          {/* Distinctive Opportunities Preview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Key Opportunities ({recommendation.distinctive_opportunities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.distinctive_opportunities.slice(0, 2).map((opportunity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {opportunity.title}
                </Badge>
              ))}
              {recommendation.distinctive_opportunities.length > 2 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{recommendation.distinctive_opportunities.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View Details
              </>
            )}
          </Button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              {/* Distinctive Opportunities */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Distinctive Opportunities
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {recommendation.distinctive_opportunities.map((opportunity, index) => (
                    <a
                      key={index}
                      href={opportunity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <span className="text-sm font-medium text-blue-900 group-hover:text-blue-700">
                        {opportunity.title}
                      </span>
                      <ExternalLink className="h-4 w-4 text-blue-600 group-hover:text-blue-500" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Potential Challenges */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Potential Challenges
                </h4>
                <div className="space-y-2">
                  {recommendation.potential_challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-orange-800">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essay Points */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-purple-500" />
                  "Why This School" Essay Points
                </h4>
                <div className="space-y-2">
                  {recommendation.why_school_essay_points.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-purple-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="border-t border-gray-100 pt-4 mt-6">
          {!showFeedback && !recommendation.userFeedback ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Share your thoughts</span> on this recommendation to improve future matches
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFeedback(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Give Feedback
              </Button>
            </div>
          ) : recommendation.userFeedback ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Your feedback submitted</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < recommendation.userFeedback!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{recommendation.userFeedback.feedback}</p>
            </div>
          ) : (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">How do you feel about {recommendation.name}?</h4>
              
              {/* Interest Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Interest Level</label>
                <div className="flex gap-2">
                  {[
                    { value: 'very-interested', label: 'Very Interested', color: 'green' },
                    { value: 'somewhat-interested', label: 'Somewhat Interested', color: 'yellow' },
                    { value: 'not-interested', label: 'Not Interested', color: 'red' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={feedbackData.interest === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFeedbackData(prev => ({ ...prev, interest: option.value as any }))}
                      className={`text-xs ${
                        feedbackData.interest === option.value 
                          ? option.color === 'green' ? 'bg-green-600' 
                            : option.color === 'yellow' ? 'bg-yellow-500' 
                            : 'bg-red-600'
                          : ''
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Overall Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating }))}
                      className="p-1"
                    >
                      <Star 
                        className={`h-5 w-5 ${rating <= feedbackData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Additional Comments</label>
                <textarea
                  value={feedbackData.feedback}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="What do you think about this recommendation? Any specific concerns or attractions?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    if (onFeedbackSubmit) {
                      onFeedbackSubmit({
                        schoolName: recommendation.name,
                        userId: 'current-user', // This would come from auth context
                        ...feedbackData,
                        submittedAt: new Date()
                      });
                    }
                    setShowFeedback(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Feedback
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFeedback(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}