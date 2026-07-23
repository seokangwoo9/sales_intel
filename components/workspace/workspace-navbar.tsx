"use client";

import { PanelLeftOpen, PanelLeftClose, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkspaceNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function WorkspaceNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: WorkspaceNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-50">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left section - Sidebar toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full"
          />
        </div>

        {/* Right section - Help */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
