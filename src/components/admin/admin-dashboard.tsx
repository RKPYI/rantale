"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminDashboardStats } from "@/hooks/use-admin";
import { OverviewTab } from "./overview-tab";
import { AuthorApplicationsTab } from "./author-applications-tab";
import { SystemHealthTab } from "./system-health-tab";
import { ContactsTab } from "./contacts-tab";
import { EditorialGroupsTab } from "./editorial-groups-tab";
import { GenresTab } from "./genres-tab";
import { TagsTab } from "./tags-tab";
// import { ActivityTab } from "./activity-tab"; // Not production-ready yet

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats();

  if (statsLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data: {statsError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-full sm:w-auto sm:min-w-0">
            <TabsTrigger value="overview" className="flex-shrink-0">
              Overview
            </TabsTrigger>
            {/* Users Tab - Not production-ready yet */}
            {/* <TabsTrigger value="users" className="flex-shrink-0">
              Users
            </TabsTrigger> */}
            {/* Content Tab - Not production-ready yet */}
            {/* <TabsTrigger value="content" className="flex-shrink-0">
              Content
            </TabsTrigger> */}
            <TabsTrigger value="authors" className="flex-shrink-0">
              Student Apps
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex-shrink-0">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="editorial-groups" className="flex-shrink-0">
              Editorial Groups
            </TabsTrigger>
            <TabsTrigger value="genres" className="flex-shrink-0">
              Genres
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex-shrink-0">
              Tags
            </TabsTrigger>
            {/* Activity Tab - Not production-ready yet */}
            {/* <TabsTrigger value="activity" className="flex-shrink-0">
              Activity
            </TabsTrigger> */}
            {/* Moderation Tab - Not production-ready yet */}
            {/* <TabsTrigger value="moderation" className="flex-shrink-0">
              Moderation
            </TabsTrigger> */}
            <TabsTrigger value="system" className="flex-shrink-0">
              System
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        {/* Users Tab - Not production-ready yet */}
        {/* <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent> */}

        {/* Content Tab - Not production-ready yet */}
        {/* <TabsContent value="content" className="mt-6">
          <ContentManagement />
        </TabsContent> */}

        {/* Author Applications Tab */}
        <TabsContent value="authors" className="mt-6">
          <AuthorApplicationsTab />
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-6">
          <ContactsTab />
        </TabsContent>

        {/* Editorial Groups Tab */}
        <TabsContent value="editorial-groups" className="mt-6">
          <EditorialGroupsTab />
        </TabsContent>

        {/* Genres Tab */}
        <TabsContent value="genres" className="mt-6">
          <GenresTab />
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="mt-6">
          <TagsTab />
        </TabsContent>

        {/* Activity Tab - Not production-ready yet */}
        {/* <TabsContent value="activity" className="mt-6">
          <ActivityTab />
        </TabsContent> */}

        {/* Moderation Tab - Not production-ready yet */}
        {/* <TabsContent value="moderation" className="mt-6">
          <ModerationQueue />
        </TabsContent> */}

        {/* System Tab */}
        <TabsContent value="system" className="mt-6">
          <SystemHealthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
