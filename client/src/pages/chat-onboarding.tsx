import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AIChat } from "@/components/AIChat";
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
      }
    }
    fetchResponses();
  }, [user, section]);

  // On first load, send intro/context to AI
  useEffect(() => {
    console.log("section", section);
    console.log("sectionQuestions", sectionQuestions);
    console.log("responses", responses);
    if (!initialized && section && sectionQuestions.length > 0) {
      // Find the first unanswered question
      const firstUnanswered = sectionQuestions.find((q: any) => !responses[q.id]);
      console.log("firstUnanswered", firstUnanswered);
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: firstUnanswered
            ? firstUnanswered.question
            : "Great job! You've already completed this section.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setInitialized(true);
    }
  }, [section, sectionQuestions, initialized, responses]);

  // Helper to build OpenAI context prompt with function calling
  function buildContextPrompt(userMessage: string) {
    let context = `CONTEXT: You are a helpful college counselor helping a student complete their "${section}" profile section.\n\n`;
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
    context += `- Ask questions one at a time in a conversational way\n`;
    context += `- Focus on unanswered questions first\n`;
    context += `- You may ask ONE thoughtful follow-up question if relevant\n`;
    context += `- Be encouraging and help the student think through their answers\n`;
    context += `- When the student provides a clear answer to a question, include a SAVE_RESPONSE tag in your response\n`;
    context += `- IMPORTANT: Use the EXACT question ID numbers shown above (e.g., 1, 2, 3, etc.)\n`;
    context += `- Format: [SAVE_RESPONSE:QUESTION_ID:ANSWER:QUESTION_TEXT]\n`;
    context += `- Example: [SAVE_RESPONSE:1:computer science:Do you have a career or major in mind?]\n`;
    context += `- If they've answered everything, congratulate them and suggest they can always update answers\n\n`;
    
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
      
      setMessages((prev) => [
        ...prev,
        result.aiMessage ?? {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Complete: {section}</h2>
      <AIChat
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentSection={section || ''}
        sectionQuestions={sectionQuestions}
      />
      {/* Progress indicator */}
      <div className="mt-4 text-sm text-gray-600">
        Progress: {Object.keys(responses).length} / {sectionQuestions.length} questions answered
      </div>
    </div>
  );
} 