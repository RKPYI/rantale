"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  Edit,
  Code,
  Info,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  fontSize?: number;
  lineHeight?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  label = "Content",
  placeholder = "Write your chapter content here... (Markdown supported)",
  rows = 15,
  required = false,
  className,
  fontSize = 14,
  lineHeight = 1.6,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">(
    "split",
  );

  // Helper function to insert markdown syntax
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById(
      "markdown-content",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const insertLineMarkdown = (prefix: string) => {
    const textarea = document.getElementById(
      "markdown-content",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lines = value.split("\n");

    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;

    // Find which lines are selected
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos <= start && start < currentPos + lineLength) {
        startLine = i;
      }
      if (currentPos <= end && end < currentPos + lineLength) {
        endLine = i;
        break;
      }
      currentPos += lineLength;
    }

    // Add prefix to selected lines
    for (let i = startLine; i <= endLine; i++) {
      if (!lines[i].startsWith(prefix)) {
        lines[i] = prefix + lines[i];
      }
    }

    onChange(lines.join("\n"));
    setTimeout(() => textarea.focus(), 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertMarkdown("_", "_"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertLineMarkdown("# "),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertLineMarkdown("## "),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertLineMarkdown("### "),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertLineMarkdown("- "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertLineMarkdown("1. "),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertLineMarkdown("> "),
    },
    {
      icon: Code,
      label: "Inline Code",
      action: () => insertMarkdown("`", "`"),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertMarkdown("[", "](https://)"),
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: () => insertMarkdown("![alt text](", ")"),
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      action: () => insertMarkdown("\n---\n"),
    },
  ];

  const renderMarkdownPreview = () => (
    <div
      className="prose prose-gray dark:prose-invert bg-muted/30 max-w-none overflow-auto rounded-md border p-6"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        minHeight: `${rows * 1.5}rem`,
      }}
    >
      {value.trim() ? (
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
            code: ({ node, className, children, ...props }) => {
              const isInline = !className?.includes("language-");
              return isInline ? (
                <code
                  className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="bg-muted block overflow-x-auto rounded-md p-4 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            ul: ({ node, ...props }) => (
              <ul className="my-4 ml-6 list-disc space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            hr: ({ node, ...props }) => (
              <hr className="border-border my-8" {...props} />
            ),
            img: ({ node, src, alt, ...props }) => {
              // Prevent empty src attribute error
              if (!src) return null;
              return (
                <img
                  src={src}
                  alt={alt || ""}
                  className="my-4 h-auto max-w-full rounded-lg"
                  {...props}
                />
              );
            },
          }}
        >
          {value}
        </ReactMarkdown>
      ) : (
        <p className="text-muted-foreground italic">
          Preview will appear here...
        </p>
      )}
    </div>
  );

  const renderEditor = () => (
    <Textarea
      id="markdown-content"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="resize-none font-mono text-sm"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
      }}
    />
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="markdown-content">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setActiveTab(activeTab === "edit" ? "preview" : "edit")
            }
            className="text-xs"
          >
            <Info className="mr-1 h-3 w-3" />
            Markdown Guide
          </Button>
        </div>
      </div>

      {/* Markdown Toolbar */}
      <div className="bg-muted/30 flex flex-wrap gap-1 rounded-md border p-2">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.label}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "split")}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="split" className="gap-2">
            <Code className="h-4 w-4" />
            Split
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-2">
          {renderEditor()}
        </TabsContent>

        <TabsContent value="split" className="mt-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>{renderEditor()}</div>
            <div className="hidden lg:block">{renderMarkdownPreview()}</div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-2">
          {renderMarkdownPreview()}
        </TabsContent>
      </Tabs>

      {/* Character/Word Count */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <span>{value.length} characters</span>
          <span>
            {value.trim() ? value.trim().split(/\s+/).length : 0} words
          </span>
        </div>
        {activeTab === "split" && (
          <span className="text-xs italic">
            Split view available on larger screens
          </span>
        )}
      </div>

      {/* Quick Markdown Guide */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Markdown Quick Reference</CardTitle>
          <CardDescription className="text-xs">
            Use these syntax patterns to format your content
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <code className="bg-muted rounded px-1">**bold**</code> - Bold
              text
            </div>
            <div>
              <code className="bg-muted rounded px-1">_italic_</code> - Italic
              text
            </div>
            <div>
              <code className="bg-muted rounded px-1"># Heading 1</code> - Large
              heading
            </div>
            <div>
              <code className="bg-muted rounded px-1">## Heading 2</code> -
              Medium heading
            </div>
            <div>
              <code className="bg-muted rounded px-1">- List item</code> -
              Bullet list
            </div>
            <div>
              <code className="bg-muted rounded px-1">1. Item</code> - Numbered
              list
            </div>
            <div>
              <code className="bg-muted rounded px-1">&gt; Quote</code> -
              Blockquote
            </div>
            <div>
              <code className="bg-muted rounded px-1">`code`</code> - Inline
              code
            </div>
            <div>
              <code className="bg-muted rounded px-1">[text](url)</code> - Link
            </div>
            <div>
              <code className="bg-muted rounded px-1">![alt](url)</code> - Image
            </div>
            <div>
              <code className="bg-muted rounded px-1">---</code> - Horizontal
              line
            </div>
            <div>
              <code className="bg-muted rounded px-1">~~strike~~</code> -
              Strikethrough
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
