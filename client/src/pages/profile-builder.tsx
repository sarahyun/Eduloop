import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, FileText, Sparkles, Clock, CheckCircle, Edit, RefreshCw } from "lucide-react";
import { api, type User } from "@/lib/api";
import { questionsData, type Question } from '@/data/questionsData';
import { useAuth } from "@/context/AuthContext";

export default function ProfileBuilder() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'form' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h2>
          <Button onClick={() => window.location.href = '/'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Create a mock user ID for API calls (since backend expects number but Firebase uses string)
  const mockUserId = 1; // This is a temporary solution until backend is updated to handle string UIDs
  
  // Load profile data to determine completion status
  const { data: profileData } = useQuery({
    queryKey: ['/api/profile', mockUserId],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${mockUserId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });
  
  // Convert questionsData to array format and check completion status
  const sections = Object.entries(questionsData).map(([sectionId, questions]) => {
    const isCompleted = profileData && questions.some((q: Question) => 
      profileData.responses && profileData.responses[q.id.toString()]
    );
    
    return {
      id: sectionId,
      title: sectionId,
      description: getDescriptionForSection(sectionId),
      questions: questions as Question[],
      completed: isCompleted
    };
  });

  // Helper function to get description for each section
  function getDescriptionForSection(sectionId: string): string {
    const descriptions: Record<string, string> = {
      "Academic Information": "Your academic interests and performance", 
      "Extracurriculars and Interests": "Your activities and passions outside the classroom",
      "Personal Reflections": "Deeper insights into who you are",
      "College Preferences": "What you're looking for in your college experience"
    };
    return descriptions[sectionId] || "Complete this section";
  }

  // Find first incomplete section
  const getFirstIncompleteSection = () => {
    return sections.find(section => !section.completed);
  };

  // Handle navigation to specific method
  const handleMethodSelection = (method: 'chat' | 'form', sectionId?: string) => {
    const targetSection = sectionId ? sections.find(s => s.id === sectionId) : getFirstIncompleteSection();
    
    if (method === 'chat') {
      // Navigate to main chat page
      window.location.href = '/chat';
    } else {
      // Navigate to form with specific section
      const sectionName = targetSection?.id || 'Academic Information';
      window.location.href = `/section-form?section=${encodeURIComponent(sectionName)}`;
    }
  };

  // Calculate completion percentage based on actual completed sections
  const completedSections = sections.filter(section => section.completed).length;
  const profileCompletion = Math.round((completedSections / sections.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || 'User', email: user.email || '' }} />
      
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-600 hover:text-blue-600"
                          onClick={() => handleMethodSelection('chat', section.id)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-600 hover:text-blue-600"
                          onClick={() => handleMethodSelection('form', section.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Form
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