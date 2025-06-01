import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Globe } from "lucide-react";
import { api, type Conversation, type Message } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', mockUserId],
    enabled: !!user,
  });

  // Set default conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [`/api/messages/${selectedConversationId}`],
    enabled: !!selectedConversationId,
  });

  // Mutations
  const createConversationMutation = useMutation({
    mutationFn: (data: { userId: number; title?: string }) => api.createConversation(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setSelectedConversationId(newConversation.id);
      toast({ title: "New conversation started!" });
    },
    onError: () => {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      api.sendMessage(conversationId, { role: 'user', content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${variables.conversationId}`] });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    try {
      let conversationId = selectedConversationId;
      
      if (!conversationId) {
        const newConversation = await createConversationMutation.mutateAsync({
          userId: mockUserId,
          title: "New Conversation"
        });
        conversationId = newConversation.id;
      }

      await sendMessageMutation.mutateAsync({ conversationId, content });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  // Handle creating new conversation
  const handleNewConversation = () => {
    createConversationMutation.mutate({
      userId: mockUserId,
      title: "New Conversation"
    });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: user.displayName || user.email || 'User', email: user.email || '' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          
          {/* Conversation List Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* New Conversation */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button 
                    size="sm"
                    onClick={handleNewConversation}
                    disabled={createConversationMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversations.length === 0 ? (
                    <div className="text-center py-4">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedConversationId === conversation.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {conversation.title || "Untitled Conversation"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          Last updated {new Date(conversation.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>



            {/* Language Support */}
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
                      {selectedConversation?.title || "AI Mentor Chat"}
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
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={sendMessageMutation.isPending}
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
