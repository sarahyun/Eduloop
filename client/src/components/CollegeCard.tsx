import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Bookmark, BookmarkCheck } from "lucide-react";
import type { College } from "@/lib/api";

interface CollegeCardProps {
  college: College;
  matchScore?: number;
  reasoning?: string;
  category?: 'reach' | 'match' | 'safety';
  highlights?: string[];
  isSaved?: boolean;
  onSave?: (collegeId: number) => void;
  onRemove?: (collegeId: number) => void;
  onClick?: (college: College) => void;
}

export function CollegeCard({ 
  college, 
  matchScore, 
  reasoning, 
  category, 
  highlights = [],
  isSaved = false,
  onSave,
  onRemove,
  onClick 
}: CollegeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'reach': return 'bg-orange-100 text-orange-700';
      case 'match': return 'bg-success/10 text-success';
      case 'safety': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMatchScoreIcon = (score?: number) => {
    if (!score) return null;
    
    if (score >= 90) {
      return <CheckCircle className="w-4 h-4 mr-1" />;
    } else if (score >= 80) {
      return <Star className="w-4 h-4 mr-1" />;
    }
    return null;
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onRemove) {
      onRemove(college.id);
    } else if (!isSaved && onSave) {
      onSave(college.id);
    }
  };

  return (
    <div 
      className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(college)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={college.imageUrl || "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
            alt={`${college.name} campus`} 
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{college.name}</h3>
            <p className="text-sm text-gray-600">{college.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {matchScore && (
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
              {getMatchScoreIcon(matchScore)}
              {matchScore}% Match
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className="p-1"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400 hover:text-primary" />
            )}
          </Button>
        </div>
      </div>

      {reasoning && (
        <p className="text-sm text-gray-600 mb-3">{reasoning}</p>
      )}

      {college.description && !reasoning && (
        <p className="text-sm text-gray-600 mb-3">{college.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {highlights.length > 0 ? (
            highlights.slice(0, 3).map((highlight, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {highlight}
              </Badge>
            ))
          ) : (
            college.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary hover:text-primary-dark text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(college);
          }}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
