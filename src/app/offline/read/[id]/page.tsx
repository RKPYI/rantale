/**
 * Offline Chapter Reader
 * Read downloaded chapters without internet connection
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  WifiOff,
  Home,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { offlineService, type OfflineChapter } from '@/services/offline';
import { useOfflineStatus } from '@/hooks/use-offline-chapter';

interface OfflineReaderPageProps {
  params: {
    id: string;
  };
}

export default function OfflineReaderPage({ params }: OfflineReaderPageProps) {
  const router = useRouter();
  const { isOffline } = useOfflineStatus();
  const [chapter, setChapter] = useState<OfflineChapter | null>(null);
  const [allChapters, setAllChapters] = useState<OfflineChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChapter();
  }, [params.id]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current chapter
      const chapterData = await offlineService.getOfflineChapter(params.id);
      
      if (!chapterData) {
        setError('Chapter not found in offline storage');
        setLoading(false);
        return;
      }

      setChapter(chapterData);

      // Load all chapters from the same novel for navigation
      const allDownloaded = await offlineService.getAllDownloadedChapters();
      const sameNovelChapters = allDownloaded
        .filter(ch => ch.novel_id === chapterData.novel_id)
        .sort((a, b) => a.chapter_number - b.chapter_number);
      
      setAllChapters(sameNovelChapters);
    } catch (err) {
      console.error('Failed to load chapter:', err);
      setError('Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (chapterId: number) => {
    router.push(`/offline/read/${chapterId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-center text-lg font-medium">
              {error || 'Chapter not found'}
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              This chapter may not be downloaded for offline reading.
            </p>
            <Link href="/offline/downloads" className="mt-6">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                View Downloads
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find navigation chapters
  const currentIndex = allChapters.findIndex(ch => ch.id === chapter.id);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background/95 sticky top-0 z-50 border-b shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Link href="/offline/downloads">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Downloads</span>
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Center: Chapter Info */}
            <div className="flex-1 px-4 text-center">
              <div className="truncate text-sm font-medium">
                {chapter.novelTitle}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                Chapter {chapter.chapter_number}
              </div>
            </div>

            {/* Right: Offline Badge */}
            <Badge variant="secondary" className="gap-2">
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Offline Notice */}
          {isOffline && (
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="flex items-center gap-3 p-4">
                <WifiOff className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Reading Offline
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You're reading a downloaded chapter. All navigation works without internet!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter Header */}
          <Card>
            <CardHeader className="text-center">
              <Badge variant="outline" className="mx-auto w-fit">
                Chapter {chapter.chapter_number}
              </Badge>
              <CardTitle className="text-2xl md:text-3xl">
                {chapter.novelTitle}
              </CardTitle>
              <h1 className="text-muted-foreground text-xl font-semibold md:text-2xl">
                {chapter.title}
              </h1>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>Downloaded {new Date(chapter.downloadedAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          {/* Chapter Content */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="mt-6 mb-4 text-3xl font-bold" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="mt-5 mb-3 text-2xl font-semibold" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="mt-4 mb-2 text-xl font-semibold" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4 leading-relaxed" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
                        {...props}
                      />
                    ),
                  }}
                >
                  {chapter.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {previousChapter ? (
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation(previousChapter.id)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-muted-foreground text-xs">Previous</div>
                      <div className="text-sm">Chapter {previousChapter.chapter_number}</div>
                    </div>
                  </Button>
                ) : (
                  <div />
                )}

                <div className="text-center">
                  <div className="text-muted-foreground text-sm">
                    Chapter {chapter.chapter_number} of {allChapters.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {allChapters.length} {allChapters.length === 1 ? 'chapter' : 'chapters'} downloaded
                  </div>
                </div>

                {nextChapter ? (
                  <Button
                    onClick={() => handleNavigation(nextChapter.id)}
                    className="flex items-center gap-2"
                  >
                    <div className="text-right">
                      <div className="text-xs">Next</div>
                      <div className="text-sm">Chapter {nextChapter.chapter_number}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chapter List */}
          {allChapters.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <List className="h-5 w-5" />
                  All Downloaded Chapters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allChapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleNavigation(ch.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                        ch.id === chapter.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="font-medium">
                        Chapter {ch.chapter_number}: {ch.title}
                      </div>
                      {ch.id === chapter.id && (
                        <Badge variant="secondary" className="mt-1">
                          Currently Reading
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
