"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  Loader2,
} from "lucide-react";
import {
  useAdminAuthorApplications,
  useAdminAuthorApplication,
} from "@/hooks/use-admin";
import { AuthorApplication } from "@/types/api";
import { formatDate } from "@/lib/novel-utils";
import { adminService } from "@/services/admin";
import { logAndToastError } from "@/lib/utils";

// Helper to detect and warn about spam-like content
const detectSpamPattern = (text: string): boolean => {
  if (!text) return false;

  // Check for very long words (more than 50 characters without space)
  const hasLongWord = /\S{50,}/.test(text);

  // Check for excessive repetition of same character
  const hasRepetition = /(.)\1{20,}/.test(text);

  return hasLongWord || hasRepetition;
};

export function AuthorApplicationsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<number | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view">(
    "view",
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    data: applications,
    loading,
    error,
    refetch,
  } = useAdminAuthorApplications(
    1,
    statusFilter === "all" ? undefined : statusFilter,
  );
  const { data: selectedApp } = useAdminAuthorApplication(
    selectedApplication || 0,
  );

  // Track initial load to prevent skeleton flashing on filter changes
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

  const handleAction = async (
    applicationId: number,
    action: "approve" | "reject",
    notes?: string,
  ) => {
    try {
      if (action === "approve") {
        await adminService.approveAuthorApplication(applicationId, notes);
      } else {
        await adminService.rejectAuthorApplication(
          applicationId,
          notes || "No reason provided",
        );
      }
      await refetch();
      setIsDialogOpen(false);
      setAdminNotes("");
    } catch (error) {
      logAndToastError(
        error,
        `Failed to ${action} application`,
        `Failed to ${action} application. Please try again.`,
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Only show skeleton on initial load, not on filter changes
  if (loading && isInitialLoad) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load applications: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const applicationsList = ((
    applications as { applications?: { data?: AuthorApplication[] } }
  )?.applications?.data || []) as AuthorApplication[];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Student Applications</h3>
          <p className="text-muted-foreground text-sm">
            Review and manage student applications
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {loading && !isInitialLoad ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Filter className="mr-2 h-4 w-4" />
              )}
              Filter:{" "}
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              <span className={statusFilter === "all" ? "font-semibold" : ""}>
                All
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
              <span
                className={statusFilter === "pending" ? "font-semibold" : ""}
              >
                Pending
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
              <span
                className={statusFilter === "approved" ? "font-semibold" : ""}
              >
                Approved
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
              <span
                className={statusFilter === "rejected" ? "font-semibold" : ""}
              >
                Rejected
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Applications List */}
      {applicationsList.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="py-8 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No Applications</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "No student applications found"
                  : `No ${statusFilter} applications found`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 ${loading && !isInitialLoad ? "opacity-50" : "opacity-100"}`}
        >
          {applicationsList.map((application: AuthorApplication) => {
            const hasSuspiciousContent =
              detectSpamPattern(application.bio || "") ||
              detectSpamPattern(application.writing_experience || "") ||
              detectSpamPattern(application.sample_work || "");

            return (
              <Card
                key={application.id}
                className={hasSuspiciousContent ? "border-orange-500/50" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <h4 className="font-medium break-words">
                            {application.user?.name || "Unknown User"}
                          </h4>
                          <p className="text-muted-foreground text-sm break-all">
                            {application.user?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasSuspiciousContent && (
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-orange-600"
                            >
                              ⚠️ Suspicious
                            </Badge>
                          )}
                          {getStatusBadge(application.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div className="min-w-0">
                          <Label className="font-medium">Pen Name:</Label>
                          <p className="text-muted-foreground break-words">
                            {application.pen_name || "Not specified"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <Label className="font-medium">
                            Writing Experience:
                          </Label>
                          <p className="text-muted-foreground line-clamp-2 break-words">
                            {application.writing_experience}
                          </p>
                        </div>
                      </div>

                      {application.bio && (
                        <div className="min-w-0 text-sm">
                          <Label className="font-medium">Bio:</Label>
                          <p className="text-muted-foreground line-clamp-2 break-words">
                            {application.bio}
                          </p>
                        </div>
                      )}

                      {application.admin_notes && (
                        <div className="min-w-0 text-sm">
                          <Label className="font-medium">Admin Notes:</Label>
                          <p className="text-muted-foreground break-words">
                            {application.admin_notes}
                          </p>
                        </div>
                      )}

                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>
                          Applied: {formatDate(application.created_at)}
                        </span>
                        {application.reviewed_at && (
                          <span>
                            Reviewed: {formatDate(application.reviewed_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(application.id);
                          setActionType("view");
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>

                      {application.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedApplication(application.id);
                              setActionType("approve");
                              setIsDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedApplication(application.id);
                              setActionType("reject");
                              setIsDialogOpen(true);
                            }}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Application"
                : actionType === "reject"
                  ? "Reject Application"
                  : "Application Details"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Add optional notes and approve this student application."
                : actionType === "reject"
                  ? "Please provide a reason for rejecting this application."
                  : "View detailed information about this application."}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <Label className="font-medium">Applicant:</Label>
                  <p className="overflow-hidden break-words">
                    {selectedApp.user?.name}
                  </p>
                </div>
                <div className="min-w-0">
                  <Label className="font-medium">Email:</Label>
                  <p className="overflow-hidden break-all">
                    {selectedApp.user?.email}
                  </p>
                </div>
                <div className="min-w-0">
                  <Label className="font-medium">Pen Name:</Label>
                  <p className="overflow-hidden break-words">
                    {selectedApp.pen_name || "Not specified"}
                  </p>
                </div>
                <div className="min-w-0">
                  <Label className="font-medium">Status:</Label>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <Label className="font-medium">Bio:</Label>
                <div className="text-muted-foreground bg-muted max-h-40 overflow-y-auto rounded p-3 text-sm">
                  <p
                    className="break-words whitespace-pre-wrap"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selectedApp.bio}
                  </p>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <Label className="font-medium">Writing Experience:</Label>
                <div className="text-muted-foreground bg-muted max-h-40 overflow-y-auto rounded p-3 text-sm">
                  <p
                    className="break-words whitespace-pre-wrap"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selectedApp.writing_experience}
                  </p>
                </div>
              </div>

              {selectedApp.sample_work && (
                <div className="min-w-0 space-y-2">
                  <Label className="font-medium">Sample Work:</Label>
                  <div className="text-muted-foreground bg-muted max-h-40 overflow-y-auto rounded p-3 text-sm">
                    <p
                      className="break-words whitespace-pre-wrap"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedApp.sample_work}
                    </p>
                  </div>
                </div>
              )}

              {selectedApp.portfolio_url && (
                <div className="min-w-0 space-y-2">
                  <Label className="font-medium">Portfolio URL:</Label>
                  <a
                    href={selectedApp.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden text-sm break-all text-blue-600 hover:underline"
                  >
                    {selectedApp.portfolio_url}
                  </a>
                </div>
              )}

              {(actionType === "approve" || actionType === "reject") && (
                <div className="space-y-2">
                  <Label className="font-medium">
                    {actionType === "reject"
                      ? "Rejection Reason *"
                      : "Admin Notes (Optional)"}
                  </Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={
                      actionType === "reject"
                        ? "Please provide a reason for rejection..."
                        : "Add any notes for this approval..."
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {actionType === "approve" && (
              <Button
                onClick={() =>
                  handleAction(selectedApplication!, "approve", adminNotes)
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Application
              </Button>
            )}
            {actionType === "reject" && (
              <Button
                variant="destructive"
                onClick={() =>
                  handleAction(selectedApplication!, "reject", adminNotes)
                }
                disabled={!adminNotes.trim()}
              >
                Reject Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
