import { apiClient } from "@/lib/api-client";
import type {
  GlossaryFact,
  GlossaryBulkReviewResponse,
  GlossaryNovelStatusResponse,
  GlossaryResponse,
  GlossaryProposalResponse,
  GlossaryReviewResponse,
} from "@/types/glossary";

export const glossaryService = {
  async getReaderGlossary(slug: string): Promise<GlossaryResponse> {
    const response = await apiClient.get<GlossaryResponse>(`/novels/${slug}/glossary`);
    return response.data;
  },

  async getAdminNovels(search?: string, page?: number): Promise<GlossaryNovelStatusResponse> {
    const response = await apiClient.get<GlossaryNovelStatusResponse>("/admin/glossary/novels", {
      search,
      page,
      per_page: 20,
    });
    return response.data;
  },

  async scanNovel(slug: string): Promise<{ queued_chapters: number }> {
    const response = await apiClient.post<{ queued_chapters: number }>(
      `/admin/novels/${slug}/glossary/scan`,
    );
    return response.data;
  },

  async resumeScanNovel(slug: string): Promise<{ queued_chapters: number; skipped_chapters: number }> {
    const response = await apiClient.post<{ queued_chapters: number; skipped_chapters: number }>(
      `/admin/novels/${slug}/glossary/resume`,
    );
    return response.data;
  },

  async getPendingFacts(slug: string): Promise<{ data: GlossaryFact[] }> {
    const response = await apiClient.get<{ data: GlossaryFact[] }>(
      `/admin/novels/${slug}/glossary/pending`,
    );
    return response.data;
  },

  async reviewFact(
    slug: string,
    factId: number,
    action: "approve" | "reject",
    notes?: string,
  ): Promise<GlossaryReviewResponse> {
    const response = await apiClient.post<GlossaryReviewResponse>(
      `/admin/novels/${slug}/glossary/${factId}/review`,
      { action, notes },
    );
    return response.data;
  },

  async bulkReview(
    slug: string,
    factIds: number[],
    action: "approve" | "reject",
    notes?: string,
  ) {
    const response = await apiClient.post<GlossaryBulkReviewResponse>(
      `/admin/novels/${slug}/glossary/review-bulk`,
      { fact_ids: factIds, action, notes },
    );
    return response.data;
  },

  async getProposals(slug: string, status = "pending"): Promise<GlossaryProposalResponse> {
    const response = await apiClient.get<GlossaryProposalResponse>(
      `/admin/novels/${slug}/glossary/proposals`,
      { status, per_page: 50 },
    );
    return response.data;
  },

  async decideProposal(
    slug: string,
    proposalId: number,
    action: "approve" | "reject",
    notes?: string,
  ): Promise<{ proposal: import("@/types/glossary").GlossaryProposal }> {
    const response = await apiClient.post<{ proposal: import("@/types/glossary").GlossaryProposal }>(
      `/admin/novels/${slug}/glossary/proposals/${proposalId}/decision`,
      { action, notes },
    );
    return response.data;
  },

  async updateFact(
    slug: string,
    factId: number,
    value: string,
    factKey?: string,
  ): Promise<{ fact: GlossaryFact }> {
    const response = await apiClient.patch<{ fact: GlossaryFact }>(
      `/admin/novels/${slug}/glossary/facts/${factId}`,
      { value, fact_key: factKey },
    );
    return response.data;
  },
};
