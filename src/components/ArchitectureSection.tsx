import { motion } from "framer-motion";
import { Search, Brain, Cog, Users, BarChart3, ChevronRight } from "lucide-react";
import { useState } from "react";

const layers = [
  {
    id: 1,
    name: "Assessment",
    icon: Search,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    description: "Establish baseline measurements of system health through static/dynamic analysis, security scanning, and architecture evaluation.",
    tools: ["SonarQube", "DeepCode", "CodeQL", "OWASP ZAP"],
    output: "System health report with prioritised issues",
  },
  {
    id: 2,
    name: "Intelligence",
    icon: Brain,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    description: "Apply AI/ML models to analyse data, predict issues, and generate recommendations with confidence scores.",
    tools: ["ML Classification", "Neural Networks", "Ensemble Methods", "RL Agents"],
    output: "Scored recommendations with false positive filtering",
  },
  {
    id: 3,
    name: "Automation",
    icon: Cog,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    description: "Execute automated actions integrated into CI/CD pipelines: refactoring, security enforcement, dependency management.",
    tools: ["GitHub Actions", "Terraform", "OPA", "Dependabot"],
    output: "Automated remediation and deployment",
  },
  {
    id: 4,
    name: "Orchestration (Jidoka)",
    icon: Users,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/30",
    description: "Balance automation with human oversight using confidence thresholds. <70% = human required, 70-90% = review, >90% = fully automated.",
    tools: ["Confidence Engine", "Escalation Manager", "Audit Trail"],
    output: "Right-sized human intervention",
  },
  {
    id: 5,
    name: "Governance",
    icon: BarChart3,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
    description: "Track KPIs through dashboards: technical debt trends, deployment velocity, security posture, and ROI metrics.",
    tools: ["DORA Metrics", "Grafana", "Custom Dashboards"],
    output: "Continuous improvement feedback loop",
  },
];

const ArchitectureSection = () => {
  const [activeLayer, setActiveLayer] = useState(0);
  const active = layers[activeLayer];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Five-Layer <span className="text-gradient-primary">Architecture</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The AIM-Framework's modular design ensures each concern is addressed by a dedicated, interoperable layer.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Layer selector */}
          <div className="space-y-2">
            {layers.map((layer, i) => (
              <motion.button
                key={layer.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveLayer(i)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 text-left ${
                  activeLayer === i
                    ? `${layer.borderColor} ${layer.bgColor}`
                    : "border-border bg-card hover:bg-surface-elevated"
                }`}
              >
                <div className={`p-2 rounded-md ${layer.bgColor}`}>
                  <layer.icon className={`w-4 h-4 ${layer.color}`} />
                </div>
                <div className="flex-1">
                  <span className={`font-display text-sm font-semibold ${activeLayer === i ? layer.color : "text-foreground"}`}>
                    Layer {layer.id}
                  </span>
                  <div className="text-xs text-muted-foreground">{layer.name}</div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeLayer === i ? "rotate-90 " + layer.color : "text-muted-foreground"}`} />
              </motion.button>
            ))}
          </div>

          {/* Layer detail */}
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl border ${active.borderColor} ${active.bgColor} p-8`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${active.bgColor}`}>
                <active.icon className={`w-6 h-6 ${active.color}`} />
              </div>
              <div>
                <h3 className={`font-display text-xl font-bold ${active.color}`}>
                  Layer {active.id}: {active.name}
                </h3>
              </div>
            </div>

            <p className="text-foreground/80 mb-6 leading-relaxed">{active.description}</p>

            <div className="mb-6">
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Key Tools & Components</span>
              <div className="flex flex-wrap gap-2">
                {active.tools.map((tool) => (
                  <span key={tool} className={`px-3 py-1 rounded-md border ${active.borderColor} ${active.bgColor} font-display text-xs ${active.color}`}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground block mb-1">Output</span>
              <span className="text-sm text-foreground/70">{active.output}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
