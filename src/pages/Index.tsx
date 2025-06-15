
import { ForBrands } from "@/components/landing/ForBrands";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedTasks } from "@/components/landing/FeaturedTasks";
import { Testimonials } from "@/components/landing/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen bg-yeild-black text-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedTasks />
        <Testimonials />
        <ForBrands />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
