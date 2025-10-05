import { Footer } from "@/components/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
