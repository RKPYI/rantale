"use client";

import { Badge } from "@/components/ui/badge";
import { ChapterReviewStatus } from "@/types/api";

const statusConfig: Record<
  ChapterReviewStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  revision_requested: { label: "Revision Requested", variant: "destructive" },
  pending_update: { label: "Pending Update", variant: "outline" },
};

export function ChapterStatusBadge({
  status,
}: {
  status: ChapterReviewStatus;
}) {
  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
