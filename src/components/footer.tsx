"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Github, Twitter, Mail, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background mt-auto border-t">
      <div className="px-4 py-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
            >
              {!mounted ? (
                <div className="bg-muted h-8 w-[120px] animate-pulse rounded" />
              ) : (
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/rantale-dark.svg"
                      : "/rantale-light.svg"
                  }
                  alt="Rantale"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              )}
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm">
              Discover and read amazing novels from around the world. Join our
              community of readers and authors.
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="https://github.com/RKPYI/rantale"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              {/* Disable Twitter link for now */}
              <div className="pointer-events-none opacity-50">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="https://twitter.com/RKPYI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Contact</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Browse Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Browse</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Novels
                </Link>
              </li>
              <li>
                <Link
                  href="/genres"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Genres
                </Link>
              </li>
              <li>
                <Link
                  href="/top-rated"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Top Rated
                </Link>
              </li>
              <li>
                <Link
                  href="/recently-updated"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Recently Updated
                </Link>
              </li>
              <li>
                <Link
                  href="/completed"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Completed
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/authors"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Authors
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/discussions"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discussions
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-muted-foreground flex items-center space-x-4 text-sm">
            <span>© 2025 Rantale. All rights reserved.</span>
          </div>

          <div className="text-muted-foreground flex items-center space-x-1 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 fill-current text-red-500" />
            <span>for book lovers</span>
            <BookOpen className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
