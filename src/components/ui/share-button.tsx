"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  MessageCircle,
  Mail,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({
  title,
  description = "",
  url = "",
  className = "",
  variant = "outline",
  size = "icon",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Use current URL if not provided
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.log("Error sharing:", err);
          handleCopyLink(); // Fallback to copy
        }
      }
    } else {
      handleCopyLink(); // Fallback for browsers without native share
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleEmailShare = () => {
    const subject = `Check out: ${title}`;
    const body = `${description}\n\n${shareUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const handleTwitterShare = () => {
    const text = description ? `${title}: ${description}` : title;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`,
      "_blank",
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
    );
  };

  const handleWhatsAppShare = () => {
    const text = description
      ? `${title}: ${description} ${shareUrl}`
      : `${title} ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Check if native share is supported
  const hasNativeShare =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Share &quot;{title.length > 25 ? title.slice(0, 25) + "..." : title}
          &quot;
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleTwitterShare}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleFacebookShare}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleEmailShare}>
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
