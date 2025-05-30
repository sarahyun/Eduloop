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
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'from-primary/5 to-primary/10 text-primary';
      case 'purple':
        return 'from-purple-50 to-purple-100 text-purple-600';
      case 'green':
        return 'from-green-50 to-green-100 text-green-600';
      case 'orange':
        return 'from-orange-50 to-orange-100 text-orange-600';
      default:
        return 'from-primary/5 to-primary/10 text-primary';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'purple':
        return 'text-purple-500';
      case 'green':
        return 'text-green-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-primary';
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
    <div className={`bg-gradient-to-r ${getColorClasses(color)} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className={`font-semibold ${getIconColor(color)}`}>{value}</span>
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
