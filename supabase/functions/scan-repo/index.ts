import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  languages_url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { owner, repo } = await req.json();
    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "owner and repo are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GITHUB_TOKEN = Deno.env.get("GITHUB_ACCESS_TOKEN");
    const SNYK_TOKEN = Deno.env.get("SNYK_API_TOKEN");

    const ghHeaders: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "IntelliOps-Scanner",
    };
    if (GITHUB_TOKEN) {
      ghHeaders["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    // ──────── 1. GitHub: repo info ────────
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: ghHeaders,
    });
    if (!repoRes.ok) {
      const errText = await repoRes.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error (${repoRes.status}): ${errText}` }),
        { status: repoRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const repoInfo: GitHubRepoInfo = await repoRes.json();

    // ──────── 2. GitHub: languages breakdown ────────
    const langRes = await fetch(repoInfo.languages_url, { headers: ghHeaders });
    const languages: Record<string, number> = langRes.ok ? await langRes.json() : {};

    // ──────── 3. GitHub: code scanning alerts (if available) ────────
    let codeAlerts: any[] = [];
    try {
      const alertsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts?per_page=50&state=open`,
        { headers: ghHeaders }
      );
      if (alertsRes.ok) {
        codeAlerts = await alertsRes.json();
      } else {
        // 403/404 means code scanning not enabled – that's fine
        await alertsRes.text();
      }
    } catch {
      // ignore
    }

    // ──────── 4. GitHub: Dependabot / security advisories ────────
    let dependabotAlerts: any[] = [];
    try {
      const depRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/dependabot/alerts?per_page=50&state=open`,
        { headers: ghHeaders }
      );
      if (depRes.ok) {
        dependabotAlerts = await depRes.json();
      } else {
        await depRes.text();
      }
    } catch {
      // ignore
    }

    // ──────── 5. Snyk: test the repo ────────
    let snykVulns: any[] = [];
    let snykError: string | null = null;
    if (SNYK_TOKEN) {
      try {
        // Try Snyk's test endpoint for GitHub repos
        const snykRes = await fetch(
          `https://snyk.io/api/v1/test/github/${owner}/${repo}`,
          {
            headers: {
              Authorization: `token ${SNYK_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (snykRes.ok) {
          const snykData = await snykRes.json();
          if (snykData.issues?.vulnerabilities) {
            snykVulns = snykData.issues.vulnerabilities.slice(0, 30);
          }
        } else {
          const t = await snykRes.text();
          snykError = `Snyk API ${snykRes.status}: ${t.slice(0, 200)}`;
        }
      } catch (e) {
        snykError = `Snyk request failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    // ──────── 6. GitHub: recent commits for activity ────────
    let recentCommits = 0;
    try {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
        { headers: ghHeaders }
      );
      if (commitsRes.ok) {
        const commits = await commitsRes.json();
        recentCommits = Array.isArray(commits) ? commits.length : 0;
      } else {
        await commitsRes.text();
      }
    } catch {
      // ignore
    }

    // ──────── 7. GitHub: contributors ────────
    let contributorCount = 0;
    try {
      const contribRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
        { headers: ghHeaders }
      );
      if (contribRes.ok) {
        // Use Link header to get total count
        const linkHeader = contribRes.headers.get("Link");
        if (linkHeader) {
          const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          contributorCount = lastMatch ? parseInt(lastMatch[1]) : 1;
        } else {
          const data = await contribRes.json();
          contributorCount = Array.isArray(data) ? data.length : 1;
        }
      } else {
        await contribRes.text();
      }
    } catch {
      // ignore
    }

    // ──────── Build response ────────
    const findings: any[] = [];

    // Map code scanning alerts to findings
    for (const alert of codeAlerts) {
      findings.push({
        source: "GitHub CodeQL",
        severity: mapGitHubSeverity(alert.rule?.security_severity_level || alert.rule?.severity),
        category: alert.rule?.tags?.includes("security") ? "Security" : "Code Quality",
        message: alert.rule?.description || alert.rule?.name || "Code scanning alert",
        file: alert.most_recent_instance?.location?.path || "unknown",
        line: alert.most_recent_instance?.location?.start_line || 0,
      });
    }

    // Map Dependabot alerts
    for (const alert of dependabotAlerts) {
      findings.push({
        source: "Dependabot",
        severity: mapGitHubSeverity(alert.security_advisory?.severity),
        category: "Dependencies",
        message: `${alert.security_advisory?.summary || "Vulnerability"} in ${alert.dependency?.package?.name || "package"}`,
        file: alert.dependency?.manifest_path || "package.json",
        line: 0,
      });
    }

    // Map Snyk vulnerabilities
    for (const vuln of snykVulns) {
      findings.push({
        source: "Snyk (DeepCode)",
        severity: mapSnykSeverity(vuln.severity),
        category: "Security",
        message: vuln.title || vuln.description || "Vulnerability detected",
        file: vuln.from?.[0] || vuln.packageName || "unknown",
        line: 0,
      });
    }

    // Compute health scores from real data
    const totalLangBytes = Object.values(languages).reduce((a, b) => a + (b as number), 0);
    const primaryLang = Object.entries(languages).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const highCount = findings.filter((f) => f.severity === "high").length;
    const mediumCount = findings.filter((f) => f.severity === "medium").length;

    const securityFindings = findings.filter((f) => f.category === "Security").length;
    const depFindings = findings.filter((f) => f.category === "Dependencies").length;

    // Score computation based on real data
    const securityScore = Math.max(0, 100 - securityFindings * 12 - criticalCount * 20);
    const depScore = Math.max(0, 100 - depFindings * 8 - dependabotAlerts.length * 5);
    const complexityScore = repoInfo.size > 50000 ? 45 : repoInfo.size > 10000 ? 65 : 80;
    const activityScore = recentCommits > 50 ? 90 : recentCommits > 20 ? 75 : recentCommits > 5 ? 60 : 35;
    const overallIssues = findings.length;

    const gradeFor = (s: number) => {
      if (s >= 90) return { grade: "A", color: "text-emerald-400" };
      if (s >= 80) return { grade: "B+", color: "text-emerald-400" };
      if (s >= 70) return { grade: "B", color: "text-amber-400" };
      if (s >= 60) return { grade: "C", color: "text-amber-400" };
      if (s >= 50) return { grade: "D", color: "text-red-400" };
      return { grade: "F", color: "text-red-400" };
    };

    const healthScores = [
      { category: "Security", score: securityScore, ...gradeFor(securityScore) },
      { category: "Dependencies", score: depScore, ...gradeFor(depScore) },
      { category: "Code Complexity", score: complexityScore, ...gradeFor(complexityScore) },
      { category: "Activity & Maintenance", score: activityScore, ...gradeFor(activityScore) },
    ];

    const avgScore = Math.round(healthScores.reduce((a, b) => a + b.score, 0) / healthScores.length);
    const techDebtHours = criticalCount * 16 + highCount * 8 + mediumCount * 4 + Math.round(repoInfo.size / 500);

    const result = {
      repo: `${owner}/${repo}`,
      repoInfo: {
        description: repoInfo.description,
        primaryLanguage: primaryLang ? primaryLang[0] : repoInfo.language,
        languages: Object.keys(languages),
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        sizeKb: repoInfo.size,
        contributors: contributorCount,
        recentCommits,
      },
      totalIssues: overallIssues,
      techDebtHours,
      overallScore: avgScore,
      healthScores,
      findings: findings.slice(0, 20), // top 20
      dataSources: {
        github: true,
        codeScanning: codeAlerts.length > 0,
        dependabot: dependabotAlerts.length > 0,
        snyk: snykVulns.length > 0,
        snykError,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-repo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function mapGitHubSeverity(s: string | undefined): string {
  if (!s) return "medium";
  const lower = s.toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high" || lower === "error") return "high";
  if (lower === "medium" || lower === "warning") return "medium";
  return "low";
}

function mapSnykSeverity(s: string | undefined): string {
  if (!s) return "medium";
  const lower = s.toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}
