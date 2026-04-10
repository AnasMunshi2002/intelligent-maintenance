import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Finding {
  originalFinding: string;
  businessImpact: string;
  incidentProbability: number;
  fixSuggestion: string;
  fixProbability: number;
  estimatedEffort: string;
  automatable: boolean;
}

interface AnalysisInput {
  riskLevel: string;
  summary: string;
  prioritizedFindings: Finding[];
  patterns: string[];
  actionPlan: { priority: number; action: string; rationale: string }[];
}

type JidokaDecision = "auto_fix" | "supervised" | "human_required";

interface JidokaRouted {
  finding: Finding;
  confidence: number;
  decision: JidokaDecision;
  reasoning: string;
  ciAction: string;
}

function computeConfidence(f: Finding): number {
  // Weighted formula: fix probability (50%), incident probability inversion (20%), automatable bonus (20%), effort penalty (10%)
  let score = f.fixProbability * 0.5;
  score += (100 - f.incidentProbability) * 0.2;
  score += f.automatable ? 20 : 0;

  const effort = f.estimatedEffort?.toLowerCase() || "";
  if (effort.includes("hour") || effort.includes("minute")) score += 10;
  else if (effort.includes("day")) score += 5;
  else score += 0;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function routeDecision(confidence: number, impact: string): { decision: JidokaDecision; reasoning: string; ciAction: string } {
  if (confidence >= 90) {
    return {
      decision: "auto_fix",
      reasoning: `Confidence ${confidence}% ≥ 90% threshold. Fix is well-understood and automatable.`,
      ciAction: "Auto-apply patch → run test suite → deploy via CI/CD → log to audit trail",
    };
  }
  if (confidence >= 70) {
    const isCritical = impact === "critical" || impact === "high";
    return {
      decision: "supervised",
      reasoning: `Confidence ${confidence}% in 70–90% range.${isCritical ? " High business impact requires human approval." : " Generating PR for review."}`,
      ciAction: "Generate fix PR → assign reviewer → run CI checks → await approval → merge & deploy",
    };
  }
  return {
    decision: "human_required",
    reasoning: `Confidence ${confidence}% < 70% threshold. Requires human expertise for diagnosis and resolution.`,
    ciAction: "Create detailed issue ticket → assign to team lead → attach AI analysis context → monitor SLA",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, scanResult } = await req.json();
    if (!analysis) {
      return new Response(JSON.stringify({ error: "analysis is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input = analysis as AnalysisInput;
    const routedFindings: JidokaRouted[] = [];
    const stats = { auto_fix: 0, supervised: 0, human_required: 0 };

    for (const f of input.prioritizedFindings || []) {
      const confidence = computeConfidence(f);
      const { decision, reasoning, ciAction } = routeDecision(confidence, f.businessImpact);
      stats[decision]++;
      routedFindings.push({ finding: f, confidence, decision, reasoning, ciAction });
    }

    // Sort: auto-fixable first (quick wins), then supervised, then human
    routedFindings.sort((a, b) => b.confidence - a.confidence);

    const totalFindings = routedFindings.length;
    const automationRate = totalFindings > 0
      ? Math.round(((stats.auto_fix + stats.supervised) / totalFindings) * 100)
      : 0;

    const estimatedTimeSaved = routedFindings
      .filter((r) => r.decision === "auto_fix")
      .reduce((total, r) => {
        const effort = r.finding.estimatedEffort?.toLowerCase() || "";
        if (effort.includes("hour")) return total + parseFloat(effort) || total + 2;
        if (effort.includes("day")) return total + (parseFloat(effort) || 1) * 8;
        if (effort.includes("minute")) return total + (parseFloat(effort) || 30) / 60;
        return total + 1;
      }, 0);

    const result = {
      repo: scanResult?.repo || "unknown",
      riskLevel: input.riskLevel,
      routedFindings,
      stats,
      summary: {
        totalFindings,
        automationRate,
        estimatedTimeSavedHours: Math.round(estimatedTimeSaved * 10) / 10,
        autoFixCount: stats.auto_fix,
        supervisedCount: stats.supervised,
        humanRequiredCount: stats.human_required,
      },
      pipeline: [
        { step: 1, name: "Assessment", status: "complete", detail: `${scanResult?.totalIssues || 0} issues scanned` },
        { step: 2, name: "Intelligence", status: "complete", detail: `${totalFindings} findings analyzed by AI` },
        { step: 3, name: "Jidoka Routing", status: "complete", detail: `${stats.auto_fix} auto / ${stats.supervised} supervised / ${stats.human_required} manual` },
        { step: 4, name: "Execution", status: "pending", detail: "Awaiting CI/CD integration" },
      ],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("jidoka-route error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
