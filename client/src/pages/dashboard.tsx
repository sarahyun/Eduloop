import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { CollegeCard } from "@/components/CollegeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use authenticated user from session
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  // Fetch core data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile', user.id],
    enabled: !!user?.id,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/recommendations', user.id],
    enabled: !!user?.id,
  });

  const { data: savedColleges = [] } = useQuery({
    queryKey: ['/api/saved-colleges', user.id],
    enabled: !!user?.id,
  });

  // Core mutations
  const saveCollegeMutation = useMutation({
    mutationFn: (data: { userId: number; collegeId: number }) => api.saveCollege(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-colleges'] });
      toast({ title: "College saved!" });
    },
  });

  const removeSavedCollegeMutation = useMutation({
    mutationFn: ({ userId, collegeId }: { userId: number; collegeId: number }) => 
      api.removeSavedCollege(userId, collegeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-colleges'] });
      toast({ title: "College removed" });
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

  // Handle search
  const handleSearch = async (query: string) => {
    try {
      await aiSearchMutation.mutateAsync({ query });
    } catch (error) {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    }
  };

  // Handle saving/removing colleges
  const handleSaveCollege = (collegeId: number) => {
    saveCollegeMutation.mutate({ userId: user.id, collegeId });
  };

  const handleRemoveSavedCollege = (collegeId: number) => {
    removeSavedCollegeMutation.mutate({ userId: user.id, collegeId });
  };

  const isCollegeSaved = (collegeId: number) => {
    return savedColleges.some((saved: any) => saved.collegeId === collegeId);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      'careerMajor', 'dreamSchools', 'freeTimeActivities', 'collegeExperience', 
      'extracurricularsAdditionalInfo', 'gpa', 'satScore', 'actScore',
      'favoriteClasses', 'strugglingSubjects', 'whatMakesHappy', 'challengeOvercome'
    ];
    
    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileComplete = profileCompletion >= 70; // Require 70% completion for recommendations

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Simple Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name ? user.name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-gray-600 mb-4">
            Find colleges that match your interests and goals.
          </p>
          
          {/* Profile Completion Nudge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-900">Complete your profile for better matches</h3>
                  <span className="text-sm font-medium text-blue-700">{profileCompletion}% complete</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-sm text-blue-700">The more we learn about you, the more helpful our recommendations become.</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/profile'}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 ml-4"
              >
                Build Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Core Feature 1: Search */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={aiSearchMutation.isPending}
          />
        </div>

        {/* Search Results */}
        {aiSearchMutation.data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {aiSearchMutation.data.colleges.map((result: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{result.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{result.reasoning}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">{result.matchScore}% Match</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Core Feature 2: College Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your College Matches</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => isProfileComplete ? generateRecommendationsMutation.mutate(user.id) : null}
                disabled={generateRecommendationsMutation.isPending || !isProfileComplete}
                className={!isProfileComplete ? "opacity-50 cursor-not-allowed" : ""}
              >
                {generateRecommendationsMutation.isPending ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(recommendations as any[]).length === 0 ? (
              <div className="text-center py-12">
                {!isProfileComplete ? (
                  <>
                    <p className="text-gray-500 mb-4">Complete your profile to unlock recommendations</p>
                    <Button 
                      disabled={true}
                      className="opacity-50 cursor-not-allowed"
                    >
                      Complete Profile to Unlock
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">No recommendations yet</p>
                    <Button 
                      onClick={() => generateRecommendationsMutation.mutate(user.id)}
                      disabled={generateRecommendationsMutation.isPending}
                    >
                      Get Recommendations
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {(recommendations as any[]).map((rec: any) => (
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

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/profile'}
            className="bg-blue-600 text-white"
          >
            Build Your Profile
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/chat'}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat with AI
          </Button>
        </div>
      </div>
    </div>
  );
}
