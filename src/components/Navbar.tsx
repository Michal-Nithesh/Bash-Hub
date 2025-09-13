import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, User, LogOut, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false, onLogout }) => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BashHub
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link to="/ai-tutor">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950">
                    <Bot className="h-4 w-4 mr-1" />
                    AI Tutor
                  </Button>
                </Link>
                <Link to="/community-chat">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Community
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm">Leaderboard</Button>
                </Link>
                <Link to="/store">
                  <Button variant="ghost" size="sm">Store</Button>
                </Link>
                <Link to="/library">
                  <Button variant="ghost" size="sm">Library</Button>
                </Link>
                <Link to="/focus-mode">
                  <Button variant="ghost" size="sm">Focus Mode</Button>
                </Link>
                <Link to="/timetable">
                  <Button variant="ghost" size="sm">Timetable</Button>
                </Link>
                <Link to="/certificates">
                  <Button variant="ghost" size="sm">Certificates</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">Get Started</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};