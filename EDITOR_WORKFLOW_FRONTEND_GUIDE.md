# Editor Workflow - Frontend Integration Guide

> This document explains the new editorial workflow system for chapter
> publishing. Frontend developers should update the web application to support
> these changes.

## Overview

The role system has been updated:

- **Moderator** role has been renamed to **Editor** (role value `2` remains the
  same)
- **Editors** can NO longer create novels or chapters
- **Editors** can only review and approve/reject chapters created by authors
- **Authors** can create novels and chapters, but chapters now require editor
  approval before publishing
- **Admins** have full access (can do everything authors and editors can do)

## Role Changes

| Role   | Value | Can Create Novels | Can Create Chapters | Can Review Chapters |
| ------ | ----- | ----------------- | ------------------- | ------------------- |
| User   | 0     | ❌                | ❌                  | ❌                  |
| Author | 1     | ✅                | ✅                  | ❌                  |
| Editor | 2     | ❌                | ❌                  | ✅                  |
| Admin  | 3     | ✅                | ✅                  | ✅                  |

## Chapter Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CHAPTER WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Author creates chapter                                     │
│            │                                                 │
│            ▼                                                 │
│   ┌─────────────────┐                                        │
│   │ pending_review  │ ◄──────────────────────┐               │
│   └────────┬────────┘                        │               │
│            │                                 │               │
│            ▼                                 │               │
│   ┌─────────────────┐                        │               │
│   │  Editor Review  │                        │               │
│   └────────┬────────┘                        │               │
│            │                                 │               │
│     ┌──────┴──────┐                          │               │
│     │             │                          │               │
│     ▼             ▼                          │               │
│ ┌────────┐  ┌──────────────────┐             │               │
│ │approved│  │revision_requested│             │               │
│ └────┬───┘  └────────┬─────────┘             │               │
│      │               │                       │               │
│      ▼               ▼                       │               │
│  Published     Author fixes                  │               │
│  (visible)     and resubmits ────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Chapter Statuses

| Status               | Description                                 | Visible to Public |
| -------------------- | ------------------------------------------- | ----------------- |
| `draft`              | Not yet submitted (reserved for future use) | ❌                |
| `pending_review`     | Awaiting editor approval                    | ❌                |
| `approved`           | Approved and published                      | ✅                |
| `revision_requested` | Editor requested changes                    | ❌                |

---

## API Changes

### Public Chapter Endpoints (No Changes Required)

These endpoints now only return **approved/published** chapters:

```
GET /api/novels/{slug}/chapters
GET /api/novels/{slug}/chapters/{chapterNumber}
```

**Note:** Unpublished chapters are automatically hidden from public view.

---

## New Author Endpoints

### 1. Get All Chapters (Including Unpublished)

Authors need to see all their chapters including those pending review or needing
revision.

```http
GET /api/author/novels/{slug}/chapters
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "All chapters for novel: Novel Title",
  "novel": {
    "id": 1,
    "title": "Novel Title",
    "slug": "novel-title",
    "author": "Author Name"
  },
  "chapters": [
    {
      "id": 1,
      "title": "Chapter 1",
      "chapter_number": 1,
      "word_count": 2500,
      "status": "approved",
      "reviewed_at": "2026-02-03T10:00:00Z",
      "created_at": "2026-02-01T08:00:00Z",
      "published_at": "2026-02-03T10:00:00Z",
      "latest_review": null
    },
    {
      "id": 2,
      "title": "Chapter 2",
      "chapter_number": 2,
      "word_count": 3000,
      "status": "revision_requested",
      "reviewed_at": "2026-02-02T14:00:00Z",
      "created_at": "2026-02-02T08:00:00Z",
      "published_at": null,
      "latest_review": {
        "id": 5,
        "chapter_id": 2,
        "action": "revision_requested",
        "notes": "Please fix the grammar issues in paragraph 3.",
        "created_at": "2026-02-02T14:00:00Z"
      }
    },
    {
      "id": 3,
      "title": "Chapter 3",
      "chapter_number": 3,
      "word_count": 2800,
      "status": "pending_review",
      "reviewed_at": null,
      "created_at": "2026-02-03T08:00:00Z",
      "published_at": null,
      "latest_review": null
    }
  ]
}
```

### 2. Create Chapter (Behavior Changed)

When an author creates a chapter, it now starts with `pending_review` status
instead of being published immediately.

```http
POST /api/novels/{slug}/chapters
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Chapter Title",
  "content": "Chapter content...",
  "chapter_number": 1,
  "is_free": true
}
```

**Response (Author):**

```json
{
  "message": "Chapter created successfully and submitted for review",
  "chapter": {
    "id": 1,
    "title": "Chapter Title",
    "status": "pending_review",
    "published_at": null
  }
}
```

**Response (Admin - bypasses review):**

```json
{
  "message": "Chapter created and published successfully",
  "chapter": {
    "id": 1,
    "title": "Chapter Title",
    "status": "approved",
    "published_at": "2026-02-03T10:00:00Z"
  }
}
```

### 3. Submit Chapter for Review (After Revision)

After an author fixes a chapter that had revision requested, they submit it for
review again.

```http
POST /api/novels/{slug}/chapters/{chapterId}/submit-for-review
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Chapter submitted for review successfully",
  "chapter": {
    "id": 2,
    "status": "pending_review"
  }
}
```

### 4. Author Stats (Updated)

The author stats endpoint now includes chapter workflow information:

```http
GET /api/author/stats
Authorization: Bearer {token}
```

**New fields in response:**

```json
{
  "content_stats": { ... },
  "engagement_stats": { ... },
  "quality_stats": { ... },
  "reader_engagement": { ... },
  "top_novel": { ... },
  "chapter_workflow": {
    "pending_review": 3,
    "revision_requested": 1,
    "approved": 25,
    "draft": 0
  }
}
```

---

## New Editor Endpoints

### 1. Get Editor Stats

```http
GET /api/editor/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Editor stats retrieved successfully",
  "stats": {
    "pending_review": 15,
    "my_reviews_today": 5,
    "my_reviews_this_week": 23,
    "my_total_reviews": 156,
    "approvals_today": 4,
    "revisions_requested_today": 1
  }
}
```

### 2. Get Pending Chapters

```http
GET /api/editor/pending-chapters
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (default: 1)
- `per_page` (default: 15)

**Response:**

```json
{
  "message": "Pending chapters retrieved successfully",
  "chapters": {
    "current_page": 1,
    "data": [
      {
        "id": 5,
        "title": "The Beginning",
        "chapter_number": 1,
        "word_count": 3500,
        "status": "pending_review",
        "created_at": "2026-02-03T08:00:00Z",
        "novel": {
          "id": 2,
          "title": "Epic Fantasy",
          "slug": "epic-fantasy",
          "author": "Jane Doe",
          "user": {
            "id": 10,
            "name": "Jane Doe"
          }
        }
      }
    ],
    "total": 15,
    "per_page": 15,
    "last_page": 1
  }
}
```

### 3. Get Chapter Details for Review

```http
GET /api/editor/chapters/{chapterId}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Chapter details retrieved successfully",
  "chapter": {
    "id": 5,
    "title": "The Beginning",
    "content": "Full chapter content here...",
    "chapter_number": 1,
    "word_count": 3500,
    "status": "pending_review",
    "created_at": "2026-02-03T08:00:00Z",
    "novel": {
      "id": 2,
      "title": "Epic Fantasy",
      "slug": "epic-fantasy",
      "author": "Jane Doe",
      "user_id": 10,
      "user": {
        "id": 10,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    },
    "reviews": [
      {
        "id": 3,
        "action": "revision_requested",
        "notes": "Previous revision notes...",
        "created_at": "2026-02-02T10:00:00Z",
        "editor": {
          "id": 5,
          "name": "Editor Name"
        }
      }
    ],
    "reviewer": null
  }
}
```

### 4. Approve Chapter

```http
POST /api/editor/chapters/{chapterId}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Great chapter! Minor formatting fixed." // optional
}
```

**Response:**

```json
{
  "message": "Chapter approved and published successfully",
  "chapter": {
    "id": 5,
    "title": "The Beginning",
    "status": "approved",
    "published_at": "2026-02-03T12:00:00Z",
    "reviewed_at": "2026-02-03T12:00:00Z",
    "novel": {
      "id": 2,
      "title": "Epic Fantasy",
      "slug": "epic-fantasy"
    },
    "reviewer": {
      "id": 5,
      "name": "Editor Name"
    }
  }
}
```

### 5. Request Revision

```http
POST /api/editor/chapters/{chapterId}/request-revision
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Please fix the following issues:\n1. Grammar error in paragraph 2\n2. Missing character description\n3. Timeline inconsistency with chapter 3"
}
```

**Notes field is required!**

**Response:**

```json
{
  "message": "Revision requested successfully",
  "chapter": {
    "id": 5,
    "title": "The Beginning",
    "status": "revision_requested",
    "reviewed_at": "2026-02-03T12:00:00Z",
    "novel": {
      "id": 2,
      "title": "Epic Fantasy",
      "slug": "epic-fantasy"
    },
    "reviewer": {
      "id": 5,
      "name": "Editor Name"
    },
    "latest_review": {
      "id": 8,
      "action": "revision_requested",
      "notes": "Please fix the following issues..."
    }
  }
}
```

### 6. Get Review History

```http
GET /api/editor/review-history
Authorization: Bearer {token}
```

**Query Parameters:**

- `per_page` (default: 15)

**Response:**

```json
{
  "message": "Review history retrieved successfully",
  "reviews": {
    "current_page": 1,
    "data": [
      {
        "id": 8,
        "chapter_id": 5,
        "action": "approved",
        "notes": null,
        "created_at": "2026-02-03T12:00:00Z",
        "chapter": {
          "id": 5,
          "title": "The Beginning",
          "chapter_number": 1,
          "novel_id": 2,
          "novel": {
            "id": 2,
            "title": "Epic Fantasy",
            "slug": "epic-fantasy"
          }
        }
      }
    ],
    "total": 156,
    "per_page": 15
  }
}
```

---

## Frontend UI Recommendations

### Author Dashboard

1. **Chapter List View**
   - Show status badges: `Pending Review` (yellow), `Approved` (green),
     `Revision Requested` (red)
   - For `revision_requested` chapters, show the editor's notes prominently
   - Add "Submit for Review" button for `revision_requested` chapters

2. **Chapter Stats Widget**
   - Display the `chapter_workflow` stats from author stats endpoint
   - Show alerts if there are chapters needing revision

3. **Chapter Creation**
   - Update success message to indicate chapter is submitted for review
   - Inform authors that chapters will be published after editor approval

### Editor Dashboard

1. **Pending Reviews Queue**
   - Show list of chapters pending review sorted by oldest first
   - Display novel title, author name, chapter title, word count
   - Quick actions: View, Approve, Request Revision

2. **Review Page**
   - Full chapter content display
   - Previous review history (if any)
   - Action buttons: Approve (optional notes) or Request Revision (required
     notes)
   - Rich text editor for revision notes

3. **Stats Widget**
   - Today's reviews
   - Pending queue count
   - Weekly activity

### Notifications

Authors receive notifications when:

- Chapter is **approved**: "Your chapter 'Chapter Title' for 'Novel Title' has
  been approved and published."
- **Revision requested**: "Your chapter 'Chapter Title' for 'Novel Title' needs
  revision." (includes revision notes in notification data)

The notification data includes:

```json
{
  "chapter_id": 5,
  "chapter_title": "The Beginning",
  "chapter_number": 1,
  "novel_id": 2,
  "novel_title": "Epic Fantasy",
  "novel_slug": "epic-fantasy",
  "revision_notes": "..." // only for revision_requested
}
```

---

## Error Responses

### Common Errors

**Unauthorized (401):**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Forbidden - Not Author (403):**

```json
{
  "success": false,
  "message": "Author privileges required. Please apply for author status.",
  "current_role": 0,
  "required_roles": ["author", "admin"]
}
```

**Forbidden - Not Editor (403):**

```json
{
  "success": false,
  "message": "Editor privileges required",
  "current_role": 1,
  "required_roles": ["editor", "admin"]
}
```

**Invalid Status for Approval (400):**

```json
{
  "message": "This chapter cannot be approved in its current status",
  "current_status": "approved"
}
```

**Invalid Status for Submission (400):**

```json
{
  "message": "This chapter cannot be submitted for review in its current status",
  "current_status": "pending_review"
}
```

---

## Migration Notes

- All existing chapters have been migrated to `approved` status
- Existing users with role `2` (formerly Moderator) are now Editors
- No data loss - all existing functionality for approved chapters works the same

---

## Questions?

Contact the backend team for any clarification on these endpoints or workflow
changes.
