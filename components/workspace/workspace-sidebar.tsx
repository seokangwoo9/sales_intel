"use client";

import { Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  isOpen: boolean;
}

export function WorkspaceSidebar({ isOpen }: WorkspaceSidebarProps) {
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
          "fixed top-16 left-0 bottom-0 z-40 bg-card border-r border-border transition-all duration-300 ease-in-out",
          isOpen ? "w-[280px] translate-x-0" : "w-[64px] -translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="flex flex-col gap-2 p-2">
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
