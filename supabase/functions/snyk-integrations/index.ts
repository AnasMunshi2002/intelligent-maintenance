import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SNYK_TOKEN = Deno.env.get("SNYK_API_TOKEN");
  const SNYK_ORG_ID = Deno.env.get("SNYK_ORG_ID");

  // Try v1 API with "token" prefix
  const v1Res = await fetch(`https://snyk.io/api/v1/org/${SNYK_ORG_ID}/integrations`, {
    headers: { Authorization: `token ${SNYK_TOKEN}` },
  });
  const v1Status = v1Res.status;
  const v1Body = await v1Res.text();

  // Try REST API with "token" prefix  
  const restRes = await fetch(`https://api.snyk.io/rest/self?version=2024-10-15`, {
    headers: { Authorization: `token ${SNYK_TOKEN}` },
  });
  const restStatus = restRes.status;
  const restBody = await restRes.text();

  return new Response(JSON.stringify({
    tokenLength: SNYK_TOKEN?.length || 0,
    tokenPrefix: SNYK_TOKEN?.substring(0, 8) || "none",
    orgId: SNYK_ORG_ID,
    v1: { status: v1Status, body: v1Body.slice(0, 300) },
    rest: { status: restStatus, body: restBody.slice(0, 300) },
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
