"use client";

import { useState, useCallback } from "react";
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Edit,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Shield,
  PenTool,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorialGroups } from "@/hooks/use-admin";
import { adminService } from "@/services/admin";
import { EditorialGroup, EditorialGroupMember } from "@/types/api";
import { logAndToastError, ApiError } from "@/lib/error-utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteModal } from "@/components/ui/delete-modal";

export function EditorialGroupsTab() {
  const { data: groups, loading, error, refetch } = useEditorialGroups();
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return <EditorialGroupsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load editorial groups: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Editorial Groups</h2>
          <p className="text-muted-foreground text-sm">
            Manage editorial groups, assign editors and students
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <CreateGroupDialog
            onSuccess={() => {
              setShowCreateDialog(false);
              refetch();
            }}
          />
        </Dialog>
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No editorial groups yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first editorial group to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              expanded={expandedGroup === group.id}
              onToggle={() =>
                setExpandedGroup(expandedGroup === group.id ? null : group.id)
              }
              onRefresh={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────

interface GroupCardProps {
  group: EditorialGroup;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

function GroupCard({ group, expanded, onToggle, onRefresh }: GroupCardProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [removingMember, setRemovingMember] = useState<{
    username: string;
    name: string;
  } | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteEditorialGroup(group.id);
      toast.success("Group deleted successfully");
      onRefresh();
    } catch (err) {
      logAndToastError(err, "Failed to delete group");
    } finally {
      setDeleting(false);
      setShowDeleteGroup(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await adminService.removeMemberFromGroup(
        group.id,
        removingMember.username,
      );
      toast.success(`${removingMember.name} removed from group`);
      onRefresh();
    } catch (err) {
      logAndToastError(err, "Failed to remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          className="hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {group.tag}
              </Badge>
              <Badge variant={group.is_active ? "default" : "secondary"}>
                {group.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {group.member_count} member{group.member_count !== 1 ? "s" : ""}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
          {group.description && (
            <p className="text-muted-foreground text-sm">{group.description}</p>
          )}
        </CardHeader>

        {expanded && (
          <CardContent className="space-y-4 border-t pt-4">
            {/* Editor Section */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Editor</h4>
              </div>
              {group.editor ? (
                <MemberRow
                  member={group.editor}
                  onRemove={() =>
                    setRemovingMember({
                      username: group.editor!.username,
                      name: group.editor!.name,
                    })
                  }
                />
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No editor assigned
                </p>
              )}
            </div>

            {/* Authors Section */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <PenTool className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">
                  Students ({group.authors.length})
                </h4>
              </div>
              {group.authors.length > 0 ? (
                <div className="space-y-2">
                  {group.authors.map((author) => (
                    <MemberRow
                      key={author.id}
                      member={author}
                      onRemove={() =>
                        setRemovingMember({
                          username: author.username,
                          name: author.name,
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No authors assigned
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <AddMemberDialog
                  groupId={group.id}
                  hasEditor={!!group.editor}
                  onSuccess={() => {
                    setShowAddMember(false);
                    onRefresh();
                  }}
                />
              </Dialog>

              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Group
                  </Button>
                </DialogTrigger>
                <EditGroupDialog
                  group={group}
                  onSuccess={() => {
                    setShowEditDialog(false);
                    onRefresh();
                  }}
                />
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteGroup(true)}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delete Group Modal */}
      <DeleteModal
        open={showDeleteGroup}
        onOpenChange={setShowDeleteGroup}
        onConfirm={handleDelete}
        isLoading={deleting}
        title={`Delete "${group.name}"?`}
        description="This will permanently delete this editorial group and remove all member assignments. This action cannot be undone."
        confirmText="Delete Group"
      />

      {/* Remove Member Modal */}
      <DeleteModal
        open={!!removingMember}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        onConfirm={handleRemoveMember}
        title={`Remove ${removingMember?.name ?? "member"}?`}
        description={`This will remove @${removingMember?.username ?? ""} from this editorial group.`}
        confirmText="Remove"
        variant="warning"
      />
    </>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────

function MemberRow({
  member,
  onRemove,
}: {
  member: EditorialGroupMember;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.avatar || undefined} />
          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-muted-foreground text-xs">@{member.username}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <UserMinus className="text-destructive h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Create Group Dialog ──────────────────────────────────────────────

function CreateGroupDialog({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !tag.trim()) return;
    setSubmitting(true);
    try {
      await adminService.createEditorialGroup({
        name: name.trim(),
        tag: tag.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Group created successfully");
      setName("");
      setTag("");
      setDescription("");
      onSuccess();
    } catch (err) {
      logAndToastError(err, "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Editorial Group</DialogTitle>
        <DialogDescription>
          Create a new editorial group for organizing editors and authors.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            placeholder="e.g. Fantasy Review Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="group-tag">Tag</Label>
          <Input
            id="group-tag"
            placeholder="e.g. FRT"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={10}
          />
          <p className="text-muted-foreground text-xs">
            Short identifier for the group (max 10 chars)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="group-description">Description (optional)</Label>
          <Textarea
            id="group-description"
            placeholder="Describe the purpose of this group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !tag.trim()}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Group
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Edit Group Dialog ────────────────────────────────────────────────

function EditGroupDialog({
  group,
  onSuccess,
}: {
  group: EditorialGroup;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [tag, setTag] = useState(group.tag);
  const [description, setDescription] = useState(group.description || "");
  const [isActive, setIsActive] = useState(group.is_active);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await adminService.updateEditorialGroup(group.id, {
        name: name.trim() || undefined,
        tag: tag.trim() || undefined,
        description: description.trim() || undefined,
        is_active: isActive,
      });
      toast.success("Group updated successfully");
      onSuccess();
    } catch (err) {
      logAndToastError(err, "Failed to update group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Group: {group.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Group Name</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tag">Tag</Label>
          <Input
            id="edit-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="edit-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="edit-active">Active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Add Member Dialog ────────────────────────────────────────────────

function AddMemberDialog({
  groupId,
  hasEditor,
  onSuccess,
}: {
  groupId: number;
  hasEditor: boolean;
  onSuccess: () => void;
}) {
  const [role, setRole] = useState<"editor" | "author">(
    hasEditor ? "author" : "editor",
  );
  const [username, setUsername] = useState("");
  const [authorUsernames, setAuthorUsernames] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setValidationErrors([]);
    try {
      if (role === "editor") {
        if (!username.trim()) return;
        await adminService.addMemberToGroup(groupId, {
          username: username.trim(),
          role: "editor",
        });
        toast.success("Editor added to group");
      } else {
        const usernames = authorUsernames
          .split(/[,\n]+/)
          .map((u) => u.trim())
          .filter(Boolean);
        if (usernames.length === 0) return;
        await adminService.addMemberToGroup(groupId, {
          usernames,
          role: "author",
        });
        toast.success(
          `${usernames.length} student${usernames.length > 1 ? "s" : ""} added to group`,
        );
      }
      setUsername("");
      setAuthorUsernames("");
      onSuccess();
    } catch (err) {
      // Extract per-field validation errors from ApiError details
      const apiErr = err as ApiError;
      if (apiErr?.details) {
        const allErrors = Object.values(apiErr.details).flat();
        if (allErrors.length > 0) {
          setValidationErrors(allErrors);
          return;
        }
      }
      logAndToastError(err, "Failed to add member(s)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Member</DialogTitle>
        <DialogDescription>
          Add an editor or authors to this group by username.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 text-sm">
                {validationErrors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Role</Label>
          <div className="flex gap-2">
            <Button
              variant={role === "editor" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRole("editor");
                setValidationErrors([]);
              }}
              disabled={hasEditor}
            >
              <Shield className="mr-2 h-4 w-4" />
              Editor
            </Button>
            <Button
              variant={role === "author" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRole("author");
                setValidationErrors([]);
              }}
            >
              <PenTool className="mr-2 h-4 w-4" />
              Author
            </Button>
          </div>
          {hasEditor && role !== "author" && (
            <p className="text-xs text-amber-500">
              This group already has an editor. Remove the current editor first.
            </p>
          )}
        </div>

        {role === "editor" ? (
          <div className="space-y-2">
            <Label htmlFor="editor-username">Editor Username</Label>
            <Input
              id="editor-username"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="author-usernames">Student Usernames</Label>
            <Textarea
              id="author-usernames"
              placeholder="Enter usernames separated by commas or new lines&#10;e.g. alice, bob, charlie"
              value={authorUsernames}
              onChange={(e) => setAuthorUsernames(e.target.value)}
              rows={4}
            />
            <p className="text-muted-foreground text-xs">
              You can add multiple authors at once
            </p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={
            submitting ||
            (role === "editor" && !username.trim()) ||
            (role === "author" && !authorUsernames.trim())
          }
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add {role === "editor" ? "Editor" : "Student(s)"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────

function EditorialGroupsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
