// Environment configuration with validation
export const env = {
  // API Configuration
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL,

  // Development flags
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
} as const;

// Validate required environment variables in production only
// In development, we'll use defaults if not provided
export function validateEnv() {
  // Only validate in production, allow defaults in development
  if (env.IS_PRODUCTION) {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      throw new Error(
        `Missing required environment variables: NEXT_PUBLIC_API_BASE_URL\n` +
          "Please set this in your Vercel project settings under Environment Variables.",
      );
    }
  }

  // Log configuration in development
  if (env.IS_DEVELOPMENT) {
    console.log("🔧 API Configuration:", {
      API_BASE_URL: env.API_BASE_URL,
      APP_URL: env.APP_URL,
    });
  }
}

// Call validation
validateEnv();
