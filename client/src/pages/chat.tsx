import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Globe, ArrowLeft } from "lucide-react";
import { api, type Conversation, type Message } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);

  // Check for profile data and recommendations availability
  useEffect(() => {
    const checkDataAvailability = async () => {
      if (!user?.uid) return;

      try {
        // Check for profile data
        const profileResponse = await fetch(`https://web-production-bb19.up.railway.app/profiles/status/${user.uid}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setHasProfileData(profileData.status === 'completed');
        }

        // Check for recommendations
        const recResponse = await fetch(`https://web-production-bb19.up.railway.app/recommendations/status/${user.uid}`);
        if (recResponse.ok) {
          const recData = await recResponse.json();
          setHasRealRecommendations(recData.status === 'completed' && recData.recommendation_count > 0);
        }
      } catch (error) {
        console.error('Error checking data availability:', error);
      }
    };

    checkDataAvailability();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now(),
      conversationId: 1,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const response = await api.sendMessage(1, { role: 'user', content });
      setMessages(prev => [...prev, response.aiMessage ?? {
        id: Date.now() + 2,
        conversationId: 1,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        createdAt: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        conversationId: 1,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        createdAt: new Date().toISOString()
      }]);
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={{ name: user.displayName || user.email || 'User', email: user.email || '' }}
        hasProfileData={hasProfileData}
        hasRealRecommendations={hasRealRecommendations}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Return to Dashboard Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>
        <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          {/* Sidebar (optional, can be simplified further) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Mentor Chat</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Start a conversation with your AI mentor!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.name ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${
                        selectedLanguage === lang.name 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : ""
                      }`}
                      onClick={() => setSelectedLanguage(lang.name)}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                      AI Mentor Chat
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Your intelligent college counselor and mentor
                    </p>
                  </div>
                  {selectedLanguage !== "English" && (
                    <Badge variant="outline" className="text-primary border-primary">
                      {selectedLanguage}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full p-6">
                  <AIChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    isExpanded={true}
                    user={{ fullName: user.displayName || user.email || 'User' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
