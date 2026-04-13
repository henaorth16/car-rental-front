import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhyChooseUsSection } from "@/components/landing/WhyChooseUsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowitWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

const Index = () => {
  return (
    <div className="min-h-screen"> 
      <HeroSection />
      <FeaturesSection />
      <WhyChooseUsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </div>
  );
};

export default Index;
