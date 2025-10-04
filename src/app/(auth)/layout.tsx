import { Footer } from "@/components/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}