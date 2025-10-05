This is a [Next.js](https://nextjs.org) project for Rantale, a novel reading
platform built with modern React patterns and shadcn/ui components.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A running Laravel backend API

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your backend API URL:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## ✨ Features

- **🔐 Complete Authentication System**
  - Email/password registration and login
  - Google OAuth integration
  - Email verification
  - JWT token management
  - Protected routes

- **🎨 Modern UI Components**
  - shadcn/ui component library
  - Dark/light theme support
  - Responsive design
  - OKLCH color system

- **📡 API Integration**
  - Type-safe API client
  - React hooks for data fetching
  - Error handling
  - Loading states
  - Pagination support

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── google/callback/ # OAuth callback
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── navbar.tsx         # Navigation with auth integration
├── hooks/                 # Custom React hooks
│   ├── use-auth.ts        # Authentication state management
│   ├── use-api.ts         # Generic API hooks
│   └── use-novels.ts      # Novel-specific data hooks
├── lib/                   # Utilities
│   ├── api-client.ts      # Centralized API client
│   ├── env.ts             # Environment validation
│   └── utils.ts           # Utility functions
├── services/              # API service layers
│   ├── auth.ts            # Authentication services
│   ├── novels.ts          # Novel services
│   └── reading.ts         # Reading progress services
└── types/                 # TypeScript interfaces
    └── api.ts             # API response types
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Components

Add shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Components auto-configure with New York style and CSS variables.

### Authentication Flow

1. **User Registration/Login** → JWT token stored
2. **Protected API Calls** → Token automatically included
3. **Profile Management** → Real-time sync with backend
4. **Email Verification** → Handled via backend routes

## 📚 Documentation

- **[API Integration Guide](./API.md)** - Complete API setup and usage
- **[Copilot Instructions](./.github/copilot-instructions.md)** - AI coding
  assistant guidelines

## 🔗 Backend Integration

This frontend connects to a Laravel backend with Sanctum authentication.
Required API routes:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get user profile
- `POST /auth/logout` - User logout
- `GET /auth/google` - Google OAuth
- `GET /auth/google/callback` - OAuth callback

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect your repo to Vercel
# Add environment variables in dashboard
# Deploy automatically on push
```

### Manual Deployment

```bash
npm run build
npm run start
```

## 🧪 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with OKLCH colors
- **shadcn/ui** - Component library
- **Radix UI** - Headless components
- **Lucide React** - Icons
- **next-themes** - Theme management

## 📄 License

This project is private and proprietary.
