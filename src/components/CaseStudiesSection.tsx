import { motion } from "framer-motion";

const cases = [
  {
    name: "Adobe",
    focus: "AI-Driven DevOps",
    outcome: "20% retrieval accuracy increase",
    detail: "Built AI-powered internal support using Amazon Bedrock, reducing developer toil and accelerating legacy modernisation.",
    tag: "Enterprise AI",
    url: "https://aws.amazon.com/blogs/machine-learning/adobe-enhances-developer-productivity-using-amazon-bedrock-knowledge-bases/",
  },
  {
    name: "Spotify",
    focus: "Microservices at Scale",
    outcome: "68% more deployments",
    detail: "Migrated to containerised microservices with Kubernetes auto-scaling and zero-downtime rolling deployments.",
    tag: "Cloud Native",
    url: "https://hackernoon.com/why-spotify-migrated-from-its-homegrown-orchestration-tool-helios-to-kubernetes",
  },
  {
    name: "GitHub",
    focus: "AI-Powered Refactoring",
    outcome: "3× faster vulnerability fixes",
    detail: "Copilot Autofix combines CodeQL + GPT-4o to detect and suggest fixes for security vulnerabilities inline.",
    tag: "AI Security",
    url: "https://github.blog/news-insights/product-news/secure-code-more-than-three-times-faster-with-copilot-autofix/",
  },
  {
    name: "Capital One",
    focus: "DevSecOps Pipeline",
    outcome: "2 weeks → <24 hours",
    detail: "Automated vulnerability scanning cut security certification time by 93% with 95% assessment coverage.",
    tag: "Regulated Industry",
    url: "https://blog.qualys.com/qualys-insights/2018/12/04/capital-one-building-security-into-devops",
  },
  {
    name: "Netflix",
    focus: "Resilience Engineering",
    outcome: "99.99% availability",
    detail: "4-year AWS migration with stateless design, circuit breakers, and chaos engineering for fault tolerance.",
    tag: "Cloud Migration",
    url: "https://aws.amazon.com/solutions/case-studies/netflix-reinvent-2022-evolution-of-chaos-engineering/",
  },
];

const CaseStudiesSection = () => {
  return (
    <section id="case-studies" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Industry <span className="text-gradient-primary">Validation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            IntelliOps is informed by transformation journeys at five industry-leading organisations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-xl border border-border bg-card p-6 hover:bg-surface-elevated transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg font-bold text-foreground">{c.name}</span>
                <span className="font-display text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {c.tag}
                </span>
              </div>
              <div className="font-display text-sm text-accent mb-2">{c.focus}</div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.detail}</p>
              <div className="border-t border-border pt-3">
                <span className="font-display text-xs text-muted-foreground uppercase tracking-wider">Key Outcome</span>
                <div className="font-display text-primary font-semibold mt-1">{c.outcome}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
