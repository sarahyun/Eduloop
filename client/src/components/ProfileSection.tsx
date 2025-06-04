import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  BookOpen, 
  Trophy, 
  Heart, 
  Target, 
  GraduationCap,
  Star,
  Lightbulb,
  Calendar,
  Award
} from 'lucide-react';

export interface ProfileSectionData {
  section_id: string;
  title: string;
  type: 'paragraph' | 'bullets' | 'key_value' | 'timeline' | 'table';
  content: string | string[] | Record<string, any>[] | Record<string, string>;
}

interface ProfileSectionProps {
  section: ProfileSectionData;
  className?: string;
}

const getSectionIcon = (sectionId: string) => {
  const icons: Record<string, JSX.Element> = {
    core_snapshot: <User className="w-5 h-5" />,
    academic_profile: <BookOpen className="w-5 h-5" />,
    intellectual_interests: <Lightbulb className="w-5 h-5" />,
    extracurriculars: <Trophy className="w-5 h-5" />,
    core_values_and_drives: <Heart className="w-5 h-5" />,
    hidden_strengths: <Star className="w-5 h-5" />,
    college_fit: <GraduationCap className="w-5 h-5" />,
    future_direction: <Target className="w-5 h-5" />,
    final_insight: <Award className="w-5 h-5" />,
  };
  return icons[sectionId] || <Star className="w-5 h-5" />;
};

const renderBulletItem = (item: string, index: number) => {
  // Clean up the item by removing markdown-style formatting and extracting emoji + title
  const cleanItem = item.replace(/\*\*(.*?)\*\*/g, '$1');
  const emojiMatch = cleanItem.match(/^([\u{1F300}-\u{1F9FF}]|\u{2600}-\u{26FF}|\u{2700}-\u{27BF})\s*/u);
  const emoji = emojiMatch ? emojiMatch[0].trim() : null;
  const textContent = emoji ? cleanItem.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '') : cleanItem;
  
  // Extract title (text before first dash or colon) and description
  let titleMatch = textContent.match(/^([^:]+):\s*(.*)$/);
  if (!titleMatch) {
    titleMatch = textContent.match(/^([^–]+)–\s*(.*)$/);
  }
  if (!titleMatch) {
    titleMatch = textContent.match(/^([^—]+)—\s*(.*)$/);
  }
  if (!titleMatch) {
    titleMatch = textContent.match(/^([^-]+)-\s*(.*)$/);
  }
  const title = titleMatch ? titleMatch[1].trim() : '';
  const description = titleMatch ? titleMatch[2].trim() : textContent;
  
  return (
    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100">
      {emoji && (
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border">
          {emoji}
        </div>
      )}
      {!emoji && (
        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-gray-900 mb-2 text-base">{title}</h4>
        )}
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const renderContent = (section: ProfileSectionData) => {
  switch (section.type) {
    case 'paragraph':
      return (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-base">
            {section.content as string}
          </p>
        </div>
      );
    
    case 'bullets':
      return (
        <div className="space-y-3">
          {(section.content as string[]).map((item, index) => renderBulletItem(item, index))}
        </div>
      );
    
    case 'table':
      return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(section.content as Record<string, string>).map(([key, value], index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap w-1/3">
                    <div className="font-semibold text-gray-900">{key}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 leading-relaxed">{value}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    case 'key_value':
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {(section.content as Record<string, any>[]).map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">{item.key}</h4>
              <p className="text-gray-700 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      );
    
    case 'timeline':
      return (
        <div className="space-y-4">
          {(section.content as Record<string, any>[]).map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{item.timeframe}</p>
                <p className="text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return <p className="text-gray-700">{section.content as string}</p>;
  }
};

export function ProfileSection({ section, className = "" }: ProfileSectionProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            {getSectionIcon(section.section_id)}
          </div>
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent(section)}
      </CardContent>
    </Card>
  );
}