import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileEdit,
  RefreshCw,
} from "lucide-react";
import { ChapterStatus } from "@/types/api";

interface ChapterStatusBadgeProps {
  status: ChapterStatus;
  className?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<
  ChapterStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  approved: {
    label: "Published",
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  revision_requested: {
    label: "Revision Needed",
    icon: AlertCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  pending_update: {
    label: "Update Pending",
    icon: RefreshCw,
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function ChapterStatusBadge({
  status,
  className,
  showIcon = true,
}: ChapterStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-0", config.className, className)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

export function getChapterStatusLabel(status: ChapterStatus): string {
  return STATUS_CONFIG[status].label;
}
