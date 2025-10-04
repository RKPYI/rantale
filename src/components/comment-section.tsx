"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Edit, 
  Trash2,
  AlertTriangle,
  Clock,
  Star
} from 'lucide-react';

import { useNovelComments } from '@/hooks/use-comments';
import { useUserVoteOnComment } from '@/hooks/use-comments';
import { useAuth } from '@/hooks/use-auth';
import { commentService } from '@/services/comments';
import { useAsync } from '@/hooks/use-api';

import {
  formatCommentTime,
  isCommentEdited,
  getCommentVoteRatio,
  sortComments,
  truncateContent
} from '@/lib/content-utils';

import { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/api';

interface CommentSectionProps {
  novelSlug: string;
  chapterId?: number;
  title: string;
}

export function CommentSection({ novelSlug, chapterId, title }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'controversial'>('newest');
  const [showSpoilers, setShowSpoilers] = useState(false);

  const { user, isAuthenticated } = useAuth();
  
  // Fetch comments
  const { data: commentsData, loading: commentsLoading, error: commentsError, refetch: refetchComments } = 
    chapterId 
      ? useNovelComments(novelSlug) 
      : useNovelComments(novelSlug);

  // Async operations
  const { loading: submittingComment, execute: executeCommentAction } = useAsync();

  const comments = commentsData?.comments.data || [];
  const totalComments = commentsData?.total_comments_count || 0;
  const sortedComments = sortComments(comments, sortBy);

  // Create comment
  const handleCreateComment = async (parentId?: number) => {
    if (!newComment.trim() || !isAuthenticated) return;

    const commentData: CreateCommentRequest = {
      novel_id: 1, // This would need to be passed as prop or fetched
      content: newComment.trim(),
      ...(chapterId && { chapter_id: chapterId }),
      ...(parentId && { parent_id: parentId }),
    };

    try {
      await executeCommentAction(commentService.createComment, commentData);
      setNewComment('');
      setReplyingTo(null);
      refetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    const updateData: UpdateCommentRequest = {
      content: editContent.trim(),
    };

    try {
      await executeCommentAction(commentService.updateComment, commentId, updateData);
      setEditingComment(null);
      setEditContent('');
      refetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await executeCommentAction(commentService.deleteComment, commentId);
      refetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Vote on comment
  const handleVoteComment = async (commentId: number, isUpvote: boolean) => {
    if (!isAuthenticated) return;

    try {
      await executeCommentAction(commentService.voteOnComment, commentId, { is_upvote: isUpvote });
      refetchComments();
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // Comment component
  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const isOwner = user?.id === comment.user_id;
    const canEdit = isAuthenticated && (isOwner || user?.is_admin);
    const isEditing = editingComment === comment.id;
    const maxDepth = 3;

    return (
      <div className={`space-y-3 ${depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            {/* Comment Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {comment.user.avatar && (
                    <img src={comment.user.avatar} alt={comment.user.name} />
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.user.name}</span>
                    {comment.user.is_admin && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                    {!comment.user.email_verified_at && (
                      <Badge variant="outline" className="text-xs">Unverified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatCommentTime(comment.created_at)}
                    {isCommentEdited(comment) && <span>(edited)</span>}
                  </div>
                </div>
              </div>

              {/* Comment Actions */}
              {canEdit && (
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(comment)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Comment Content */}
            <div className="mb-3">
              {comment.is_spoiler && !showSpoilers ? (
                <div className="bg-muted p-3 rounded flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Spoiler content hidden</span>
                  <Button size="sm" variant="outline" onClick={() => setShowSpoilers(true)}>
                    Show Spoilers
                  </Button>
                </div>
              ) : isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                    placeholder="Edit your comment..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={submittingComment}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}

              {comment.is_spoiler && (
                <Badge variant="outline" className="text-xs mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Spoiler
                </Badge>
              )}
            </div>

            {/* Comment Footer */}
            {!isEditing && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Vote buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVoteComment(comment.id, true)}
                      disabled={!isAuthenticated || submittingComment}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVoteComment(comment.id, false)}
                      disabled={!isAuthenticated || submittingComment}
                    >
                      <ThumbsDown className="h-3 w-3" />
                      {comment.dislikes}
                    </Button>
                  </div>

                  {/* Reply button */}
                  {depth < maxDepth && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      disabled={!isAuthenticated}
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </Button>
                  )}
                </div>

                {/* Vote ratio indicator */}
                {(comment.likes + comment.dislikes) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {Math.round(getCommentVoteRatio(comment))}% positive
                  </div>
                )}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleCreateComment(comment.id)}
                    disabled={!newComment.trim() || submittingComment}
                  >
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments for {title}
          </CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{totalComments} comments</span>
            <div className="flex items-center gap-2">
              <label className="text-xs">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* New comment form */}
      {isAuthenticated ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this novel/chapter..."
                rows={4}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="spoiler-warning"
                    className="rounded"
                  />
                  <label htmlFor="spoiler-warning" className="text-sm">
                    This comment contains spoilers
                  </label>
                </div>
                <Button 
                  onClick={() => handleCreateComment()}
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-3">Please sign in to leave a comment</p>
            <Button variant="outline">Sign In</Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {commentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : commentsError ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-500 mb-3">Error loading comments: {commentsError}</p>
            <Button variant="outline" onClick={refetchComments}>Try Again</Button>
          </CardContent>
        </Card>
      ) : sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}