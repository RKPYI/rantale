import { apiClient } from "@/lib/api-client";
import {
  Comment,
  CommentsResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  VoteCommentRequest,
  CommentResponse,
  VoteResponse,
  CommentVote,
  AdminCommentsResponse,
  PaginatedResponse,
} from "@/types/api";

export const commentService = {
  // Get comments for a novel
  async getNovelComments(
    novelSlug: string,
    page?: number,
  ): Promise<CommentsResponse> {
    const params = page ? { page } : {};
    const response = await apiClient.get<CommentsResponse>(
      `/novels/${novelSlug}/comments`,
      params,
    );
    return response.data;
  },

  // Get comments for a chapter
  async getChapterComments(
    novelSlug: string,
    chapterId: number,
    page?: number,
  ): Promise<CommentsResponse> {
    const params = page ? { page } : {};
    const response = await apiClient.get<CommentsResponse>(
      `/novels/${novelSlug}/chapters/${chapterId}/comments`,
      params,
    );
    return response.data;
  },

  // Create a new comment (requires authentication)
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<CommentResponse>("/comments", data);
    return response.data.comment;
  },

  // Update a comment (requires authentication and ownership)
  async updateComment(
    commentId: number,
    data: UpdateCommentRequest,
  ): Promise<Comment> {
    const response = await apiClient.put<CommentResponse>(
      `/comments/${commentId}`,
      data,
    );
    return response.data.comment;
  },

  // Delete a comment (requires authentication and ownership or admin)
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // Vote on a comment (requires authentication)
  async voteOnComment(
    commentId: number,
    data: VoteCommentRequest,
  ): Promise<{ likes: number; dislikes: number; message: string }> {
    const response = await apiClient.post<VoteResponse>(
      `/comments/${commentId}/vote`,
      data,
    );
    return {
      likes: response.data.likes,
      dislikes: response.data.dislikes,
      message: response.data.message,
    };
  },

  // Get user's vote on a comment (requires authentication)
  async getUserVoteOnComment(commentId: number): Promise<CommentVote | null> {
    const response = await apiClient.get<{ vote: CommentVote | null }>(
      `/comments/${commentId}/vote`,
    );
    return response.data.vote;
  },

  // Admin: Get all comments (requires admin)
  async getAllComments(page?: number): Promise<AdminCommentsResponse> {
    const params = page ? { page } : {};
    const response = await apiClient.get<AdminCommentsResponse>(
      "/admin/comments",
      params,
    );
    return response.data;
  },

  // Admin: Toggle comment approval (requires admin)
  async toggleCommentApproval(commentId: number): Promise<Comment> {
    const response = await apiClient.put<CommentResponse>(
      `/admin/comments/${commentId}/toggle-approval`,
    );
    return response.data.comment;
  },
};
