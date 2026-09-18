"use client";

import { useEffect, useState } from "react";
import { BookMarked, CheckCircle2, Loader2, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminGlossaryNovels } from "@/hooks/use-glossary";
import { glossaryService } from "@/services/glossary";
import type { GlossaryFact, GlossaryProposal } from "@/types/glossary";
import { toast } from "sonner";

export function GlossaryTab() {
  const [search, setSearch] = useState("");
  const { data, loading, error, refetch } = useAdminGlossaryNovels(search);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [reviewSlug, setReviewSlug] = useState<string | null>(null);
  const [pendingFacts, setPendingFacts] = useState<GlossaryFact[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<number[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [proposals, setProposals] = useState<GlossaryProposal[]>([]);
  const [editingFactId, setEditingFactId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const novels = data?.data ?? [];

  useEffect(() => {
    if (!reviewSlug) {
      setPendingFacts([]);
      setSelectedFacts([]);
      return;
    }
    setReviewLoading(true);
    Promise.all([
      glossaryService.getPendingFacts(reviewSlug),
      glossaryService.getProposals(reviewSlug),
    ])
      .then(([facts, proposalResult]) => {
        setPendingFacts(facts.data);
        setProposals(proposalResult.data);
      })
      .catch(() => toast.error("Could not load pending glossary facts"))
      .finally(() => setReviewLoading(false));
  }, [reviewSlug]);

  const review = async (action: "approve" | "reject") => {
    if (!reviewSlug || selectedFacts.length === 0) return;
    setReviewLoading(true);
    try {
      await glossaryService.bulkReview(reviewSlug, selectedFacts, action);
      toast.success(`${selectedFacts.length} fact${selectedFacts.length === 1 ? "" : "s"} ${action}d`);
      setPendingFacts((facts) => facts.filter((fact) => !selectedFacts.includes(fact.id)));
      setSelectedFacts([]);
      await refetch();
    } catch (reviewError) {
      toast.error(reviewError instanceof Error ? reviewError.message : "Review decision failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const decideProposal = async (proposal: GlossaryProposal, action: "approve" | "reject") => {
    if (!reviewSlug) return;
    setReviewLoading(true);
    try {
      await glossaryService.decideProposal(reviewSlug, proposal.id, action);
      setProposals((current) => current.filter((item) => item.id !== proposal.id));
      toast.success(`Proposal ${action}d`);
      await refetch();
    } catch (proposalError) {
      toast.error(proposalError instanceof Error ? proposalError.message : "Proposal decision failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const saveFactEdit = async (fact: GlossaryFact) => {
    if (!reviewSlug || !editingValue.trim()) return;
    setReviewLoading(true);
    try {
      const result = await glossaryService.updateFact(reviewSlug, fact.id, editingValue.trim(), fact.fact_key);
      setPendingFacts((current) => current.map((item) => item.id === fact.id ? result.fact : item));
      setEditingFactId(null);
      toast.success("Fact correction saved");
    } catch (editError) {
      toast.error(editError instanceof Error ? editError.message : "Could not save fact correction");
    } finally {
      setReviewLoading(false);
    }
  };

  const scan = async (slug: string, title: string) => {
    setBusySlug(slug);
    try {
      const result = await glossaryService.scanNovel(slug);
      toast.success(`${title}: ${result.queued_chapters} chapters queued`);
      await refetch();
    } catch (scanError) {
      toast.error(scanError instanceof Error ? scanError.message : "Could not queue scan");
    } finally {
      setBusySlug(null);
    }
  };

  const resume = async (slug: string, title: string) => {
    setBusySlug(slug);
    try {
      const result = await glossaryService.resumeScanNovel(slug);
      toast.success(`${title}: ${result.queued_chapters} incomplete chapters queued`);
      await refetch();
    } catch (scanError) {
      toast.error(scanError instanceof Error ? scanError.message : "Could not resume scan");
    } finally {
      setBusySlug(null);
    }
  };

  const scanVisibleUnscanned = async () => {
    const targets = novels.filter((novel) => novel.glossary_scan_status === "not_started");
    if (targets.length === 0) {
      toast.info("No unscanned novels are visible.");
      return;
    }

    setScanningAll(true);
    try {
      for (const novel of targets) {
        await glossaryService.scanNovel(novel.slug);
      }
      toast.success(`${targets.length} novel${targets.length === 1 ? "" : "s"} queued`);
      await refetch();
    } catch (scanError) {
      toast.error(scanError instanceof Error ? scanError.message : "Some scans could not be queued");
    } finally {
      setScanningAll(false);
    }
  };

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-xl" />)}</div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  const unscanned = novels.filter((novel) => novel.glossary_scan_status === "not_started").length;
  const pending = novels.reduce((total, novel) => total + novel.pending_glossary_facts_count, 0);

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Novels in view" value={data?.total ?? 0} />
        <Metric label="Not scanned" value={unscanned} />
        <Metric label="Pending review" value={pending} />
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><BookMarked className="size-5 text-primary" />Glossary workspace</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">Queue chapter scans and keep uncertain story facts reviewable.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a novel" className="pl-9" />
            </div>
            <Button variant="secondary" size="sm" disabled={scanningAll} onClick={scanVisibleUnscanned}>
              {scanningAll ? <Loader2 className="size-4 animate-spin" /> : <BookMarked className="size-4" />}
              Scan visible unscanned
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {novels.map((novel) => (
            <div key={novel.id} className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{novel.title}</p>
                  <StatusBadge status={novel.glossary_scan_status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{novel.author} · {novel.glossary_facts_count} facts from {novel.published_chapters_count} published chapters</p>
                {novel.pending_glossary_facts_count > 0 && <p className="mt-1 text-xs text-amber-600">{novel.pending_glossary_facts_count} facts need review</p>}
                {novel.glossary_last_scan_error && <p className="text-destructive mt-1 text-xs">{novel.glossary_last_scan_error}</p>}
              </div>
              <div className="flex gap-2">
                {novel.pending_glossary_facts_count > 0 && (
                  <Button variant="secondary" size="sm" onClick={() => setReviewSlug(novel.slug)}>
                    Review
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={busySlug === novel.slug} onClick={() => scan(novel.slug, novel.title)}>
                    {busySlug === novel.slug ? <Loader2 className="size-4" /> : novel.glossary_scan_status === "failed" ? <RefreshCw className="size-4" /> : <BookMarked className="size-4" />}
                    {novel.glossary_scan_status === "not_started" ? "Scan" : "Rescan"}
                  </Button>
                  {novel.glossary_scan_status !== "not_started" && (
                    <Button variant="ghost" size="sm" disabled={busySlug === novel.slug} onClick={() => resume(novel.slug, novel.title)} title="Queue only chapters without a successful latest scan">
                      <RefreshCw className="size-4" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {novels.length === 0 && <p className="text-muted-foreground py-8 text-center text-sm">No novels match this search.</p>}
        </CardContent>
      </Card>

      {reviewSlug && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Review extracted facts</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">Admin-only context may include later chapters. Confirm each fact before it becomes reader-visible.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReviewSlug(null)}>Close</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposals.length > 0 && (
              <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-amber-600" />
                  <p className="font-medium">Manager proposals</p>
                  <Badge variant="outline">{proposals.length}</Badge>
                </div>
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{proposal.entity?.canonical_name ?? proposal.observation?.entity_name ?? "Unknown entity"}</p>
                      <Badge variant="outline">{proposal.operation}</Badge>
                      <span className="text-muted-foreground text-xs">{Math.round(proposal.confidence * 100)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm">{proposal.reason ?? "The manager found a possible conflict."}</p>
                    {proposal.ai_explanation && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        AI check: <span className="font-medium">{proposal.ai_recommendation ?? "needs_review"}</span> — {proposal.ai_explanation}
                      </p>
                    )}
                    {proposal.before_data?.value !== undefined && <p className="text-muted-foreground mt-2 text-xs">Current: {String(proposal.before_data.value)}</p>}
                    {proposal.after_data?.value !== undefined && <p className="mt-1 text-xs">Suggested: {String(proposal.after_data.value)}</p>}
                    {proposal.observation?.quote && <blockquote className="border-primary/30 text-muted-foreground mt-2 border-l-2 pl-3 text-xs italic">“{proposal.observation.quote}”</blockquote>}
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={reviewLoading} onClick={() => decideProposal(proposal, "reject")}>Reject</Button>
                      <Button size="sm" disabled={reviewLoading} onClick={() => decideProposal(proposal, "approve")}>Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reviewLoading && pendingFacts.length === 0 ? <Skeleton className="h-24 w-full" /> : pendingFacts.map((fact) => (
              <label key={fact.id} className="block cursor-pointer rounded-xl border p-4">
                <div className="flex gap-3">
                  <input type="checkbox" checked={selectedFacts.includes(fact.id)} onChange={(event) => setSelectedFacts((current) => event.target.checked ? [...current, fact.id] : current.filter((id) => id !== fact.id))} className="accent-primary mt-1 h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{fact.entity.canonical_name}</p>
                      <Badge variant="outline">{fact.entity.type}</Badge>
                      <span className="text-muted-foreground text-xs">{Math.round(fact.confidence * 100)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm">{fact.value}</p>
                    {editingFactId === fact.id ? (
                      <div className="mt-3 flex gap-2">
                        <Input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} aria-label={`Correct ${fact.fact_key}`} />
                        <Button size="sm" disabled={reviewLoading} onClick={() => saveFactEdit(fact)}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingFactId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 px-0"
                        onClick={() => {
                          setEditingFactId(fact.id);
                          setEditingValue(fact.value);
                        }}
                      >
                        Edit canonical value
                      </Button>
                    )}
                    {fact.previous_value && <p className="text-muted-foreground mt-1 text-xs">Previous extraction: {fact.previous_value}</p>}
                    {fact.evidence[0] && <blockquote className="border-primary/30 text-muted-foreground mt-3 border-l-2 pl-3 text-xs italic">Ch. {fact.evidence[0].chapter.chapter_number}: “{fact.evidence[0].quote}”</blockquote>}
                  </div>
                </div>
              </label>
            ))}
            {pendingFacts.length === 0 && !reviewLoading && <p className="text-muted-foreground py-6 text-center text-sm">No pending facts for this novel.</p>}
            {selectedFacts.length > 0 && (
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" disabled={reviewLoading} onClick={() => review("reject")}>Reject selected</Button>
                <Button disabled={reviewLoading} onClick={() => review("approve")}>Approve selected</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-card p-4"><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-muted-foreground text-sm">{label}</p></div>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return <Badge variant="secondary"><CheckCircle2 className="size-3" />Ready</Badge>;
  if (status === "failed") return <Badge variant="destructive"><XCircle className="size-3" />Failed</Badge>;
  if (status === "stale") return <Badge variant="destructive"><XCircle className="size-3" />Stalled</Badge>;
  if (status === "queued" || status === "running") return <Badge variant="outline"><Loader2 className="size-3 animate-spin" />Processing</Badge>;
  return <Badge variant="outline">Not scanned</Badge>;
}
