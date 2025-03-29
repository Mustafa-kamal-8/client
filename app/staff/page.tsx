"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { format } from "date-fns"; 

type Category = {
  id: string;
  name: string;
};

type Message = {
  message_text: string;
  created_at: string | number | Date;
  id: string;
  title: string;
  content: string;
  date: string;
};

export default function StaffPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth("/api/categories");
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Messages when category is selected
  const fetchMessages = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`/api/message?category_id=${categoryId}`);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchMessages(selectedCategory);
    } else {
      setMessages([]); // Clear messages when no category is selected
    }
  }, [selectedCategory]);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setSidebarOpen(!isMobileView);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <ProtectedRoute allowedRoles={["STAFF"]}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:relative",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {sidebarOpen && <span className="font-semibold">Message Center</span>}
            </div>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 mb-2">
              {sidebarOpen && <h3 className="text-sm font-medium text-muted-foreground">Message Categories</h3>}
            </div>
            <nav className="flex flex-col gap-1 px-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  {sidebarOpen && <span>{category.name}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-2">
              {sidebarOpen && (
                <div className="text-sm">
                  Logged in as: <span className="font-medium">{user?.firstName}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className={cn("flex items-center gap-2", !sidebarOpen && "justify-center")}
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && "Logout"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col w-full overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name + " Messages"
                  : "Select a Category"}
              </h1>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Messages List */}
          <main className="flex-1 overflow-auto p-4 w-full">
  {isLoading ? (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <p>Loading messages...</p>
    </div>
  ) : selectedCategory ? (
    <div className="grid gap-4 w-full">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div key={message.id} className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Message</h3>
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.created_at), "yyyy-MM-dd HH:mm:ss")}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{message.message_text}</p>
          </div>
        ))
      ) : (
        <p>No messages found.</p>
      )}
    </div>
  ) : (
    <p>Select a category to view messages.</p>
  )}
</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
