import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import ExplorePage from "@/pages/explore";
import OnboardingPage from "@/pages/onboarding";
import ChatOnboarding from "@/pages/chat-onboarding";
import ProfileBuilder from "@/pages/profile-builder";
import SectionForm from "@/pages/section-form";
import SampleFormPage from "@/pages/sample-form";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/chat">
        <ProtectedRoute component={ChatPage} />
      </Route>
      <Route path="/explore">
        <ProtectedRoute component={ExplorePage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={OnboardingPage} />
      </Route>
      <Route path="/chat-onboarding">
        <ProtectedRoute component={ChatOnboarding} />
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
      <Route path="/sample-form">
        <ProtectedRoute component={SampleFormPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
