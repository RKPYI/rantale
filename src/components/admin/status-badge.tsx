import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "healthy" | "warning" | "critical";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    healthy: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    critical: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
  };

  const { icon: Icon, color, bg } = config[status];

  return (
    <Badge variant="outline" className={`${bg} ${color} border-0`}>
      <Icon className="mr-1 h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
