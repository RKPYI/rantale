"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Crown, Shield, PenTool } from "lucide-react";
import { User } from "@/types/api";
import {
  getUserRole,
  getRoleInfo,
  shouldShowRoleBadge,
  getProfileImageFallback,
} from "@/lib/user-utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  size = "md",
  showBadge = true,
  className,
}: UserAvatarProps) {
  const role = getUserRole(user);
  const roleInfo = getRoleInfo(user);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-24 w-24 sm:h-28 sm:w-28",
  };

  const iconSize =
    size === "sm"
      ? "h-2.5 w-2.5"
      : size === "md"
        ? "h-3 w-3"
        : size === "lg"
          ? "h-3.5 w-3.5"
          : "h-4 w-4";

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Crown className={iconSize} />;
      case "editor":
        return <Shield className={iconSize} />;
      case "author":
        return <PenTool className={iconSize} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar
        className={cn(
          sizeClasses[size],
          size === "xl" && "ring-background shadow-sm ring-4",
        )}
      >
        <AvatarImage
          src={user.avatar || undefined}
          alt={user.name}
          className="object-cover"
        />
        <AvatarFallback
          className={cn(
            "bg-muted text-muted-foreground font-medium",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-2xl sm:text-3xl",
          )}
        >
          {user.avatar ? (
            <UserIcon
              className={cn(
                size === "sm" && "h-3 w-3",
                size === "md" && "h-4 w-4",
                size === "lg" && "h-6 w-6",
                size === "xl" && "h-10 w-10 sm:h-12 sm:w-12",
              )}
            />
          ) : (
            getProfileImageFallback(user)
          )}
        </AvatarFallback>
      </Avatar>

      {showBadge && shouldShowRoleBadge(user) && (
        <div
          className={cn(
            "border-background absolute flex items-center justify-center rounded-full border-2",
            roleInfo.bgColor,
            size === "sm" && "-right-0.5 -bottom-0.5 h-3.5 w-3.5",
            size === "md" && "-right-1 -bottom-1 h-5 w-5",
            size === "lg" && "-right-1 -bottom-1 h-6 w-6",
            size === "xl" && "right-0 bottom-0 h-8 w-8",
          )}
        >
          {getRoleIcon()}
        </div>
      )}
    </div>
  );
}

interface UserInfoProps {
  user: User;
  showRole?: boolean;
  showVerificationStatus?: boolean;
  compact?: boolean;
  className?: string;
}

export function UserInfo({
  user,
  showRole = true,
  showVerificationStatus = true,
  compact = false,
  className,
}: UserInfoProps) {
  const roleInfo = getRoleInfo(user);

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-1.5" : "gap-2",
        className,
      )}
    >
      <span
        className={cn(
          "font-medium",
          compact ? "text-sm leading-tight" : "text-sm",
        )}
      >
        {user.name || "Unknown User"}
      </span>

      {showRole && shouldShowRoleBadge(user) && (
        <Badge
          className={cn(
            "border-transparent",
            roleInfo.bgColor,
            compact
              ? "h-4 gap-0 rounded px-1 text-[10px] leading-none font-medium"
              : "gap-1 text-xs",
          )}
        >
          {!compact && roleInfo.icon && <span>{roleInfo.icon}</span>}
          {roleInfo.name}
        </Badge>
      )}

      {showVerificationStatus && !user.email_verified_at && (
        <Badge
          variant="outline"
          className={cn(compact ? "h-4 px-1 text-[10px] leading-none" : "text-xs")}
        >
          Unverified
        </Badge>
      )}
    </div>
  );
}
