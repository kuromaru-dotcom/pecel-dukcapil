import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import type { User } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  return (
    <WebSocketProvider 
      userId={user?.id} 
      username={user?.username} 
      role={user?.role}
    >
      <Toaster />
      <Router />
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
