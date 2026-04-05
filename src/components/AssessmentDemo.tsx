import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, ShieldAlert, GitBranch, FileCode, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SAMPLE_REPOS = [
  { name: "acme/web-dashboard", lang: "TypeScript" },
  { name: "acme/payment-service", lang: "Java" },
  { name: "acme/legacy-api", lang: "Python" },
];

interface Finding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  message: string;
  file: string;
  line: number;
}

interface HealthScore {
  category: string;
  score: number;
  grade: string;
  color: string;
}

interface ScanResult {
  repo: string;
  totalIssues: number;
  techDebtHours: number;
  healthScores: HealthScore[];
  findings: Finding[];
}

const generateResults = (repo: string): ScanResult => {
  const dataMap: Record<string, ScanResult> = {
    "acme/web-dashboard": {
      repo,
      totalIssues: 23,
      techDebtHours: 48,
      healthScores: [
        { category: "Code Complexity", score: 72, grade: "B", color: "text-amber-400" },
        { category: "Duplication", score: 88, grade: "A", color: "text-emerald-400" },
        { category: "Security", score: 64, grade: "C", color: "text-red-400" },
        { category: "Dependencies", score: 81, grade: "A-", color: "text-emerald-400" },
        { category: "Test Coverage", score: 56, grade: "C-", color: "text-red-400" },
      ],
      findings: [
        { severity: "critical", category: "Security", message: "SQL injection vulnerability in user query builder", file: "src/db/queries.ts", line: 142 },
        { severity: "high", category: "Complexity", message: "Cyclomatic complexity of 34 exceeds threshold (15)", file: "src/utils/parser.ts", line: 88 },
        { severity: "high", category: "Security", message: "Hardcoded API key in configuration file", file: "src/config/api.ts", line: 12 },
        { severity: "medium", category: "Duplication", message: "Duplicated block (28 lines) across 3 files", file: "src/components/Form.tsx", line: 45 },
        { severity: "medium", category: "Dependencies", message: "lodash@4.17.15 has known prototype pollution vulnerability", file: "package.json", line: 22 },
        { severity: "low", category: "Style", message: "Unused import detected", file: "src/pages/Home.tsx", line: 3 },
      ],
    },
    "acme/payment-service": {
      repo,
      totalIssues: 41,
      techDebtHours: 96,
      healthScores: [
        { category: "Code Complexity", score: 54, grade: "C-", color: "text-red-400" },
        { category: "Duplication", score: 67, grade: "C+", color: "text-amber-400" },
        { category: "Security", score: 78, grade: "B+", color: "text-amber-400" },
        { category: "Dependencies", score: 45, grade: "D", color: "text-red-400" },
        { category: "Test Coverage", score: 82, grade: "A-", color: "text-emerald-400" },
      ],
      findings: [
        { severity: "critical", category: "Dependencies", message: "Spring Boot 2.5.x reached end-of-life, 14 CVEs unpatched", file: "pom.xml", line: 18 },
        { severity: "critical", category: "Complexity", message: "God class PaymentProcessor has 2,400 lines", file: "src/main/java/PaymentProcessor.java", line: 1 },
        { severity: "high", category: "Duplication", message: "Validation logic duplicated across 6 service classes", file: "src/main/java/services/", line: 0 },
        { severity: "high", category: "Security", message: "Missing input sanitization on webhook endpoint", file: "src/main/java/WebhookController.java", line: 67 },
        { severity: "medium", category: "Complexity", message: "Deeply nested conditionals (depth 7)", file: "src/main/java/RuleEngine.java", line: 203 },
        { severity: "low", category: "Style", message: "Inconsistent naming convention in DTO classes", file: "src/main/java/dto/", line: 0 },
      ],
    },
    "acme/legacy-api": {
      repo,
      totalIssues: 67,
      techDebtHours: 184,
      healthScores: [
        { category: "Code Complexity", score: 31, grade: "F", color: "text-red-400" },
        { category: "Duplication", score: 42, grade: "D", color: "text-red-400" },
        { category: "Security", score: 38, grade: "F", color: "text-red-400" },
        { category: "Dependencies", score: 29, grade: "F", color: "text-red-400" },
        { category: "Test Coverage", score: 18, grade: "F", color: "text-red-400" },
      ],
      findings: [
        { severity: "critical", category: "Security", message: "No authentication on 12 API endpoints", file: "app/routes.py", line: 1 },
        { severity: "critical", category: "Dependencies", message: "Python 2.7 — end-of-life since Jan 2020", file: "runtime.txt", line: 1 },
        { severity: "critical", category: "Security", message: "Plaintext password storage in database layer", file: "app/models/user.py", line: 34 },
        { severity: "high", category: "Complexity", message: "Monolithic file with 4,800 lines and no separation", file: "app/main.py", line: 1 },
        { severity: "high", category: "Duplication", message: "Copy-pasted error handling in 23 locations", file: "app/handlers/", line: 0 },
        { severity: "medium", category: "Dependencies", message: "requests@2.18.0 has SSL verification bypass", file: "requirements.txt", line: 8 },
      ],
    },
  };

  if (dataMap[repo]) return dataMap[repo];

  // Generate randomised results for custom GitHub repos
  const seed = repo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (min: number, max: number) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);
  const randInt = (min: number, max: number) => Math.round(rand(min, max));
  const scoreFor = (base: number) => {
    const s = Math.min(100, Math.max(0, randInt(base - 20, base + 20)));
    const grade = s >= 90 ? "A" : s >= 80 ? "B+" : s >= 70 ? "B" : s >= 60 ? "C" : s >= 50 ? "D" : "F";
    const color = s >= 70 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";
    return { score: s, grade, color };
  };

  const complexity = scoreFor(randInt(30, 85));
  const duplication = scoreFor(randInt(40, 90));
  const security = scoreFor(randInt(25, 80));
  const deps = scoreFor(randInt(30, 85));
  const tests = scoreFor(randInt(15, 80));

  const totalIssues = randInt(12, 78);
  const techDebtHours = randInt(24, 220);

  const severities: Finding["severity"][] = ["critical", "high", "high", "medium", "medium", "low"];
  const categories = ["Security", "Complexity", "Duplication", "Dependencies", "Security", "Style"];
  const messages = [
    "Potential injection vulnerability detected in request handler",
    "Cyclomatic complexity exceeds recommended threshold",
    "Duplicated logic found across multiple modules",
    "Outdated dependency with known CVEs",
    "Missing rate limiting on public endpoints",
    "Inconsistent error handling patterns",
  ];
  const files = ["src/api/handler", "src/core/engine", "src/utils/helpers", "package.json", "src/routes/auth", "src/lib/format"];

  return {
    repo,
    totalIssues,
    techDebtHours,
    healthScores: [
      { category: "Code Complexity", ...complexity },
      { category: "Duplication", ...duplication },
      { category: "Security", ...security },
      { category: "Dependencies", ...deps },
      { category: "Test Coverage", ...tests },
    ],
    findings: severities.map((sev, i) => ({
      severity: sev,
      category: categories[i],
      message: messages[i],
      file: files[i],
      line: randInt(1, 300),
    })),
  };
};

const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "CRITICAL" },
  high: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", label: "HIGH" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "MEDIUM" },
  low: { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", label: "LOW" },
};

const ScoreBar = ({ score, delay }: { score: number; delay: number }) => (
  <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${score}%` }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`h-full rounded-full ${
        score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400"
      }`}
    />
  </div>
);

const AssessmentDemo = () => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleScan = (repo: string) => {
    setSelectedRepo(repo);
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setResult(generateResults(repo));
      setScanning(false);
    }, 2000);
  };

  const overallScore = result
    ? Math.round(result.healthScores.reduce((a, b) => a + b.score, 0) / result.healthScores.length)
    : 0;

  return (
    <section id="assessment-demo" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-emerald-400/30 bg-emerald-400/5">
            <Search className="w-3 h-3 text-emerald-400" />
            <span className="font-display text-[10px] uppercase tracking-wider text-emerald-400">Layer 1 · Assessment</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Code Health <span className="text-gradient-primary">Scanner</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simulate an IntelliOps Layer 1 assessment — select a repository to analyse code complexity, security vulnerabilities, and technical debt.
          </p>
        </motion.div>

        {/* Repo selector */}
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {SAMPLE_REPOS.map((repo) => (
              <motion.button
                key={repo.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScan(repo.name)}
                disabled={scanning}
                className={`p-4 rounded-xl border text-left transition-all duration-300 disabled:opacity-50 ${
                  selectedRepo === repo.name
                    ? "border-emerald-400/50 bg-emerald-400/5"
                    : "border-border bg-card hover:border-primary/30 hover:bg-surface-elevated"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display text-sm font-semibold text-foreground">{repo.name}</span>
                </div>
                <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">{repo.lang}</span>
              </motion.button>
            ))}
          </div>

          {/* Scanning animation */}
          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="font-display text-sm text-muted-foreground animate-pulse">
                  Running SonarQube · DeepCode · CodeQL · OWASP ZAP…
                </p>
              </motion.div>
            )}

            {/* Results */}
            {result && !scanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Summary bar */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <div className={`font-display text-4xl font-bold ${
                      overallScore >= 70 ? "text-emerald-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {overallScore}
                    </div>
                    <div className="font-display text-xs text-muted-foreground uppercase tracking-wider mt-1">Health Score</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <div className="font-display text-4xl font-bold text-foreground flex items-center justify-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      {result.totalIssues}
                    </div>
                    <div className="font-display text-xs text-muted-foreground uppercase tracking-wider mt-1">Issues Found</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <div className="font-display text-4xl font-bold text-foreground">
                      {result.techDebtHours}h
                    </div>
                    <div className="font-display text-xs text-muted-foreground uppercase tracking-wider mt-1">Est. Tech Debt</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Health scores */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-primary" /> Health Breakdown
                    </h3>
                    <div className="space-y-4">
                      {result.healthScores.map((hs, i) => (
                        <div key={hs.category}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-display text-xs text-muted-foreground">{hs.category}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-display text-xs font-bold ${hs.color}`}>{hs.grade}</span>
                              <span className="font-display text-xs text-muted-foreground">{hs.score}/100</span>
                            </div>
                          </div>
                          <ScoreBar score={hs.score} delay={i * 0.1} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" /> Top Findings
                    </h3>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {result.findings.map((f, i) => {
                        const sev = severityConfig[f.severity];
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`rounded-lg border ${sev.border} ${sev.bg} p-3`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-display text-[9px] font-bold uppercase tracking-wider ${sev.color}`}>
                                {sev.label}
                              </span>
                              <span className="font-display text-[9px] text-muted-foreground uppercase tracking-wider">
                                {f.category}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 mb-1">{f.message}</p>
                            <span className="font-display text-[10px] text-muted-foreground">
                              {f.file}{f.line > 0 ? `:${f.line}` : ""}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pipeline hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-center"
                >
                  <p className="font-display text-xs text-muted-foreground">
                    Assessment complete → findings are forwarded to <span className="text-cyan-400">Layer 2 (Intelligence)</span> for AI-powered prioritisation
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

export default AssessmentDemo;
