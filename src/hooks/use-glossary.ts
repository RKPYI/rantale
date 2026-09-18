"use client";

import { glossaryService } from "@/services/glossary";
import type { GlossaryResponse } from "@/types/glossary";
import { useApi } from "./use-api";

export function useReaderGlossary(slug: string, enabled = true) {
  return useApi<GlossaryResponse>(
    () => (enabled ? glossaryService.getReaderGlossary(slug) : Promise.resolve(null as never)),
    [slug, enabled],
  );
}

export function useAdminGlossaryNovels(search?: string, page?: number) {
  return useApi(
    () => glossaryService.getAdminNovels(search, page),
    [search, page],
  );
}
