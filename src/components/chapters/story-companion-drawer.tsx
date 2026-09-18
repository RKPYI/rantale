"use client";

import { FormEvent, useState } from "react";
import { Bot, BookOpen, Loader2, Send, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { storyCompanionService, type StoryCompanionMessage } from "@/services/story-companion";
import type { StoryCompanionResponse } from "@/types/glossary";
import { handleApiError } from "@/lib/api-client";

export function StoryCompanionDrawer({ slug, open, onOpenChange }: { slug: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<StoryCompanionMessage[]>([]);
  const [answer, setAnswer] = useState<StoryCompanionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    const nextHistory = [...messages, { role: "user" as const, content: trimmed }];
    try {
      const result = await storyCompanionService.ask(slug, trimmed, nextHistory);
      setAnswer(result);
      setMessages([...nextHistory, { role: "assistant", content: result.answer }]);
      setQuestion("");
    } catch (requestError) {
      setError(handleApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const suggested = ["Who is this character?", "What do we know about this item?", "Where is the story currently taking place?"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Bot className="text-primary size-5" />Ask about this story</DialogTitle>
          <DialogDescription>Answers use only approved facts and chapters you have reached.</DialogDescription>
        </DialogHeader>
        {!isAuthenticated ? (
          <Alert><ShieldAlert className="size-4" /><AlertDescription>Sign in and start reading to use the spoiler-safe companion.</AlertDescription></Alert>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-3 text-sm">
              <p className="font-medium">Spoiler boundary</p>
              <p className="text-muted-foreground mt-1">The server will never answer from chapters beyond your reading progress.</p>
            </div>
            {answer && (
              <div className="rounded-xl border p-4">
                <p className="text-sm leading-6">{answer.answer}</p>
                {answer.citations.length > 0 && (
                  <div className="mt-4 space-y-2 border-t pt-3">
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Sources</p>
                    {answer.citations.map((citation) => (
                      <blockquote key={`${citation.chapter_id}-${citation.quote}`} className="border-primary/30 text-muted-foreground border-l-2 pl-3 text-xs leading-5">
                        Ch. {citation.chapter_number}: “{citation.quote}”
                      </blockquote>
                    ))}
                  </div>
                )}
              </div>
            )}
            {answer?.availability !== "answered" && answer && (
              <Alert><BookOpen className="size-4" /><AlertDescription>This is not available from the story evidence you have reached yet.</AlertDescription></Alert>
            )}
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="flex flex-wrap gap-2">
              {suggested.map((prompt) => <Button key={prompt} type="button" variant="outline" size="sm" onClick={() => setQuestion(prompt)}>{prompt}</Button>)}
            </div>
            <form onSubmit={ask} className="space-y-2">
              <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask something you have already read about..." rows={3} />
              <Button type="submit" disabled={!question.trim() || loading} className="w-full">{loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Ask</Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
