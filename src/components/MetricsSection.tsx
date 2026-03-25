import { motion } from "framer-motion";
import { TrendingDown, Zap, ShieldCheck, Eye } from "lucide-react";

const metrics = [
  { value: "36.9%", label: "Technical Debt Reduction", icon: TrendingDown, detail: "Mean across 6 repositories" },
  { value: "2.8×", label: "Faster Refactoring", icon: Zap, detail: "vs manual approaches" },
  { value: "35.7%", label: "False Positive Filtering", icon: Eye, detail: "Jidoka-managed detection" },
  { value: "85%", label: "Deployment Frequency ↑", icon: ShieldCheck, detail: "Cross-case mean improvement" },
];

const MetricsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Proven <span className="text-gradient-primary">Results</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Validated through tool experiments on open-source repositories and case studies from industry leaders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-gradient rounded-xl p-6 bg-card text-center group hover:bg-surface-elevated transition-colors duration-300"
            >
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-display text-3xl font-bold text-foreground mb-1">{m.value}</div>
              <div className="font-display text-sm text-primary tracking-wide mb-2">{m.label}</div>
              <div className="text-xs text-muted-foreground">{m.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
