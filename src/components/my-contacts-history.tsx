"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Mail,
  Eye,
  Filter,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import { useMyContacts, useMyContact } from "@/hooks/use-contact";
import { UserContact } from "@/types/api";
import { formatDate } from "@/lib/novel-utils";
import { Label } from "@/components/ui/label";

export function MyContactsHistory() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: contactsData,
    loading,
    error,
  } = useMyContacts(1, statusFilter === "all" ? undefined : statusFilter);

  const { data: selectedContactData } = useMyContact(selectedContact || 0);

  const handleViewContact = (contactId: number) => {
    setSelectedContact(contactId);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Sent</Badge>;
      case "read":
        return (
          <Badge variant="default" className="bg-blue-600">
            Read
          </Badge>
        );
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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
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
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load your contact messages: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contacts = contactsData?.contacts?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                My Contact Messages
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                View your contact history and admin responses
              </p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                    Sent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("read")}>
                    Read by Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("replied")}>
                    Replied
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild size="sm">
                <Link href="/contact">
                  <Send className="mr-2 h-4 w-4" />
                  New Message
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "You haven't sent any contact messages yet."
                  : `No messages with status: ${statusFilter}.`}
              </p>
              <Button asChild>
                <Link href="/contact">
                  <Send className="mr-2 h-4 w-4" />
                  Send a Message
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <ContactMessageCard
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

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          {selectedContactData?.contact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedContactData.contact.subject}
                  {getStatusBadge(selectedContactData.contact.status)}
                </DialogTitle>
                <DialogDescription>
                  Sent on {formatDate(selectedContactData.contact.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">
                    {selectedContactData.contact.subject}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Your Message</Label>
                  <div className="bg-muted mt-1 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">
                      {selectedContactData.contact.message}
                    </p>
                  </div>
                </div>

                {selectedContactData.contact.admin_response ? (
                  <div>
                    <Label className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Admin Response
                    </Label>
                    <div className="mt-1 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <p className="whitespace-pre-wrap text-green-900 dark:text-green-100">
                        {selectedContactData.contact.admin_response}
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Responded on{" "}
                        {formatDate(selectedContactData.contact.responded_at!)}
                      </p>
                    </div>
                  </div>
                ) : selectedContactData.contact.status === "read" ? (
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <p className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <Eye className="h-4 w-4" />
                      Your message has been read by our team. You'll receive a
                      response soon.
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground text-sm">
                      <MessageSquare className="mb-1 inline h-4 w-4" /> Your
                      message is pending review. We'll get back to you as soon
                      as possible.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Contact Message Card Component
interface ContactMessageCardProps {
  contact: UserContact;
  onView: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

function ContactMessageCard({
  contact,
  onView,
  getStatusBadge,
}: ContactMessageCardProps) {
  return (
    <Card
      className={`transition-shadow hover:shadow-md ${contact.admin_response ? "border-l-4 border-green-500" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{contact.subject}</h3>
              {getStatusBadge(contact.status)}
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(contact.created_at)}</span>
            </div>

            <p className="text-muted-foreground line-clamp-2 text-sm">
              {contact.message}
            </p>

            {contact.admin_response && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Admin responded on {formatDate(contact.responded_at!)}
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
