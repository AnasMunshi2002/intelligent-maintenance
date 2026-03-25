import { motion } from "framer-motion";
import { Shield, Cpu, GitBranch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-display text-xs text-primary tracking-wider uppercase">AI-Powered DevSecOps</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-foreground">Intelligent</span>
            <br />
            <span className="text-gradient-primary">Software Maintenance</span>
          </h1>

          <p className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AIM-Framework integrates AI-driven refactoring with DevSecOps automation. 
            Reduce technical debt by <span className="text-primary font-semibold">40%</span>, 
            deploy <span className="text-accent font-semibold">3x faster</span>, 
            and maintain with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              Explore Framework <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="heroOutline" size="lg">
              View Architecture
            </Button>
          </div>
        </motion.div>

        {/* Floating icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 flex justify-center gap-16 md:gap-24"
        >
          {[
            { icon: Shield, label: "DevSecOps" },
            { icon: Cpu, label: "AI Engine" },
            { icon: GitBranch, label: "CI/CD" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 animate-float"
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <div className="p-3 rounded-xl border border-border bg-card">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-xs text-muted-foreground tracking-wider uppercase">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
