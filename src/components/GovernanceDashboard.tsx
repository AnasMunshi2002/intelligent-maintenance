import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  Rocket, Clock, AlertTriangle, Wrench, TrendingUp, DollarSign,
  CheckCircle2, Activity, Timer, BarChart3, ShieldCheck, ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── DORA Metrics Data ─── */

const doraKpis = [
  {
    label: "Deployment Frequency",
    value: "4.2 / day",
    prev: "1.1 / day",
    trend: "+282%",
    up: true,
    icon: Rocket,
    description: "Average deployments per day over last 30 days",
  },
  {
    label: "Lead Time for Changes",
    value: "2.4 hrs",
    prev: "18.6 hrs",
    trend: "-87%",
    up: false,
    icon: Clock,
    description: "Commit to production deployment time",
  },
  {
    label: "Change Failure Rate",
    value: "4.2%",
    prev: "22.8%",
    trend: "-82%",
    up: false,
    icon: AlertTriangle,
    description: "% of deployments causing incidents",
  },
  {
    label: "Mean Time to Recovery",
    value: "18 min",
    prev: "4.2 hrs",
    trend: "-93%",
    up: false,
    icon: Wrench,
    description: "Average incident recovery time",
  },
];

const deployFreqData = [
  { week: "W1", frequency: 1.2, target: 3 },
  { week: "W2", frequency: 1.8, target: 3 },
  { week: "W3", frequency: 2.4, target: 3 },
  { week: "W4", frequency: 2.9, target: 3 },
  { week: "W5", frequency: 3.1, target: 4 },
  { week: "W6", frequency: 3.6, target: 4 },
  { week: "W7", frequency: 3.9, target: 4 },
  { week: "W8", frequency: 4.2, target: 4 },
];

const leadTimeData = [
  { week: "W1", hours: 18.6 },
  { week: "W2", hours: 15.2 },
  { week: "W3", hours: 12.1 },
  { week: "W4", hours: 9.4 },
  { week: "W5", hours: 6.8 },
  { week: "W6", hours: 4.5 },
  { week: "W7", hours: 3.2 },
  { week: "W8", hours: 2.4 },
];

const failureRateData = [
  { week: "W1", rate: 22.8, incidents: 8 },
  { week: "W2", rate: 19.4, incidents: 6 },
  { week: "W3", rate: 16.1, incidents: 5 },
  { week: "W4", rate: 12.7, incidents: 4 },
  { week: "W5", rate: 9.3, incidents: 3 },
  { week: "W6", rate: 7.1, incidents: 2 },
  { week: "W7", rate: 5.6, incidents: 2 },
  { week: "W8", rate: 4.2, incidents: 1 },
];

const mttrData = [
  { week: "W1", minutes: 252 },
  { week: "W2", minutes: 198 },
  { week: "W3", minutes: 144 },
  { week: "W4", minutes: 96 },
  { week: "W5", minutes: 54 },
  { week: "W6", minutes: 36 },
  { week: "W7", minutes: 24 },
  { week: "W8", minutes: 18 },
];

/* ─── ROI Data ─── */

const roiSummary = [
  { metric: "Developer Hours Saved", before: "120 hrs/month", after: "8 hrs/month", savings: "112 hrs/month" },
  { metric: "Incident Response Cost", before: "£18,400/month", after: "£2,100/month", savings: "£16,300/month" },
  { metric: "Deployment Rollbacks", before: "14/month", after: "2/month", savings: "12 fewer/month" },
  { metric: "Code Review Bottleneck", before: "3.2 days avg", after: "4.1 hrs avg", savings: "2.8 days saved" },
  { metric: "Security Patch Latency", before: "21 days", after: "2.4 hrs", savings: "~21 days faster" },
];

const roiBreakdown = [
  { name: "Automated Fixes", value: 45, color: "hsl(var(--primary))" },
  { name: "Guided Fixes", value: 30, color: "hsl(160, 60%, 45%)" },
  { name: "Manual Resolution", value: 15, color: "hsl(45, 80%, 55%)" },
  { name: "Governance Overhead", value: 10, color: "hsl(var(--muted-foreground))" },
];

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

const GovernanceDashboard = () => {
  return (
    <section id="governance" className="py-24 relative overflow-hidden">
      {/* Background */}
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
            Track continuous improvement with industry-standard DevOps Research and Assessment (DORA) metrics. 
            Quantify the business value of automated maintenance.
          </p>
        </motion.div>

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
                  <span className={`flex items-center gap-0.5 font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
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
            Your team currently operates at <span className="font-bold text-emerald-400">Elite</span> level across all four DORA metrics.
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
                  <TableRow key={row.band} className={row.band === "Elite" ? "bg-emerald-500/10" : ""}>
                    <TableCell className={`font-semibold text-xs ${row.band === "Elite" ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {row.band === "Elite" ? "✦ " : ""}{row.band}
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
          {/* Deployment Frequency */}
          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Deployment Frequency Trend</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deployFreqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deploys/Day" />
                <Line type="monotone" dataKey="target" stroke="hsl(160, 60%, 45%)" strokeDasharray="5 5" name="Target" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Lead Time */}
          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Lead Time for Changes</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={leadTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit=" hrs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Lead Time (hrs)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Change Failure Rate */}
          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Change Failure Rate</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={failureRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(45, 80%, 55%)" strokeWidth={2} name="Failure Rate (%)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="incidents" stroke="hsl(0, 70%, 55%)" strokeWidth={2} name="Incidents" dot={{ r: 3 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* MTTR */}
          <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">Mean Time to Recovery (MTTR)</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit=" min" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="minutes" stroke="hsl(0, 70%, 55%)" fill="hsl(0, 70%, 55%, 0.12)" name="MTTR (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── ROI Section ── */}
        <motion.div {...cardAnim} className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-semibold text-foreground">Return on Investment</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ROI Highlight */}
            <motion.div {...cardAnim} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm p-6 flex flex-col justify-center">
              <p className="text-xs text-emerald-400 font-medium mb-2">Estimated Annual Savings</p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">£214,800</p>
              <p className="text-xs text-muted-foreground">Based on developer cost of £75/hr and current automation rate</p>
              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">ROI Ratio</span>
                  <span className="font-bold text-emerald-400">8.4x</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Payback Period</span>
                  <span className="font-bold text-foreground">6 weeks</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Automation Rate</span>
                  <span className="font-bold text-foreground">78%</span>
                </div>
              </div>
            </motion.div>

            {/* Effort Breakdown Pie */}
            <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
              <h4 className="font-display text-sm font-semibold text-foreground mb-4">Resolution Effort Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roiBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
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
                    {item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ROI Table */}
            <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 lg:col-span-1">
              <h4 className="font-display text-sm font-semibold text-foreground mb-4">Cost Savings Breakdown</h4>
              <div className="space-y-3">
                {roiSummary.map((row) => (
                  <div key={row.metric} className="border-b border-border/30 pb-2 last:border-0">
                    <p className="text-xs font-medium text-foreground mb-1">{row.metric}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-red-400/80 line-through">{row.before}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-emerald-400 font-semibold">{row.after}</span>
                    </div>
                    <p className="text-[10px] text-emerald-400/70 mt-0.5">Saving: {row.savings}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Audit Trail Summary ── */}
        <motion.div {...cardAnim} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Governance Audit Trail</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Every decision through the IntelliOps pipeline is logged for compliance and continuous improvement.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Scans", value: "342", icon: CheckCircle2, detail: "Last 90 days" },
              { label: "Findings Processed", value: "1,847", icon: Activity, detail: "Auto + Manual" },
              { label: "Compliance Score", value: "96.4%", icon: ShieldCheck, detail: "SOC2 / ISO 27001" },
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
