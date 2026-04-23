import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGate from "@/components/AuthGate";
import BanGate from "@/components/BanGate";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import Messages from "./pages/Messages";
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthGate>
        <BanGate>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chat/:id" element={<ChatRoom />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BanGate>
      </AuthGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
