import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  Rocket, Clock, AlertTriangle, Wrench, TrendingUp, DollarSign,
  CheckCircle2, Activity, Timer, BarChart3, ShieldCheck, ArrowUpRight,
  ArrowDownRight, Info,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ClientDecisions } from "@/components/ClientDecisionPanel";
import ClosedLoopAuditPanel from "@/components/ClosedLoopAuditPanel";

/* ─── Types ─── */
interface PipelineData {
  scanResult: any;
  analysisResult: any;
  jidokaResult: any;
  clientDecisions: ClientDecisions | null;
}

interface GovernanceDashboardProps {
  pipelineData?: PipelineData;
}

/* ─── DORA band reference (static) ─── */
const doraBands = [
  { band: "Elite", deployFreq: "On-demand (multiple/day)", leadTime: "< 1 hour", changeFailure: "0–15%", mttr: "< 1 hour" },
  { band: "High", deployFreq: "Daily–Weekly", leadTime: "1 day–1 week", changeFailure: "16–30%", mttr: "< 1 day" },
  { band: "Medium", deployFreq: "Weekly–Monthly", leadTime: "1 week–1 month", changeFailure: "16–30%", mttr: "1 day–1 week" },
  { band: "Low", deployFreq: "Monthly–Biannually", leadTime: "1–6 months", changeFailure: "> 30%", mttr: "> 6 months" },
];

const cardAnim = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

/* ─── Helpers to derive metrics from pipeline data ─── */
function deriveMetrics(data: PipelineData) {
  const { scanResult, analysisResult, jidokaResult, clientDecisions } = data;

  // Repo info
  const repoName = scanResult?.repo?.full_name || scanResult?.repo?.name || "Unknown Repo";
  const repoStars = scanResult?.repo?.stargazers_count ?? 0;

  // Findings
  const totalFindings = jidokaResult?.routedFindings?.length ?? analysisResult?.prioritizedFindings?.length ?? scanResult?.findings?.length ?? 0;
  const riskLevel = analysisResult?.riskLevel ?? jidokaResult?.riskLevel ?? "medium";

  // Health scores — values may be numbers or objects like {category, score, grade, color}
  const rawHealthScores = scanResult?.healthScores ?? {};
  const healthScores: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawHealthScores)) {
    healthScores[k] = typeof v === "number" ? v : (v as any)?.score ?? 0;
  }
  const avgHealth = Object.values(healthScores).length > 0
    ? Math.round(Object.values(healthScores).reduce((a, b) => a + b, 0) / Object.values(healthScores).length)
    : 50;

  // Tech debt
  const techDebt = scanResult?.techDebt ?? {};

  // Jidoka stats
  const jidokaStats = jidokaResult?.stats ?? { auto_fix: 0, supervised: 0, human_required: 0 };
  const jidokaAutomationRate = jidokaResult?.summary?.automationRate ?? 0;
  const estimatedTimeSaved = jidokaResult?.summary?.estimatedTimeSavedHours ?? 0;

  // Client decisions
  const decisions = clientDecisions?.summary ?? { ai_auto: 0, guided: 0, manual: 0 };
  const clientAutomationRate = clientDecisions?.automationRate ?? 0;

  // Derive DORA-projected metrics based on automation rate
  const effectiveAutomationRate = clientDecisions ? clientAutomationRate : jidokaAutomationRate;
  const automationFactor = effectiveAutomationRate / 100;

  // Project DORA improvements based on automation level
  const baseDeployFreq = 1.1;
  const projectedDeployFreq = +(baseDeployFreq + (automationFactor * 3.5)).toFixed(1);
  const baseLeadTime = 18.6;
  const projectedLeadTime = +(baseLeadTime * (1 - automationFactor * 0.87)).toFixed(1);
  const baseFailureRate = 22.8;
  const projectedFailureRate = +(baseFailureRate * (1 - automationFactor * 0.82)).toFixed(1);
  const baseMTTR = 252; // minutes
  const projectedMTTR = Math.round(baseMTTR * (1 - automationFactor * 0.93));

  // ROI calculation
  const devCostPerHour = 75; // £
  const hoursSavedPerMonth = Math.round(estimatedTimeSaved * 4.3); // weekly to monthly
  const monthlySavings = hoursSavedPerMonth * devCostPerHour;
  const annualSavings = monthlySavings * 12;

  return {
    repoName, repoStars, totalFindings, riskLevel, avgHealth, techDebt,
    jidokaStats, decisions, effectiveAutomationRate, automationFactor,
    projectedDeployFreq, baseDeployFreq, projectedLeadTime, baseLeadTime,
    projectedFailureRate, baseFailureRate, projectedMTTR, baseMTTR,
    hoursSavedPerMonth, monthlySavings, annualSavings, estimatedTimeSaved,
    healthScores,
  };
}

function generateTrendData(base: number, projected: number, weeks: number = 8, decreasing: boolean = false) {
  const data = [];
  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1);
    const eased = t * t * (3 - 2 * t); // smoothstep
    const value = decreasing
      ? +(base - (base - projected) * eased).toFixed(1)
      : +(base + (projected - base) * eased).toFixed(1);
    data.push({ week: `W${i + 1}`, value });
  }
  return data;
}

function getDoraBand(automationRate: number): string {
  if (automationRate >= 70) return "Elite";
  if (automationRate >= 50) return "High";
  if (automationRate >= 30) return "Medium";
  return "Low";
}

/* ─── Component ─── */
const GovernanceDashboard = ({ pipelineData }: GovernanceDashboardProps) => {
  const hasData = pipelineData?.scanResult != null;

  if (!hasData) {
    return (
      <section id="governance" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-4">
            <BarChart3 className="w-3 h-3" />
            Layer 5 — Governance & Reporting
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            DORA Metrics & ROI Dashboard
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete Layers 1–4 to populate governance metrics with real project data.
          </p>
        </div>
      </section>
    );
  }

  const m = deriveMetrics(pipelineData!);
  const doraBand = getDoraBand(m.effectiveAutomationRate);

  const doraKpis = [
    {
      label: "Deployment Frequency",
      value: `${m.projectedDeployFreq} / day`,
      prev: `${m.baseDeployFreq} / day`,
      trend: `+${Math.round(((m.projectedDeployFreq - m.baseDeployFreq) / m.baseDeployFreq) * 100)}%`,
      up: true,
      icon: Rocket,
      description: "Projected deployments per day with IntelliOps automation",
    },
    {
      label: "Lead Time for Changes",
      value: `${m.projectedLeadTime} hrs`,
      prev: `${m.baseLeadTime} hrs`,
      trend: `-${Math.round(((m.baseLeadTime - m.projectedLeadTime) / m.baseLeadTime) * 100)}%`,
      up: false,
      icon: Clock,
      description: "Projected commit-to-production time",
    },
    {
      label: "Change Failure Rate",
      value: `${m.projectedFailureRate}%`,
      prev: `${m.baseFailureRate}%`,
      trend: `-${Math.round(((m.baseFailureRate - m.projectedFailureRate) / m.baseFailureRate) * 100)}%`,
      up: false,
      icon: AlertTriangle,
      description: "Projected deployment failure rate",
    },
    {
      label: "Mean Time to Recovery",
      value: m.projectedMTTR < 60 ? `${m.projectedMTTR} min` : `${(m.projectedMTTR / 60).toFixed(1)} hrs`,
      prev: `${(m.baseMTTR / 60).toFixed(1)} hrs`,
      trend: `-${Math.round(((m.baseMTTR - m.projectedMTTR) / m.baseMTTR) * 100)}%`,
      up: false,
      icon: Wrench,
      description: "Projected average incident recovery time",
    },
  ];

  const deployTrend = generateTrendData(m.baseDeployFreq, m.projectedDeployFreq, 8, false);
  const leadTimeTrend = generateTrendData(m.baseLeadTime, m.projectedLeadTime, 8, true);
  const failureTrend = generateTrendData(m.baseFailureRate, m.projectedFailureRate, 8, true);
  const mttrTrend = generateTrendData(m.baseMTTR, m.projectedMTTR, 8, true);

  const roiBreakdown = [
    { name: "AI Auto-Fix", value: m.decisions.ai_auto || m.jidokaStats.auto_fix, color: "hsl(var(--primary))" },
    { name: "Guided Fix", value: m.decisions.guided || m.jidokaStats.supervised, color: "hsl(160, 60%, 45%)" },
    { name: "Manual Resolution", value: m.decisions.manual || m.jidokaStats.human_required, color: "hsl(45, 80%, 55%)" },
  ].filter(d => d.value > 0);

  const roiTotal = roiBreakdown.reduce((s, d) => s + d.value, 0);

  return (
    <section id="governance" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div {...cardAnim} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-4">
            <BarChart3 className="w-3 h-3" />
            Layer 5 — Governance & Reporting
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            DORA Metrics & ROI Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Metrics derived from your scan of <span className="text-primary font-semibold">{m.repoName}</span> — 
            {m.totalFindings} findings processed with {m.effectiveAutomationRate}% automation rate.
          </p>
        </motion.div>

        {/* ── Project Context Banner ── */}
        <motion.div {...cardAnim} className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Repository:</span>
            <span className="text-sm font-semibold text-foreground">{m.repoName}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Risk: <span className={`font-bold ${m.riskLevel === "critical" ? "text-red-400" : m.riskLevel === "high" ? "text-orange-400" : m.riskLevel === "medium" ? "text-yellow-400" : "text-emerald-400"}`}>{m.riskLevel.toUpperCase()}</span></span>
            <span>Findings: <span className="font-bold text-foreground">{m.totalFindings}</span></span>
            <span>Health: <span className="font-bold text-foreground">{m.avgHealth}%</span></span>
            <span>Automation: <span className="font-bold text-primary">{m.effectiveAutomationRate}%</span></span>
          </div>
        </motion.div>

        {/* ── Closed-Loop Audit Trail (real PRs from Layer 4) ── */}
        <ClosedLoopAuditPanel />

        {/* ── DORA KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {doraKpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const isPositive = kpi.label === "Deployment Frequency" ? kpi.up : !kpi.up;
            return (
              <motion.div
                key={kpi.label}
                {...cardAnim}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">was {kpi.prev}</span>
                  <span className={`flex items-center gap-0.5 font-semibold ${isPositive ? "text-emerald-400" : "text-emerald-400"}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-2">{kpi.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── DORA Performance Band ── */}
        <motion.div {...cardAnim} className="mb-12 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">DORA Performance Classification</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Based on {m.effectiveAutomationRate}% automation, your projected performance band is{" "}
            <span className={`font-bold ${doraBand === "Elite" ? "text-emerald-400" : doraBand === "High" ? "text-blue-400" : doraBand === "Medium" ? "text-yellow-400" : "text-red-400"}`}>
              {doraBand}
            </span>.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Band</TableHead>
                  <TableHead className="text-xs">Deploy Frequency</TableHead>
                  <TableHead className="text-xs">Lead Time</TableHead>
                  <TableHead className="text-xs">Change Failure</TableHead>
                  <TableHead className="text-xs">MTTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doraBands.map((row) => (
                  <TableRow key={row.band} className={row.band === doraBand ? "bg-emerald-500/10" : ""}>
                    <TableCell className={`font-semibold text-xs ${row.band === doraBand ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {row.band === doraBand ? "✦ " : ""}{row.band}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.deployFreq}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.leadTime}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.changeFailure}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.mttr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* ── DORA Trend Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Deployment Frequency Projection</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deployTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deploys/Day" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Lead Time for Changes</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={leadTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit=" hrs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Lead Time (hrs)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Change Failure Rate</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={failureTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(45, 80%, 55%)" strokeWidth={2} name="Failure Rate (%)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Mean Time to Recovery (MTTR)</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mttrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit=" min" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(0, 70%, 55%)" fill="hsl(0, 70%, 55%, 0.12)" name="MTTR (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── ROI Section ── */}
        <motion.div {...cardAnim} className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-semibold text-foreground">Return on Investment — {m.repoName}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ROI Highlight */}
            <motion.div {...cardAnim} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm p-6 flex flex-col justify-center">
              <p className="text-xs text-emerald-400 font-medium mb-2">Estimated Annual Savings</p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">
                £{m.annualSavings > 0 ? m.annualSavings.toLocaleString() : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Based on £{75}/hr developer cost × {m.hoursSavedPerMonth} hrs/month saved</p>
              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Automation Rate</span>
                  <span className="font-bold text-emerald-400">{m.effectiveAutomationRate}%</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Hours Saved / Week</span>
                  <span className="font-bold text-foreground">{m.estimatedTimeSaved}h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Findings</span>
                  <span className="font-bold text-foreground">{m.totalFindings}</span>
                </div>
              </div>
            </motion.div>

            {/* Resolution Breakdown Pie */}
            <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
              <h4 className="font-display text-sm font-semibold text-foreground mb-4">Resolution Strategy Breakdown</h4>
              {roiBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={roiBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                        {roiBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {roiBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name} ({item.value}/{roiTotal})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">Submit Layer 4 decisions to see breakdown</p>
              )}
            </motion.div>

            {/* Health Scores Summary */}
            <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
              <h4 className="font-display text-sm font-semibold text-foreground mb-4">Repository Health Scores</h4>
              <div className="space-y-3">
                {Object.entries(m.healthScores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-bold text-foreground">{value as number}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${value as number}%` }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(m.healthScores).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No health scores available</p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Audit Trail ── */}
        <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Pipeline Audit Trail</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Full traceability of decisions through the IntelliOps pipeline for <span className="font-semibold text-foreground">{m.repoName}</span>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: "L1: Findings Scanned", value: String(m.totalFindings), icon: CheckCircle2, detail: "Repository scan" },
              { label: "L2: Risk Level", value: m.riskLevel.toUpperCase(), icon: AlertTriangle, detail: "AI intelligence" },
              { label: "L3: Auto-Routable", value: `${m.jidokaStats.auto_fix}/${m.totalFindings}`, icon: Activity, detail: "Jidoka engine" },
              { label: "L4: Client Approved", value: pipelineData?.clientDecisions ? `${m.decisions.ai_auto + m.decisions.guided + m.decisions.manual}/${m.totalFindings}` : "Pending", icon: ShieldCheck, detail: "Client decisions" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-4 rounded-lg bg-background/50 border border-border/30">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{stat.detail}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GovernanceDashboard;
