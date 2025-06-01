import { useEffect, useState } from "react";
import { AIChat } from "@/components/AIChat";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { questionsData } from "@/data/questionsData";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ChatOnboarding() {
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  const sectionQuestions = section ? questionsData[section] : [];
  const [responses, setResponses] = useState<{ [id: string]: string }>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);

  // Fetch existing responses on mount
  useEffect(() => {
    async function fetchResponses() {
      if (user && section) {
        const formId = section.toLowerCase().replace(/\s+/g, '_');
        const existing = await api.getFormResponses(user.uid, formId);
        console.log("existing", existing);
        if (existing && existing.responses) {
          const respObj: { [id: string]: string } = {};
          for (const r of existing.responses) {
            respObj[r.question_id] = r.answer;
          }
          setResponses(respObj);
        }
        setResponsesLoaded(true); // Mark responses as loaded
      }
    }
    fetchResponses();
  }, [user, section]);

  // On first load, send intro/context to AI - ONLY after responses are loaded
  useEffect(() => {
    console.log("section", section);
    console.log("sectionQuestions", sectionQuestions);
    console.log("responses", responses);
    console.log("responsesLoaded", responsesLoaded);
    
    if (!initialized && section && sectionQuestions.length > 0 && responsesLoaded) {
      // Find the first unanswered question
      const firstUnanswered = sectionQuestions.find((q: any) => !responses[q.id]);
      const answeredCount = Object.keys(responses).length;
      const completionThreshold = Math.ceil(sectionQuestions.length * 0.5);
      const isComplete = answeredCount >= completionThreshold;
      
      console.log("firstUnanswered", firstUnanswered);
      console.log("isComplete", isComplete, "answeredCount", answeredCount, "threshold", completionThreshold);
      
      let initialMessage = "";
      if (isComplete && !firstUnanswered) {
        initialMessage = "Excellent! You've completed this section. All questions have been answered. Feel free to review or update any of your responses.";
      } else if (isComplete) {
        initialMessage = `Great progress! This section is already marked as complete since you've answered ${answeredCount} out of ${sectionQuestions.length} questions. Would you like to continue with the remaining questions or review your existing answers?`;
      } else if (firstUnanswered) {
        initialMessage = firstUnanswered.question;
      } else {
        initialMessage = "Let's work on completing this section together!";
      }
      
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: initialMessage,
          createdAt: new Date().toISOString(),
        },
      ]);
      setInitialized(true);
    }
  }, [section, sectionQuestions, initialized, responses, responsesLoaded]);

  // Helper to build OpenAI context prompt with function calling
  function buildContextPrompt(userMessage: string) {
    const answeredCount = Object.keys(responses).length;
    const completionThreshold = Math.ceil(sectionQuestions.length * 0.5);
    const isComplete = answeredCount >= completionThreshold;
    
    let context = `CONTEXT: You are a helpful college counselor helping a student complete their "${section}" profile section.\n\n`;
    context += `SECTION STATUS: ${isComplete ? `✅ COMPLETE (${answeredCount}/${sectionQuestions.length} answered, ${completionThreshold} needed)` : `⏳ IN PROGRESS (${answeredCount}/${sectionQuestions.length} answered, ${completionThreshold - answeredCount} more needed to complete)`}\n\n`;
    context += `SECTION QUESTIONS (with exact IDs to use):\n`;
    sectionQuestions.forEach((q: any) => {
      const answer = responses[q.id];
      if (answer) {
        context += `✓ ID:${q.id} - ${q.question} (Already answered: "${answer}")\n`;
      } else {
        context += `○ ID:${q.id} - ${q.question} (Not yet answered)\n`;
      }
    });
    context += `\nINSTRUCTIONS:\n`;
    context += `- This section is considered complete when at least ${completionThreshold} questions (50%) are answered\n`;
    context += `- Ask questions one at a time in a conversational way\n`;
    context += `- Focus on unanswered questions first\n`;
    context += `- You may ask ONE thoughtful follow-up question if relevant\n`;
    context += `- Be encouraging and help the student think through their answers\n`;
    context += `- When the student provides a clear answer to a question, include a SAVE_RESPONSE tag in your response\n`;
    context += `- IMPORTANT: Use the EXACT question ID numbers shown above (e.g., 1, 2, 3, etc.)\n`;
    context += `- Format: [SAVE_RESPONSE:QUESTION_ID:ANSWER:QUESTION_TEXT]\n`;
    context += `- Example: [SAVE_RESPONSE:1:computer science:Do you have a career or major in mind?]\n`;
    context += `- If the section is already complete, congratulate them and mention they can continue adding details or move to other sections\n\n`;
    
    // Add conversation history for context
    if (messages.length > 0) {
      context += `RECENT CONVERSATION:\n`;
      // Include last 6 messages (3 exchanges) for context
      const recentMessages = messages.slice(-20);
      recentMessages.forEach((msg) => {
        const role = msg.role === 'user' ? 'Student' : 'AI Mentor';
        context += `${role}: ${msg.content}\n`;
      });
      context += `\n`;
    }
    
    context += `CURRENT STUDENT MESSAGE: ${userMessage}`;
    return context;
  }

  // Function to parse and save responses from AI message
  const parseAndSaveResponses = async (aiMessage: string) => {
    const savePattern = /\[SAVE_RESPONSE:([^:]+):([^:]+):([^\]]+)\]/g;
    let match;
    
    console.log("Parsing AI message for save commands:", aiMessage);
    
    while ((match = savePattern.exec(aiMessage)) !== null) {
      const [fullMatch, questionId, answer, questionText] = match;
      console.log("Found save command:", { questionId, answer, questionText });
      await saveResponse(questionId, answer, questionText);
    }
  };

  // Function to save a response (called by AI)
  const saveResponse = async (questionId: string, answer: string, questionText: string) => {
    if (!user || !section) return;
    
    try {
      const formId = section.toLowerCase().replace(/\s+/g, '_');
      
      // Get existing responses
      const existing = await api.getFormResponses(user.uid, formId);
      let allResponses = existing?.responses || [];
      
      // Update or add the response
      const existingIndex = allResponses.findIndex(r => r.question_id === questionId);
      if (existingIndex >= 0) {
        allResponses[existingIndex].answer = answer;
      } else {
        allResponses.push({
          question_id: questionId,
          question_text: questionText,
          answer: answer
        });
      }
      
      // Use upsert endpoint to avoid 400 error
      const response = await fetch('/api/responses/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.uid,
          form_id: formId,
          responses: allResponses
        }),
      });
      
      if (response.ok) {
        // Update local state
        setResponses(prev => ({ ...prev, [questionId]: answer }));
        console.log(`Saved response for question: ${questionText}`);
      } else {
        console.error('Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  // Handle sending a message (student answer)
  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    
    // Build context prompt for OpenAI
    const contextPrompt = buildContextPrompt(content);
    
    try {
      // Send message to AI
      const result = await api.sendMessage(1, { 
        role: 'user', 
        content: contextPrompt
      });
      
      // Parse AI response for save commands
      if (result.aiMessage?.content) {
        await parseAndSaveResponses(result.aiMessage.content);
        
        // Clean the AI message by removing SAVE_RESPONSE tags
        const cleanContent = result.aiMessage.content.replace(/\[SAVE_RESPONSE:[^\]]+\]/g, '').trim();
        result.aiMessage.content = cleanContent;
      }
      
      // Ensure AI message has proper timestamp
      const aiMessage = result.aiMessage ?? {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      
      // Make sure createdAt is set properly
      if (!aiMessage.createdAt) {
        aiMessage.createdAt = new Date().toISOString();
      }
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = sectionQuestions.length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const completionThreshold = Math.ceil(totalQuestions * 0.5);
  const isComplete = answeredCount >= completionThreshold;
  
  // Get section description
  const getSectionDescription = (sectionName: string) => {
    const descriptions: Record<string, string> = {
      "Introduction": "Tell us about yourself and your goals",
      "Academic Information": "Your academic interests and performance",
      "Extracurriculars and Interests": "Your activities and passions outside the classroom",
      "Personal Reflections": "Deeper insights into who you are",
      "College Preferences": "What you're looking for in your college experience"
    };
    return descriptions[sectionName] || "Complete this section";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user?.displayName || user?.email || 'User', email: user?.email || '' }} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Context */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/profile-builder'}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile Builder
            </Button>
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your {section} Section
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {getSectionDescription(section || '')}
            </p>
            <p className="text-sm text-gray-500">
              Our AI counselor will guide you through thoughtful questions to build your profile
            </p>
          </div>
        </div>

        {/* Show loading state while fetching responses */}
        {!responsesLoaded ? (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your existing responses...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Section */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Section Progress</h3>
                  <span className="text-sm font-medium text-gray-600">
                    {answeredCount} of {totalQuestions} questions answered
                  </span>
                </div>
                <Progress value={progressPercentage} className="mb-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {isComplete ? 
                      "✅ Section complete!" : 
                      `${completionThreshold - answeredCount} more answers needed to complete`
                    }
                  </span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isComplete ? 
                    "Great job! This section is marked as complete. You can continue adding more details or move to other sections." : 
                    `Answer at least ${completionThreshold} questions (50%) to mark this section as complete.`
                  }
                </p>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  AI Counselor Chat
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Have a natural conversation about your {section?.toLowerCase()} details
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <AIChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    isExpanded={true}
                    user={{ fullName: user?.displayName || user?.email || 'User' }}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            The AI will ask follow-up questions based on your answers. Be authentic and detailed!
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>• Your responses are automatically saved</span>
            <span>• You can return anytime to continue</span>
            <span>• All information is kept private</span>
          </div>
        </div>
      </div>
    </div>
  );
} 