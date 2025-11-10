import { Metadata } from "next";
import {
  FileText,
  Heart,
  Scale,
  Users,
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  Mail,
  XCircle,
  Eye,
  UserCheck,
  Gavel,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Terms of Service | Rantale",
  description:
    "Terms of Service for Rantale - A non-profit novel reading platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <FileText className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            Last Updated: November 11, 2025
          </p>
        </div>

        {/* Non-Profit Notice */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Important Notice:</strong> Rantale is a non-profit,
            community-driven project. We operate without monetization,
            advertisements, or commercial interests. These terms exist to ensure
            a respectful, safe, and enjoyable environment for all readers and
            writers who share our love for literature.
          </AlertDescription>
        </Alert>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              Welcome to Rantale! By accessing or using our platform, you agree
              to be bound by these Terms of Service ("Terms"). Please read them
              carefully before using our services.
            </p>
            <p>
              If you do not agree with any part of these Terms, you may not
              access or use our platform. As a non-profit project, our primary
              goal is to foster a healthy community of readers and writers, and
              these Terms help us maintain that environment.
            </p>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                By creating an account or using Rantale, you acknowledge that
                you have read, understood, and agree to be bound by these Terms
                and our Privacy Policy.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>To use Rantale, you must:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Be at least 13 years old</li>
              <li>
                Provide accurate and complete registration information if
                creating an account
              </li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>
                Not be prohibited from using our services under applicable laws
              </li>
              <li>
                Not have been previously banned or suspended from our platform
                for violating these Terms
              </li>
            </ul>
            <p>
              If you are under 18, we recommend having a parent or guardian
              review these Terms with you.
            </p>
          </CardContent>
        </Card>

        {/* Account Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Account Security
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials
                </li>
                <li>
                  You must notify us immediately of any unauthorized access or
                  security breach
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>We recommend using a strong, unique password</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. Account Information
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>You must provide accurate and truthful information</li>
                <li>
                  You must keep your account information up to date (especially
                  email address)
                </li>
                <li>
                  You may not impersonate another person or use misleading
                  identities
                </li>
                <li>
                  You may not create multiple accounts to circumvent bans or
                  restrictions
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                3. Account Termination
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  You may delete your account at any time through your profile
                  settings
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms
                </li>
                <li>
                  Upon termination, your access to the platform will cease, and
                  your data will be handled according to our Privacy Policy
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              User Content and Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Content Ownership
              </h3>
              <p className="text-muted-foreground">
                You retain full ownership of all content you create and post on
                Rantale, including novels, chapters, comments, and reviews.
                However, by posting content on our platform, you grant us a
                non-exclusive, worldwide, royalty-free license to:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Host, store, and display your content on the platform</li>
                <li>
                  Distribute your content to other users who access it through
                  our services
                </li>
                <li>
                  Create backups and derivatives necessary for platform
                  functionality
                </li>
                <li>
                  Modify formatting for display purposes (without altering
                  actual content)
                </li>
              </ul>
              <Alert className="mt-3">
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Non-Profit Guarantee:</strong> We will never sell,
                  license, or monetize your content. This license exists solely
                  to operate the platform and serve the community.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. Content Guidelines
              </h3>
              <p className="text-muted-foreground">You agree NOT to post:</p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  <strong>Illegal content:</strong> Content that violates any
                  applicable laws or regulations
                </li>
                <li>
                  <strong>Harmful content:</strong> Content that promotes
                  violence, hate speech, harassment, or discrimination
                </li>
                <li>
                  <strong>Explicit content:</strong> Excessively graphic sexual
                  or violent content (mature content warnings should be used
                  appropriately)
                </li>
                <li>
                  <strong>Plagiarized content:</strong> Content that infringes
                  on others' intellectual property rights
                </li>
                <li>
                  <strong>Spam or malicious content:</strong> Unsolicited
                  advertisements, malware, or phishing attempts
                </li>
                <li>
                  <strong>Personal information:</strong> Other people's private
                  information without consent
                </li>
                <li>
                  <strong>Misinformation:</strong> Deliberately false or
                  misleading information intended to deceive
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                3. Author Responsibilities
              </h3>
              <p className="text-muted-foreground">
                If you publish novels on Rantale as an author:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>
                  You must own the rights to the content you publish or have
                  proper authorization
                </li>
                <li>
                  You should use appropriate content warnings for mature themes
                </li>
                <li>
                  You are responsible for the accuracy of genre classifications
                  and descriptions
                </li>
                <li>
                  You agree to engage respectfully with readers and their
                  feedback
                </li>
                <li>
                  You understand that comments and ratings are part of the
                  community experience
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                4. Community Conduct
              </h3>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Treat all community members with respect and courtesy</li>
                <li>
                  Provide constructive criticism rather than personal attacks
                </li>
                <li>
                  Report content that violates these Terms rather than engaging
                  in arguments
                </li>
                <li>
                  Do not manipulate ratings, reviews, or engagement metrics
                </li>
                <li>
                  Do not use the platform for self-promotion outside of your
                  author profile
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Copyright Policy
              </h3>
              <p>
                We respect intellectual property rights and expect our users to
                do the same. If you believe your copyright has been infringed:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Contact us immediately with detailed information about the
                  infringement
                </li>
                <li>Provide proof of ownership or authorization</li>
                <li>We will investigate and take appropriate action</li>
                <li>Repeat infringers will have their accounts terminated</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. Platform Content
              </h3>
              <p>
                The Rantale platform itself, including our logo, design,
                features, and code, is protected by copyright and other
                intellectual property laws. You may not:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Copy, modify, or create derivative works of our platform
                </li>
                <li>Reverse engineer or attempt to extract our source code</li>
                <li>Use our branding without explicit written permission</li>
                <li>
                  Scrape or systematically download content from our platform
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Moderation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              To maintain a safe and welcoming community, we reserve the right
              to:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Review, monitor, and moderate user-generated content at our
                discretion
              </li>
              <li>
                Remove content that violates these Terms or our community
                guidelines
              </li>
              <li>
                Issue warnings, temporary suspensions, or permanent bans for
                violations
              </li>
              <li>
                Take appropriate action against accounts engaged in abusive
                behavior
              </li>
            </ul>
            <p>
              Moderation decisions are made in good faith to protect the
              community. While we strive to be fair and consistent, we reserve
              the right to make final determinations about content and conduct.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                We do not actively monitor all content but rely on community
                reports and automated systems. You play a crucial role in
                keeping Rantale safe by reporting violations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Service Availability and Changes</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Service Availability
              </h3>
              <p>
                While we strive to provide reliable service, as a non-profit
                project:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>We cannot guarantee uninterrupted or error-free service</li>
                <li>
                  Maintenance, updates, or technical issues may cause temporary
                  downtime
                </li>
                <li>
                  We are not liable for any loss of data or access during
                  service interruptions
                </li>
                <li>
                  We recommend keeping backups of important content you create
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. Platform Changes
              </h3>
              <p>We reserve the right to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Modify, update, or discontinue features or services at any
                  time
                </li>
                <li>
                  Update these Terms with reasonable notice to users (major
                  changes will be announced)
                </li>
                <li>Change or remove content formats and specifications</li>
                <li>
                  Implement new features, tools, or restrictions as needed
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. "As-Is" Service
              </h3>
              <p>
                Rantale is provided "as is" and "as available" without
                warranties of any kind, either express or implied. We do not
                warrant that:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>The service will meet your specific requirements</li>
                <li>The service will be uninterrupted or error-free</li>
                <li>
                  All bugs, errors, or defects will be corrected immediately
                </li>
                <li>The service will be secure from unauthorized access</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                2. User Content Disclaimer
              </h3>
              <p>
                We do not endorse, guarantee, or take responsibility for any
                user-generated content. Views expressed by users are their own
                and do not represent our views or opinions.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                3. Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by law, Rantale and its
                operators shall not be liable for:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Any indirect, incidental, special, or consequential damages
                </li>
                <li>
                  Loss of data, profits, goodwill, or other intangible losses
                </li>
                <li>
                  Damages resulting from unauthorized access to your account
                </li>
                <li>Damages resulting from user-generated content</li>
                <li>
                  Damages resulting from service interruptions or technical
                  failures
                </li>
              </ul>
            </div>

            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <strong>Important:</strong> As a non-profit project operated by
                volunteers, our resources are limited. While we do our best to
                provide excellent service, we cannot be held liable for issues
                beyond our reasonable control.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              You agree to indemnify, defend, and hold harmless Rantale, its
              operators, and affiliates from any claims, damages, losses,
              liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Content you post on the platform</li>
              <li>Your use or misuse of the service</li>
            </ul>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              If you have a dispute or concern about the service, we encourage
              you to contact us first to resolve the issue informally. Most
              concerns can be resolved quickly and amicably through direct
              communication.
            </p>
            <p>For formal disputes:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Both parties agree to attempt good faith negotiation for at
                least 30 days
              </li>
              <li>
                Any legal proceedings must be conducted in accordance with
                applicable laws
              </li>
              <li>
                These Terms are governed by the laws of the jurisdiction where
                our primary operators are located
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">By You</h3>
              <p>
                You may terminate your account at any time by deleting it
                through your profile settings. Your content may remain visible
                to other users unless you delete it before account termination.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">By Us</h3>
              <p>We may suspend or terminate your access to Rantale if you:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Violate these Terms or our community guidelines</li>
                <li>Engage in illegal activities</li>
                <li>
                  Repeatedly receive moderation actions for policy violations
                </li>
                <li>Pose a security risk to the platform or other users</li>
                <li>
                  Attempt to circumvent bans or restrictions through alternate
                  accounts
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">Effect</h3>
              <p>Upon termination:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Your right to access and use the platform will cease</li>
                <li>
                  Your data will be handled according to our Privacy Policy
                </li>
                <li>
                  Provisions that should survive termination (including
                  disclaimers and limitations) will remain in effect
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Miscellaneous */}
        <Card>
          <CardHeader>
            <CardTitle>General Provisions</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">
                1. Entire Agreement
              </h3>
              <p>
                These Terms, along with our Privacy Policy, constitute the
                entire agreement between you and Rantale regarding the use of
                our service.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">2. Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable,
                the remaining provisions will remain in full effect.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">3. No Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms
                will not be considered a waiver of those rights.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-foreground font-semibold">4. Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our consent.
                We may assign our rights and obligations without restriction.
              </p>
            </div>
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
              If you have questions, concerns, or feedback about these Terms of
              Service, please contact us:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Via Contact Page:</strong> Visit our{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact page
                </a>{" "}
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
              We typically respond to inquiries within 5-7 business days.
            </p>
          </CardContent>
        </Card>

        {/* Final Note */}
        <div className="border-primary/20 bg-muted/50 rounded-lg border-2 border-dashed p-6 text-center">
          <Users className="text-primary mx-auto mb-3 h-8 w-8" />
          <h3 className="mb-2 text-lg font-semibold">
            Building a Community Together
          </h3>
          <p className="text-muted-foreground">
            These Terms exist to protect our community and ensure everyone can
            enjoy Rantale. As a non-profit platform built by and for literature
            lovers, we believe in transparency, respect, and collaboration.
            Thank you for being part of our journey!
          </p>
        </div>
      </div>
    </div>
  );
}
