import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { CollegeCard } from "@/components/CollegeCard";
import { ProgressCard } from "@/components/ProgressCard";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Search, Lightbulb, Target } from "lucide-react";
import { api, type User, type College, type ProfileInsight } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [user] = useState<User>({ id: 1, username: "sarah", email: "sarah@example.com", fullName: "Sarah Johnson" });
  const [expandedChat, setExpandedChat] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile', user.id],
    enabled: !!user?.id,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/recommendations', user.id],
    enabled: !!user?.id,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations', user.id],
    enabled: !!user?.id,
  });

  const { data: savedColleges = [] } = useQuery({
    queryKey: ['/api/saved-colleges', user.id],
    enabled: !!user?.id,
  });

  const { data: insights = [], refetch: refetchInsights } = useQuery({
    queryKey: ['/api/insights', user.id],
    enabled: false, // Only fetch when requested
  });

  // Current conversation (latest or create new)
  const currentConversation = conversations[0];
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/conversations', currentConversation?.id, 'messages'],
    enabled: !!currentConversation?.id,
  });

  // Mutations
  const createConversationMutation = useMutation({
    mutationFn: (data: { userId: number; title?: string }) => api.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      api.sendMessage(conversationId, { role: 'user', content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  const saveCollegeMutation = useMutation({
    mutationFn: (data: { userId: number; collegeId: number }) => api.saveCollege(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-colleges'] });
      toast({ title: "College saved successfully!" });
    },
  });

  const removeSavedCollegeMutation = useMutation({
    mutationFn: ({ userId, collegeId }: { userId: number; collegeId: number }) => 
      api.removeSavedCollege(userId, collegeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-colleges'] });
      toast({ title: "College removed from saved list" });
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: (userId: number) => api.generateRecommendations(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      toast({ title: "New recommendations generated!" });
    },
  });

  const aiSearchMutation = useMutation({
    mutationFn: ({ query }: { query: string }) => api.aiSearchColleges(query, user.id),
  });

  // Handle AI search
  const handleSearch = async (query: string) => {
    try {
      await aiSearchMutation.mutateAsync({ query });
      toast({ title: "Search completed!", description: "Check results below" });
    } catch (error) {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    }
  };

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversation?.id;
    
    if (!conversationId) {
      const newConversation = await createConversationMutation.mutateAsync({
        userId: user.id,
        title: "Chat with AI Mentor"
      });
      conversationId = newConversation.id;
    }

    await sendMessageMutation.mutateAsync({ conversationId, content });
  };

  // Handle saving/removing colleges
  const handleSaveCollege = (collegeId: number) => {
    saveCollegeMutation.mutate({ userId: user.id, collegeId });
  };

  const handleRemoveSavedCollege = (collegeId: number) => {
    removeSavedCollegeMutation.mutate({ userId: user.id, collegeId });
  };

  // Check if college is saved
  const isCollegeSaved = (collegeId: number) => {
    return savedColleges.some(saved => saved.collegeId === collegeId);
  };

  // Generate insights
  const handleGenerateInsights = () => {
    refetchInsights();
  };

  const profileCompletion = profile?.profileCompletion || 0;
  const conversationCount = conversations.length;
  const schoolsExplored = recommendations.length;
  const savedCount = savedColleges.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your AI mentor has been learning about your interests. Ready to discover some amazing colleges that could be perfect for you?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                onClick={() => setExpandedChat(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with AI Mentor
              </Button>
              <Button 
                variant="outline"
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => window.location.href = '/explore'}
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Colleges
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI-Powered College Search */}
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={aiSearchMutation.isPending}
            />

            {/* Search Results */}
            {aiSearchMutation.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <p className="text-sm text-gray-600">{aiSearchMutation.data.searchStrategy}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiSearchMutation.data.colleges.map((result, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">{result.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{result.reasoning}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{result.category}</Badge>
                          <span className="text-sm font-medium text-primary">{result.matchScore}% Match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* College Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateRecommendationsMutation.mutate(user.id)}
                    disabled={generateRecommendationsMutation.isPending}
                  >
                    {generateRecommendationsMutation.isPending ? "Generating..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recommendations yet</p>
                    <Button 
                      onClick={() => generateRecommendationsMutation.mutate(user.id)}
                      disabled={generateRecommendationsMutation.isPending}
                    >
                      Generate Recommendations
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((rec) => (
                      <CollegeCard
                        key={rec.id}
                        college={rec.college!}
                        matchScore={rec.matchScore}
                        reasoning={rec.reasoning}
                        category={rec.category as any}
                        isSaved={isCollegeSaved(rec.collegeId)}
                        onSave={handleSaveCollege}
                        onRemove={handleRemoveSavedCollege}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Your College Journey Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ProgressCard
                    title="Profile Completion"
                    value={`${profileCompletion}%`}
                    description="Complete 3 more reflection questions to unlock advanced insights"
                    type="progress"
                    progressValue={profileCompletion}
                    color="primary"
                  />
                  <ProgressCard
                    title="AI Conversations"
                    value={conversationCount}
                    description="Last chat: Career exploration"
                    type="count"
                    icon="message"
                    color="purple"
                  />
                  <ProgressCard
                    title="Schools Explored"
                    value={schoolsExplored}
                    description={`${savedCount} saved to favorites`}
                    type="count"
                    icon="bookmark"
                    color="green"
                  />
                  <ProgressCard
                    title="Next Steps"
                    value={3}
                    description="Due this week: Visit Stanford's virtual info session"
                    type="count"
                    icon="clock"
                    color="orange"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Latest AI Insights</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateInsights}
                    disabled={insights.length === 0}
                  >
                    Generate Insights
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Complete your profile to unlock personalized insights</p>
                    <Button onClick={handleGenerateInsights}>
                      Generate Insights
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.slice(0, 2).map((insight, index) => (
                      <div 
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            {insight.type === 'recommendation' ? (
                              <Lightbulb className="w-5 h-5 text-primary" />
                            ) : (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                            {insight.actionItems.length > 0 && (
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                                View Action Items →
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Mentor Sidebar */}
          <div>
            <AIChat
              conversation={currentConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={sendMessageMutation.isPending}
              isExpanded={expandedChat}
              onToggleExpanded={() => setExpandedChat(!expandedChat)}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
