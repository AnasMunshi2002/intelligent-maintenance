import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, ShieldAlert, GitBranch, FileCode, Loader2, Link2, CheckCircle, XCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Finding {
  source: string;
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
  repoInfo: {
    description: string | null;
    primaryLanguage: string | null;
    languages: string[];
    stars: number;
    forks: number;
    openIssues: number;
    sizeKb: number;
    contributors: number;
    recentCommits: number;
  };
  totalIssues: number;
  techDebtHours: number;
  overallScore: number;
  healthScores: HealthScore[];
  findings: Finding[];
  dataSources: {
    github: boolean;
    codeScanning: boolean;
    dependabot: boolean;
    snyk: boolean;
    snykError: string | null;
  };
}

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

interface AssessmentDemoProps {
  onScanComplete?: (result: ScanResult) => void;
}

const AssessmentDemo = ({ onScanComplete }: AssessmentDemoProps) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const { toast } = useToast();

  const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
    // Handle full URLs
    const urlMatch = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };
    // Handle owner/repo format
    const shortMatch = url.match(/^([^/\s]+)\/([^/\s]+)$/);
    if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
    return null;
  };

  const handleScan = async () => {
    setUrlError("");
    const parsed = parseGithubUrl(githubUrl.trim());
    if (!parsed) {
      setUrlError("Enter a valid GitHub URL or owner/repo (e.g. facebook/react)");
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("scan-repo", {
        body: { owner: parsed.owner, repo: parsed.repo },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setResult(data as ScanResult);
    } catch (e: any) {
      console.error("Scan error:", e);
      toast({
        title: "Scan Failed",
        description: e.message || "Could not scan repository",
        variant: "destructive",
      });
      setUrlError(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

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
            Live Code Health <span className="text-gradient-primary">Scanner</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-time assessment using GitHub API, Dependabot, CodeQL, and Snyk — scanning actual repositories for vulnerabilities, dependency issues, and code quality.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* GitHub URL input */}
          <div className="mb-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">Scan a GitHub Repository</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Paste a GitHub URL or enter owner/repo to run a real Layer 1 assessment
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder="https://github.com/owner/repo  or  owner/repo"
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setUrlError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && !scanning && handleScan()}
                  disabled={scanning}
                  className="flex-1 bg-background border-border font-mono text-sm"
                />
                <Button onClick={handleScan} disabled={scanning || !githubUrl.trim()} className="shrink-0">
                  {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  {scanning ? "Scanning…" : "Scan"}
                </Button>
              </div>
              {urlError && <p className="text-xs text-destructive mt-2">{urlError}</p>}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="font-display text-sm text-muted-foreground animate-pulse">
                  Querying GitHub API · Dependabot · CodeQL · Snyk…
                </p>
                <p className="font-display text-[10px] text-muted-foreground/60 mt-2">
                  Fetching real vulnerability data from live APIs
                </p>
              </motion.div>
            )}

            {result && !scanning && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Data sources badge bar */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mr-2">Data Sources:</span>
                  {[
                    { label: "GitHub API", active: result.dataSources.github },
                    { label: "CodeQL", active: result.dataSources.codeScanning },
                    { label: "Dependabot", active: result.dataSources.dependabot },
                    { label: "Snyk", active: result.dataSources.snyk },
                  ].map((src) => (
                    <span
                      key={src.label}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider border ${
                        src.active
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          : "border-border bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {src.active ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {src.label}
                    </span>
                  ))}
                </div>

                {/* Repo info */}
                {result.repoInfo && (
                  <div className="rounded-xl border border-border bg-card p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm font-semibold text-foreground">{result.repo}</span>
                      {result.repoInfo.primaryLanguage && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-display bg-primary/10 text-primary border border-primary/20">
                          {result.repoInfo.primaryLanguage}
                        </span>
                      )}
                    </div>
                    {result.repoInfo.description && (
                      <p className="text-xs text-muted-foreground mb-2">{result.repoInfo.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-[10px] font-display text-muted-foreground">
                      <span>⭐ {result.repoInfo.stars.toLocaleString()}</span>
                      <span>🍴 {result.repoInfo.forks.toLocaleString()}</span>
                      <span>📂 {result.repoInfo.sizeKb.toLocaleString()} KB</span>
                      <span>👥 {result.repoInfo.contributors} contributors</span>
                      <span>📝 {result.repoInfo.recentCommits} recent commits</span>
                    </div>
                  </div>
                )}

                {/* Summary cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <div className={`font-display text-4xl font-bold ${
                      result.overallScore >= 70 ? "text-emerald-400" : result.overallScore >= 50 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {result.overallScore}
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
                    <div className="font-display text-4xl font-bold text-foreground">{result.techDebtHours}h</div>
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
                      <ShieldAlert className="w-4 h-4 text-primary" /> Live Findings
                    </h3>
                    {result.findings.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No vulnerabilities detected</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          Enable GitHub Advanced Security & import to Snyk for deeper scanning
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {result.findings.map((f, i) => {
                          const sev = severityConfig[f.severity as keyof typeof severityConfig] || severityConfig.medium;
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
                                  {f.source}
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
                    )}
                  </div>
                </div>

                {/* Pipeline hint */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
                  <p className="font-display text-xs text-muted-foreground">
                    Assessment complete → findings forwarded to <span className="text-cyan-400">Layer 2 (Intelligence)</span> for AI analysis
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
