import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth, AuthProvider } from "@/context/AuthContext";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import ExplorePage from "@/pages/explore";
import ProfileBuilder from "@/pages/profile-builder";
import SectionForm from "@/pages/section-form";
import OnboardingPage from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import ChatOnboarding from "@/pages/chat-onboarding";
import CollegeRecommendations from "@/pages/college-recommendations";
import StudentProfileView from "@/pages/student-profile-view";
import { ProfileGeneration } from "@/pages/profile-generation";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <LandingPage />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/chat">
        <ProtectedRoute component={ChatPage} />
      </Route>
      <Route path="/explore">
        <ProtectedRoute component={ExplorePage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfileBuilder} />
      </Route>
      <Route path="/profile-builder">
        <ProtectedRoute component={ProfileBuilder} />
      </Route>
      <Route path="/section-form">
        <ProtectedRoute component={SectionForm} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={OnboardingPage} />
      </Route>
      <Route path="/chat-onboarding">
        <ProtectedRoute component={ChatOnboarding} />
      </Route>
      <Route path="/recommendations">
        <ProtectedRoute component={CollegeRecommendations} />
      </Route>
      <Route path="/college-recommendations">
        <ProtectedRoute component={CollegeRecommendations} />
      </Route>
      <Route path="/profile-view">
        <ProtectedRoute component={StudentProfileView} />
      </Route>
      <Route path="/profile-generation">
        <ProtectedRoute component={ProfileGeneration} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
