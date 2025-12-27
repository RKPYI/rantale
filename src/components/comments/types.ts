import { Comment } from "@/types/api";

export interface CommentSectionProps {
  novelSlug: string;
  novelId: number;
  chapterId?: number;
  chapterNumber?: number;
  title: string;
}

export interface CommentItemProps {
  comment: Comment;
  depth?: number;
  userId?: number;
  isAdmin?: boolean;
  userVotes: Map<number, boolean | null>;
  openSpoilers: Set<number>;
  collapsedReplies: Set<number>;
  replyingTo: number | null;
  editingComment: number | null;
  onStartReply: (commentId: number) => void;
  onCancelReply: () => void;
  onSubmitReply: (
    parentId: number,
    content: string,
    isSpoiler: boolean,
  ) => void;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onVote: (commentId: number, isUpvote: boolean) => void;
  onToggleSpoiler: (commentId: number) => void;
  onToggleRepliesCollapsed: (commentId: number) => void;
  isSubmitting: boolean;
}

export interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSpoiler: boolean;
  onSpoilerChange: (isSpoiler: boolean) => void;
  placeholder?: string;
  submitText?: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  showCancel?: boolean;
}

export interface CommentHeaderProps {
  comment: Comment;
  canEdit: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
}

export interface CommentContentProps {
  comment: Comment;
  isEditing: boolean;
  isSpoilerOpen: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onSubmitEdit: () => void;
  onCancelEdit: () => void;
  onToggleSpoiler: () => void;
  isSubmitting: boolean;
}

export interface CommentActionsProps {
  comment: Comment;
  userId?: number;
  userVote: boolean | null;
  depth: number;
  maxDepth: number;
  isEditing: boolean;
  isReplying: boolean;
  onVote: (isUpvote: boolean) => void;
  onToggleReply: () => void;
  isSubmitting: boolean;
}

export type SortOption = "newest" | "oldest" | "popular" | "controversial";
