
import React from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M7 10.5a1.5 1.5 0 0 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zM14 10.5a1.5 1.5 0 0 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zM8.5 14.5h7" />
            <path d="M11 13v2" />
            <path d="M13 13v2" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-bold">AI-RAMS</h1>
          <p className="text-xl text-muted-foreground">
            Artificial Intelligent Rainwater Analysis and Management System
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
