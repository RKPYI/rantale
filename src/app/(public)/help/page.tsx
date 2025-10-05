import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Search,
  Book,
  User,
  Settings,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqItems = [
    {
      question: "How do I create an account?",
      answer:
        "You can create an account by clicking the 'Sign up' button in the top right corner of any page. You can register with your email or use Google authentication for quick access.",
    },
    {
      question: "How do I search for novels?",
      answer:
        "Use the search bar in the navigation to find novels by title, author, or keywords. You can also browse by genre or check our top-rated section for popular recommendations.",
    },
    {
      question: "Can I read novels offline?",
      answer:
        "Currently, novels need to be read online through our platform. We're working on offline reading features for the future.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "You can report content by using the report button on any novel or chapter page. Our moderation team reviews all reports promptly.",
    },
    {
      question: "Can I submit my own novels?",
      answer:
        "Yes! We welcome original content from authors. Please contact our support team for information about our submission process and guidelines.",
    },
    {
      question: "How does the rating system work?",
      answer:
        "Readers can rate novels from 1 to 5 stars. The overall rating is calculated from all user ratings to help others discover great content.",
    },
  ];

  const helpCategories = [
    {
      icon: User,
      title: "Account & Profile",
      description: "Manage your account settings and profile",
      link: "/help/account",
    },
    {
      icon: Book,
      title: "Reading & Novels",
      description: "Learn about reading features and novel discovery",
      link: "/help/reading",
    },
    {
      icon: Settings,
      title: "Settings & Preferences",
      description: "Customize your reading experience",
      link: "/help/settings",
    },
    {
      icon: MessageCircle,
      title: "Community Guidelines",
      description: "Rules and guidelines for our community",
      link: "/help/guidelines",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold">
            <HelpCircle className="h-8 w-8" />
            Help Center
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get help with RanoVel
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Categories */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.title} href={category.link}>
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Icon className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold">{category.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-xl font-semibold">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help.
            </p>
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
