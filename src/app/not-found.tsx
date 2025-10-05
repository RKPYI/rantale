import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-muted-foreground text-8xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
