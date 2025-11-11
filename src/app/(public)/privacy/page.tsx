import { Metadata } from "next";
import {
  Shield,
  Heart,
  Lock,
  Database,
  Users,
  Mail,
  Globe,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Rantale",
  description:
    "Privacy policy for Rantale - A non-profit novel reading platform",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last Updated: November 11, 2025
          </p>
        </div>

        {/* Non-Profit Notice */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Important Notice:</strong> Rantale is a non-profit project
            created for the love of literature and community. We do not monetize
            your data, sell your information, or display advertisements. This
            platform exists solely to provide a space for readers and writers to
            connect and share stories.
          </AlertDescription>
        </Alert>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              Welcome to Rantale. We respect your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              how we collect, use, and safeguard your data when you use our
              platform.
            </p>
            <p>
              As a non-profit project, our primary goal is to foster a community
              of readers and writers. We only collect the minimum amount of
              information necessary to provide our services and enhance your
              experience.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Account Information
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  <strong>Email address:</strong> Required for account creation,
                  verification, and important notifications
                </li>
                <li>
                  <strong>Username/Display name:</strong> Used to identify you
                  on the platform
                </li>
                <li>
                  <strong>Password:</strong> Securely encrypted and stored to
                  protect your account
                </li>
                <li>
                  <strong>Profile information:</strong> Optional details like
                  bio, avatar, and preferences
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. Content You Create
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Novels, chapters, and stories you publish</li>
                <li>Comments and ratings you post</li>
                <li>Library entries and reading lists you create</li>
                <li>Author applications and related information</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                3. Usage Information
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  Reading progress and history (to sync across devices and
                  provide recommendations)
                </li>
                <li>
                  Pages visited and features used (to improve the platform)
                </li>
                <li>
                  Device information and browser type (for compatibility and
                  technical support)
                </li>
                <li>
                  IP address and approximate location (for security and to
                  prevent abuse)
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                4. Cookies and Local Storage
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Authentication tokens (to keep you logged in securely)</li>
                <li>
                  Preferences and settings (theme, reading preferences, etc.)
                </li>
                <li>Offline reading data (for PWA functionality)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>We use your information solely for the following purposes:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Provide core services:</strong> Account management,
                content hosting, and reading features
              </li>
              <li>
                <strong>Enhance user experience:</strong> Personalized
                recommendations, reading progress sync, and saved preferences
              </li>
              <li>
                <strong>Platform improvement:</strong> Understanding how users
                interact with features to make informed development decisions
              </li>
              <li>
                <strong>Community moderation:</strong> Ensuring a safe and
                respectful environment for all users
              </li>
              <li>
                <strong>Security:</strong> Preventing fraud, abuse, and
                unauthorized access
              </li>
              <li>
                <strong>Communication:</strong> Sending essential notifications,
                updates, and responding to your inquiries
              </li>
            </ul>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>We will never:</strong> Sell your data, share it with
                advertisers, use it for marketing purposes, or monetize your
                information in any way.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>We take your data security seriously and implement:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Encryption:</strong> All passwords are hashed using
                industry-standard algorithms. Data transmission uses HTTPS/SSL
                encryption.
              </li>
              <li>
                <strong>Access controls:</strong> Strict limitations on who can
                access user data within our team (admin and moderator roles
                only).
              </li>
              <li>
                <strong>Regular backups:</strong> To prevent data loss while
                maintaining security.
              </li>
              <li>
                <strong>Security monitoring:</strong> Continuous monitoring for
                suspicious activities and potential breaches.
              </li>
            </ul>
            <p>
              However, no system is 100% secure. We encourage you to use strong,
              unique passwords and enable two-factor authentication when
              available.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sharing and Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              We do not sell, rent, or share your personal information with
              third parties for their marketing purposes. We may share limited
              data only in these specific circumstances:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Service providers:</strong> Essential infrastructure
                providers (hosting, database services) who are bound by strict
                confidentiality agreements
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law, court
                order, or to protect our rights and users' safety
              </li>
              <li>
                <strong>Public content:</strong> Novels, comments, and profiles
                you choose to make public are visible to other users and search
                engines
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>You have the following rights regarding your data:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of all data we have
                about you
              </li>
              <li>
                <strong>Correction:</strong> Update or correct your personal
                information through your profile settings
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                associated data (some content may be retained for legal or
                moderation purposes)
              </li>
              <li>
                <strong>Export:</strong> Download your data in a portable format
              </li>
              <li>
                <strong>Opt-out:</strong> Manage notification preferences and
                data collection settings
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us through the contact
              page or email us directly.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              Our platform is intended for users aged 13 and older. We do not
              knowingly collect personal information from children under 13. If
              you believe a child under 13 has provided us with personal
              information, please contact us immediately, and we will delete
              such information.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>We retain your data for as long as:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Your account is active</li>
              <li>
                Necessary to provide services you've requested (e.g., reading
                history for syncing)
              </li>
              <li>Required by law or for legitimate business purposes</li>
            </ul>
            <p>
              When you delete your account, we will remove or anonymize your
              personal information within 30 days, except for data we're legally
              required to retain or content that has been made public and
              continues to be accessed by other users.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for legal, operational, or regulatory
              reasons. When we make significant changes, we will:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>
                Notify you via email or platform notification for material
                changes
              </li>
              <li>
                Provide a reasonable period for you to review changes before
                they take effect
              </li>
            </ul>
            <p>
              Your continued use of the platform after changes indicates your
              acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or how we handle your data, please contact us:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Via Contact Page:</strong> Visit our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact page
                </Link>{" "}
                to send us a message
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@rantale.randk.me"
                  className="text-primary hover:underline"
                >
                  support@rantale.randk.me
                </a>
              </li>
            </ul>
            <p className="text-sm">
              We typically respond to privacy-related inquiries within 5-7
              business days.
            </p>
          </CardContent>
        </Card>

        {/* Final Note */}
        <div className="border-primary/20 bg-muted/50 rounded-lg border-2 border-dashed p-6 text-center">
          <Heart className="text-primary mx-auto mb-3 h-8 w-8" />
          <h3 className="mb-2 text-lg font-semibold">
            Thank You for Being Part of Our Community
          </h3>
          <p className="text-muted-foreground">
            As a non-profit project, we're committed to maintaining your trust.
            Your support and participation make this platform possible. We
            promise to always prioritize your privacy and the community's best
            interests.
          </p>
        </div>
      </div>
    </div>
  );
}
