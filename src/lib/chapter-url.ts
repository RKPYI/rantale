import type { ChapterSummary, NovelWithChapters, VolumeSummary } from "@/types/novel";

export interface ChapterPathInput {
  chapter_number: number;
  volume_number?: number | null;
}

export function isVolumeNovel(usesVolumes?: boolean): boolean {
  return usesVolumes === true;
}

export function getChapterHrefFromParts(
  slug: string,
  chapterNumber: number,
  usesVolumes?: boolean,
  volumeNumber?: number | null,
): string | null {
  if (isVolumeNovel(usesVolumes)) {
    if (volumeNumber == null) {
      return null;
    }

    return `/novels/${slug}/volumes/${volumeNumber}/chapters/${chapterNumber}`;
  }

  return `/novels/${slug}/chapters/${chapterNumber}`;
}

export function getChapterLabelFromParts(
  chapterNumber: number,
  usesVolumes?: boolean,
  volumeNumber?: number | null,
): string {
  if (isVolumeNovel(usesVolumes) && volumeNumber != null) {
    return `Vol. ${volumeNumber} · Ch. ${chapterNumber}`;
  }

  return `Ch. ${chapterNumber}`;
}

export function getChapterPath(
  novelSlug: string,
  chapter: ChapterPathInput,
  usesVolumes?: boolean,
): string {
  return (
    getChapterHrefFromParts(
      novelSlug,
      chapter.chapter_number,
      usesVolumes,
      chapter.volume_number,
    ) ?? `/novels/${novelSlug}/chapters/${chapter.chapter_number}`
  );
}

export function getChapterLabel(
  chapter: ChapterPathInput,
  usesVolumes?: boolean,
): string {
  return getChapterLabelFromParts(
    chapter.chapter_number,
    usesVolumes,
    chapter.volume_number,
  );
}

export function flattenNovelChapters(
  novel: Pick<NovelWithChapters, "uses_volumes" | "chapters" | "volumes">,
): ChapterSummary[] {
  if (novel.uses_volumes && novel.volumes?.length) {
    return novel.volumes.flatMap((volume) =>
      volume.chapters.map((chapter) => ({
        ...chapter,
        volume_id: chapter.volume_id ?? volume.id,
        volume_number: chapter.volume_number ?? volume.volume_number,
      })),
    );
  }

  return [...(novel.chapters ?? [])].sort(
    (a, b) => a.chapter_number - b.chapter_number,
  );
}

export function groupChaptersByVolume(
  volumes: VolumeSummary[] | undefined,
): VolumeSummary[] {
  return (volumes ?? []).map((volume) => ({
    ...volume,
    chapters: [...volume.chapters].sort(
      (a, b) => a.chapter_number - b.chapter_number,
    ),
  }));
}

export function getNavigationChapter(
  chapter: {
    previous_chapter?: number | null;
    next_chapter?: number | null;
    previous_volume?: number | null;
    next_volume?: number | null;
  },
  direction: "previous" | "next",
  usesVolumes?: boolean,
): ChapterPathInput | null {
  const chapterNumber =
    direction === "previous" ? chapter.previous_chapter : chapter.next_chapter;

  if (chapterNumber == null) {
    return null;
  }

  if (usesVolumes) {
    const volumeNumber =
      direction === "previous" ? chapter.previous_volume : chapter.next_volume;

    if (volumeNumber == null) {
      return null;
    }

    return { chapter_number: chapterNumber, volume_number: volumeNumber };
  }

  return { chapter_number: chapterNumber };
}
