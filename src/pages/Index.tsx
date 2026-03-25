import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MetricsSection />
      <ArchitectureSection />
      <CaseStudiesSection />
      <CTASection />
      
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="font-display text-xs text-muted-foreground tracking-wider">
            IntelliOps — AI-Driven Intelligent Maintenance © 2026
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            University of West London · Mohammad Anas Abdulhameed Munshi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
