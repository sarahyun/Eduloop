import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Globe } from "lucide-react";
import { api, type User, type Conversation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const [user] = useState<User>({ id: 1, username: "sarah", email: "sarah@example.com", fullName: "Sarah Johnson" });
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations', user.id],
    enabled: !!user?.id,
  });

  // Set default conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/conversations', selectedConversationId, 'messages'],
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
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      api.sendMessage(conversationId, { role: 'user', content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', variables.conversationId, 'messages'] });
    },
  });

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    let conversationId = selectedConversationId;
    
    if (!conversationId) {
      const newConversation = await createConversationMutation.mutateAsync({
        userId: user.id,
        title: "New Conversation"
      });
      conversationId = newConversation.id;
    }

    await sendMessageMutation.mutateAsync({ conversationId, content });
  };

  // Handle creating new conversation
  const handleNewConversation = () => {
    createConversationMutation.mutate({
      userId: user.id,
      title: "New Conversation"
    });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
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

            {/* Recent Conversation Memories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Engineering vs CS</span>
                      <span className="text-xs text-gray-500">Yesterday</span>
                    </div>
                    <p className="text-xs text-gray-600">Discussed differences between engineering and computer science programs...</p>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Essay Brainstorming</span>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-xs text-gray-600">Explored your leadership experience and community service themes...</p>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">School Climate</span>
                      <span className="text-xs text-gray-500">1 week ago</span>
                    </div>
                    <p className="text-xs text-gray-600">Talked about finding schools with collaborative learning environments...</p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:text-primary-dark">
                  View All Conversations
                </Button>
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
                    user={user}
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
