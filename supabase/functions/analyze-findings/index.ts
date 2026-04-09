import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanResult } = await req.json();
    if (!scanResult) {
      return new Response(JSON.stringify({ error: "scanResult is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are IntelliOps Layer 2 — an AI-powered software intelligence engine that analyzes code assessment results and provides actionable recommendations.

Given a repository's scan results (from GitHub CodeQL, Dependabot, and Snyk), you must:
1. Prioritize the findings by business impact and exploitability
2. For each finding, predict the likelihood of it causing a production incident
3. Generate a concrete fix suggestion with estimated fix probability
4. Identify hidden patterns and correlations between findings
5. Provide an overall risk assessment and recommended action plan

Be specific, technical, and data-driven. Reference actual file paths and vulnerability IDs when available.`;

    const userPrompt = `Analyze these scan results for repository "${scanResult.repo}":

Repository Info:
- Primary Language: ${scanResult.repoInfo?.primaryLanguage || "Unknown"}
- Size: ${scanResult.repoInfo?.sizeKb || 0} KB
- Open Issues: ${scanResult.repoInfo?.openIssues || 0}
- Recent Commits: ${scanResult.repoInfo?.recentCommits || 0}
- Contributors: ${scanResult.repoInfo?.contributors || 0}

Overall Health Score: ${scanResult.overallScore}/100
Total Issues Found: ${scanResult.totalIssues}
Estimated Tech Debt: ${scanResult.techDebtHours} hours

Health Breakdown:
${scanResult.healthScores?.map((h: any) => `- ${h.category}: ${h.score}/100 (${h.grade})`).join("\n") || "N/A"}

Top Findings:
${scanResult.findings?.map((f: any, i: number) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.source}: ${f.message} (${f.file}${f.line ? `:${f.line}` : ""})`).join("\n") || "No findings"}

Data Sources Active: GitHub=${scanResult.dataSources?.github}, CodeQL=${scanResult.dataSources?.codeScanning}, Dependabot=${scanResult.dataSources?.dependabot}, Snyk=${scanResult.dataSources?.snyk}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_analysis",
              description: "Provide structured Layer 2 intelligence analysis of scan results",
              parameters: {
                type: "object",
                properties: {
                  riskLevel: {
                    type: "string",
                    enum: ["critical", "high", "medium", "low"],
                    description: "Overall risk level for this repository",
                  },
                  summary: {
                    type: "string",
                    description: "2-3 sentence executive summary of the analysis",
                  },
                  prioritizedFindings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        originalFinding: { type: "string", description: "The original finding message" },
                        businessImpact: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        incidentProbability: { type: "number", description: "0-100 probability of causing incident" },
                        fixSuggestion: { type: "string", description: "Specific technical fix recommendation" },
                        fixProbability: { type: "number", description: "0-100 confidence the fix will resolve the issue" },
                        estimatedEffort: { type: "string", description: "e.g. 2h, 1d, 3d" },
                        automatable: { type: "boolean", description: "Can this be auto-fixed by CI/CD?" },
                      },
                      required: ["originalFinding", "businessImpact", "incidentProbability", "fixSuggestion", "fixProbability", "estimatedEffort", "automatable"],
                    },
                  },
                  patterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "Cross-cutting patterns and correlations detected",
                  },
                  actionPlan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        priority: { type: "number", description: "1 = highest" },
                        action: { type: "string" },
                        rationale: { type: "string" },
                      },
                      required: ["priority", "action", "rationale"],
                    },
                  },
                },
                required: ["riskLevel", "summary", "prioritizedFindings", "patterns", "actionPlan"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_analysis" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiRes.text();
      console.error("AI Gateway error:", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: use content directly
      analysis = {
        riskLevel: "medium",
        summary: aiData.choices?.[0]?.message?.content || "Analysis completed.",
        prioritizedFindings: [],
        patterns: [],
        actionPlan: [],
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-findings error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
