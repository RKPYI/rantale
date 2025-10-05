# Novel API - Comprehensive Documentation

## Base Information

- **Base URL**: `https://your-api-domain.com/api`
- **Authentication**: Bearer Token (Laravel Sanctum)
- **Content-Type**: `application/json`
- **Accept**: `application/json`

## Authentication Header Format

```
Authorization: Bearer {your_token_here}
```

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Author Application System](#author-application-system)
3. [Author Dashboard](#author-dashboard)
4. [Admin Dashboard](#admin-dashboard)
5. [Novel Management](#novel-management)
6. [Chapter Management](#chapter-management)
7. [User Library System](#user-library-system)
8. [Notification System](#notification-system)
9. [Comment System](#comment-system)
10. [Rating System](#rating-system)
11. [Reading Progress](#reading-progress)
12. [Data Models](#data-models)
13. [Error Responses](#error-responses)
14. [Status Codes](#status-codes)

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

**Request Body:**

```json
{
  "name": "string (required, max:255)",
  "email": "string (required, email, unique)",
  "password": "string (required, min:8)",
  "password_confirmation": "string (required, must match password)"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "email_verified": false,
    "role": 0,
    "avatar": null,
    "bio": null,
    "is_admin": false
  },
  "token": "1|abc123...",
  "verification_notice": "Please check your email for verification link."
}
```

### Login User

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "string (required, email)",
  "password": "string (required)"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2024-01-01T10:00:00.000000Z",
    "email_verified": true,
    "role": 0,
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Novel enthusiast",
    "is_admin": false
  },
  "token": "2|def456..."
}
```

**Error Response (401):**

```json
{
  "message": "Invalid credentials"
}
```

### Logout User

**POST** `/auth/logout`

- **Authentication**: Required
- **Success Response (200):** `{ "message": "Logged out successfully" }`

### Get Current User

**GET** `/auth/me`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2024-01-01T10:00:00.000000Z",
    "email_verified": true,
    "role": 0,
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Novel enthusiast",
    "is_admin": false,
    "last_login_at": "2024-01-01T10:00:00.000000Z",
    "created_at": "2024-01-01T10:00:00.000000Z"
  }
}
```

### Update Profile

**PUT** `/auth/profile`

- **Authentication**: Required

**Request Body:**

```json
{
  "name": "string (optional, max:255)",
  "bio": "string (optional, max:500, nullable)",
  "avatar": "string (optional, url, max:255, nullable)"
}
```

### Change Password

**PUT** `/auth/change-password`

- **Authentication**: Required

**Request Body:**

```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min:8)",
  "new_password_confirmation": "string (required, must match new_password)"
}
```

### Google OAuth

**GET** `/auth/google`

- Returns Google OAuth URL for redirection

**GET** `/auth/google/callback`

- Handles Google OAuth callback

### Email Verification

**POST** `/auth/email/verify/{id}/{hash}`

- Verifies user email

**POST** `/auth/email/verification-notification`

- **Authentication**: Required
- Sends verification email

**POST** `/auth/email/resend-verification`

- **Authentication**: Required
- Resends verification email

---

## � Author Application System

### Submit Author Application

**POST** `/author/apply`

- **Authentication**: Required
- **Authorization**: Regular users only (not existing authors/admins)

**Request Body:**

```json
{
  "pen_name": "string (optional, max:255)",
  "bio": "string (required, min:50, max:1000)",
  "writing_experience": "string (required, min:100, max:2000)",
  "sample_work": "string (optional, max:5000)",
  "portfolio_url": "string (optional, url, max:255)"
}
```

**Success Response (201):**

```json
{
  "message": "Author application submitted successfully",
  "application": {
    "id": 1,
    "user_id": 123,
    "pen_name": "Fantasy Writer",
    "bio": "I'm passionate about writing fantasy novels...",
    "writing_experience": "I have been writing for 5 years...",
    "sample_work": "Chapter 1: The mysterious forest...",
    "portfolio_url": "https://myportfolio.com",
    "status": "pending",
    "admin_notes": null,
    "reviewed_by": null,
    "reviewed_at": null,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z"
  }
}
```

**Error Responses:**

```json
// User already has author privileges (400)
{
  "message": "You already have author privileges",
  "current_role": 1
}

// Pending application exists (409)
{
  "message": "You already have a pending author application",
  "application": { /* application object */ }
}

// Resubmission after rejection (200)
{
  "message": "Author application resubmitted successfully",
  "application": { /* updated application object */ }
}
```

### Get Application Status

**GET** `/author/application-status`

- **Authentication**: Required

**Success Response (200) - With Application:**

```json
{
  "application": {
    "id": 1,
    "status": "pending", // or "approved" or "rejected"
    "pen_name": "Fantasy Writer",
    "bio": "I'm passionate about writing fantasy novels...",
    "writing_experience": "I have been writing for 5 years...",
    "sample_work": "Chapter 1: The mysterious forest...",
    "portfolio_url": "https://myportfolio.com",
    "admin_notes": "Great writing style, approved!",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "reviewed_at": "2024-01-02T14:30:00.000000Z",
    "reviewer": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

**Success Response (200) - No Application:**

```json
{
  "message": "No author application found",
  "can_apply": true,
  "current_role": 0
}
```

### Admin: Get All Applications

**GET** `/admin/author-applications`

- **Authentication**: Required
- **Authorization**: Admin only

**Query Parameters:**

- `status` (string, optional): Filter by status (pending|approved|rejected|all,
  default: all)
- `page` (integer, optional): Page number for pagination

**Success Response (200):**

```json
{
  "applications": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 123,
        "pen_name": "Fantasy Writer",
        "bio": "I'm passionate about writing...",
        "writing_experience": "I have been writing...",
        "sample_work": "Chapter 1: The mysterious...",
        "portfolio_url": "https://myportfolio.com",
        "status": "pending",
        "admin_notes": null,
        "reviewed_by": null,
        "reviewed_at": null,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "user": {
          "id": 123,
          "name": "John Doe",
          "email": "john@example.com",
          "created_at": "2024-01-01T09:00:00.000000Z"
        },
        "reviewer": null
      }
    ],
    "first_page_url": "...",
    "from": 1,
    "last_page": 2,
    "links": [...],
    "next_page_url": "...",
    "path": "...",
    "per_page": 20,
    "prev_page_url": null,
    "to": 20,
    "total": 35
  },
  "stats": {
    "total": 35,
    "pending": 12,
    "approved": 18,
    "rejected": 5
  }
}
```

### Admin: Get Single Application

**GET** `/admin/author-applications/{application_id}`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "application": {
    // Complete application object with user and reviewer details
  }
}
```

### Admin: Approve Application

**POST** `/admin/author-applications/{application_id}/approve`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:**

```json
{
  "admin_notes": "string (optional, max:1000)"
}
```

**Success Response (200):**

```json
{
  "message": "Author application approved successfully",
  "application": {
    "id": 1,
    "status": "approved",
    "admin_notes": "Great writing style and experience!",
    "reviewed_by": 2,
    "reviewed_at": "2024-01-02T14:30:00.000000Z",
    "user": {
      "id": 123,
      "name": "John Doe",
      "role": 1 // Now promoted to author
    },
    "reviewer": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

**Error Response (400):**

```json
{
  "message": "Application has already been reviewed",
  "current_status": "approved"
}
```

### Admin: Reject Application

**POST** `/admin/author-applications/{application_id}/reject`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:**

```json
{
  "admin_notes": "string (required, min:10, max:1000)"
}
```

**Success Response (200):**

```json
{
  "message": "Author application rejected",
  "application": {
    "id": 1,
    "status": "rejected",
    "admin_notes": "Please provide more writing samples and improve your bio.",
    "reviewed_by": 2,
    "reviewed_at": "2024-01-02T14:30:00.000000Z",
    "user": {
      "id": 123,
      "name": "John Doe",
      "role": 0 // Remains regular user
    },
    "reviewer": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

### Admin: Update Application Notes

**PUT** `/admin/author-applications/{application_id}/notes`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:**

```json
{
  "admin_notes": "string (required, max:1000)"
}
```

**Success Response (200):**

```json
{
  "message": "Application notes updated",
  "application": {
    // Updated application object
  }
}
```

---

## �📚 Novel Management

### Get All Novels

**GET** `/novels`

**Query Parameters:**

- `genre` (string, optional): Filter by genre slug
- `status` (string, optional): Filter by status (ongoing|completed|hiatus)
- `sort_by` (string, optional): Sort criteria
  (popular|rating|latest|updated|created_at|updated_at)
- `sort_order` (string, optional): Sort direction (asc|desc, default: desc)
- `page` (integer, optional): Page number for pagination

**Success Response (200):**

```json
{
  "message": "List of novels",
  "novels": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "title": "Epic Fantasy Novel",
        "author": "Jane Author",
        "slug": "epic-fantasy-novel",
        "description": "An amazing story...",
        "cover_image": "https://example.com/cover.jpg",
        "status": "ongoing",
        "rating": 4.5,
        "rating_count": 100,
        "views": 5000,
        "total_chapters": 25,
        "is_featured": true,
        "is_trending": false,
        "published_at": "2024-01-01T10:00:00.000000Z",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "genres": [
          {
            "id": 1,
            "name": "Fantasy",
            "slug": "fantasy",
            "description": "Fantasy novels"
          }
        ]
      }
    ],
    "first_page_url": "https://api.com/novels?page=1",
    "from": 1,
    "last_page": 5,
    "last_page_url": "https://api.com/novels?page=5",
    "links": [...],
    "next_page_url": "https://api.com/novels?page=2",
    "path": "https://api.com/novels",
    "per_page": 12,
    "prev_page_url": null,
    "to": 12,
    "total": 50
  }
}
```

### Get Single Novel

**GET** `/novels/{slug}`

**Success Response (200):**

```json
{
  "message": "Novel details",
  "novel": {
    "id": 1,
    "title": "Epic Fantasy Novel",
    "author": "Jane Author",
    "slug": "epic-fantasy-novel",
    "description": "An amazing story...",
    "cover_image": "https://example.com/cover.jpg",
    "status": "ongoing",
    "rating": 4.5,
    "rating_count": 100,
    "views": 5001,
    "total_chapters": 25,
    "is_featured": true,
    "is_trending": false,
    "published_at": "2024-01-01T10:00:00.000000Z",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "genres": [
      {
        "id": 1,
        "name": "Fantasy",
        "slug": "fantasy",
        "description": "Fantasy novels"
      }
    ],
    "chapters": [
      {
        "id": 1,
        "novel_id": 1,
        "chapter_number": 1,
        "title": "The Beginning",
        "word_count": 2500
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "message": "Novel not found"
}
```

### Create Novel (Admin Only)

**POST** `/novels`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:**

```json
{
  "title": "string (required, max:255)",
  "author": "string (required, max:255)",
  "description": "string (optional)",
  "cover_image": "string (optional, url)",
  "status": "string (optional, in:ongoing,completed,hiatus)",
  "genres": "array (optional)",
  "genres.*": "integer (exists:genres,id)"
}
```

**Success Response (201):**

```json
{
  "message": "Novel created successfully",
  "novel": {
    // Novel object with genres loaded
  }
}
```

### Update Novel (Admin Only)

**PUT** `/novels/{slug}`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:** Same as create, but all fields are optional (use `sometimes`
validation)

### Delete Novel (Admin Only)

**DELETE** `/novels/{slug}`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "message": "Novel deleted successfully"
}
```

### Search Novels

**GET** `/novels/search?q={query}`

**Query Parameters:**

- `q` (string, required): Search query

**Success Response (200):**

```json
{
  "message": "Search results for: fantasy",
  "novels": [
    {
      "id": 1,
      "slug": "epic-fantasy-novel",
      "title": "Epic Fantasy Novel",
      "author": "Jane Author",
      "description": "An amazing story...",
      "cover_image": "https://example.com/cover.jpg",
      "rating": 4.5,
      "status": "ongoing",
      "genres": [...]
    }
  ]
}
```

### Get Popular Novels

**GET** `/novels/popular`

**Success Response (200):**

```json
{
  "message": "Popular novels",
  "novels": [
    // Array of novel objects (limit 12)
  ]
}
```

### Get Latest Novels

**GET** `/novels/latest`

**Success Response (200):**

```json
{
  "message": "Latest novels",
  "novels": [
    // Array of novel objects (limit 12)
  ]
}
```

### Get Recommendations

**GET** `/novels/recommendations`

**Success Response (200):**

```json
{
  "message": "Recommended novels",
  "novels": [
    // Array of novel objects (limit 12)
  ]
}
```

### Get All Genres

**GET** `/novels/genres`

**Success Response (200):**

```json
{
  "message": "Available genres",
  "genres": [
    {
      "id": 1,
      "name": "Fantasy",
      "slug": "fantasy",
      "description": "Fantasy novels",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z"
    }
  ]
}
```

---

## 📖 Chapter Management

### Get Novel Chapters

**GET** `/novels/{novel_slug}/chapters`

**Success Response (200):**

```json
{
  "message": "Chapters for novel: Epic Fantasy Novel",
  "novel": {
    "title": "Epic Fantasy Novel",
    "slug": "epic-fantasy-novel",
    "author": "Jane Author"
  },
  "chapters": [
    {
      "id": 1,
      "title": "The Beginning",
      "chapter_number": 1,
      "word_count": 2500
    }
  ]
}
```

### Get Single Chapter

**GET** `/novels/{novel_slug}/chapters/{chapter_number}`

**Success Response (200):**

```json
{
  "message": "Chapter details",
  "novel": {
    "id": 1,
    "title": "Epic Fantasy Novel",
    "slug": "epic-fantasy-novel",
    "author": "Jane Author"
  },
  "chapter": {
    "id": 1,
    "novel_id": 1,
    "title": "The Beginning",
    "content": "Full chapter content here...",
    "chapter_number": 1,
    "word_count": 2500,
    "views": 1500,
    "is_free": true,
    "published_at": "2024-01-01T10:00:00.000000Z",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "previous_chapter": null,
    "next_chapter": 2
  }
}
```

**Error Response (404):**

```json
{
  "message": "Chapter not found"
}
```

### Create Chapter (Author Only)

**POST** `/novels/{novel_slug}/chapters`

- **Authentication**: Required
- **Authorization**: Author+ (author, moderator, admin)

**Request Body:**

```json
{
  "title": "string (required, max:255)",
  "content": "string (required)",
  "chapter_number": "integer (optional, min:1, auto-generated if not provided)",
  "is_free": "boolean (optional, default: true)",
  "published_at": "datetime (optional)"
}
```

**Success Response (201):**

```json
{
  "message": "Chapter created successfully",
  "chapter": {
    "id": 1,
    "novel_id": 1,
    "title": "The New Adventure",
    "content": "Full chapter content...",
    "chapter_number": 5,
    "word_count": 3200,
    "views": 0,
    "is_free": true,
    "published_at": "2024-01-01T10:00:00.000000Z",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z"
  }
}
```

**Error Response (409):**

```json
{
  "message": "Chapter number already exists",
  "existing_chapter": {
    // Existing chapter object
  }
}
```

### Update Chapter (Author Only)

**PUT** `/novels/{novel_slug}/chapters/{chapter_id}`

- **Authentication**: Required
- **Authorization**: Author+ or novel owner

**Request Body:** Same as create, but all fields optional

### Delete Chapter (Author Only)

**DELETE** `/novels/{novel_slug}/chapters/{chapter_id}`

- **Authentication**: Required
- **Authorization**: Author+ or novel owner

**Success Response (200):**

```json
{
  "message": "Chapter 'The New Adventure' (#5) deleted successfully"
}
```

---

## 📚 User Library System

### Get User's Library

**GET** `/library`

- **Authentication**: Required

**Query Parameters:**

- `status` (string, optional): Filter by status
  (want_to_read|reading|completed|dropped|on_hold|favorites|all, default: all)
- `favorites` (boolean, optional): Filter favorites only (true|false) -
  alternative to status=favorites
- `page` (integer, optional): Page number for pagination

**Success Response (200):**

```json
{
  "message": "User library retrieved successfully",
  "library": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 123,
        "novel_id": 456,
        "status": "reading",
        "is_favorite": true,
        "added_at": "2024-01-01T10:00:00.000000Z",
        "status_updated_at": "2024-01-01T15:30:00.000000Z",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T15:30:00.000000Z",
        "novel": {
          "id": 456,
          "title": "Epic Fantasy Novel",
          "author": "Jane Author",
          "slug": "epic-fantasy-novel",
          "cover_image": "https://example.com/cover.jpg",
          "rating": 4.5,
          "status": "ongoing",
          "genres": [...]
        }
      }
    ]
  },
  "stats": {
    "total": 25,
    "want_to_read": 8,
    "reading": 5,
    "completed": 10,
    "dropped": 1,
    "on_hold": 1,
    "favorites": 12
  }
}
```

### Add Novel to Library

**POST** `/library`

- **Authentication**: Required

**Request Body:**

```json
{
  "novel_id": "integer (required, exists:novels,id)",
  "status": "string (required, in:want_to_read,reading,completed,dropped,on_hold)",
  "is_favorite": "boolean (optional, default: false)"
}
```

**Success Response (201 for new, 200 for update):**

```json
{
  "message": "Novel added to library successfully",
  "library_entry": {
    // Complete library entry with novel data
  }
}
```

### Update Library Entry

**PUT** `/library/{library_id}`

- **Authentication**: Required
- **Authorization**: Entry owner only

**Request Body:**

```json
{
  "status": "string (optional, in:want_to_read,reading,completed,dropped,on_hold)",
  "is_favorite": "boolean (optional)"
}
```

### Remove from Library

**DELETE** `/library/{library_id}`

- **Authentication**: Required
- **Authorization**: Entry owner only

**Success Response (200):**

```json
{
  "message": "'Epic Fantasy Novel' removed from library successfully"
}
```

### Check Novel Status in Library

**GET** `/library/novel/{novel_slug}/status`

- **Authentication**: Required

**Success Response (200) - In Library:**

```json
{
  "in_library": true,
  "library_entry": {
    "id": 1,
    "status": "reading",
    "is_favorite": true,
    "added_at": "2024-01-01T10:00:00.000000Z",
    "status_updated_at": "2024-01-01T15:30:00.000000Z"
  },
  "novel_id": 456,
  "novel_title": "Epic Fantasy Novel"
}
```

**Success Response (200) - Not in Library:**

```json
{
  "in_library": false,
  "novel_id": 456,
  "novel_title": "Epic Fantasy Novel"
}
```

### Toggle Favorite Status

**POST** `/library/novel/{novel_slug}/toggle-favorite`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "message": "Added to favorites", // or "Removed from favorites"
  "is_favorite": true,
  "library_entry": {
    // Complete library entry with novel data
  }
}
```

### Get Available Statuses

**GET** `/library/statuses`

**Success Response (200):**

```json
{
  "statuses": [
    { "value": "want_to_read", "label": "Want to Read" },
    { "value": "reading", "label": "Reading" },
    { "value": "completed", "label": "Completed" },
    { "value": "dropped", "label": "Dropped" },
    { "value": "on_hold", "label": "On Hold" }
  ]
}
```

---

## 🔔 Notification System

### Get User Notifications

**GET** `/notifications`

- **Authentication**: Required

**Query Parameters:**

- `type` (string, optional): Filter by type
  (new_chapter|comment_reply|author_status|novel_update|system|all, default:
  all)
- `read` (string, optional): Filter by read status (read|unread|all, default:
  all)
- `page` (integer, optional): Page number for pagination

**Success Response (200):**

```json
{
  "notifications": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 123,
        "type": "new_chapter",
        "title": "New Chapter Available",
        "message": "Chapter 15: The Final Battle of 'Epic Fantasy Novel' is now available!",
        "data": {
          "novel_id": 456,
          "novel_slug": "epic-fantasy-novel",
          "novel_title": "Epic Fantasy Novel",
          "chapter_id": 789,
          "chapter_number": 15,
          "chapter_title": "The Final Battle"
        },
        "is_read": false,
        "read_at": null,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
      }
    ]
  },
  "stats": {
    "total": 25,
    "unread": 8,
    "read": 17
  }
}
```

### Get Unread Count

**GET** `/notifications/unread-count`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "unread_count": 8
}
```

### Mark Notification as Read

**PUT** `/notifications/{notification_id}/read`

- **Authentication**: Required
- **Authorization**: Notification owner only

**Success Response (200):**

```json
{
  "message": "Notification marked as read",
  "notification": {
    // Updated notification object
  }
}
```

### Mark Notification as Unread

**PUT** `/notifications/{notification_id}/unread`

- **Authentication**: Required
- **Authorization**: Notification owner only

### Mark All as Read

**PUT** `/notifications/mark-all-read`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "message": "All notifications marked as read",
  "updated_count": 8
}
```

### Delete Notification

**DELETE** `/notifications/{notification_id}`

- **Authentication**: Required
- **Authorization**: Notification owner only

### Clear All Read Notifications

**DELETE** `/notifications/clear-read`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "message": "Read notifications cleared",
  "deleted_count": 15
}
```

---

## 💬 Comment System

### Get Comments

**GET** `/novels/{novel_slug}/comments` (Novel comments) **GET**
`/novels/{novel_slug}/chapters/{chapter_id}/comments` (Chapter comments)

**Success Response (200):**

```json
{
  "comments": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "novel_id": 1,
        "chapter_id": null,
        "parent_id": null,
        "content": "Great novel!",
        "likes": 5,
        "dislikes": 0,
        "is_spoiler": false,
        "is_approved": true,
        "edited_at": null,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "avatar": "https://example.com/avatar.jpg",
          "role": 0,
          "email_verified_at": "2024-01-01T10:00:00.000000Z"
        },
        "replies": [
          {
            "id": 2,
            "user_id": 2,
            "novel_id": 1,
            "chapter_id": null,
            "parent_id": 1,
            "content": "I agree!",
            "likes": 2,
            "dislikes": 0,
            "is_spoiler": false,
            "is_approved": true,
            "edited_at": null,
            "created_at": "2024-01-01T11:00:00.000000Z",
            "updated_at": "2024-01-01T11:00:00.000000Z",
            "user": {
              "id": 2,
              "name": "Jane Smith",
              "avatar": null,
              "role": 0,
              "email_verified_at": "2024-01-01T09:00:00.000000Z"
            },
            "replies": []
          }
        ]
      }
    ],
    "first_page_url": "...",
    "from": 1,
    "last_page": 3,
    "links": [...],
    "next_page_url": "...",
    "path": "...",
    "per_page": 20,
    "prev_page_url": null,
    "to": 20,
    "total": 45
  },
  "total_comments_count": 67
}
```

### Create Comment

**POST** `/comments`

- **Authentication**: Required

**Request Body:**

```json
{
  "novel_id": "integer (required, exists:novels,id)",
  "chapter_id": "integer (optional, exists:chapters,id)",
  "parent_id": "integer (optional, exists:comments,id)",
  "content": "string (required, max:1000)",
  "is_spoiler": "boolean (optional, default: false)"
}
```

**Success Response (201):**

```json
{
  "message": "Comment created successfully",
  "comment": {
    // Comment object with user and replies loaded
  }
}
```

### Update Comment

**PUT** `/comments/{comment_id}`

- **Authentication**: Required
- **Authorization**: Comment owner only

**Request Body:**

```json
{
  "content": "string (required, max:1000)",
  "is_spoiler": "boolean (optional)"
}
```

**Success Response (200):**

```json
{
  "message": "Comment updated successfully",
  "comment": {
    "id": 1,
    "user_id": 1,
    "novel_id": 1,
    "chapter_id": null,
    "parent_id": null,
    "content": "Updated comment content",
    "likes": 5,
    "dislikes": 0,
    "is_spoiler": false,
    "is_approved": true,
    "edited_at": "2024-01-01T15:30:00.000000Z",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T15:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "replies": []
  }
}
```

### Delete Comment

**DELETE** `/comments/{comment_id}`

- **Authentication**: Required
- **Authorization**: Comment owner or admin

**Success Response (200):**

```json
{
  "message": "Comment deleted successfully"
}
```

### Vote on Comment

**POST** `/comments/{comment_id}/vote`

- **Authentication**: Required

**Request Body:**

```json
{
  "is_upvote": "boolean (required)"
}
```

**Success Response (200):**

```json
{
  "message": "Vote added", // or "Vote updated" or "Vote removed"
  "likes": 6,
  "dislikes": 1
}
```

### Get User's Vote on Comment

**GET** `/comments/{comment_id}/vote`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "vote": {
    "is_upvote": true,
    "created_at": "2024-01-01T10:00:00.000000Z"
  }
  // or "vote": null if no vote exists
}
```

### Admin: Get All Comments

**GET** `/admin/comments`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "current_page": 1,
  "data": [
    {
      // Comment objects with user, novel, and chapter data
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "...",
        "role": 0,
        "email_verified_at": "..."
      },
      "novel": {
        "id": 1,
        "title": "Epic Fantasy Novel"
      },
      "chapter": {
        "id": 1,
        "title": "The Beginning"
      }
    }
  ]
}
```

### Admin: Toggle Comment Approval

**PUT** `/admin/comments/{comment_id}/toggle-approval`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "message": "Comment approval status updated",
  "comment": {
    // Updated comment object
  }
}
```

---

## ⭐ Rating System

### Get Novel Ratings

**GET** `/novels/{novel_slug}/ratings`

**Success Response (200):**

```json
{
  "ratings": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "novel_id": 1,
        "rating": 5,
        "review": "Amazing novel! Highly recommended.",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ]
  },
  "stats": {
    "average_rating": 4.5,
    "total_ratings": 100,
    "rating_breakdown": {
      "5": 50,
      "4": 30,
      "3": 15,
      "2": 3,
      "1": 2
    }
  }
}
```

### Create or Update Rating

**POST** `/ratings`

- **Authentication**: Required

**Request Body:**

```json
{
  "novel_id": "integer (required, exists:novels,id)",
  "rating": "integer (required, min:1, max:5)",
  "review": "string (optional, max:1000)"
}
```

**Success Response (200 for update, 201 for create):**

```json
{
  "message": "Rating created successfully", // or "Rating updated successfully"
  "rating": {
    "id": 1,
    "user_id": 1,
    "novel_id": 1,
    "rating": 5,
    "review": "Amazing novel!",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "novel": {
      "id": 1,
      "title": "Epic Fantasy Novel"
    }
  },
  "novel_stats": {
    "average_rating": 4.52,
    "total_ratings": 101
  }
}
```

### Get User's Rating for Novel

**GET** `/novels/{novel_slug}/my-rating`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "rating": {
    "id": 1,
    "user_id": 1,
    "novel_id": 1,
    "rating": 5,
    "review": "Amazing novel!",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z"
  }
  // or "rating": null if no rating exists
}
```

### Delete Rating

**DELETE** `/ratings/{rating_id}`

- **Authentication**: Required
- **Authorization**: Rating owner or admin

**Success Response (200):**

```json
{
  "message": "Rating deleted successfully",
  "novel_stats": {
    "average_rating": 4.48,
    "total_ratings": 99
  }
}
```

### Get User's All Ratings

**GET** `/my-ratings`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "novel_id": 1,
      "rating": 5,
      "review": "Amazing novel!",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z",
      "novel": {
        "id": 1,
        "title": "Epic Fantasy Novel",
        "author": "Jane Author",
        "cover_image": "https://example.com/cover.jpg",
        "slug": "epic-fantasy-novel"
      }
    }
  ]
}
```

---

## 📚 Reading Progress

### Get Reading Progress for Novel

**GET** `/reading-progress/{novel_slug}`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "novel_slug": "epic-fantasy-novel",
  "user_id": 1,
  "current_chapter": {
    "id": 5,
    "chapter_number": 5,
    "title": "The Adventure Begins"
  },
  "progress_percentage": 20.0,
  "last_read_at": "2024-01-01T15:30:00.000000Z",
  "total_chapters": 25
}
```

**Response for no progress (200):**

```json
{
  "novel_slug": "epic-fantasy-novel",
  "user_id": 1,
  "current_chapter": null,
  "progress_percentage": 0,
  "last_read_at": null,
  "total_chapters": 25
}
```

### Update Reading Progress

**PUT** `/reading-progress`

- **Authentication**: Required

**Request Body:**

```json
{
  "novel_slug": "string (required)",
  "chapter_number": "integer (required)"
}
```

**Success Response (200):**

```json
{
  "message": "Reading progress updated successfully",
  "progress": {
    "novel_slug": "epic-fantasy-novel",
    "user_id": 1,
    "current_chapter": {
      "id": 6,
      "novel_id": 1,
      "title": "New Discoveries",
      "chapter_number": 6,
      "word_count": 3000,
      "views": 800,
      "is_free": true,
      "published_at": "2024-01-01T10:00:00.000000Z",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z"
    },
    "progress_percentage": 24.0,
    "last_read_at": "2024-01-01T16:00:00.000000Z",
    "total_chapters": 25
  }
}
```

**Error Response (404):**

```json
{
  "error": "Novel not found"
}
// or
{
  "error": "Chapter not found"
}
```

### Get All User's Reading Progress

**GET** `/reading-progress/user`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "user_id": 1,
  "reading_progress": [
    {
      "novel": {
        "id": 1,
        "title": "Epic Fantasy Novel",
        "author": "Jane Author",
        "cover_image": "https://example.com/cover.jpg",
        "slug": "epic-fantasy-novel"
      },
      "current_chapter": {
        "id": 5,
        "chapter_number": 5,
        "title": "The Adventure Begins"
      },
      "progress_percentage": 20.0,
      "last_read_at": "2024-01-01T15:30:00.000000Z",
      "total_chapters": 25
    }
  ]
}
```

### Create Initial Reading Progress

**POST** `/reading-progress`

- **Authentication**: Required

**Request Body:**

```json
{
  "novel_slug": "string (required)"
}
```

**Success Response (201):**

```json
{
  "message": "Reading progress created successfully",
  "progress": {
    "novel_slug": "epic-fantasy-novel",
    "user_id": 1,
    "current_chapter": {
      "id": 1,
      "novel_id": 1,
      "title": "The Beginning",
      "chapter_number": 1,
      "word_count": 2500,
      "views": 1500,
      "is_free": true,
      "published_at": "2024-01-01T10:00:00.000000Z",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z"
    },
    "progress_percentage": 4.0,
    "last_read_at": "2024-01-01T16:30:00.000000Z",
    "total_chapters": 25
  }
}
```

**Error Response (409 - Conflict):**

```json
{
  "message": "Reading progress already exists for this novel",
  "progress": {
    // Existing progress data
  }
}
```

**Error Response (404):**

```json
{
  "error": "Novel not found"
}
// or
{
  "error": "No chapters found for this novel"
}
```

### Delete Reading Progress

**DELETE** `/reading-progress/{novel_slug}`

- **Authentication**: Required

**Success Response (200):**

```json
{
  "message": "Reading progress deleted successfully"
}
```

**Error Response (404):**

```json
{
  "message": "No reading progress found to delete"
}
```

---

## 📊 Data Models

### User Model

```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "email_verified_at": "datetime|null",
  "email_verified": "boolean",
  "role": "integer (0=user, 1=author, 2=moderator, 3=admin)",
  "provider": "string (email|google)",
  "provider_id": "string|null",
  "avatar": "string|null",
  "bio": "string|null",
  "is_admin": "boolean",
  "last_login_at": "datetime|null",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Author Application Model

```json
{
  "id": "integer",
  "user_id": "integer",
  "pen_name": "string|null",
  "bio": "string",
  "writing_experience": "string",
  "sample_work": "string|null",
  "portfolio_url": "string|null",
  "status": "string (pending|approved|rejected)",
  "admin_notes": "string|null",
  "reviewed_by": "integer|null",
  "reviewed_at": "datetime|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "user": "User object",
  "reviewer": "User object|null"
}
```

### Novel Model

```json
{
  "id": "integer",
  "title": "string",
  "author": "string",
  "slug": "string",
  "description": "string|null",
  "status": "string (ongoing|completed|hiatus)",
  "cover_image": "string|null",
  "total_chapters": "integer",
  "views": "integer",
  "likes": "integer",
  "rating": "decimal (0.00-5.00)",
  "rating_count": "integer",
  "is_featured": "boolean",
  "is_trending": "boolean",
  "published_at": "datetime|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "genres": "array of Genre objects"
}
```

### Chapter Model

```json
{
  "id": "integer",
  "novel_id": "integer",
  "title": "string",
  "content": "string",
  "chapter_number": "integer",
  "word_count": "integer",
  "views": "integer",
  "is_free": "boolean",
  "published_at": "datetime|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "previous_chapter": "integer|null",
  "next_chapter": "integer|null"
}
```

### Comment Model

```json
{
  "id": "integer",
  "user_id": "integer",
  "novel_id": "integer",
  "chapter_id": "integer|null",
  "parent_id": "integer|null",
  "content": "string",
  "likes": "integer",
  "dislikes": "integer",
  "is_spoiler": "boolean",
  "is_approved": "boolean",
  "edited_at": "datetime|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "user": "User object",
  "replies": "array of Comment objects"
}
```

### Rating Model

```json
{
  "id": "integer",
  "user_id": "integer",
  "novel_id": "integer",
  "rating": "integer (1-5)",
  "review": "string|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "user": "User object",
  "novel": "Novel object"
}
```

### Genre Model

```json
{
  "id": "integer",
  "name": "string",
  "slug": "string",
  "description": "string|null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Reading Progress Model

```json
{
  "id": "integer",
  "user_id": "integer",
  "novel_id": "integer",
  "chapter_id": "integer",
  "created_at": "datetime",
  "updated_at": "datetime",
  "novel": "Novel object",
  "chapter": "Chapter object"
}
```

---

## ❌ Error Responses

### Validation Error (422)

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Authentication Error (401)

```json
{
  "message": "Unauthenticated"
}
```

### Authorization Error (403)

```json
{
  "message": "Unauthorized"
}
```

### Not Found Error (404)

```json
{
  "message": "Resource not found"
}
// or specific messages like:
{
  "message": "Novel not found"
}
{
  "message": "Chapter not found"
}
```

### Server Error (500)

```json
{
  "message": "Internal server error",
  "error": "Detailed error message (in debug mode)"
}
```

---

## 📋 Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | OK - Request successful                  |
| 201  | Created - Resource created successfully  |
| 400  | Bad Request - Invalid request data       |
| 401  | Unauthorized - Authentication required   |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource not found           |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error - Server error     |

---

## 🔒 Middleware & Permissions

### Authentication Middleware

- `auth:sanctum` - Requires valid bearer token

### Authorization Levels

- **Public**: No authentication required
- **User**: Authenticated users only
- **Verified**: Authenticated + email verified users only
- **Admin**: Authenticated + admin role users only

### Route Protection Summary

- **Public Routes**: Novel/chapter reading, search, popular lists
- **User Routes**: Comments, ratings, reading progress, profile management
- **Admin Routes**: Novel/chapter creation/editing/deletion, comment moderation

---

## � Frontend Implementation Notes

### Detecting Edited Comments

Comments now include an `edited_at` field that helps the frontend determine if a
comment has been edited:

**Comment Response Fields for Edit Detection:**

```json
{
  "id": 1,
  "content": "This comment was edited",
  "edited_at": "2024-01-01T15:30:00.000000Z", // null if never edited
  "created_at": "2024-01-01T10:00:00.000000Z",
  "updated_at": "2024-01-01T15:30:00.000000Z"
}
```

**Frontend Logic:**

```javascript
// Check if comment was edited
function isCommentEdited(comment) {
  return comment.edited_at !== null;
}

// Display edit indicator
function renderComment(comment) {
  const editedText = isCommentEdited(comment)
    ? ` (edited ${formatTime(comment.edited_at)})`
    : "";

  return `
    <div class="comment">
      <p>${comment.content}</p>
      <small>
        Posted ${formatTime(comment.created_at)}${editedText}
      </small>
    </div>
  `;
}
```

**Time Comparison for Edit Detection:**

- `edited_at` is `null` for comments that have never been edited
- `edited_at` contains timestamp when comment was last edited
- Frontend can show "(edited)" indicator when `edited_at` is not null
- Can show "last edited X minutes ago" using the `edited_at` timestamp

---

## �💡 Usage Examples

### Authenticate and Get Novels

```javascript
// Login
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
const { token } = await loginResponse.json();

// Get novels with authentication
const novelsResponse = await fetch(
  "/api/novels?genre=fantasy&sort_by=popular",
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
const novels = await novelsResponse.json();
```

### Post a Comment

```javascript
await fetch("/api/comments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    novel_id: 1,
    content: "Great chapter!",
    is_spoiler: false,
  }),
});
```

### Update Reading Progress

```javascript
await fetch("/api/reading-progress", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    novel_slug: "epic-fantasy-novel",
    chapter_number: 5,
  }),
});
```

---

## 📝 Notes for Frontend Developers

1. **Always include Bearer token** for authenticated routes
2. **Check response status codes** before processing data
3. **Handle validation errors** by displaying field-specific messages
4. **Pagination is used** for lists - check `next_page_url` for more data
5. **Novel slugs are used** instead of IDs for SEO-friendly URLs
6. **Comments are nested** - replies are included in the `replies` array
7. **Reading progress tracks by chapter number**, not chapter ID
8. **Rating system is 1-5 stars** with optional text review
9. **Email verification affects** some features - check `email_verified` status
10. **Admin users** have access to additional management endpoints
11. **Author Dashboard** provides statistics and novel management for authors
12. **Admin Dashboard** provides comprehensive platform management and analytics

---

## 📊 Author Dashboard

### Get Author Statistics

**GET** `/author/stats`

- **Authentication**: Required
- **Authorization**: Author+ (author, moderator, admin)

**Success Response (200):**

```json
{
  "total_novels": 5,
  "total_views": 15000,
  "total_followers": 0,
  "monthly_views": null,
  "monthly_followers": null,
  "average_rating": 4.25
}
```

**Response Fields:**

- `total_novels`: Total number of novels published by the author
- `total_views`: Cumulative views across all author's novels
- `total_followers`: Total followers (currently 0, pending follow system
  implementation)
- `monthly_views`: Views gained in last 30 days (null, pending view tracking
  implementation)
- `monthly_followers`: Followers gained in last 30 days (null, pending follow
  system implementation)
- `average_rating`: Average rating across all author's novels (null if no
  ratings)

### Get Author's Novels

**GET** `/author/novels`

- **Authentication**: Required
- **Authorization**: Author+ (author, moderator, admin)

**Success Response (200):**

```json
{
  "message": "Author novels retrieved successfully",
  "novels": [
    {
      "id": 1,
      "title": "Epic Fantasy Adventure",
      "author": "Test Author",
      "slug": "epic-fantasy-adventure",
      "description": "An amazing fantasy story...",
      "status": "ongoing",
      "cover_image": "https://example.com/cover.jpg",
      "total_chapters": 25,
      "views": 5000,
      "likes": 150,
      "rating": 4.5,
      "rating_count": 20,
      "is_featured": false,
      "is_trending": true,
      "published_at": "2024-01-01T10:00:00.000000Z",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z",
      "chapters_count": 25,
      "views_count": 5000,
      "rating_avg": 4.5,
      "genres": [
        {
          "id": 1,
          "name": "Fantasy",
          "slug": "fantasy",
          "description": "Fantasy novels"
        }
      ]
    }
  ]
}
```

**Extended Novel Fields:**

- `chapters_count`: Total number of chapters in the novel
- `views_count`: Total views for the novel (same as `views`)
- `rating_avg`: Average rating (null if no ratings, same as `rating`)

**Error Response (403):**

```json
{
  "message": "Unauthorized. Author privileges required."
}
```

---

## 🛡️ Admin Dashboard

### Get Dashboard Statistics

**GET** `/admin/dashboard/stats`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "users": {
    "total": 150,
    "new_this_month": 25,
    "verified": 120,
    "active_today": 45,
    "by_role": {
      "users": 100,
      "authors": 35,
      "moderators": 5,
      "admins": 10
    }
  },
  "content": {
    "novels": 75,
    "chapters": 1200,
    "comments": 3500,
    "ratings": 800,
    "pending_comments": 15,
    "novels_this_month": 8
  },
  "engagement": {
    "total_views": 125000,
    "total_library_entries": 2500,
    "average_rating": 4.25,
    "top_genres": [
      { "name": "Fantasy", "count": 25 },
      { "name": "Romance", "count": 20 },
      { "name": "Sci-Fi", "count": 15 },
      { "name": "Mystery", "count": 10 },
      { "name": "Adventure", "count": 5 }
    ]
  },
  "author_applications": {
    "pending": 12,
    "approved_this_month": 8,
    "total_approved": 45
  }
}
```

### Get Recent Activity Feed

**GET** `/admin/activity`

- **Authentication**: Required
- **Authorization**: Admin only

**Query Parameters:**

- `limit` (integer, optional): Number of activities to return (default: 20)

**Success Response (200):**

```json
{
  "message": "Recent activity retrieved successfully",
  "activities": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "activity_type": "user_registered"
    },
    {
      "id": 2,
      "title": "New Fantasy Adventure",
      "author": "Jane Author",
      "created_at": "2024-01-01T09:30:00.000000Z",
      "activity_type": "novel_created"
    },
    {
      "id": 3,
      "user_id": 5,
      "novel_id": 1,
      "content": "Great chapter!",
      "created_at": "2024-01-01T09:15:00.000000Z",
      "activity_type": "comment_posted",
      "user": {
        "id": 5,
        "name": "Reader User"
      },
      "novel": {
        "id": 1,
        "title": "Epic Fantasy Novel"
      }
    },
    {
      "id": 4,
      "user_id": 10,
      "status": "pending",
      "created_at": "2024-01-01T09:00:00.000000Z",
      "activity_type": "application_submitted",
      "user": {
        "id": 10,
        "name": "Aspiring Author"
      }
    }
  ]
}
```

### Get User Management Data

**GET** `/admin/users`

- **Authentication**: Required
- **Authorization**: Admin only

**Query Parameters:**

- `page` (integer, optional): Page number for pagination
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role (0|1|2|3|all, default: all)
- `status` (string, optional): Filter by status (active|inactive|unverified|all)

**Success Response (200):**

```json
{
  "message": "User management data retrieved successfully",
  "users": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 0,
        "is_active": true,
        "email_verified_at": "2024-01-01T10:00:00.000000Z",
        "last_login_at": "2024-01-01T15:30:00.000000Z",
        "created_at": "2024-01-01T09:00:00.000000Z"
      }
    ],
    "first_page_url": "...",
    "from": 1,
    "last_page": 5,
    "links": [...],
    "next_page_url": "...",
    "path": "...",
    "per_page": 25,
    "prev_page_url": null,
    "to": 25,
    "total": 150
  }
}
```

### Update User

**PUT** `/admin/users/{user_id}`

- **Authentication**: Required
- **Authorization**: Admin only

**Request Body:**

```json
{
  "role": "integer (optional, in:0,1,2,3)",
  "is_active": "boolean (optional)"
}
```

**Success Response (200):**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": 1,
    "is_active": true,
    "email_verified_at": "2024-01-01T10:00:00.000000Z"
  }
}
```

### Get Content Moderation Queue

**GET** `/admin/moderation`

- **Authentication**: Required
- **Authorization**: Admin/Moderator

**Query Parameters:**

- `type` (string, optional): Filter by type (comments|novels|all, default: all)

**Success Response (200):**

```json
{
  "message": "Moderation queue retrieved successfully",
  "moderation_data": {
    "pending_comments": [
      {
        "id": 1,
        "content": "This comment needs review",
        "is_approved": false,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "user": {
          "id": 5,
          "name": "User Name"
        },
        "novel": {
          "id": 1,
          "title": "Novel Title"
        }
      }
    ],
    "recent_novels": [
      {
        "id": 1,
        "title": "New Novel",
        "author": "Author Name",
        "status": "ongoing",
        "created_at": "2024-01-01T10:00:00.000000Z"
      }
    ]
  }
}
```

### Get System Health

**GET** `/admin/system-health`

- **Authentication**: Required
- **Authorization**: Admin only

**Success Response (200):**

```json
{
  "message": "System health retrieved successfully",
  "health": {
    "database": {
      "status": "healthy",
      "total_tables": 15
    },
    "cache": {
      "status": "healthy"
    },
    "storage": {
      "status": "healthy"
    },
    "recent_errors": {
      "count_today": 0,
      "critical_errors": 0
    }
  }
}
```

**Error Response (403):**

```json
{
  "message": "Unauthorized"
}
```

---

_This documentation is comprehensive and should provide all necessary
information for frontend development and AI tool integration._
