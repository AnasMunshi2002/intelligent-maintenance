import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Start Maintaining <span className="text-gradient-primary">Intelligently</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            The AIM-Framework provides the reference architecture your team needs to converge AI and DevOps for smarter software maintenance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="heroOutline" size="lg" className="gap-2">
              <Github className="w-4 h-4" /> View on GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
