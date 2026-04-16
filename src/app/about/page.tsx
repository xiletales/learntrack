import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { AboutContent } from "./about-content";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <AboutContent />
      <Footer />
    </div>
  );
}
