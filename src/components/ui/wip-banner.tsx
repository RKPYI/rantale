import { Construction, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WipBannerProps {
  title?: string;
  message?: string;
  variant?: "default" | "info" | "warning";
  className?: string;
}

export function WipBanner({
  title = "Work in Progress",
  message = "This page is currently under construction. Some features may not be available yet.",
  variant = "default",
  className,
}: WipBannerProps) {
  const icons = {
    default: Construction,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[variant];

  const variantStyles = {
    default: "bg-muted border-muted-foreground/20",
    info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
    warning:
      "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
  };

  return (
    <Alert className={cn(variantStyles[variant], className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
