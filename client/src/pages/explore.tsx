import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { CollegeCard } from "@/components/CollegeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, Search, MapPin, Users, School, DollarSign } from "lucide-react";
import { api, type User, type College } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ExplorePage() {
  const [user] = useState<User>({ id: 1, username: "sarah", email: "sarah@example.com", fullName: "Sarah Johnson" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    size: "",
    setting: "",
    minSAT: [1000],
    maxTuition: [80000],
    state: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch colleges
  const { data: colleges = [] } = useQuery({
    queryKey: ['/api/colleges'],
  });

  const { data: savedColleges = [] } = useQuery({
    queryKey: ['/api/saved-colleges', user.id],
    enabled: !!user?.id,
  });

  // AI search mutation
  const aiSearchMutation = useMutation({
    mutationFn: ({ query }: { query: string }) => api.aiSearchColleges(query, user.id),
  });

  // Regular search mutation
  const searchMutation = useMutation({
    mutationFn: ({ query }: { query: string }) => api.searchColleges(query),
  });

  // Save/remove college mutations
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

  // Filter colleges based on current filters
  const filteredColleges = colleges.filter(college => {
    if (filters.type && college.type !== filters.type) return false;
    if (filters.size && college.size !== filters.size) return false;
    if (filters.setting && college.setting !== filters.setting) return false;
    if (college.averageSAT && college.averageSAT < filters.minSAT[0]) return false;
    if (college.tuition && college.tuition > filters.maxTuition[0]) return false;
    if (filters.state && !college.location.includes(filters.state)) return false;
    return true;
  });

  // Handle AI search
  const handleAISearch = async (query: string) => {
    try {
      await aiSearchMutation.mutateAsync({ query });
      setSearchQuery(query);
      toast({ title: "AI search completed!", description: "Intelligent results based on your query" });
    } catch (error) {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    }
  };

  // Handle regular search
  const handleRegularSearch = async (query: string) => {
    try {
      await searchMutation.mutateAsync({ query });
      setSearchQuery(query);
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

  // Check if college is saved
  const isCollegeSaved = (collegeId: number) => {
    return savedColleges.some(saved => saved.collegeId === collegeId);
  };

  // Get colleges to display
  const displayColleges = aiSearchMutation.data?.colleges || searchMutation.data || filteredColleges;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Colleges</h1>
          <p className="text-lg text-gray-600">
            Discover colleges that match your interests and goals using our AI-powered search
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* College Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="liberal arts">Liberal Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
                  <Select value={filters.size} onValueChange={(value) => setFilters({...filters, size: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any size</SelectItem>
                      <SelectItem value="small">Small (&lt; 5,000)</SelectItem>
                      <SelectItem value="medium">Medium (5,000-15,000)</SelectItem>
                      <SelectItem value="large">Large (&gt; 15,000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Setting */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Setting</label>
                  <Select value={filters.setting} onValueChange={(value) => setFilters({...filters, setting: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any setting</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="suburban">Suburban</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* SAT Score Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Minimum SAT Score: {filters.minSAT[0]}
                  </label>
                  <Slider
                    value={filters.minSAT}
                    onValueChange={(value) => setFilters({...filters, minSAT: value})}
                    max={1600}
                    min={800}
                    step={50}
                    className="w-full"
                  />
                </div>

                {/* Tuition Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Maximum Tuition: ${filters.maxTuition[0].toLocaleString()}
                  </label>
                  <Slider
                    value={filters.maxTuition}
                    onValueChange={(value) => setFilters({...filters, maxTuition: value})}
                    max={100000}
                    min={10000}
                    step={5000}
                    className="w-full"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">State</label>
                  <Input
                    placeholder="e.g., CA, NY, TX"
                    value={filters.state}
                    onChange={(e) => setFilters({...filters, state: e.target.value})}
                  />
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setFilters({
                    type: "",
                    size: "",
                    setting: "",
                    minSAT: [1000],
                    maxTuition: [80000],
                    state: "",
                  })}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Search Section */}
            <div className="space-y-4">
              <SearchBar 
                onSearch={handleAISearch}
                isLoading={aiSearchMutation.isPending}
              />
              
              {/* Regular Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search colleges by name, location, or program..."
                    className="pl-10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRegularSearch((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Search Results Header */}
            {(aiSearchMutation.data || searchMutation.data || searchQuery) && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {aiSearchMutation.data ? 'AI Search Results' : 'Search Results'}
                  </h2>
                  {aiSearchMutation.data?.searchStrategy && (
                    <p className="text-sm text-gray-600 mt-1">
                      {aiSearchMutation.data.searchStrategy}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {displayColleges.length} results
                </Badge>
              </div>
            )}

            {/* College Results */}
            <div className="grid gap-6">
              {displayColleges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <School className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <Button onClick={() => setFilters({
                      type: "",
                      size: "",
                      setting: "",
                      minSAT: [1000],
                      maxTuition: [80000],
                      state: "",
                    })}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                displayColleges.map((college: any) => (
                  <CollegeCard
                    key={college.id || college.name}
                    college={college}
                    matchScore={college.matchScore}
                    reasoning={college.reasoning}
                    category={college.category}
                    highlights={college.highlights}
                    isSaved={isCollegeSaved(college.id || 0)}
                    onSave={handleSaveCollege}
                    onRemove={handleRemoveSavedCollege}
                  />
                ))
              )}
            </div>

            {/* Load More */}
            {displayColleges.length > 0 && displayColleges.length >= 20 && (
              <div className="text-center">
                <Button variant="outline">
                  Load More Colleges
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
