const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Public read of the closed-loop audit trail. Returns a sanitized view of
// the most recent decisions (no internal error messages, capped row count).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Server not configured");

    const select = [
      "id",
      "repository",
      "finding",
      "decision",
      "confidence",
      "pr_url",
      "pr_number",
      "branch_name",
      "execution_status",
      "created_at",
    ].join(",");

    const res = await fetch(
      `${url}/rest/v1/decisions?select=${select}&order=created_at.desc&limit=20`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) throw new Error(`Database error: ${res.status}`);
    const rows = await res.json();

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("list-decisions error:", e);
    return new Response(
      JSON.stringify({ rows: [], error: "Failed to load audit trail" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});