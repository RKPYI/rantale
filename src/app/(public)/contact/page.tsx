import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
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
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What's this about?" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more details..."
                    rows={6}
                  />
                </div>
                <Button className="w-full">Send Message</Button>
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
                <p className="font-medium">support@ranovel.com</p>
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
