import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle, Loader2, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrioritizedFinding {
  originalFinding: string;
  businessImpact: "critical" | "high" | "medium" | "low";
  incidentProbability: number;
  fixSuggestion: string;
  fixProbability: number;
  estimatedEffort: string;
  automatable: boolean;
}

interface ActionItem {
  priority: number;
  action: string;
  rationale: string;
}

interface AnalysisResult {
  riskLevel: "critical" | "high" | "medium" | "low";
  summary: string;
  prioritizedFindings: PrioritizedFinding[];
  patterns: string[];
  actionPlan: ActionItem[];
}

const riskConfig = {
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "CRITICAL RISK" },
  high: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", label: "HIGH RISK" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "MEDIUM RISK" },
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "LOW RISK" },
};

const impactColors = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

interface IntelligenceLayerProps {
  scanResult: any | null;
}

const IntelligenceLayer = ({ scanResult }: IntelligenceLayerProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!scanResult) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-findings", {
        body: { scanResult },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis as AnalysisResult);
    } catch (e: any) {
      console.error("Analysis error:", e);
      toast({
        title: "Analysis Failed",
        description: e.message || "Could not analyze findings",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!scanResult) {
    return (
      <section id="intelligence-layer" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/5">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-cyan-400">Layer 2 · Intelligence</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            AI-Powered <span className="text-gradient-primary">Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Run a Layer 1 Assessment above first — then Layer 2 will analyse the findings using AI to predict incidents, suggest fixes, and generate an action plan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="intelligence-layer" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/5">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-cyan-400">Layer 2 · Intelligence</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            AI-Powered <span className="text-gradient-primary">Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI analyses Layer 1 findings to predict production incidents, prioritise by business impact, and generate fix recommendations with confidence scores.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {!analysis && !analyzing && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Layer 1 scan of <span className="text-primary font-semibold">{scanResult.repo}</span> found{" "}
                <span className="text-foreground font-semibold">{scanResult.totalIssues} issues</span>. Ready for AI analysis.
              </p>
              <Button onClick={handleAnalyze} size="lg" className="gap-2">
                <Brain className="w-4 h-4" />
                Run AI Intelligence Analysis
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="font-display text-sm text-muted-foreground animate-pulse">
                  AI analysing {scanResult.totalIssues} findings…
                </p>
                <p className="font-display text-[10px] text-muted-foreground/60 mt-2">
                  Predicting incident probabilities · Generating fix suggestions · Building action plan
                </p>
              </motion.div>
            )}

            {analysis && !analyzing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Risk level + summary */}
                <div className={`rounded-xl border ${riskConfig[analysis.riskLevel].border} ${riskConfig[analysis.riskLevel].bg} p-6 mb-8`}>
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className={`w-5 h-5 ${riskConfig[analysis.riskLevel].color}`} />
                    <span className={`font-display text-sm font-bold uppercase tracking-wider ${riskConfig[analysis.riskLevel].color}`}>
                      {riskConfig[analysis.riskLevel].label}
                    </span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Prioritized findings */}
                {analysis.prioritizedFindings.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 mb-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" /> Prioritised Findings with Fix Predictions
                    </h3>
                    <div className="space-y-4">
                      {analysis.prioritizedFindings.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-lg border border-border bg-background p-4"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-display text-[9px] font-bold uppercase tracking-wider ${impactColors[f.businessImpact]}`}>
                                  {f.businessImpact} impact
                                </span>
                                {f.automatable && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-display bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                                    <Zap className="w-2 h-2" /> Auto-fixable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground/80">{f.originalFinding}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-display text-xs text-muted-foreground">Effort</div>
                              <div className="font-display text-sm font-bold text-foreground">{f.estimatedEffort}</div>
                            </div>
                          </div>

                          {/* Probabilities */}
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                                <span>Incident Probability</span>
                                <span className={f.incidentProbability >= 70 ? "text-red-400" : f.incidentProbability >= 40 ? "text-amber-400" : "text-emerald-400"}>
                                  {f.incidentProbability}%
                                </span>
                              </div>
                              <Progress value={f.incidentProbability} className="h-1.5" />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                                <span>Fix Probability</span>
                                <span className={f.fixProbability >= 70 ? "text-emerald-400" : f.fixProbability >= 40 ? "text-amber-400" : "text-red-400"}>
                                  {f.fixProbability}%
                                </span>
                              </div>
                              <Progress value={f.fixProbability} className="h-1.5" />
                            </div>
                          </div>

                          {/* Fix suggestion */}
                          <div className="rounded-md bg-muted/30 p-2.5">
                            <div className="flex items-center gap-1 mb-1">
                              <CheckCircle className="w-3 h-3 text-cyan-400" />
                              <span className="font-display text-[10px] uppercase tracking-wider text-cyan-400">Suggested Fix</span>
                            </div>
                            <p className="text-xs text-foreground/70">{f.fixSuggestion}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns */}
                {analysis.patterns.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 mb-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" /> Detected Patterns
                    </h3>
                    <ul className="space-y-2">
                      {analysis.patterns.map((p, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-xs text-foreground/80"
                        >
                          <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                          {p}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action plan */}
                {analysis.actionPlan.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" /> Recommended Action Plan
                    </h3>
                    <div className="space-y-3">
                      {analysis.actionPlan.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
                            <span className="font-display text-[10px] font-bold text-cyan-400">{item.priority}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{item.action}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{item.rationale}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pipeline forward */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
                  <p className="font-display text-xs text-muted-foreground">
                    Intelligence complete → recommendations forwarded to <span className="text-purple-400">Layer 3 (Automation)</span> for CI/CD integration
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

export default IntelligenceLayer;
