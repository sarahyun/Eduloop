import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bell, Compass, Menu, LogOut, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { questionsData, type Question, getSectionConfig } from '@/data/questionsData';
import { API_BASE_URL } from '@/lib/config';

interface NavigationProps {
  user?: { name: string; email: string };
  hasProfileData?: boolean;
  hasRealRecommendations?: boolean;
}

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

export function Navigation({ user, hasProfileData = false, hasRealRecommendations = false }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user: authUser } = useAuth();
  const { toast } = useToast();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Calculate profile completion for navigation
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!authUser?.uid) return;

      const completed = new Set<string>();
      
      for (const sectionId of Object.keys(questionsData)) {
        const sectionFormId = sectionId.toLowerCase().replace(/\s+/g, '_');
        const sectionQuestions = questionsData[sectionId as keyof typeof questionsData] as Question[];
        const sectionConfig = getSectionConfig(sectionId);
        
        try {
          const response = await fetch(`${API_BASE_URL}/responses/${authUser.uid}/${sectionFormId}`);
          if (response.ok) {
            const data: FormResponse = await response.json();
            
            if (data.responses && data.responses.length > 0) {
              const answeredCount = sectionQuestions.filter(q => {
                const response = data.responses.find(r => r.question_id === q.id.toString());
                return response && response.answer.trim().length > 0;
              }).length;
              
              const completionThreshold = Math.ceil(sectionQuestions.length * sectionConfig.completionThreshold);
              if (answeredCount >= completionThreshold) {
                completed.add(sectionId);
              }
            }
          }
        } catch (error) {
          console.error(`Error loading completion status for ${sectionId}:`, error);
        }
      }
      
      setCompletedSections(completed);
      
      // Calculate completion percentage
      const allSections = Object.keys(questionsData);
      const requiredSections = allSections.filter(sectionId => !getSectionConfig(sectionId).isOptional);
      const completedRequiredSections = requiredSections.filter(sectionId => completed.has(sectionId));
      const completion = requiredSections.length > 0 
        ? Math.round((completedRequiredSections.length / requiredSections.length) * 100)
        : 100;
      setProfileCompletion(completion);
    };

    loadCompletionStatus();
  }, [authUser?.uid]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", enabled: true },
    { name: "Profile", href: "/profile", enabled: true },
    { name: "Insights", href: "/profile-view", enabled: profileCompletion >= 100, tooltip: profileCompletion >= 100 ? "" : "Complete profile to view insights" },
    { name: "Schools", href: "/recommendations", enabled: profileCompletion >= 100, tooltip: profileCompletion >= 100 ? "" : "Complete profile to view recommendations" },
    { name: "Mentor", href: "/chat", enabled: true },
  ];
  
  // Debug logging
  console.log('Navigation Debug:', {
    profileCompletion,
    hasProfileData,
    hasRealRecommendations,
    navigation
  });

  const isActive = (href: string) => {
    // Exact match for most routes
    if (location === href) return true;
    
    // Special case for dashboard variants
    if (href === '/dashboard' && (location === '/dashboard' || location === '/')) return true;
    
    // For other routes, only match if it's an exact match or a direct sub-path
    // but not if it's just a prefix (e.g., /profile vs /profile-view)
    if (href !== '/' && location.startsWith(href)) {
      const remainingPath = location.slice(href.length);
      return remainingPath === '' || remainingPath.startsWith('/');
    }
    
    return false;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavClick = (item: typeof navigation[0], e: React.MouseEvent) => {
    if (!item.enabled) {
      e.preventDefault();
      toast({
        title: item.tooltip,
        description: item.name === "Insights" 
          ? "Complete your profile questionnaire to unlock personalized insights."
          : "Complete your profile questionnaire to unlock college recommendations.",
        variant: "default",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">CollegeNavigate AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center max-w-2xl">
            {navigation.map((item) => (
              <Link key={item.name} href={item.enabled ? item.href : "#"}>
                <span
                  className={`transition-colors cursor-pointer ${
                    item.enabled && isActive(item.href)
                      ? "text-primary font-medium"
                      : item.enabled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
                  title={item.tooltip}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-300 text-gray-700">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                  <DropdownMenuItem className="flex flex-col items-start hover:bg-gray-50 cursor-default focus:bg-gray-50 p-3">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/profile'}
                    className="hover:bg-gray-100 cursor-pointer transition-colors focus:bg-gray-100 active:bg-gray-200 px-3 py-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="hover:bg-gray-100 cursor-pointer transition-colors focus:bg-gray-100 active:bg-gray-200 px-3 py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.enabled ? item.href : "#"}>
                      <span
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                          item.enabled && isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : item.enabled
                            ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            : "text-gray-400 cursor-not-allowed bg-gray-50"
                        }`}
                        onClick={(e) => {
                          handleNavClick(item, e);
                          if (item.enabled) setMobileMenuOpen(false);
                        }}
                        title={item.tooltip}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                  
                  {user && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="px-3 py-2">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start px-3 py-2 w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
