import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/config';

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface Question {
  id: string;
  question: string;
  type?: 'text' | 'textarea' | 'number';
}

interface Section {
  section: string;
  questions: Question[];
}

interface FormPageProps {
  formData: Section[];
  formTitle: string;
  formId: string;
  userId?: string;
}

export function FormPage({ formData, formTitle, formId, userId: propUserId }: FormPageProps) {
  const { user } = useAuth();
  const userId = propUserId || user?.uid;
  const [formResponses, setFormResponses] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing responses on component mount
  useEffect(() => {
    if (userId && formId) {
      // Load existing responses from API
      fetch(`${API_BASE_URL}/question-responses/${userId}/${formId}`)
        .then(response => response.json())
        .then(data => {
          if (data && Array.isArray(data)) {
            const savedResponses = data.reduce((acc: { [key: string]: string }, response: any) => {
              acc[response.questionId] = response.userAnswer || '';
              return acc;
            }, {});
            setFormResponses(savedResponses);
          }
        })
        .catch(error => {
          console.error('Error fetching form responses:', error);
        });
    }
  }, [userId, formId]);

  // Autosave mutation
  const autosaveMutation = useMutation({
    mutationFn: async (responses: { [key: string]: string }) => {
      setIsSaving(true);
      
      // Filter out empty responses
      const filledResponses = Object.entries(responses).filter(([_, value]) => value && value.trim() !== '');
      
      const responsePayload = {
        response_id: `${userId}-${formId}`,
        user_id: userId,
        form_id: formId,
        submitted_at: new Date().toISOString(),
        responses: filledResponses.map(([questionId, answer]) => {
          const questionText = formData
            .flatMap(section => section.questions)
            .find(question => question.id === questionId)?.question || '';

          return {
            question_id: questionId,
            question_text: questionText,
            answer: answer
          };
        })
      };

      const response = await fetch(`${API_BASE_URL}/question-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload)
      });
      
      if (!response.ok) throw new Error('Failed to autosave responses');
      return response.json();
    },
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
    },
    onError: (error) => {
      setIsSaving(false);
      console.error('Error saving responses:', error);
    }
  });

  // Debounced autosave function
  const debouncedAutosave = useCallback(
    debounce((responses: { [key: string]: string }) => {
      if (Object.keys(responses).length > 0) {
        autosaveMutation.mutate(responses);
      }
    }, 1000),
    [autosaveMutation]
  );

  const handleResponseChange = (questionId: string, value: string) => {
    setFormResponses(prevResponses => {
      const updatedResponses = {
        ...prevResponses,
        [questionId]: value
      };
      debouncedAutosave(updatedResponses);
      return updatedResponses;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {formTitle}
              </CardTitle>
              
              {/* Autosave status */}
              <div className="text-sm text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span>Saved at {lastSaved.toLocaleTimeString()}</span>
                ) : (
                  <span>Responses are autosaved</span>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {formData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {section.section}
                  </h3>
                </div>
                
                {section.questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <Label htmlFor={question.id} className="text-base font-medium text-gray-900">
                      {question.question}
                    </Label>
                    
                    {question.type === 'textarea' ? (
                      <Textarea
                        id={question.id}
                        placeholder="Type here..."
                        value={formResponses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="min-h-32 text-base"
                        rows={4}
                      />
                    ) : question.type === 'number' ? (
                      <Input
                        id={question.id}
                        type="number"
                        placeholder="Enter number..."
                        value={formResponses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="text-base"
                      />
                    ) : (
                      <Input
                        id={question.id}
                        type="text"
                        placeholder="Type here..."
                        value={formResponses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="text-base"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}