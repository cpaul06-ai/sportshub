import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigin = "https://cpaul06-ai.github.io";
const headers = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=45, s-maxage=45",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const get = (path: string) => fetch(`https://api.sleeper.app/v1${path}`).then(async (response) => {
  if (!response.ok) throw new Error(`Sleeper request failed (${response.status})`);
  return response.json();
});

let playerCache: { at: number; players: Record<string, any> } | null = null;
async function getPlayers() {
  if (playerCache && Date.now() - playerCache.at < 6 * 60 * 60 * 1000) return playerCache.players;
  const players = await get("/players/nfl");
  playerCache = { at: Date.now(), players };
  return players as Record<string, any>;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("league") || "";
  const managedIds = [...new Set((url.searchParams.get("teams") || "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0 && id <= 64))].slice(0, 6);
  if (!/^\d{6,30}$/.test(leagueId)) return json({ error: "Valid Sleeper league ID required" }, 400);

  try {
    const [nflState, league, rosters, users, tradedPicks, playerData] = await Promise.all([
      get("/state/nfl"),
      get(`/league/${leagueId}`),
      get(`/league/${leagueId}/rosters`),
      get(`/league/${leagueId}/users`),
      get(`/league/${leagueId}/traded_picks`).catch(() => []),
      getPlayers(),
    ]);
    const week = Math.max(1, Math.min(18, +(nflState.week || nflState.leg || 1)));
    const weeks = [...new Set([week, week - 1, week - 2, week - 3].filter((value) => value > 0))];
    const [matchups, transactionGroups] = await Promise.all([
      get(`/league/${leagueId}/matchups/${week}`).catch(() => []),
      Promise.all(weeks.map((value) => get(`/league/${leagueId}/transactions/${value}`).catch(() => []))),
    ]);
    const managerById = Object.fromEntries((users || []).map((user: any) => [user.user_id, {
      userId: user.user_id,
      username: user.username || user.display_name || "manager",
      displayName: user.display_name || user.username || "Manager",
      teamName: user.metadata?.team_name || user.display_name || user.username || "Team",
      avatar: user.avatar || null,
    }]));
    const matchupByRoster = Object.fromEntries((matchups || []).map((matchup: any) => [String(matchup.roster_id), matchup]));
    const playerIds = new Set<string>();
    for (const roster of rosters || []) for (const id of [...(roster.players || []), ...(roster.reserve || []), ...(roster.taxi || [])]) playerIds.add(String(id));
    const players = Object.fromEntries([...playerIds].map((id) => {
      const player = playerData[id] || {};
      return [id, {
        id,
        name: player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ") || `Player ${id}`,
        position: player.position || "",
        team: player.team || null,
        age: player.age || null,
        injuryStatus: player.injury_status || null,
        fantasyPositions: player.fantasy_positions || [],
      }];
    }));
    const rosterRows = (rosters || []).map((roster: any) => {
      const settings = roster.settings || {};
      return {
        rosterId: roster.roster_id,
        managed: managedIds.includes(+roster.roster_id),
        ownerId: roster.owner_id,
        manager: managerById[roster.owner_id] || { username: "manager", displayName: "Manager", teamName: `Team ${roster.roster_id}`, avatar: null },
        record: { wins: +settings.wins || 0, losses: +settings.losses || 0, ties: +settings.ties || 0 },
        pointsFor: (+settings.fpts || 0) + (+settings.fpts_decimal || 0) / 100,
        pointsAgainst: (+settings.fpts_against || 0) + (+settings.fpts_against_decimal || 0) / 100,
        waiverPosition: +settings.waiver_position || null,
        faabUsed: +settings.waiver_budget_used || 0,
        players: roster.players || [],
        starters: roster.starters || [],
        reserve: roster.reserve || [],
        taxi: roster.taxi || [],
        matchup: matchupByRoster[String(roster.roster_id)] || null,
      };
    });
    return json({
      generatedAt: new Date().toISOString(),
      source: "Sleeper public API",
      currentWeek: week,
      managedRosterIds: managedIds,
      league: {
        id: leagueId,
        name: league.name,
        season: league.season,
        status: league.status,
        totalRosters: league.total_rosters,
        rosterPositions: league.roster_positions || [],
        scoringSettings: league.scoring_settings || {},
        settings: league.settings || {},
      },
      managedRosters: rosterRows.filter((row: any) => row.managed),
      rosters: rosterRows,
      players,
      transactions: transactionGroups.flat().sort((a: any, b: any) => (+b.status_updated || +b.created || 0) - (+a.status_updated || +a.created || 0)).slice(0, 150),
      tradedPicks,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to load Sleeper league" }, 502);
  }
});
