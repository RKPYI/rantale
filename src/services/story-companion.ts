import { apiClient } from "@/lib/api-client";
import type { StoryCompanionResponse } from "@/types/glossary";

export interface StoryCompanionMessage {
  role: "user" | "assistant";
  content: string;
}

export const storyCompanionService = {
  async ask(
    slug: string,
    question: string,
    history: StoryCompanionMessage[],
  ): Promise<StoryCompanionResponse> {
    const response = await apiClient.post<StoryCompanionResponse>(
      `/novels/${slug}/story-companion`,
      { question, history },
    );
    return response.data;
  },
};
