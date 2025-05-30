import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import ExplorePage from "@/pages/explore";
import OnboardingPage from "@/pages/onboarding";
import ChatOnboarding from "@/pages/chat-onboarding-new";
import ProfileBuilder from "@/pages/profile-builder";
import SectionForm from "@/pages/section-form";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/chat-onboarding" component={ChatOnboarding} />
      <Route path="/profile-builder" component={ProfileBuilder} />
      <Route path="/section-form" component={SectionForm} />
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
