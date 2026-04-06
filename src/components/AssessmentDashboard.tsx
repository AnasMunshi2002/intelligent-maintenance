import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";
import {
  TrendingDown, Activity, Copy, Bug, ShieldAlert,
  ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── placeholder data (replace with real values) ─── */

const kpis = [
  {
    label: "Technical Debt Ratio",
    pre: "38%",
    post: "12%",
    delta: -68,
    icon: TrendingDown,
    accent: "text-red-400",
    accentPost: "text-emerald-400",
  },
  {
    label: "Cyclomatic Complexity",
    pre: "34.2",
    post: "11.7",
    delta: -66,
    icon: Activity,
    accent: "text-red-400",
    accentPost: "text-emerald-400",
  },
  {
    label: "Duplication %",
    pre: "22%",
    post: "4%",
    delta: -82,
    icon: Copy,
    accent: "text-amber-400",
    accentPost: "text-emerald-400",
  },
  {
    label: "Issue Density",
    pre: "8.4",
    post: "1.9",
    delta: -77,
    icon: Bug,
    accent: "text-amber-400",
    accentPost: "text-emerald-400",
  },
  {
    label: "Security Hotspots",
    pre: "14",
    post: "2",
    delta: -86,
    icon: ShieldAlert,
    accent: "text-red-400",
    accentPost: "text-emerald-400",
  },
];

const comparisonTable = [
  { metric: "Technical Debt Ratio", pre: "38%", post: "12%", improvement: "68%" },
  { metric: "Cyclomatic Complexity (avg)", pre: "34.2", post: "11.7", improvement: "66%" },
  { metric: "Code Duplication", pre: "22%", post: "4%", improvement: "82%" },
  { metric: "Issue Density (per KLOC)", pre: "8.4", post: "1.9", improvement: "77%" },
  { metric: "Security Hotspots", pre: "14", post: "2", improvement: "86%" },
  { metric: "Test Coverage", pre: "31%", post: "87%", improvement: "181%" },
  { metric: "Build Time (min)", pre: "18.4", post: "6.2", improvement: "66%" },
  { metric: "Mean-Time-To-Resolve (hrs)", pre: "72", post: "8.5", improvement: "88%" },
];

const barData = [
  { metric: "Tech Debt", Pre: 38, Post: 12 },
  { metric: "Complexity", Pre: 34, Post: 12 },
  { metric: "Duplication", Pre: 22, Post: 4 },
  { metric: "Issue Density", Pre: 8.4, Post: 1.9 },
  { metric: "Sec Hotspots", Pre: 14, Post: 2 },
];

const trendData = [
  { sprint: "S1", before: 38, after: 38 },
  { sprint: "S2", before: 36, after: 32 },
  { sprint: "S3", before: 35, after: 26 },
  { sprint: "S4", before: 34, after: 20 },
  { sprint: "S5", before: 33, after: 16 },
  { sprint: "S6", before: 33, after: 12 },
];

const radarData = [
  { metric: "Maintainability", Pre: 40, Post: 88 },
  { metric: "Reliability", Pre: 55, Post: 92 },
  { metric: "Security", Pre: 35, Post: 90 },
  { metric: "Performance", Pre: 60, Post: 85 },
  { metric: "Testability", Pre: 30, Post: 87 },
];

/* ─── component ─── */

const cardAnim = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const AssessmentDashboard = () => (
  <section id="assessment-dashboard" className="py-24 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-card/10 to-background" />
    <div className="relative z-10 container mx-auto px-6">
      {/* Header */}
      <motion.div {...cardAnim} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/30 bg-primary/5">
          <Activity className="w-3 h-3 text-primary" />
          <span className="font-display text-[10px] uppercase tracking-wider text-primary">
            Layer 1 · Assessment Dashboard
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Pre vs Post <span className="text-gradient-primary">Refactoring</span> Metrics
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Placeholder metrics demonstrating the measurable impact of IntelliOps-driven maintenance.
          Replace these values with your own assessment data.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              {...cardAnim}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-border bg-card p-5 flex flex-col items-center text-center hover:border-primary/30 transition-colors"
            >
              <Icon className="w-5 h-5 text-muted-foreground mb-3" />
              <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                {k.label}
              </span>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-display text-lg font-bold line-through opacity-50 ${k.accent}`}>
                  {k.pre}
                </span>
                <span className={`font-display text-2xl font-bold ${k.accentPost}`}>
                  {k.post}
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
                <ArrowDownRight className="w-3 h-3" />
                {Math.abs(k.delta)}% reduced
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        {/* Bar chart */}
        <motion.div
          {...cardAnim}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-6">
            Metric Comparison — Pre vs Post
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="metric"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Pre" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Post" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line chart – tech debt trend */}
        <motion.div
          {...cardAnim}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-6">
            Technical Debt Trend Over Sprints
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="sprint"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="before"
                stroke="#f87171"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Without IntelliOps"
              />
              <Line
                type="monotone"
                dataKey="after"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="With IntelliOps"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Radar + Table row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <motion.div
          {...cardAnim}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-6">
            Quality Dimensions — Radar View
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Radar
                name="Pre-Refactoring"
                dataKey="Pre"
                stroke="#f87171"
                fill="#f87171"
                fillOpacity={0.15}
              />
              <Radar
                name="Post-Refactoring"
                dataKey="Post"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.15}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          {...cardAnim}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-6">
            Full Comparison Table
          </h3>
          <div className="overflow-auto max-h-[340px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-display text-xs">Metric</TableHead>
                  <TableHead className="font-display text-xs text-right">Before</TableHead>
                  <TableHead className="font-display text-xs text-right">After</TableHead>
                  <TableHead className="font-display text-xs text-right">Improvement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonTable.map((row) => (
                  <TableRow key={row.metric} className="border-border">
                    <TableCell className="text-xs font-medium text-foreground">
                      {row.metric}
                    </TableCell>
                    <TableCell className="text-xs text-right text-red-400 font-mono">
                      {row.pre}
                    </TableCell>
                    <TableCell className="text-xs text-right text-emerald-400 font-mono">
                      {row.post}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <ArrowUpRight className="w-3 h-3" />
                        {row.improvement}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AssessmentDashboard;
