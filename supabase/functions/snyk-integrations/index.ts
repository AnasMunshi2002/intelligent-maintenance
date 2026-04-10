import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SNYK_TOKEN = Deno.env.get("SNYK_API_TOKEN");
  const SNYK_ORG_ID = Deno.env.get("SNYK_ORG_ID");

  const res = await fetch(`https://snyk.io/api/v1/org/${SNYK_ORG_ID}/integrations`, {
    headers: { Authorization: `token ${SNYK_TOKEN}`, "Content-Type": "application/json" },
  });
  const data = await res.text();
  return new Response(data, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
