import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { HomeContent } from "./home-content";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <HomeContent />
      <Footer />
    </div>
  );
}
