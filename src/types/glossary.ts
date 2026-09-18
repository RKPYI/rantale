import type { Novel } from "./novel";

export type GlossaryEntityType =
  | "character"
  | "item"
  | "place"
  | "faction"
  | "creature"
  | "skill"
  | "system"
  | "event"
  | "rule"
  | "concept"
  | "other";

export interface GlossaryChapter {
  id: number;
  chapter_number: number;
  title: string;
  volume?: { volume_number: number } | null;
}

export interface GlossaryEvidence {
  id: number;
  chapter_id: number;
  quote: string;
  context: string | null;
  confidence: number;
  chapter: GlossaryChapter;
}

export interface GlossaryEntity {
  id: number;
  type: GlossaryEntityType;
  canonical_name: string;
  aliases: string[] | null;
}

export interface GlossaryFact {
  id: number;
  fact_key: string;
  value: string;
  previous_value?: string | null;
  confidence: number;
  status: "active" | "pending_review" | "rejected";
  first_seen_chapter_id: number | null;
  last_seen_chapter_id: number | null;
  last_updated_at: string | null;
  entity: GlossaryEntity;
  evidence: GlossaryEvidence[];
}

export interface GlossaryBoundary {
  id: number;
  chapter_number: number;
  title: string;
  volume_number?: number | null;
}

export interface GlossaryResponse {
  novel: { id: number; title: string; slug: string };
  max_chapter: number | null;
  boundary?: GlossaryBoundary | null;
  facts: GlossaryFact[];
}

export interface GlossaryNovelStatus extends Novel {
  published_chapters_count: number;
  glossary_entities_count: number;
  glossary_facts_count: number;
  pending_glossary_facts_count: number;
  glossary_facts_max_updated_at: string | null;
  glossary_scan_status: "not_started" | "queued" | "running" | "completed" | "failed" | "stale";
  glossary_last_scan_at: string | null;
  glossary_last_scan_error: string | null;
}

export interface GlossaryNovelStatusResponse {
  current_page: number;
  data: GlossaryNovelStatus[];
  last_page: number;
  total: number;
}

export interface GlossaryReviewResponse {
  fact: GlossaryFact;
}

export interface StoryCompanionCitation {
  chapter_id: number;
  chapter_number: number;
  quote: string;
}

export interface StoryCompanionResponse {
  answer: string;
  availability: "answered" | "not_available" | "insufficient_evidence";
  citations: StoryCompanionCitation[];
  boundary: GlossaryBoundary | null;
}

export interface GlossaryBulkReviewResponse {
  processed_ids: number[];
  skipped_ids: number[];
}

export interface GlossaryProposal {
  id: number;
  operation: string;
  status: "pending" | "approved" | "rejected" | "auto_applied" | "superseded";
  ai_recommendation?: "approve" | "reject" | "needs_review" | null;
  ai_explanation?: string | null;
  confidence: number;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  reason: string | null;
  entity?: GlossaryEntity | null;
  fact?: GlossaryFact | null;
  observation?: {
    chapter_id: number;
    entity_name: string;
    value: string;
    quote: string;
    chapter?: GlossaryChapter;
  } | null;
}

export interface GlossaryProposalResponse {
  data: GlossaryProposal[];
}
