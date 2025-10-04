import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, Book, User, Settings, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqItems = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign up' button in the top right corner of any page. You can register with your email or use Google authentication for quick access."
    },
    {
      question: "How do I search for novels?",
      answer: "Use the search bar in the navigation to find novels by title, author, or keywords. You can also browse by genre or check our top-rated section for popular recommendations."
    },
    {
      question: "Can I read novels offline?",
      answer: "Currently, novels need to be read online through our platform. We're working on offline reading features for the future."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "You can report content by using the report button on any novel or chapter page. Our moderation team reviews all reports promptly."
    },
    {
      question: "Can I submit my own novels?",
      answer: "Yes! We welcome original content from authors. Please contact our support team for information about our submission process and guidelines."
    },
    {
      question: "How does the rating system work?",
      answer: "Readers can rate novels from 1 to 5 stars. The overall rating is calculated from all user ratings to help others discover great content."
    }
  ];

  const helpCategories = [
    {
      icon: User,
      title: "Account & Profile",
      description: "Manage your account settings and profile",
      link: "/help/account"
    },
    {
      icon: Book,
      title: "Reading & Novels",
      description: "Learn about reading features and novel discovery",
      link: "/help/reading"
    },
    {
      icon: Settings,
      title: "Settings & Preferences",
      description: "Customize your reading experience",
      link: "/help/settings"
    },
    {
      icon: MessageCircle,
      title: "Community Guidelines",
      description: "Rules and guidelines for our community",
      link: "/help/guidelines"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.title} href={category.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">
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
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
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
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link href="/contact">
              <Button>
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}