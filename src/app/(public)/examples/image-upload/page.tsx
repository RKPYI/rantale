"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { NovelCoverUpload } from "@/components/novels/novel-cover-upload";
import { useAuth } from "@/contexts/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ImageUploadDemo() {
  const { user, refreshProfile } = useAuth();

  // Mock novel data for demo
  const mockNovel = {
    id: 1,
    title: "Sample Novel",
    slug: "sample-novel",
    author: "Author Name",
    description: "A sample novel for testing cover upload",
    status: "ongoing" as const,
    cover_image: null,
    total_chapters: 0,
    views: 0,
    likes: 0,
    rating: null,
    rating_count: 0,
    is_featured: false,
    is_trending: false,
    published_at: null,
    genres: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Please log in to test image upload functionality.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Image Upload Demo</h1>
        <p className="text-muted-foreground mt-2">
          Test avatar and novel cover upload functionality
        </p>
      </div>

      <Tabs defaultValue="avatar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="avatar">Avatar Upload</TabsTrigger>
          <TabsTrigger value="cover">Novel Cover Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="avatar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Profile Avatar</CardTitle>
              <CardDescription>
                Upload or update your profile picture. Images will be
                automatically resized and optimized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-sm">
                <AvatarUpload user={user} onUpdate={() => refreshProfile()} />
              </div>

              <div className="text-muted-foreground mt-6 space-y-2 text-sm">
                <p className="font-medium">Guidelines:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Recommended size: 400x400 pixels (square)</li>
                  <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Images are automatically compressed and optimized</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Novel Cover</CardTitle>
              <CardDescription>
                Upload or update the cover image for your novel. Authors can
                manage covers for their own novels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-sm">
                <NovelCoverUpload
                  novel={mockNovel}
                  onUpdate={(updatedNovel) => {
                    console.log("Novel updated:", updatedNovel);
                  }}
                />
              </div>

              <div className="text-muted-foreground mt-6 space-y-2 text-sm">
                <p className="font-medium">Guidelines:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Recommended size: 800x1200 pixels (2:3 ratio)</li>
                  <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Portrait orientation works best for book covers</li>
                  <li>Images are automatically compressed and optimized</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This demo uses a mock novel. In production,
              you can only upload covers for novels you own. The actual endpoint
              requires author authentication.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Technical Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>Client-side image validation before upload</li>
            <li>Automatic image compression and optimization</li>
            <li>Drag and drop support</li>
            <li>Real-time preview before upload</li>
            <li>Loading states and error handling</li>
            <li>Success notifications with auto-dismiss</li>
            <li>Responsive design for all screen sizes</li>
            <li>Dark mode support</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
