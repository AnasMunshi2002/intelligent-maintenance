import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import AssessmentDemo from "@/components/AssessmentDemo";
import AssessmentDashboard from "@/components/AssessmentDashboard";
import IntelligenceLayer from "@/components/IntelligenceLayer";
import JidokaDemo from "@/components/JidokaDemo";
import ClientDecisionPanel from "@/components/ClientDecisionPanel";
import GovernanceDashboard from "@/components/GovernanceDashboard";
import CTASection from "@/components/CTASection";

const Index = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [jidokaResult, setJidokaResult] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MetricsSection />
      <ArchitectureSection />
      <AssessmentDemo onScanComplete={setScanResult} />
      <IntelligenceLayer scanResult={scanResult} onAnalysisComplete={setAnalysisResult} />
      <JidokaDemo analysisResult={analysisResult} scanResult={scanResult} onRoutingComplete={setJidokaResult} />
      <ClientDecisionPanel jidokaResult={jidokaResult} />
      <AssessmentDashboard />
      <GovernanceDashboard />
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
