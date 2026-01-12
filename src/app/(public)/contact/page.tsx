"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useContact } from "@/hooks/use-contact";
import { ContactRequest } from "@/types/api";

export default function ContactPage() {
  const { submitContact, loading, error, validationErrors, success, reset } =
    useContact();
  const [formData, setFormData] = useState<ContactRequest>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error || success) reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitContact(formData);
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      // Error is handled by the hook
      console.error("Contact form submission error:", err);
    }
  };

  // Helper to get field-specific error
  const getFieldError = (fieldName: string): string | null => {
    return validationErrors[fieldName]?.[0] || null;
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground">
            We&apos;d love to hear from you. Send us a message and we&apos;ll
            respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send us a message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      Message sent successfully! We&apos;ll get back to you
                      soon.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={getFieldError("name") ? "border-red-500" : ""}
                    />
                    {getFieldError("name") && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {getFieldError("name")}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={getFieldError("email") ? "border-red-500" : ""}
                    />
                    {getFieldError("email") && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={getFieldError("subject") ? "border-red-500" : ""}
                  />
                  {getFieldError("subject") && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {getFieldError("subject")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more details..."
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={getFieldError("message") ? "border-red-500" : ""}
                  />
                  {getFieldError("message") && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {getFieldError("message")}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Mail className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Email</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Send us an email anytime!
                </p>
                <p className="font-medium">support@rantale.randk.me</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Phone className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Phone</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Mon-Fri from 8am to 5pm.
                </p>
                <p className="font-medium">+1 (555) 000-0000</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <MapPin className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Office</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Come say hello at our office HQ.
                </p>
                <p className="font-medium">
                  123 Novel Street
                  <br />
                  Reading City, RC 12345
                  <br />
                  United States
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
