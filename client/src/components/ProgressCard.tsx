import { Progress } from "@/components/ui/progress";
import { Calendar, MessageCircle, Bookmark, Clock } from "lucide-react";

interface ProgressCardProps {
  title: string;
  value: number | string;
  description: string;
  type: 'progress' | 'count' | 'status';
  icon?: 'calendar' | 'message' | 'bookmark' | 'clock';
  color?: 'primary' | 'purple' | 'green' | 'orange';
  progressValue?: number;
}

export function ProgressCard({ 
  title, 
  value, 
  description, 
  type, 
  icon, 
  color = 'primary',
  progressValue 
}: ProgressCardProps) {
  const getCardStyles = (completion: number) => {
    if (completion >= 100) {
      return 'from-emerald-50 to-emerald-100 text-emerald-600';
    } else {
      return 'from-gray-50 to-gray-100 text-gray-600';
    }
  };

  const getProgressColor = (completion: number) => {
    if (completion >= 100) {
      return 'text-emerald-500';
    } else {
      return 'text-gray-500';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-emerald-500';
      case 'purple':
        return 'text-emerald-500';
      case 'green':
        return 'text-emerald-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-emerald-500';
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar className={`w-4 h-4 mr-2 ${getIconColor(color)}`} />;
      case 'message':
        return <MessageCircle className={`w-4 h-4 mr-2 ${getIconColor(color)}`} />;
      case 'bookmark':
        return <Bookmark className={`w-4 h-4 mr-2 ${getIconColor(color)}`} />;
      case 'clock':
        return <Clock className={`w-4 h-4 mr-2 ${getIconColor(color)}`} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getCardStyles(progressValue || 0)} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className={`font-semibold ${getProgressColor(progressValue || 0)}`}>{value}</span>
      </div>
      
      {type === 'progress' && typeof progressValue === 'number' && (
        <div className="w-full mb-3">
          <Progress value={progressValue} className="h-2" />
        </div>
      )}
      
      {icon && (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          {getIcon()}
          <span className="text-sm text-gray-600">{description.split(':')[0]}</span>
        </div>
      )}
      
      <p className="text-sm text-gray-600">
        {icon ? description.split(':').slice(1).join(':').trim() : description}
      </p>
    </div>
  );
}
