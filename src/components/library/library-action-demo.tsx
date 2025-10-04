"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryActionButton } from "./library-action-button";
import { Novel } from "@/types/api";

// Demo novel data
const demoNovel: Novel = {
  id: 1,
  title: "Demo Novel",
  slug: "demo-novel",
  author: "Demo Author",
  description: "A demo novel for testing library functionality",
  cover_image: null,
  status: "ongoing",
  genres: [],
  is_featured: false,
  is_trending: false,
  rating: "4.5",
  rating_count: 100,
  views: 1000,
  likes: 50,
  total_chapters: 25,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function LibraryActionDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Library Action Button Demo</h2>

      <div className="grid gap-6">
        {/* Default Style */}
        <Card>
          <CardHeader>
            <CardTitle>Default Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <LibraryActionButton novel={demoNovel} />
            </div>
          </CardContent>
        </Card>

        {/* Badge Style */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Style (for profile pages)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <LibraryActionButton novel={demoNovel} showBadgeStyle={true} />
            </div>
          </CardContent>
        </Card>

        {/* Without Status Display */}
        <Card>
          <CardHeader>
            <CardTitle>Without Status Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <LibraryActionButton novel={demoNovel} showStatus={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
