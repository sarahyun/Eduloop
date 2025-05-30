import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, FileText, Sparkles, Clock, CheckCircle, Edit, RefreshCw } from "lucide-react";
import { api, type User } from "@/lib/api";

export default function ProfileBuilder() {
  const [user] = useState<User>({ id: 1, username: "sarah", email: "sarah@example.com", fullName: "Sarah Johnson" });
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'form' | null>(null);
  
  // Dynamic sections with completion tracking - all offer both methods
  const sections = [
    { id: 'Academic Information', title: 'Academic Information', completed: false, method: 'both', description: 'Favorite classes, subjects, academic interests', lastUpdated: '2 days ago' },
    { id: 'Extracurriculars and Interests', title: 'Extracurriculars and Interests', completed: false, method: 'both', description: 'What you\'re proud of, fields to explore, free time activities', lastUpdated: 'Not started' },
    { id: 'Personal Reflections', title: 'Personal Reflections', completed: false, method: 'both', description: 'What makes you happy, challenges overcome, values', lastUpdated: 'Not started' },
    { id: 'College Preferences', title: 'College Preferences', completed: false, method: 'both', description: 'College experience, school size, location preferences', lastUpdated: 'Not started' },
  ];

  // Find first incomplete section
  const getFirstIncompleteSection = () => {
    return sections.find(section => !section.completed);
  };

  // Handle navigation to specific method
  const handleMethodSelection = (method: 'chat' | 'form', sectionId?: string) => {
    const targetSection = sectionId ? sections.find(s => s.id === sectionId) : getFirstIncompleteSection();
    
    if (method === 'chat') {
      // Navigate to chat onboarding with specific section
      window.location.href = `/chat-onboarding?section=${targetSection?.id || 'interests'}`;
    } else {
      // Navigate to form with specific section
      window.location.href = `/section-form?section=${targetSection?.id || 'Academic Information'}`;
    }
  };

  // Calculate completion percentage based on actual completed sections
  const completedSections = sections.filter(section => section.completed).length;
  const profileCompletion = Math.round((completedSections / sections.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Build Your Profile</h1>
          <p className="text-gray-600 mb-4">
            The more we learn about you, the better we can find colleges that truly fit your personality and goals, 
            provide personalized guidance, and help you discover hidden gems you might not have considered.
          </p>
          
          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Profile Completion</h3>
              <span className="text-sm text-gray-500">{profileCompletion}% complete</span>
            </div>
            <Progress value={profileCompletion} className="mb-4" />
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{completedSections} of {sections.length} sections completed</span>
              <span>You can always update your answers later</span>
            </div>
            <p className="text-sm text-gray-600">
              Complete your profile to unlock personalized recommendations and better college matches.
            </p>
          </div>
        </div>

        {/* Method Selection */}
        {!selectedMethod && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Approach</h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Chat Option */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <CardContent className="p-6" onClick={() => setSelectedMethod('chat')}>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Chat with AI</h3>
                      <p className="text-sm text-gray-500">Conversational & Natural</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Feels like talking to a counselor
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      AI asks smart follow-up questions
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Uncovers insights you might not think of
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      5-10 minutes per session
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleMethodSelection('chat')}
                  >
                    Start Chatting
                  </Button>
                </CardContent>
              </Card>

              {/* Form Option */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200">
                <CardContent className="p-6" onClick={() => setSelectedMethod('form')}>
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick Forms</h3>
                      <p className="text-sm text-gray-500">Structured & Efficient</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Fill out at your own pace
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Clear, organized sections
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Save and return anytime
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      2-3 minutes per section
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleMethodSelection('form')}
                  >
                    Start Forms
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-2">Can't decide?</p>
              <Button variant="outline" onClick={() => handleMethodSelection('chat')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Try Both - Start with Chat
              </Button>
            </div>
          </div>
        )}

        {/* Profile Sections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Sections</h2>
          
          {sections.map((section) => (
            <Card key={section.id} className={`${section.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${section.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {section.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${section.completed ? 'text-green-900' : 'text-gray-900'}`}>
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Actions for incomplete sections */}
                    {!section.completed && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMethodSelection('chat', section.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMethodSelection('form', section.id)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Form
                        </Button>
                      </>
                    )}
                    
                    {/* Actions for completed sections - allow updates */}
                    {section.completed && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Updated {section.lastUpdated}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-600 hover:text-blue-600"
                          onClick={() => handleMethodSelection('chat', section.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </div>
  );
}