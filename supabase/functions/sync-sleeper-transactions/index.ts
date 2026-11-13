import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const LEAGUE_ID = "1329256524773588992";
const MANAGED_ROSTERS = new Set([3, 10]);
const admin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false } },
);
const sleeper = (path: string) => fetch(`https://api.sleeper.app/v1${path}`).then(async (response) => {
  if (!response.ok) throw new Error(`Sleeper request failed (${response.status})`);
  return response.json();
});
const iso = (value: unknown) => {
  const timestamp = Number(value || 0);
  return timestamp > 0 ? new Date(timestamp).toISOString() : null;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const nflState = await sleeper("/state/nfl");
    const week = Math.max(1, Math.min(18, +(nflState.week || nflState.leg || 1)));
    const weeks = [...new Set([week, week - 1, week - 2, week - 3].filter((value) => value > 0))];
    const groups = await Promise.all(weeks.map((value) => sleeper(`/league/${LEAGUE_ID}/transactions/${value}`).catch(() => [])));
    const transactions = groups.flat();
    const rows = transactions.filter((tx: any) => tx.transaction_id).map((tx: any) => {
      const rosterIds = [...new Set((tx.roster_ids || []).map(Number).filter(Number.isInteger))];
      return {
        transaction_id: String(tx.transaction_id),
        league_id: LEAGUE_ID,
        season: +(nflState.season || 2026),
        week: +(tx.leg || week),
        transaction_type: String(tx.type || "unknown"),
        status: String(tx.status || "unknown"),
        roster_ids: rosterIds,
        managed_roster_ids: rosterIds.filter((id: number) => MANAGED_ROSTERS.has(id)),
        sleeper_created_at: iso(tx.created),
        sleeper_updated_at: iso(tx.status_updated || tx.created),
        payload: tx,
        last_seen_at: new Date().toISOString(),
      };
    });
    if (rows.length) {
      const { error } = await admin.from("fantasy_transaction_events").upsert(rows, {
        onConflict: "transaction_id",
        ignoreDuplicates: false,
      });
      if (error) throw error;
    }
    return new Response(JSON.stringify({ ok: true, leagueId: LEAGUE_ID, week, observed: rows.length }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Sync failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
