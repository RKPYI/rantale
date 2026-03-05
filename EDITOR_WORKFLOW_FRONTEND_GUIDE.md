# Editor Dashboard — Frontend API Guide

> Complete reference for building the editor dashboard UI. All endpoints require
> `Authorization: Bearer {token}` and the user must have `role = editor` or
> `admin`.

---

## Base URL

```
/api/editor
```

---

## Authentication & Roles

| Role     | Access                                                    |
| -------- | --------------------------------------------------------- |
| `editor` | Full access to all `/api/editor/*` endpoints              |
| `admin`  | Full access (admins can also unclaim/approve any chapter) |
| `author` | ❌ 403 — "Editor privileges required"                     |

---

## Chapter Statuses

These statuses drive the entire review workflow:

```
draft → pending_review → approved (published)
                       → revision_requested → (author edits) → pending_review
approved → pending_update → approved (update applied)
                          → approved (update rejected, original kept)
```

| Status               | Meaning                                      | Visible to Readers? |
| -------------------- | -------------------------------------------- | ------------------- |
| `draft`              | Author is still writing, not submitted       | No                  |
| `pending_review`     | Submitted by author, awaiting editor review  | No                  |
| `approved`           | Reviewed and published                       | **Yes**             |
| `revision_requested` | Editor asked author to revise                | No                  |
| `pending_update`     | Published chapter has a pending content edit | Yes (old content)   |

---

## Claiming System

Editors **must claim** a chapter before they can review it. This prevents two
editors from reviewing the same chapter simultaneously.

- **Claim duration:** 24 hours (auto-expires after that)
- **One editor per chapter** at a time
- **Editors can unclaim** voluntarily
- **Admins can unclaim** any chapter

---

## Endpoints

### 1. `GET /api/editor/stats`

Editor dashboard statistics.

**Response:**

```json
{
  "message": "Editor stats retrieved successfully",
  "stats": {
    "pending_review": 12,
    "available_to_claim": 8,
    "my_claimed_chapters": 2,
    "my_reviews_today": 5,
    "my_reviews_this_week": 23,
    "my_total_reviews": 142,
    "approvals_today": 3,
    "revisions_requested_today": 2
  }
}
```

| Field                       | Type | Description                                 |
| --------------------------- | ---- | ------------------------------------------- |
| `pending_review`            | int  | Total chapters pending review (all editors) |
| `available_to_claim`        | int  | Chapters not claimed or with expired claims |
| `my_claimed_chapters`       | int  | Chapters you currently have claimed         |
| `my_reviews_today`          | int  | Reviews you completed today                 |
| `my_reviews_this_week`      | int  | Reviews you completed this week             |
| `my_total_reviews`          | int  | All-time review count                       |
| `approvals_today`           | int  | Chapters you approved today                 |
| `revisions_requested_today` | int  | Revision requests you sent today            |

---

### 2. `GET /api/editor/group`

Returns the editorial group the editor belongs to, its members, and how many
pending chapters come from the group's authors.

**Response (assigned to a group):**

```json
{
  "message": "Group info retrieved successfully",
  "group": {
    "id": 1,
    "name": "Fantasy Team",
    "tag": "FT",
    "description": "Handles all fantasy genre novels",
    "created_at": "2026-03-01T00:00:00.000000Z",
    "member_count": 5,
    "pending_chapters_from_group": 3,
    "members": [
      {
        "id": 10,
        "name": "Jane Editor",
        "username": "jane_editor",
        "email": "jane@example.com",
        "user_role": "editor",
        "group_role": "editor",
        "joined_at": "2026-03-01T00:00:00.000000Z"
      },
      {
        "id": 20,
        "name": "John Author",
        "username": "john_author",
        "email": "john@example.com",
        "user_role": "author",
        "group_role": "author",
        "joined_at": "2026-03-02T00:00:00.000000Z"
      }
    ]
  }
}
```

**Response (not in any group):**

```json
{
  "message": "You are not assigned to any editorial group.",
  "group": null
}
```

| Field                               | Type     | Description                                    |
| ----------------------------------- | -------- | ---------------------------------------------- |
| `group.id`                          | int      | Group ID                                       |
| `group.name`                        | string   | Group display name                             |
| `group.tag`                         | string   | Short tag/abbreviation                         |
| `group.description`                 | string   | Group description                              |
| `group.member_count`                | int      | Total members (editors + authors)              |
| `group.pending_chapters_from_group` | int      | Pending chapters from this group's authors     |
| `members[].id`                      | int      | User ID                                        |
| `members[].name`                    | string   | Display name                                   |
| `members[].username`                | string   | Unique username                                |
| `members[].user_role`               | string   | System-wide role (`editor`, `author`, `admin`) |
| `members[].group_role`              | string   | Role within this group (`editor` or `author`)  |
| `members[].joined_at`               | ISO 8601 | When the member joined the group               |

---

### 3. `GET /api/editor/pending-chapters`

Paginated list of all chapters awaiting review. Shows claim status per chapter.

**Query Parameters:**

| Param      | Type | Default | Description    |
| ---------- | ---- | ------- | -------------- |
| `page`     | int  | 1       | Page number    |
| `per_page` | int  | 15      | Items per page |

**Response:**

```json
{
  "message": "Pending chapters retrieved successfully",
  "chapters": {
    "data": [
      {
        "id": 42,
        "title": "The Dragon's Return",
        "chapter_number": 5,
        "status": "pending_review",
        "word_count": 3200,
        "created_at": "2026-03-03T10:00:00.000000Z",
        "novel": {
          "id": 7,
          "title": "Dragon Wars",
          "slug": "dragon-wars",
          "author": "John Author"
        },
        "claimed_by_editor": null,
        "is_claimed": false,
        "is_claimed_by_me": false,
        "can_review": false
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 35
  }
}
```

**Per-chapter fields:**

| Field               | Type        | Description                                                      |
| ------------------- | ----------- | ---------------------------------------------------------------- |
| `is_claimed`        | bool        | Is this chapter currently claimed by any editor?                 |
| `is_claimed_by_me`  | bool        | Is this chapter claimed by the current editor?                   |
| `can_review`        | bool        | Can the current editor review this? (same as `is_claimed_by_me`) |
| `claimed_by_editor` | object/null | `{id, name}` of the claiming editor, or null                     |
| `status`            | string      | `pending_review` or `pending_update`                             |

---

### 4. `GET /api/editor/my-claimed-chapters`

Chapters the current editor has claimed and is actively reviewing.

**Response:**

```json
{
  "message": "Your claimed chapters retrieved successfully",
  "chapters": [
    {
      "id": 42,
      "title": "The Dragon's Return",
      "chapter_number": 5,
      "status": "pending_review",
      "claimed_at": "2026-03-04T08:00:00.000000Z",
      "claim_expires_at": "2026-03-05T08:00:00.000000Z",
      "claim_hours_remaining": 18,
      "novel": {
        "id": 7,
        "title": "Dragon Wars",
        "slug": "dragon-wars",
        "author": "John Author"
      }
    }
  ]
}
```

| Field                   | Type     | Description                    |
| ----------------------- | -------- | ------------------------------ |
| `claim_expires_at`      | ISO 8601 | When the 24-hour claim expires |
| `claim_hours_remaining` | int      | Hours left on the claim (0-24) |

---

### 5. `POST /api/editor/chapters/{chapter}/claim`

Claim a chapter for review.

**Request:** No body needed.

**Success (200):**

```json
{
  "message": "Chapter claimed successfully. You have 24 hours to review it.",
  "chapter": { "..." },
  "claim_expires_at": "2026-03-05T08:00:00.000000Z"
}
```

**Already claimed (409):**

```json
{
  "message": "This chapter is already claimed by another editor. Please try a different chapter.",
  "claimed_by": "Jane Editor"
}
```

**Not reviewable (400):**

```json
{
  "message": "This chapter is not available for review",
  "current_status": "approved"
}
```

---

### 6. `POST /api/editor/chapters/{chapter}/unclaim`

Release a claimed chapter so others can claim it.

**Request:** No body needed.

**Success (200):**

```json
{
  "message": "Chapter claim released successfully. Other editors can now claim it."
}
```

**Not your claim (403):**

```json
{
  "message": "You can only release chapters that you have claimed"
}
```

---

### 7. `GET /api/editor/chapters/{chapter}`

Get full chapter details for review. **Requires claiming first.**

**Response:**

```json
{
  "message": "Chapter details retrieved successfully",
  "chapter": {
    "id": 42,
    "title": "The Dragon's Return",
    "content": "<p>Full HTML content of the chapter...</p>",
    "chapter_number": 5,
    "word_count": 3200,
    "status": "pending_review",
    "pending_title": null,
    "pending_content": null,
    "claimed_by": 10,
    "claimed_at": "2026-03-04T08:00:00.000000Z",
    "claim_expires_at": "2026-03-05T08:00:00.000000Z",
    "novel": {
      "id": 7,
      "title": "Dragon Wars",
      "slug": "dragon-wars",
      "author": "John Author",
      "user_id": 20
    },
    "reviews": [
      {
        "id": 1,
        "action": "revision_requested",
        "notes": "Please fix the ending paragraph.",
        "created_at": "2026-03-03T14:00:00.000000Z",
        "editor": { "id": 10, "name": "Jane Editor" }
      }
    ],
    "reviewer": null,
    "claimed_by_editor": { "id": 10, "name": "Jane Editor" }
  }
}
```

**For `pending_update` chapters:** `pending_title` and `pending_content` will
contain the author's proposed changes. The existing `title` and `content` are
the currently-published versions.

**Not claimed (403):**

```json
{
  "message": "You must claim this chapter before you can review it."
}
```

---

### 8. `POST /api/editor/chapters/{chapter}/approve`

Approve a chapter (publishes it) or approve a pending content update.

**Request:**

```json
{
  "notes": "Great chapter! (optional)"
}
```

**Success (200):**

```json
{
  "message": "Chapter approved and published successfully",
  "chapter": { "..." }
}
```

**Behavior:**

- For `pending_review` chapters → status becomes `approved`, sets `published_at`
- For `pending_update` chapters → applies `pending_title`/`pending_content` to
  the live content, clears pending fields
- Author receives a notification of type `chapter_approved`

---

### 9. `POST /api/editor/chapters/{chapter}/request-revision`

Request the author to revise the chapter.

**Request:**

```json
{
  "notes": "The ending needs work. Please expand the dialogue in section 3."
}
```

| Field   | Type   | Required | Validation |
| ------- | ------ | -------- | ---------- |
| `notes` | string | **Yes**  | max 2000   |

**Success (200):**

```json
{
  "message": "Revision requested successfully",
  "chapter": { "..." }
}
```

**Behavior:**

- For `pending_review` → status becomes `revision_requested`, author can edit
  and resubmit
- For `pending_update` → clears `pending_title`/`pending_content`, status
  reverts to `approved` (original stays published)
- Author receives a notification of type `chapter_revision_requested` with the
  notes

---

### 10. `GET /api/editor/review-history`

Paginated history of all reviews performed by this editor.

**Query Parameters:**

| Param      | Type | Default | Description    |
| ---------- | ---- | ------- | -------------- |
| `per_page` | int  | 15      | Items per page |

**Response:**

```json
{
  "message": "Review history retrieved successfully",
  "reviews": {
    "data": [
      {
        "id": 1,
        "action": "approved",
        "notes": "Well written!",
        "created_at": "2026-03-04T10:00:00.000000Z",
        "chapter": {
          "id": 42,
          "title": "The Dragon's Return",
          "chapter_number": 5,
          "novel_id": 7
        }
      }
    ],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

| `action` values      | Meaning                |
| -------------------- | ---------------------- |
| `approved`           | Chapter was approved   |
| `revision_requested` | Revision was requested |

---

## Error Responses

All endpoints return standard error shapes:

| HTTP Code | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `401`     | Not authenticated — missing or invalid token         |
| `403`     | Not an editor/admin — "Editor privileges required"   |
| `400`     | Invalid action for the chapter's current status      |
| `409`     | Conflict — chapter already claimed by another editor |

---

## Suggested Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  EDITOR DASHBOARD                                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ Stats Cards (GET /editor/stats) ──────────────────┐  │
│  │ Pending: 12  │ Available: 8  │ My Claims: 2        │  │
│  │ Today: 5     │ This Week: 23 │ Total: 142          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ My Group (GET /editor/group) ─────────────────────┐  │
│  │ Group: Fantasy Team [FT]                           │  │
│  │ Pending from group: 3                              │  │
│  │ Members:                                           │  │
│  │  👤 jane_editor (editor)                           │  │
│  │  👤 john_author (author)                           │  │
│  │  👤 alice_writer (author)                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ My Claimed Chapters (/editor/my-claimed-chapters)─┐  │
│  │ Ch.5 "The Dragon's Return" - Dragon Wars  18h left │  │
│  │  [Review] [Unclaim]                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Pending Chapters (GET /editor/pending-chapters) ──┐  │
│  │ Ch.3 "New Beginning" - Story A  🔓 Available       │  │
│  │  [Claim]                                           │  │
│  │ Ch.7 "Update" - Story B  🔒 Claimed by Bob        │  │
│  │  (unavailable)                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Review History (GET /editor/review-history) ──────┐  │
│  │ ✅ Approved "Ch.4 The Battle" - 2h ago             │  │
│  │ ↩️ Revision "Ch.2 Intro" - yesterday               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Review Workflow (Step by Step)

```
1. Editor opens dashboard          → GET /editor/stats
                                   → GET /editor/group
                                   → GET /editor/my-claimed-chapters

2. Editor browses pending          → GET /editor/pending-chapters

3. Editor claims a chapter         → POST /editor/chapters/{id}/claim

4. Editor reads the chapter        → GET /editor/chapters/{id}

5a. Editor approves               → POST /editor/chapters/{id}/approve
5b. Editor requests revision      → POST /editor/chapters/{id}/request-revision

6. (Optional) Editor unclaims     → POST /editor/chapters/{id}/unclaim
```

---

## Notifications (Author-side)

When an editor takes action, the author receives a notification:

| Notification Type            | Trigger                   | Data Fields                            |
| ---------------------------- | ------------------------- | -------------------------------------- |
| `chapter_approved`           | Editor approves a chapter | `chapter_id`, `novel_id`, `novel_slug` |
| `chapter_revision_requested` | Editor requests revision  | Same + `revision_notes`                |
