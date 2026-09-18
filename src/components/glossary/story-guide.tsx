"use client";

import { useMemo, useState } from "react";
import {
  BookMarked,
  ChevronDown,
  Quote,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useNovelProgress } from "@/hooks/use-reading-progress";
import { useReaderGlossary } from "@/hooks/use-glossary";
import type {
  GlossaryEntityType,
  GlossaryFact,
} from "@/types/glossary";

const labels: Record<GlossaryEntityType, string> = {
  character: "Characters",
  item: "Items",
  place: "Places",
  faction: "Factions",
  creature: "Creatures",
  skill: "Skills",
  system: "Systems",
  event: "Events",
  rule: "Rules",
  concept: "Concepts",
  other: "Other",
};

export function StoryGuide({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const { data: progress } = useNovelProgress(slug);
  const { data, loading, error } = useReaderGlossary(slug, isAuthenticated);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<GlossaryEntityType | "all">("all");

  const groupedEntities = useMemo(() => {
    const query = search.trim().toLowerCase();
    const grouped = new Map<number, GlossaryFact[]>();

    (data?.facts ?? []).forEach((fact) => {
      const matchesType = type === "all" || fact.entity.type === type;
      const matchesSearch =
        !query ||
        fact.entity.canonical_name.toLowerCase().includes(query) ||
        fact.value.toLowerCase().includes(query) ||
        fact.fact_key.toLowerCase().includes(query);

      if (!matchesType || !matchesSearch) return;
      grouped.set(fact.entity.id, [...(grouped.get(fact.entity.id) ?? []), fact]);
    });

    return Array.from(grouped.entries())
      .map(([entityId, facts]) => ({
        entityId,
        entity: facts[0].entity,
        facts: facts.sort((a, b) => chapterFor(b) - chapterFor(a)),
      }))
      .sort((a, b) => a.entity.canonical_name.localeCompare(b.entity.canonical_name));
  }, [data?.facts, search, type]);

  if (!isAuthenticated) {
    return (
      <Alert>
        <ShieldAlert className="size-4" />
        <AlertDescription>
          Sign in and start reading to unlock a spoiler-safe story guide based on your progress.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) return <GuideSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const boundary = data?.boundary;
  const categories = Array.from(
    new Set((data?.facts ?? []).map((fact) => fact.entity.type)),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="text-primary size-5" />
            <h2 className="text-lg font-semibold">Story guide</h2>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {boundary
              ? `Showing what is known through Chapter ${boundary.chapter_number}${boundary.title ? ` · ${boundary.title}` : ""}.`
              : "Read a chapter to establish your spoiler boundary."}
          </p>
        </div>
        <span className="text-muted-foreground hidden text-xs sm:block">
          {groupedEntities.length} entities · {data?.facts.length ?? 0} details
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute left-3 top-2.5 size-4" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the guide"
            className="h-9 pl-9"
          />
        </div>
        <Select value={type} onValueChange={(value) => setType(value as GlossaryEntityType | "all")}>
          <SelectTrigger className="h-9 w-full sm:w-40" aria-label="Filter story guide by category">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {labels[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groupedEntities.length > 0 ? (
        <div className="space-y-4">
          {groupedEntities.map((group) => (
            <EntityRecord key={group.entityId} {...group} />
          ))}
        </div>
      ) : (
        <div className="border-border border-y py-10 text-center">
          <BookMarked className="text-muted-foreground mx-auto size-7" />
          <p className="mt-3 font-medium">
            {progress?.current_chapter ? "Nothing matches that search" : "Your guide is waiting"}
          </p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
            {progress?.current_chapter
              ? "Try another name, detail, or category."
              : "Start reading to unlock facts without spoilers."}
          </p>
        </div>
      )}
    </div>
  );
}

function EntityRecord({
  entity,
  facts,
}: {
  entity: GlossaryFact["entity"];
  facts: GlossaryFact[];
}) {
  return (
    <section className="border-border border-y">
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{entity.canonical_name}</h3>
            <Badge variant="secondary" className="text-[10px]">
              {labels[entity.type]}
            </Badge>
          </div>
          {entity.aliases && entity.aliases.length > 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              Also known as {entity.aliases.join(" · ")}
            </p>
          )}
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">
          {facts.length} {facts.length === 1 ? "detail" : "details"}
        </span>
      </div>

      <div className="divide-y">
        {facts.map((fact) => (
          <FactRow key={fact.id} fact={fact} />
        ))}
      </div>
    </section>
  );
}

function FactRow({ fact }: { fact: GlossaryFact }) {
  const [expanded, setExpanded] = useState(false);
  const evidence = [...fact.evidence].sort(
    (a, b) => b.chapter.chapter_number - a.chapter.chapter_number,
  );
  const latestEvidence = evidence[0];
  const chapter = latestEvidence?.chapter.chapter_number ?? null;

  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0 pt-0.5">
          <span className="font-mono text-[10px] font-semibold text-primary">
            {chapter ? `Ch ${chapter}` : "—"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {formatFactKey(fact.fact_key)}
            </p>
            {fact.last_updated_at && (
              <span className="text-[11px] text-muted-foreground">
                updated {formatUpdatedAt(fact.last_updated_at)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-5">{fact.value}</p>

          {latestEvidence && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-muted-foreground hover:text-foreground mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={expanded}
            >
              <Quote className="text-primary size-3.5 shrink-0" />
              <span>
                {expanded ? "Hide chapter evidence" : `Read the Chapter ${chapter} note`}
              </span>
              <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {expanded && latestEvidence && (
            <div className="mt-2 space-y-1 border-l-2 border-primary/30 pl-3">
              <blockquote className="text-muted-foreground text-sm italic leading-5">
                “{latestEvidence.quote}”
              </blockquote>
              {latestEvidence.context && (
                <p className="text-muted-foreground/80 text-xs leading-5">
                  {latestEvidence.context}
                </p>
              )}
              {evidence.length > 1 && (
                <p className="pt-1 text-[11px] text-muted-foreground">
                  + {evidence.length - 1} earlier chapter {evidence.length - 1 === 1 ? "note" : "notes"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function chapterFor(fact: GlossaryFact): number {
  return Math.max(
    ...fact.evidence.map((evidence) => evidence.chapter.chapter_number),
    0,
  );
}

function formatFactKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function GuideSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
