import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, UserCheck, GitPullRequest, BookOpen, Wrench, CheckCircle2,
  ChevronDown, ChevronUp, Zap, Shield, AlertTriangle, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoutedFinding {
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
  routedFindings: RoutedFinding[];
  stats: { auto_fix: number; supervised: number; human_required: number };
  summary: {
    totalFindings: number;
    automationRate: number;
    estimatedTimeSavedHours: number;
  };
}

type ClientChoice = "ai_auto" | "guided" | "manual" | null;

const choiceConfig = {
  ai_auto: {
    icon: Bot,
    label: "AI Auto-Fix",
    description: "Let AI generate and apply the fix automatically via CI/CD pipeline",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    action: "AI will generate a patch, run tests, and deploy automatically.",
  },
  guided: {
    icon: BookOpen,
    label: "Guided Fix",
    description: "Get step-by-step recommendations — you implement the changes",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    action: "You'll receive detailed guidance with code snippets and best practices.",
  },
  manual: {
    icon: Wrench,
    label: "Manual Resolution",
    description: "Mark for manual resolution — your team handles it from here",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    action: "Issue ticket created and assigned to your team for manual resolution.",
  },
};

const decisionIcon = {
  auto_fix: Bot,
  supervised: GitPullRequest,
  human_required: UserCheck,
};

const decisionColor = {
  auto_fix: "text-emerald-400",
  supervised: "text-amber-400",
  human_required: "text-red-400",
};

export interface ClientDecisions {
  summary: { ai_auto: number; guided: number; manual: number };
  totalFindings: number;
  automationRate: number;
  estimatedTimeSavedHours: number;
  decisions: Record<number, ClientChoice>;
}

interface ClientDecisionPanelProps {
  jidokaResult: JidokaResult | null;
  onDecisionsComplete?: (decisions: ClientDecisions) => void;
}

const ClientDecisionPanel = ({ jidokaResult, onDecisionsComplete }: ClientDecisionPanelProps) => {
  const [decisions, setDecisions] = useState<Record<number, ClientChoice>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!jidokaResult) {
    return (
      <section id="client-decisions" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-orange-400/30 bg-orange-400/5">
            <ClipboardList className="w-3 h-3 text-orange-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-orange-400">Layer 4 · Client Decisions</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Client <span className="text-gradient-primary">Decision Panel</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete Layers 1–3 first — then review each finding and decide how much automation you want.
          </p>
        </div>
      </section>
    );
  }

  const allDecided = jidokaResult.routedFindings.every((_, i) => decisions[i] != null);
  const decidedCount = Object.values(decisions).filter(Boolean).length;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const summary = {
    ai_auto: Object.values(decisions).filter((d) => d === "ai_auto").length,
    guided: Object.values(decisions).filter((d) => d === "guided").length,
    manual: Object.values(decisions).filter((d) => d === "manual").length,
  };

  return (
    <section id="client-decisions" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-orange-400/30 bg-orange-400/5">
            <ClipboardList className="w-3 h-3 text-orange-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-orange-400">Layer 4 · Client Decisions</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Client <span className="text-gradient-primary">Decision Panel</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You're in control. For each finding, choose how much AI automation you want — from fully automated fixes to manual resolution.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="decision-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6 px-1">
                  <span className="font-display text-sm text-muted-foreground">
                    {decidedCount} of {jidokaResult.routedFindings.length} findings reviewed
                  </span>
                  <div className="flex gap-1.5">
                    {jidokaResult.routedFindings.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          decisions[i] ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Finding cards */}
                <div className="space-y-4">
                  {jidokaResult.routedFindings.map((r, i) => {
                    const isExpanded = expandedIndex === i;
                    const chosen = decisions[i];
                    const DecisionIcon = decisionIcon[r.decision];

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`rounded-xl border ${
                          chosen ? choiceConfig[chosen].border : "border-border"
                        } ${chosen ? choiceConfig[chosen].bg : "bg-card"} overflow-hidden transition-all`}
                      >
                        {/* Header — always visible */}
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : i)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg bg-muted/30`}>
                              <DecisionIcon className={`w-4 h-4 ${decisionColor[r.decision]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`font-display text-[10px] font-bold uppercase tracking-wider ${decisionColor[r.decision]}`}>
                                  {r.confidence}% confidence · {r.decision.replace("_", " ")}
                                </span>
                                {chosen && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-display ${choiceConfig[chosen].bg} ${choiceConfig[chosen].color} border ${choiceConfig[chosen].border}`}>
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {choiceConfig[chosen].label}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/80 truncate">{r.finding.originalFinding}</p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-4">
                                {/* Context */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                  <div className="rounded-lg bg-background/50 p-2.5">
                                    <div className="font-display text-xs font-bold text-foreground">{r.finding.businessImpact}</div>
                                    <div className="text-[9px] font-display text-muted-foreground uppercase">Impact</div>
                                  </div>
                                  <div className="rounded-lg bg-background/50 p-2.5">
                                    <div className="font-display text-xs font-bold text-foreground">{r.finding.incidentProbability}%</div>
                                    <div className="text-[9px] font-display text-muted-foreground uppercase">Incident Risk</div>
                                  </div>
                                  <div className="rounded-lg bg-background/50 p-2.5">
                                    <div className="font-display text-xs font-bold text-foreground">{r.finding.fixProbability}%</div>
                                    <div className="text-[9px] font-display text-muted-foreground uppercase">Fix Success</div>
                                  </div>
                                  <div className="rounded-lg bg-background/50 p-2.5">
                                    <div className="font-display text-xs font-bold text-foreground">{r.finding.estimatedEffort}</div>
                                    <div className="text-[9px] font-display text-muted-foreground uppercase">Effort</div>
                                  </div>
                                </div>

                                {/* AI suggestion */}
                                <div className="rounded-lg bg-background/50 p-3">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Zap className="w-3 h-3 text-cyan-400" />
                                    <span className="font-display text-[10px] uppercase tracking-wider text-cyan-400">AI Suggested Fix</span>
                                  </div>
                                  <p className="text-xs text-foreground/70">{r.finding.fixSuggestion}</p>
                                </div>

                                {/* Client choice buttons */}
                                <div>
                                  <p className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                                    Choose your approach:
                                  </p>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    {(Object.entries(choiceConfig) as [ClientChoice & string, typeof choiceConfig.ai_auto][]).map(
                                      ([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        const isSelected = chosen === key;
                                        return (
                                          <button
                                            key={key}
                                            onClick={() =>
                                              setDecisions((prev) => ({
                                                ...prev,
                                                [i]: isSelected ? null : key as ClientChoice,
                                              }))
                                            }
                                            className={`rounded-lg border p-4 text-left transition-all hover:scale-[1.02] ${
                                              isSelected
                                                ? `${cfg.border} ${cfg.bg}`
                                                : "border-border bg-background hover:border-muted-foreground/30"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 mb-2">
                                              <Icon className={`w-4 h-4 ${isSelected ? cfg.color : "text-muted-foreground"}`} />
                                              <span className={`font-display text-xs font-bold ${isSelected ? cfg.color : "text-foreground"}`}>
                                                {cfg.label}
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                              {cfg.description}
                                            </p>
                                          </button>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: allDecided ? 1 : 0.5 }}
                  className="mt-8 text-center"
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!allDecided}
                    size="lg"
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Confirm Decisions ({decidedCount}/{jidokaResult.routedFindings.length})
                  </Button>
                  {!allDecided && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Review and decide on all findings to proceed
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Confirmed summary */}
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-8 text-center mb-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Decisions Confirmed</h3>
                  <p className="text-sm text-muted-foreground">
                    Your team's execution plan for <span className="text-foreground font-semibold">{jidokaResult.repo}</span> has been finalized.
                  </p>
                </div>

                {/* Summary cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {(Object.entries(choiceConfig) as [ClientChoice & string, typeof choiceConfig.ai_auto][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const count = summary[key as keyof typeof summary];
                    return (
                      <div key={key} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-6 text-center`}>
                        <Icon className={`w-6 h-6 ${cfg.color} mx-auto mb-2`} />
                        <div className={`font-display text-3xl font-bold ${cfg.color}`}>{count}</div>
                        <div className="font-display text-xs text-muted-foreground mt-1">{cfg.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Execution plan per finding */}
                <div className="space-y-3">
                  {jidokaResult.routedFindings.map((r, i) => {
                    const choice = decisions[i]!;
                    const cfg = choiceConfig[choice];
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-lg border ${cfg.border} ${cfg.bg} p-4 flex items-center gap-4`}
                      >
                        <div className={`p-2 rounded-lg ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/80 truncate">{r.finding.originalFinding}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.action}</p>
                        </div>
                        <span className={`font-display text-[10px] font-bold uppercase tracking-wider ${cfg.color} shrink-0`}>
                          {cfg.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Forward to governance */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
                  <p className="font-display text-xs text-muted-foreground">
                    Execution plan confirmed → forwarding to <span className="text-primary">Layer 5 (Governance)</span> for DORA metrics and audit tracking
                  </p>
                </motion.div>

                {/* Reset */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => { setSubmitted(false); setDecisions({}); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Revise decisions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ClientDecisionPanel;
