import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, UserCheck, AlertTriangle, Loader2, Zap, GitPullRequest, Ticket, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JidokaRouted {
  finding: {
    originalFinding: string;
    businessImpact: string;
    incidentProbability: number;
    fixSuggestion: string;
    fixProbability: number;
    estimatedEffort: string;
    automatable: boolean;
  };
  confidence: number;
  decision: "auto_fix" | "supervised" | "human_required";
  reasoning: string;
  ciAction: string;
}

interface JidokaResult {
  repo: string;
  riskLevel: string;
  routedFindings: JidokaRouted[];
  stats: { auto_fix: number; supervised: number; human_required: number };
  summary: {
    totalFindings: number;
    automationRate: number;
    estimatedTimeSavedHours: number;
    autoFixCount: number;
    supervisedCount: number;
    humanRequiredCount: number;
  };
  pipeline: { step: number; name: string; status: string; detail: string }[];
}

const decisionConfig = {
  auto_fix: {
    icon: Bot,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    label: "Auto-Fix",
    badge: "Fully Automated",
  },
  supervised: {
    icon: GitPullRequest,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    label: "Supervised",
    badge: "PR Review Required",
  },
  human_required: {
    icon: UserCheck,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    label: "Human Required",
    badge: "Manual Resolution",
  },
};

interface JidokaDemoProps {
  analysisResult: any | null;
  scanResult: any | null;
  onRoutingComplete?: (result: JidokaResult) => void;
}

const JidokaDemo = ({ analysisResult, scanResult, onRoutingComplete }: JidokaDemoProps) => {
  const [routing, setRouting] = useState(false);
  const [result, setResult] = useState<JidokaResult | null>(null);
  const { toast } = useToast();

  const handleRoute = async () => {
    if (!analysisResult) return;
    setRouting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("jidoka-route", {
        body: { analysis: analysisResult, scanResult },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as JidokaResult);
      onRoutingComplete?.(data as JidokaResult);
    } catch (e: any) {
      console.error("Jidoka error:", e);
      toast({ title: "Jidoka Routing Failed", description: e.message, variant: "destructive" });
    } finally {
      setRouting(false);
    }
  };

  // No analysis yet – show waiting state
  if (!analysisResult) {
    return (
      <section id="jidoka-demo" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-purple-400/30 bg-purple-400/5">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-purple-400">Layer 3 · Jidoka</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Jidoka <span className="text-gradient-primary">Decision Engine</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Run Layer 1 Assessment and Layer 2 Intelligence first — then Jidoka will route each finding through confidence-based automation decisions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="jidoka-demo" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-purple-400/30 bg-purple-400/5">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-purple-400">Layer 3 · Jidoka</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Jidoka <span className="text-gradient-primary">Decision Engine</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Confidence-based routing: each finding is scored and directed to full automation, supervised PR, or human review.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {!result && !routing && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Layer 2 analysis complete. Ready to route findings through Jidoka decision engine.
              </p>
              <Button onClick={handleRoute} size="lg" className="gap-2">
                <Shield className="w-4 h-4" />
                Run Jidoka Routing
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {routing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="font-display text-sm text-muted-foreground animate-pulse">
                  Running Jidoka confidence routing…
                </p>
                <p className="font-display text-[10px] text-muted-foreground/60 mt-2">
                  Computing confidence scores · Routing decisions · Generating CI/CD actions
                </p>
              </motion.div>
            )}

            {result && !routing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Pipeline status */}
                <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                  {result.pipeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-display uppercase tracking-wider ${
                        step.status === "complete"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          : "border-border bg-card text-muted-foreground"
                      }`}>
                        {step.status === "complete" && <CheckCircle className="w-3 h-3" />}
                        {step.name}
                      </div>
                      {i < result.pipeline.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{result.summary.totalFindings}</div>
                    <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Total Findings</div>
                  </div>
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-center">
                    <div className="font-display text-2xl font-bold text-emerald-400">{result.summary.automationRate}%</div>
                    <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Automation Rate</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{result.summary.estimatedTimeSavedHours}h</div>
                    <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Time Saved</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <span className="text-emerald-400 font-display font-bold">{result.stats.auto_fix}</span>
                      <span className="text-amber-400 font-display font-bold">{result.stats.supervised}</span>
                      <span className="text-red-400 font-display font-bold">{result.stats.human_required}</span>
                    </div>
                    <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Auto / PR / Human</div>
                  </div>
                </div>

                {/* Routed findings */}
                <div className="space-y-4">
                  {result.routedFindings.map((r, i) => {
                    const cfg = decisionConfig[r.decision];
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div>
                              <span className={`font-display text-xs font-bold ${cfg.color}`}>{cfg.badge}</span>
                              <p className="text-xs text-foreground/80 mt-0.5">{r.finding.originalFinding}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`font-display text-xl font-bold ${cfg.color}`}>{r.confidence}%</div>
                            <div className="text-[10px] font-display text-muted-foreground">Confidence</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <Progress value={r.confidence} className="h-2" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="rounded-md bg-background/50 p-3">
                            <div className="flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                              <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">Reasoning</span>
                            </div>
                            <p className="text-xs text-foreground/70">{r.reasoning}</p>
                          </div>
                          <div className="rounded-md bg-background/50 p-3">
                            <div className="flex items-center gap-1 mb-1">
                              <Zap className="w-3 h-3 text-purple-400" />
                              <span className="font-display text-[10px] uppercase tracking-wider text-purple-400">CI/CD Action</span>
                            </div>
                            <p className="text-xs text-foreground/70">{r.ciAction}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Forward to Layer 4 */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
                  <p className="font-display text-xs text-muted-foreground">
                    Jidoka routing complete → decisions forwarded to <span className="text-primary">Layer 4 (Governance)</span> for DORA metrics tracking
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default JidokaDemo;
