"use client";

import { Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";

interface WorkspaceSidebarProps {
  isOpen: boolean;
}

export function WorkspaceSidebar({ isOpen }: WorkspaceSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "w-[280px] translate-x-0" : "w-[64px] -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Profile menu at top */}
        <div className="p-2 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "w-full flex items-center gap-3 h-auto py-2 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
                !isOpen && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              )}
              {isOpen && <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto">
          {/* Search navigation */}
          <Button
            variant="ghost"
            className={cn(
              "justify-start gap-3",
              !isOpen && "justify-center px-2"
            )}
          >
            <Search className="h-5 w-5 shrink-0" />
            {isOpen && <span>Search</span>}
          </Button>

          {/* Settings navigation */}
          <Button
            variant="ghost"
            className={cn(
              "justify-start gap-3",
              !isOpen && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {isOpen && <span>Settings</span>}
          </Button>

          {/* Empty state placeholder */}
          {isOpen && (
            <div className="mt-8 px-4 text-center text-sm text-muted-foreground">
              <p>Navigation items will appear here</p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
