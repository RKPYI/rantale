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
  size?: "sm" | "md" | "lg";
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
  };

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      case "author":
        return <PenTool className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size])}>
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
          )}
        >
          {user.avatar ? (
            <UserIcon
              className={cn(
                size === "sm" && "h-3 w-3",
                size === "md" && "h-4 w-4",
                size === "lg" && "h-6 w-6",
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
            "border-background absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border-2",
            roleInfo.bgColor,
            size === "sm" && "h-4 w-4",
            size === "md" && "h-5 w-5",
            size === "lg" && "h-6 w-6",
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
  className?: string;
}

export function UserInfo({
  user,
  showRole = true,
  showVerificationStatus = true,
  className,
}: UserInfoProps) {
  const role = getUserRole(user);
  const roleInfo = getRoleInfo(user);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium">{user.name || "Unknown User"}</span>

      {showRole && shouldShowRoleBadge(user) && (
        <Badge
          className={cn("flex items-center gap-1 text-xs", roleInfo.bgColor)}
        >
          {roleInfo.icon && <span>{roleInfo.icon}</span>}
          {roleInfo.name}
        </Badge>
      )}

      {showVerificationStatus && !user.email_verified_at && (
        <Badge variant="outline" className="text-xs">
          Unverified
        </Badge>
      )}
    </div>
  );
}
