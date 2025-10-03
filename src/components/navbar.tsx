"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Search, User, Settings, BookOpen, LogOut, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModeToggle from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, isAuthenticated, logout, loading, sendEmailVerification } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {/* Render a placeholder during hydration, then the actual logo */}
            {!mounted ? (
              <div className="h-8 w-[120px] bg-muted animate-pulse rounded" />
            ) : (
              <Image
                src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="RANOVEL"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            )}
          </Link>
        </div>

        {/* Middle - Search bar */}
        <div className="flex-1 max-w-md mx-4 md:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari novels..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right side - Auth section */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {loading ? (
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!user.email_verified && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="destructive" className="h-3 w-3 p-0 flex items-center justify-center">
                        {/* <Mail className="" /> */}
                      </Badge>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {!user.email_verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">Email not verified</span>
                    </div>
                  )}
                  {user.is_admin && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                
                {!user.email_verified && (
                  <>
                    <DropdownMenuItem onClick={sendEmailVerification}>
                      <MailCheck className="mr-2 h-4 w-4" />
                      Verify Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Library
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}