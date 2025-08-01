import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Search from "@/pages/search";
import PropertyDetail from "@/pages/property-detail";
import Compare from "@/pages/compare";
import MarketIntelligence from "@/pages/market-intelligence";
import AdminDashboard from "@/pages/admin";
import BuilderConsole from "@/pages/builder-console";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/compare" component={Compare} />
      <Route path="/market" component={MarketIntelligence} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/builder" component={BuilderConsole} />
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
