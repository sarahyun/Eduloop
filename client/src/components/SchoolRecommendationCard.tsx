import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  PenTool
} from 'lucide-react';
import { SchoolRecommendation, SchoolRecommendationsService } from '@/services/schoolRecommendationsService';

interface SchoolRecommendationCardProps {
  recommendation: SchoolRecommendation;
  className?: string;
}

export function SchoolRecommendationCard({ recommendation, className = "" }: SchoolRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl font-bold text-gray-900">
                {recommendation.name}
              </CardTitle>
              <Badge className={`${typeColor} font-medium px-3 py-1`}>
                {recommendation.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Overall Fit:</span>
                <div className="flex items-center gap-1">
                  <Progress value={fitScore} className="w-16 h-2" />
                  <span className="text-sm font-semibold text-gray-700">{fitScore}%</span>
                </div>
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
      </CardContent>
    </Card>
  );
}