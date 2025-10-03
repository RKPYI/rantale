import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to RANOVEL
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Discover and read amazing novels. Sign in to access your library and start your reading journey.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
