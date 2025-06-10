import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, FileText, Sparkles, Clock, CheckCircle, Edit } from "lucide-react";
import { api, type User } from "@/lib/api";
import { questionsData, type Question, getSectionConfig } from '@/data/questionsData';
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from '@/lib/config';

interface FormResponse {
  response_id?: string;
  user_id: string;
  form_id: string;
  submitted_at?: string;
  responses: Array<{
    question_id: string;
    question_text: string;
    answer: string;
  }>;
}

export default function ProfileBuilder() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'form' | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(true);
  const [sectionProgress, setSectionProgress] = useState<Record<string, { answered: number; total: number }>>({});
  
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

  // Load completion status for all sections
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user?.uid) return;

      setIsLoadingCompletion(true);
      const completed = new Set<string>();
      const progress: Record<string, { answered: number; total: number }> = {};
      
      for (const sectionId of Object.keys(questionsData)) {
        const sectionFormId = sectionId.toLowerCase().replace(/\s+/g, '_');
        const sectionQuestions = questionsData[sectionId as keyof typeof questionsData] as Question[];
        const sectionConfig = getSectionConfig(sectionId);
        
        progress[sectionId] = { answered: 0, total: sectionQuestions.length };
        
        try {
          const response = await fetch(`${API_BASE_URL}/responses/${user.uid}/${sectionFormId}`);
          if (response.ok) {
            const data: FormResponse = await response.json();
            
            // Check completion based on section configuration
            if (data.responses && data.responses.length > 0) {
              const answeredQuestionIds = new Set(data.responses.map(r => r.question_id));
              const allQuestionIds = sectionQuestions.map(q => q.id.toString());
              
              // Count questions with non-empty answers
              const answeredCount = allQuestionIds.filter(questionId => {
                const response = data.responses.find(r => r.question_id === questionId);
                return response && response.answer.trim().length > 0;
              }).length;
              
              progress[sectionId].answered = answeredCount;
              
              // Use section-specific completion threshold
              const completionThreshold = Math.ceil(allQuestionIds.length * sectionConfig.completionThreshold);
              if (answeredCount >= completionThreshold) {
                completed.add(sectionId);
              }
            }
          } else if (sectionConfig.isOptional) {
            // Optional sections can be marked as complete even without responses
            // But we don't auto-complete them to preserve user choice
          }
        } catch (error) {
          console.error(`Error loading completion status for ${sectionId}:`, error);
        }
      }
      
      setCompletedSections(completed);
      setSectionProgress(progress);
      setIsLoadingCompletion(false);
    };

    loadCompletionStatus();
  }, [user?.uid]);
  
  // Convert questionsData to array format and check completion status
  const sections = Object.entries(questionsData).map(([sectionId, questions]) => {
    const isCompleted = completedSections.has(sectionId);
    
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
      "Introduction": "Tell us about yourself and your goals",
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
      // Navigate to chat-onboarding page with section parameter
      const sectionName = targetSection?.id || 'Introduction';
      window.location.href = `/chat-onboarding?section=${encodeURIComponent(sectionName)}`;
    } else {
      // Navigate to form with specific section
      const sectionName = targetSection?.id || 'Introduction';
      window.location.href = `/section-form?section=${encodeURIComponent(sectionName)}`;
    }
  };

  // Calculate completion percentage based on required sections only
  const requiredSections = Object.keys(questionsData).filter(sectionId => !getSectionConfig(sectionId).isOptional);
  const completedRequiredSections = requiredSections.filter(sectionId => completedSections.has(sectionId));
  const profileCompletion = requiredSections.length > 0 
    ? Math.round((completedRequiredSections.length / requiredSections.length) * 100)
    : 100;

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
              <span className="text-sm text-gray-500">
                {isLoadingCompletion ? 'Loading...' : `${profileCompletion}% complete`}
              </span>
            </div>
            <Progress value={isLoadingCompletion ? 0 : profileCompletion} className="mb-4" />
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {isLoadingCompletion ? 'Checking completion...' : `${completedRequiredSections.length} of ${requiredSections.length} required sections completed`}
              </span>
              <span>Required sections complete at 50% answered</span>
            </div>
            <p className="text-sm text-gray-600">
              Required sections are marked complete when you answer at least half of their questions. Optional sections can be completed anytime.
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
                      5-10 minutes per section
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
          
          {sections.map((section) => {
            const progress = sectionProgress[section.id] || { answered: 0, total: section.questions.length };
            const sectionConfig = getSectionConfig(section.id);
            const completionThreshold = Math.ceil(progress.total * sectionConfig.completionThreshold);
            
            return (
              <Card key={section.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        {sectionConfig.isOptional && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                        {section.completed && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {progress.answered} of {progress.total} questions answered
                          </span>
                          {section.completed ? (
                            <span className="text-green-600 font-medium">
                              ✓ Complete {sectionConfig.isOptional ? '(Optional)' : `(${Math.round(sectionConfig.completionThreshold * 100)}%+ answered)`}
                            </span>
                          ) : (
                            <span>
                              {sectionConfig.isOptional 
                                ? 'Optional - complete anytime'
                                : completionThreshold - progress.answered > 0
                                  ? `${completionThreshold - progress.answered} more needed to complete`
                                  : 'Ready to mark complete'
                              }
                            </span>
                          )}
                        </div>
                        <Progress 
                          value={progress.total > 0 ? (progress.answered / progress.total) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!section.completed && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMethodSelection('chat', section.id)}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat Mode
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMethodSelection('form', section.id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Form Mode
                        </Button>
                      </>
                    )}
                    {section.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMethodSelection('form', section.id)}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Responses
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}