import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20 pb-24">{children}</main>
      <Footer />
    </>
  );
}
