import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SNYK_TOKEN = Deno.env.get("SNYK_API_TOKEN");
  const SNYK_ORG_ID = Deno.env.get("SNYK_ORG_ID");

  const endpoints = [
    { name: "self", url: "https://api.snyk.io/rest/self?version=2024-10-15" },
    { name: "orgs", url: "https://api.snyk.io/rest/orgs?version=2024-10-15" },
    { name: "projects", url: `https://api.snyk.io/rest/orgs/${SNYK_ORG_ID}/projects?version=2024-10-15&limit=5` },
    { name: "targets", url: `https://api.snyk.io/rest/orgs/${SNYK_ORG_ID}/targets?version=2024-10-15&limit=5` },
  ];

  const results: any = {};
  for (const ep of endpoints) {
    const res = await fetch(ep.url, {
      headers: { Authorization: `token ${SNYK_TOKEN}`, "Content-Type": "application/vnd.api+json" },
    });
    results[ep.name] = { status: res.status, body: (await res.text()).slice(0, 400) };
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
