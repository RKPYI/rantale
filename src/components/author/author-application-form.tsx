"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PenTool,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  useAuthorApplicationStatus,
  useSubmitAuthorApplication,
} from "@/hooks/use-author";
import { authorService } from "@/services/author";
import { useAsync } from "@/hooks/use-api";
import { AuthorApplicationRequest } from "@/types/api";
import { formatDate } from "@/lib/novel-utils";

export function AuthorApplicationForm() {
  const [formData, setFormData] = useState<AuthorApplicationRequest>({
    pen_name: "",
    bio: "",
    writing_experience: "",
    sample_work: "",
    portfolio_url: "",
  });

  const {
    data: applicationStatus,
    loading,
    error,
    refetch,
  } = useAuthorApplicationStatus();
  const { loading: submitting, execute: executeSubmit } = useAsync();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bio.trim() || !formData.writing_experience.trim()) {
      return;
    }

    try {
      await executeSubmit(authorService.submitApplication, formData);
      // Refresh the application status
      refetch();
      // Reset form
      setFormData({
        pen_name: "",
        bio: "",
        writing_experience: "",
        sample_work: "",
        portfolio_url: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };

  const handleInputChange = (
    field: keyof AuthorApplicationRequest,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-4 w-1/2 rounded"></div>
            <div className="bg-muted h-32 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading application status: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // User already has an application
  if (applicationStatus?.application) {
    const app = applicationStatus.application;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Author Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {getStatusIcon(app.status)}
            <Badge className={getStatusColor(app.status)}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </Badge>
            <span className="text-muted-foreground text-sm">
              Submitted on {formatDate(app.created_at)}
            </span>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            {app.pen_name && (
              <div>
                <Label className="font-medium">Pen Name</Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {app.pen_name}
                </p>
              </div>
            )}

            <div>
              <Label className="font-medium">Bio</Label>
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                {app.bio}
              </p>
            </div>

            <div>
              <Label className="font-medium">Writing Experience</Label>
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                {app.writing_experience}
              </p>
            </div>

            {app.sample_work && (
              <div>
                <Label className="font-medium">Sample Work</Label>
                <div className="bg-muted mt-1 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {app.sample_work}
                  </p>
                </div>
              </div>
            )}

            {app.portfolio_url && (
              <div>
                <Label className="font-medium">Portfolio</Label>
                <a
                  href={app.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
                >
                  {app.portfolio_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Admin Review */}
          {app.reviewed_at && app.reviewer && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Admin Review</Label>
                  <span className="text-muted-foreground text-xs">
                    Reviewed by {app.reviewer.name} on{" "}
                    {formatDate(app.reviewed_at)}
                  </span>
                </div>
                {app.admin_notes && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">{app.admin_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Resubmit for rejected applications */}
          {app.status === "rejected" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your application was rejected, but you can resubmit with
                improvements. The form below will be pre-filled with your
                previous submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show application form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Apply to Become an Author
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Share your writing experience and passion to join our community of
          authors.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pen Name */}
          <div className="space-y-2">
            <Label htmlFor="pen_name">
              Pen Name <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="pen_name"
              value={formData.pen_name}
              onChange={(e) => handleInputChange("pen_name", e.target.value)}
              placeholder="The name you'd like to publish under"
              maxLength={255}
            />
            <p className="text-muted-foreground text-xs">
              Leave blank to use your real name
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself as a writer..."
              rows={4}
              maxLength={1000}
              required
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Minimum 50 characters required</span>
              <span>{formData.bio.length}/1000</span>
            </div>
          </div>

          {/* Writing Experience */}
          <div className="space-y-2">
            <Label htmlFor="writing_experience">
              Writing Experience <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="writing_experience"
              value={formData.writing_experience}
              onChange={(e) =>
                handleInputChange("writing_experience", e.target.value)
              }
              placeholder="Describe your writing background, experience, and what genres you're passionate about..."
              rows={5}
              maxLength={2000}
              required
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Minimum 100 characters required</span>
              <span>{formData.writing_experience.length}/2000</span>
            </div>
          </div>

          {/* Sample Work */}
          <div className="space-y-2">
            <Label htmlFor="sample_work">
              Sample Work{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="sample_work"
              value={formData.sample_work}
              onChange={(e) => handleInputChange("sample_work", e.target.value)}
              placeholder="Share a short excerpt from your writing..."
              rows={6}
              maxLength={5000}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Optional but recommended</span>
              <span>{formData.sample_work?.length || 0}/5000</span>
            </div>
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <Label htmlFor="portfolio_url">
              Portfolio URL{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <div className="relative">
              <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                id="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) =>
                  handleInputChange("portfolio_url", e.target.value)
                }
                placeholder="https://your-portfolio.com"
                className="pl-10"
                maxLength={255}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Link to your blog, writing samples, or published works
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                submitting ||
                !formData.bio.trim() ||
                formData.bio.length < 50 ||
                !formData.writing_experience.trim() ||
                formData.writing_experience.length < 100
              }
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Applications are reviewed by our admin team. You&apos;ll receive a
              notification once your application has been processed.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
}
