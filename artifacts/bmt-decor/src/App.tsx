import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import NewProjectWizard from "@/pages/NewProjectWizard";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function ProjectDetail() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0a0e16" }}
    >
      <div className="text-center">
        <p className="text-white/40 text-sm">Chi tiết dự án — đang phát triển</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/new" component={NewProjectWizard} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
