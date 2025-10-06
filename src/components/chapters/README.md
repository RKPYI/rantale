# Markdown Editor Component

A powerful markdown editor component with real-time preview for writing novel
chapters.

## Features

### 🎨 Three Viewing Modes

- **Edit Mode**: Full-width editor for focused writing
- **Split Mode**: Side-by-side editor and preview (desktop only)
- **Preview Mode**: Full-width preview to see the final result

### 🛠️ Toolbar Shortcuts

Quick-access buttons for common markdown formatting:

- **Bold** (`**text**`)
- **Italic** (`_text_`)
- **Headings** (H1, H2, H3)
- **Lists** (Bulleted & Numbered)
- **Blockquotes**
- **Inline Code**
- **Links**
- **Images**
- **Horizontal Rules**

### 📊 Live Statistics

- Character count
- Word count
- Real-time updates as you type

### 📖 Built-in Reference Guide

Quick reference card showing common markdown syntax patterns

### 🎯 Smart Features

- Automatic cursor position restoration after toolbar actions
- Multi-line selection support for lists and headings
- Responsive design (split view on large screens only)
- Dark mode support
- Customizable font size and line height

## Usage

```tsx
import { MarkdownEditor } from "@/components/chapters/markdown-editor";

function MyComponent() {
  const [content, setContent] = useState("");

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      label="Chapter Content"
      placeholder="Write your chapter..."
      rows={20}
      required
    />
  );
}
```

## Props

| Prop          | Type                      | Default                   | Description                   |
| ------------- | ------------------------- | ------------------------- | ----------------------------- |
| `value`       | `string`                  | -                         | Current markdown content      |
| `onChange`    | `(value: string) => void` | -                         | Callback when content changes |
| `label`       | `string`                  | `"Content"`               | Label for the editor          |
| `placeholder` | `string`                  | `"Write your chapter..."` | Placeholder text              |
| `rows`        | `number`                  | `15`                      | Number of rows in edit mode   |
| `required`    | `boolean`                 | `false`                   | Whether the field is required |
| `className`   | `string`                  | -                         | Additional CSS classes        |
| `fontSize`    | `number`                  | `14`                      | Font size in pixels           |
| `lineHeight`  | `number`                  | `1.6`                     | Line height multiplier        |

## Supported Markdown Features

### GitHub Flavored Markdown (GFM)

- Tables
- Task lists
- Strikethrough text
- Autolinks

### Standard Markdown

- Headings (H1-H6)
- Bold and italic
- Lists (ordered and unordered)
- Blockquotes
- Code blocks (inline and fenced)
- Links
- Images
- Horizontal rules

### HTML Support

- Raw HTML is sanitized for security
- Common HTML tags are preserved safely

## Styling

The preview matches the reading view styling from `ChapterReadingView`:

- Consistent typography
- Proper spacing and margins
- Dark mode support
- Responsive images
- Styled code blocks
- Custom link colors
- Themed blockquotes

## Security

- All HTML content is sanitized using `rehype-sanitize`
- XSS protection built-in
- Safe for user-generated content

## Integration

Currently integrated in:

- **Author Dashboard**: Chapter creation and editing
- Can be used anywhere markdown input is needed

## Future Enhancements

Potential improvements:

- Drag-and-drop image upload
- Syntax highlighting for code blocks
- Auto-save functionality
- Collaborative editing
- Export to different formats
- Custom markdown extensions
