"use client";

import { useState, useEffect, useMemo } from "react";
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
  Mail,
  Send,
  Filter,
  Loader2,
  Trash2,
  User,
  Calendar,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useAdminContacts, useAdminContact } from "@/hooks/use-admin";
import { AdminContact } from "@/types/api";
import { formatDate } from "@/lib/novel-utils";
import { adminService } from "@/services/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteModal } from "@/components/ui/delete-modal";
import { logAndToastError } from "@/lib/utils";

export function ContactsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRespondMode, setIsRespondMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: contactsData,
    loading,
    error,
    refetch,
  } = useAdminContacts(1, statusFilter === "all" ? undefined : statusFilter);

  const { data: selectedContactData } = useAdminContact(selectedContact || 0);

  // Track initial load to prevent skeleton flashing on filter changes
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

  // Calculate stats from the contact data
  const stats = useMemo(() => {
    const contacts = contactsData?.data || [];
    return {
      total: contactsData?.total || 0,
      new: contacts.filter((c) => c.status === "new").length,
      read: contacts.filter((c) => c.status === "read").length,
      replied: contacts.filter((c) => c.status === "replied").length,
    };
  }, [contactsData]);

  const handleViewContact = (contactId: number) => {
    setSelectedContact(contactId);
    setIsRespondMode(false);
    setAdminResponse("");
    setSuccessMessage("");
    setIsDialogOpen(true);
  };

  const handleRespondClick = () => {
    setIsRespondMode(true);
    // Pre-fill with existing response if any
    if (selectedContactData?.admin_response) {
      setAdminResponse(selectedContactData.admin_response);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedContact || !adminResponse.trim()) return;

    setIsSubmitting(true);
    try {
      await adminService.respondToContact(selectedContact, {
        admin_response: adminResponse.trim(),
      });
      setSuccessMessage("Response sent successfully!");
      setIsRespondMode(false);
      await refetch();
      // Refresh the selected contact data
      setSelectedContact(null);
      setTimeout(() => {
        setSelectedContact(selectedContact);
      }, 100);
    } catch (error) {
      logAndToastError(
        error,
        "Failed to send response",
        "Failed to send response. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    setContactToDelete(contactId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    try {
      await adminService.deleteContact(contactToDelete);
      await refetch();
      setIsDialogOpen(false);
      setDeleteModalOpen(false);
      setContactToDelete(null);
    } catch (error) {
      logAndToastError(
        error,
        "Failed to delete contact",
        "Failed to delete contact. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="default" className="bg-blue-600">
            New
          </Badge>
        );
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "replied":
        return (
          <Badge variant="default" className="bg-green-600">
            Replied
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFilterBadge = (filter: string) => {
    if (!stats) return null;

    const count =
      filter === "all"
        ? stats.total
        : filter === "new"
          ? stats.new
          : filter === "read"
            ? stats.read
            : stats.replied;

    return (
      <Badge variant="outline" className="ml-2">
        {count}
      </Badge>
    );
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
          <p className="text-red-600">Failed to load contacts: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const contacts = contactsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">New</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.new}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Read</p>
                  <p className="text-2xl font-bold">{stats.read}</p>
                </div>
                <Eye className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Replied</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.replied}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Contact Messages</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {statusFilter}
                  {getFilterBadge(statusFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All {getFilterBadge("all")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                  New {getFilterBadge("new")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("read")}>
                  Read {getFilterBadge("read")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("replied")}>
                  Replied {getFilterBadge("replied")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No contact messages found
                {statusFilter !== "all" && ` with status: ${statusFilter}`}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onView={() => handleViewContact(contact.id)}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View/Respond Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          {selectedContactData ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Message #{selectedContactData.id}
                  {getStatusBadge(selectedContactData.status)}
                </DialogTitle>
                <DialogDescription>
                  Received on {formatDate(selectedContactData.created_at)}
                </DialogDescription>
              </DialogHeader>

              {successMessage && (
                <Alert className="bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedContactData.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedContactData.email}</p>
                  </div>
                </div>

                {selectedContactData.user && (
                  <div>
                    <Label className="text-muted-foreground">
                      Registered User
                    </Label>
                    <p className="font-medium">
                      {selectedContactData.user.name} (ID:{" "}
                      {selectedContactData.user.id})
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedContactData.subject}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <div className="bg-muted mt-1 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">
                      {selectedContactData.message}
                    </p>
                  </div>
                </div>

                {/* Existing Admin Response */}
                {selectedContactData.admin_response && !isRespondMode && (
                  <div>
                    <Label className="text-muted-foreground">
                      Admin Response
                    </Label>
                    <div className="mt-1 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <p className="whitespace-pre-wrap text-green-900 dark:text-green-100">
                        {selectedContactData.admin_response}
                      </p>
                      {selectedContactData.responder && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          Responded by: {selectedContactData.responder.name} on{" "}
                          {formatDate(selectedContactData.responded_at!)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                {isRespondMode && (
                  <div>
                    <Label htmlFor="adminResponse">Your Response</Label>
                    <Textarea
                      id="adminResponse"
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={6}
                      className="mt-1"
                    />
                    <p className="text-muted-foreground mt-1 text-sm">
                      {selectedContactData.user_id
                        ? "User will receive an in-app notification and email."
                        : "User will receive an email notification."}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {!isRespondMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleDeleteContact(selectedContactData.id)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button onClick={handleRespondClick}>
                      <Send className="mr-2 h-4 w-4" />
                      {selectedContactData.admin_response
                        ? "Update Response"
                        : "Send Response"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRespondMode(false);
                        setAdminResponse("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendResponse}
                      disabled={!adminResponse.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Loading...</DialogTitle>
                <DialogDescription>
                  Please wait while we load the contact details.
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center">
                <Loader2 className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Contact Message"
        description="Are you sure you want to delete this contact message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

// Contact Card Component
interface ContactCardProps {
  contact: AdminContact;
  onView: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

function ContactCard({ contact, onView, getStatusBadge }: ContactCardProps) {
  return (
    <Card
      className={`transition-shadow hover:shadow-md ${contact.status === "new" ? "border-l-4 border-blue-500" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{contact.subject}</h3>
              {getStatusBadge(contact.status)}
              {contact.status === "new" && (
                <Badge variant="default" className="bg-blue-600">
                  Unread
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {contact.name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {contact.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(contact.created_at)}
              </span>
            </div>

            <p className="text-muted-foreground line-clamp-2 text-sm">
              {contact.message}
            </p>

            {contact.admin_response && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Responded
                  {contact.responder && ` by ${contact.responder.name}`}
                </span>
              </div>
            )}
          </div>

          <Button size="sm" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
