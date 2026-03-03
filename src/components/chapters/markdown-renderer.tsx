"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  fontSize?: number;
}

export function MarkdownRenderer({
  content,
  className,
  fontSize,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn("prose prose-gray dark:prose-invert max-w-none", className)}
      style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => (
            <h1 className="mt-6 mb-4 text-3xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-5 mb-3 text-2xl font-semibold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-4 mb-2 text-xl font-semibold" {...props} />
          ),
          // Customize paragraph spacing
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          // Customize blockquote style
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
              {...props}
            />
          ),
          // Customize code blocks
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
          // Customize lists
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />
          ),
          // Customize links
          a: ({ node, ...props }) => (
            <a
              className="text-primary font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Customize horizontal rules
          hr: ({ node, ...props }) => (
            <hr className="border-border my-8" {...props} />
          ),
          // Customize images
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
          // Customize tables
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table
                className="border-border w-full border-collapse border"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => (
            <tr className="border-border border-b" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border-border border px-4 py-3 text-left font-semibold"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="border-border border px-4 py-3" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
