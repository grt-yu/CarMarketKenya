import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Cars from "@/pages/cars";
import CarDetails from "@/pages/car-details";
import SellCar from "@/pages/sell-car";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import Messages from "@/pages/messages";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/cars" component={Cars} />
          <Route path="/cars/:id" component={CarDetails} />
          <Route path="/sell" component={SellCar} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/messages" component={Messages} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
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
