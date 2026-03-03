# Chapter Workflow Documentation

This document describes the chapter creation, editing, and publishing workflow
for authors and editors.

## Chapter Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CHAPTER STATUS FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │    draft     │ ◄── Author creates chapter
                              └──────┬───────┘     with save_as_draft=true
                                     │
                                     │ Author submits for review
                                     ▼
                              ┌──────────────┐
              ┌───────────────│pending_review│◄─────────────────┐
              │               └──────┬───────┘                  │
              │                      │                          │
    Editor requests                  │ Editor approves          │ Author resubmits
    revision                         ▼                          │ after revision
              │               ┌──────────────┐                  │
              │               │   approved   │──────────────────┤
              │               └──────┬───────┘                  │
              │                      │                          │
              │                      │ Author edits             │
              ▼                      │ published chapter        │
    ┌─────────────────────┐          ▼                          │
    │ revision_requested  │   ┌──────────────┐                  │
    └─────────┬───────────┘   │pending_update│                  │
              │               └──────┬───────┘                  │
              │                      │                          │
              │ Author edits         │ Editor approves          │
              │ and resubmits        │ or rejects               │
              │                      │                          │
              └──────────────────────┴──────────────────────────┘
```

## Status Definitions

| Status               | Description                                     | Visible to Readers        |
| -------------------- | ----------------------------------------------- | ------------------------- |
| `draft`              | Chapter is being written, not submitted yet     | ❌ No                     |
| `pending_review`     | Chapter submitted and waiting for editor review | ❌ No                     |
| `revision_requested` | Editor requested changes before approval        | ❌ No                     |
| `approved`           | Chapter is published and visible to readers     | ✅ Yes                    |
| `pending_update`     | Published chapter has pending content updates   | ✅ Yes (original content) |

## Editor Claim System

To prevent race conditions where multiple editors review the same chapter
simultaneously, editors must **claim** a chapter before they can review it.

### How It Works

1. Editor sees a list of pending chapters with their claim status
2. Editor clicks **Claim** on an available chapter → chapter is locked to that
   editor
3. Editor now has exclusive read/write access to review the chapter
4. Editor approves or requests revision → claim is automatically released
5. If the editor doesn't act within **24 hours**, the claim expires
   automatically

### Rules

- Only one editor can claim a chapter at a time
- Claiming uses database-level pessimistic locking (`SELECT ... FOR UPDATE`) to
  prevent race conditions
- Claims expire after 24 hours — a scheduled command
  (`chapters:release-expired-claims`) runs hourly to clean up
- Editors can voluntarily release a claim via the unclaim endpoint
- Admins can bypass the claim requirement and review any chapter
- When an editor approves or requests revision, the claim is released so the
  chapter returns to the pool (if resubmitted)

## API Endpoints

### For Authors

#### Create a New Chapter

```http
POST /api/novels/{novel-slug}/chapters
```

**Request Body:**

```json
{
  "title": "Chapter Title",
  "content": "Chapter content...",
  "chapter_number": 1,
  "is_free": true,
  "save_as_draft": true // Optional: if true, saves as draft; if false/omitted, submits for review
}
```

**Responses:**

- `save_as_draft: true` → Status: `draft`, Message: "Chapter saved as draft
  successfully"
- `save_as_draft: false` → Status: `pending_review`, Message: "Chapter created
  successfully and submitted for review"
- Admin user → Status: `approved`, Message: "Chapter created and published
  successfully"

---

#### Update a Chapter

```http
PUT /api/novels/{novel-slug}/chapters/{chapter-id}
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "save_as_draft": false // Optional: for draft chapters, set to false to submit for review
}
```

**Behavior by Current Status:**

| Current Status       | Can Edit? | What Happens                                                                   |
| -------------------- | --------- | ------------------------------------------------------------------------------ |
| `draft`              | ✅ Yes    | Updates directly. If `save_as_draft: false`, submits for review                |
| `pending_review`     | ❌ No     | Returns 403: "Cannot edit while pending review"                                |
| `revision_requested` | ✅ Yes    | Updates directly. If `save_as_draft: false`, resubmits for review              |
| `approved`           | ✅ Yes    | Stores changes in `pending_title`/`pending_content`, status → `pending_update` |
| `pending_update`     | ❌ No     | Returns 403: "Cannot edit while pending review"                                |

---

#### Submit Draft for Review

```http
POST /api/novels/{novel-slug}/chapters/{chapter-id}/submit-for-review
```

Submits a `draft` or `revision_requested` chapter for editor review.

---

#### Get Author's Chapters (All Statuses)

```http
GET /api/author/novels/{novel-slug}/chapters
```

Returns all chapters for the author's novel, including drafts and pending
chapters with their current status and latest review.

---

### For Editors

#### Get Pending Chapters

```http
GET /api/editor/pending-chapters
```

Returns all chapters with status `pending_review` or `pending_update`. Each
chapter includes claim info:

- `is_claimed` — whether the chapter is currently claimed by any editor
- `is_claimed_by_me` — whether the current editor has claimed it
- `can_review` — whether the current editor can review it (same as
  `is_claimed_by_me`)
- `claimed_by_editor` — name of the editor who claimed it (if any)

---

#### Get My Claimed Chapters

```http
GET /api/editor/my-claimed-chapters
```

Returns all chapters currently claimed by the authenticated editor, with expiry
info:

- `claim_expires_at` — ISO timestamp when the claim expires
- `claim_hours_remaining` — hours left before the claim auto-releases

---

#### Claim a Chapter for Review

```http
POST /api/editor/chapters/{chapter-id}/claim
```

Claims a chapter so only this editor can review it. Uses database-level
pessimistic locking to prevent race conditions.

**Responses:**

- `200` — Chapter claimed successfully. You have 24 hours to review it.
- `400` — Chapter is not in a reviewable status.
- `409` — Chapter is already claimed by another editor.

**Rules:**

- Only `pending_review` or `pending_update` chapters can be claimed.
- If already claimed by the same editor, the claim timer is refreshed.
- Claims automatically expire after 24 hours if no action is taken.

---

#### Release a Claimed Chapter

```http
POST /api/editor/chapters/{chapter-id}/unclaim
```

Voluntarily releases a claimed chapter so other editors can claim it.

---

#### View a Claimed Chapter

```http
GET /api/editor/chapters/{chapter-id}
```

Returns full chapter details for review. **Requires the editor to have claimed
the chapter first** (or be an admin).

**Response:** `403` if the chapter is not claimed by the requesting editor.

---

#### Approve a Chapter

```http
POST /api/editor/chapters/{chapter-id}/approve
```

**Requires the editor to have claimed the chapter first** (or be an admin).

**Request Body:**

```json
{
  "notes": "Optional approval notes"
}
```

**Behavior:**

- For `pending_review`: Approves and publishes the chapter, releases the claim
- For `pending_update`: Applies pending content to the main content, clears
  pending fields, releases the claim

---

#### Request Revision

```http
POST /api/editor/chapters/{chapter-id}/request-revision
```

**Requires the editor to have claimed the chapter first** (or be an admin).

**Request Body:**

```json
{
  "notes": "Required revision notes explaining what needs to be changed"
}
```

**Behavior:**

- For `pending_review`: Sets status to `revision_requested`, releases the claim
- For `pending_update`: Clears pending content, keeps original published content
  as-is, status returns to `approved`, releases the claim

---

## Database Schema

### Chapters Table

| Column            | Type                   | Description                                                                   |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `status`          | enum                   | `draft`, `pending_review`, `approved`, `revision_requested`, `pending_update` |
| `pending_title`   | string (nullable)      | Pending title update for published chapters                                   |
| `pending_content` | longtext (nullable)    | Pending content update for published chapters                                 |
| `reviewed_by`     | foreign key            | Editor who last reviewed the chapter                                          |
| `reviewed_at`     | datetime               | When the chapter was last reviewed                                            |
| `published_at`    | datetime               | When the chapter was first published                                          |
| `claimed_by`      | foreign key (nullable) | Editor who has claimed this chapter for review                                |
| `claimed_at`      | datetime (nullable)    | When the chapter was claimed (expires after 24 hours)                         |

---

## Example Workflows

### Workflow 1: Author Creates and Publishes a Chapter

1. **Author creates draft:**

   ```http
   POST /api/novels/my-novel/chapters
   { "title": "Ch 1", "content": "...", "save_as_draft": true }
   ```

   → Status: `draft`

2. **Author continues editing:**

   ```http
   PUT /api/novels/my-novel/chapters/123
   { "content": "updated content..." }
   ```

   → Status: `draft`

3. **Author submits for review:**

   ```http
   POST /api/novels/my-novel/chapters/123/submit-for-review
   ```

   → Status: `pending_review`

4. **Editor claims chapter:**

   ```http
   POST /api/editor/chapters/123/claim
   ```

   → Chapter is locked to this editor for 24 hours

5. **Editor approves:**
   ```http
   POST /api/editor/chapters/123/approve
   { "notes": "Great chapter!" }
   ```
   → Status: `approved`, `published_at` is set, claim is released

---

### Workflow 2: Editor Requests Revision

1. **Editor claims chapter:**

   ```http
   POST /api/editor/chapters/123/claim
   ```

   → Chapter is locked to this editor for 24 hours

2. **Editor requests changes:**

   ```http
   POST /api/editor/chapters/123/request-revision
   { "notes": "Please fix the ending" }
   ```

   → Status: `revision_requested`, claim is released

3. **Author makes changes:**

   ```http
   PUT /api/novels/my-novel/chapters/123
   { "content": "fixed content..." }
   ```

   → Status: `revision_requested`

4. **Author resubmits:**
   ```http
   PUT /api/novels/my-novel/chapters/123
   { "content": "fixed content...", "save_as_draft": false }
   ```
   → Status: `pending_review`

---

### Workflow 3: Author Updates Published Chapter

1. **Author edits published chapter:**

   ```http
   PUT /api/novels/my-novel/chapters/123
   { "title": "Better Title", "content": "improved content..." }
   ```

   → Status: `pending_update` → `pending_title` = "Better Title" →
   `pending_content` = "improved content..." → Original `title` and `content`
   remain unchanged (still visible to readers)

2. **Editor claims chapter:**

   ```http
   POST /api/editor/chapters/123/claim
   ```

   → Chapter is locked to this editor for 24 hours

3. **Editor approves update:**
   ```http
   POST /api/editor/chapters/123/approve
   ```
   → Status: `approved` → `title` = "Better Title" (applied from pending) →
   `content` = "improved content..." (applied from pending) → `pending_title` =
   null → `pending_content` = null → Claim is released

**OR**

3. **Editor rejects update:**
   ```http
   POST /api/editor/chapters/123/request-revision
   { "notes": "The new content doesn't fit" }
   ```
   → Status: `approved` (remains published with original content) →
   `pending_title` = null (cleared) → `pending_content` = null (cleared) → Claim
   is released → Author is notified to try again

---

## Frontend Implementation Notes

### Author Dashboard

- Show chapter status badges: Draft, Pending Review, Revision Requested,
  Published, Update Pending
- For `revision_requested` chapters, show the editor's notes
- For `pending_update` chapters, show "Your changes are being reviewed"
- Disable edit button for `pending_review` and `pending_update` statuses

### Editor Dashboard

- List all chapters with `pending_review` or `pending_update` status
- Show claim status for each chapter (available, claimed by me, claimed by
  other)
- Editors must click "Claim" before they can review a chapter
- Show "My Claimed Chapters" section with expiry timers
- For `pending_update` chapters, show a diff between current content and pending
  content
- Provide approve/reject buttons with required notes for rejection (only for
  claimed chapters)
- Show "Release" button on claimed chapters the editor no longer wants to review
- Claims auto-expire after 24 hours — the scheduled command runs hourly

### Reader View

- Only show chapters with `approved` or `pending_update` status
- Always display the main `title` and `content` (not pending fields)
- Chapter count (`total_chapters`) only includes published chapters

---

## Chapter Count Rules

The `total_chapters` field on a novel only counts **published chapters**
(status: `approved` or `pending_update` with `published_at` set).

- Creating a draft does NOT increment `total_chapters`
- Approving a chapter increments `total_chapters`
- Deleting a published chapter decrements `total_chapters`
- Deleting a draft/pending chapter does NOT affect `total_chapters`
