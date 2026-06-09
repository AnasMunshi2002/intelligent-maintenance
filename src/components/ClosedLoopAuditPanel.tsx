import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitPullRequest, ExternalLink, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DecisionRow {
  id: string;
  repository: string;
  finding: string;
  decision: string;
  confidence: number | null;
  pr_url: string | null;
  pr_number: number | null;
  branch_name: string | null;
  execution_status: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: typeof CheckCircle2 }> = {
  pr_created: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "PR Created", icon: CheckCircle2 },
  failed: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Failed", icon: XCircle },
  pending: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "Pending", icon: Loader2 },
};

const ClosedLoopAuditPanel = () => {
  const [rows, setRows] = useState<DecisionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("list-decisions");
    if (!error && data?.rows) setRows(data.rows as DecisionRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // Poll every 15s for new audit entries (Realtime disabled for security).
    const t = setInterval(fetchRows, 15000);
    return () => clearInterval(t);
  }, []);

  const total = rows.length;
  const succeeded = rows.filter((r) => r.execution_status === "pr_created").length;
  const failed = rows.filter((r) => r.execution_status === "failed").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Closed-Loop Audit Trail</h3>
          <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/5 text-emerald-400">
            Live
          </span>
        </div>
        <Button onClick={fetchRows} variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Every executed decision is persisted with its repository, finding, branch, and resulting GitHub PR — providing full auditability for governance review.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-border bg-background/40 p-3 text-center">
          <div className="font-display text-2xl font-bold text-foreground">{total}</div>
          <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Total Executions</div>
        </div>
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-center">
          <div className="font-display text-2xl font-bold text-emerald-400">{succeeded}</div>
          <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">PRs Opened</div>
        </div>
        <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-center">
          <div className="font-display text-2xl font-bold text-red-400">{failed}</div>
          <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Failures</div>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Loading audit trail…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          No executions logged yet. Trigger an "AI Auto-Fix" in Layer 4 → Execute Real PR to populate.
        </p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {rows.map((r) => {
            const cfg = statusConfig[r.execution_status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={r.id} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3 flex items-start justify-between gap-3 flex-wrap`}>
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Icon className={`w-3.5 h-3.5 ${cfg.color} mt-0.5 shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-display text-[10px] uppercase tracking-wider font-bold ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{r.repository}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-foreground/80 truncate">{r.finding}</p>
                  </div>
                </div>
                {r.pr_url && (
                  <a
                    href={r.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline shrink-0"
                  >
                    PR #{r.pr_number}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ClosedLoopAuditPanel;