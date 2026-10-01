(() => {
  const view = document.querySelector("#fantasyView");
  if (!view) return;
  const POSITIONS = ["QB", "RB", "WR", "TE"];
  const FALLBACK = [
    ["jjefferson", "Justin", "Jefferson", "WR", "MIN", 1, 27],
    ["jchase", "Ja'Marr", "Chase", "WR", "CIN", 2, 26],
    ["brobinson", "Bijan", "Robinson", "RB", "ATL", 3, 24],
    ["saquon", "Saquon", "Barkley", "RB", "PHI", 4, 29],
    ["ceedee", "CeeDee", "Lamb", "WR", "DAL", 5, 27],
    ["gibbs", "Jahmyr", "Gibbs", "RB", "DET", 6, 24],
    ["amonra", "Amon-Ra", "St. Brown", "WR", "DET", 7, 26],
    ["puka", "Puka", "Nacua", "WR", "LAR", 8, 25],
    ["lamar", "Lamar", "Jackson", "QB", "BAL", 9, 29],
    ["allen", "Josh", "Allen", "QB", "BUF", 10, 30],
    ["henry", "Derrick", "Henry", "RB", "BAL", 18, 32],
    ["chasebrown", "Chase", "Brown", "RB", "CIN", 25, 26],
    ["olave", "Chris", "Olave", "WR", "NO", 28, 26],
    ["london", "Drake", "London", "WR", "ATL", 24, 25],
    ["waddle", "Jaylen", "Waddle", "WR", "MIA", 32, 27],
    ["bonix", "Bo", "Nix", "QB", "DEN", 40, 26],
  ].map(([player_id, first_name, last_name, position, team, search_rank, age]) => ({
    player_id, first_name, last_name, position, team, search_rank, age, active: true,
  }));
  let players = FALLBACK,
    initialized = false,
    state = normalize(decodeTrade() || window.store?.tradeAnalyzer || {});

  function makeTeam(n) {
    return { id: crypto.randomUUID?.() || String(Date.now() + n), name: `Team ${n}`, assets: [] };
  }
  function normalize(s) {
    const teams = Array.isArray(s.teams) && s.teams.length >= 2 ? s.teams : [makeTeam(1), makeTeam(2)];
    return { format: s.format || "redraft", scoring: s.scoring || "ppr", qb: s.qb || "1qb", teams: teams.slice(0, 6), saved: Array.isArray(s.saved) ? s.saved : [], sleeper: s.sleeper || null };
  }
  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function value(p) {
    const rank = Math.max(1, Math.min(220, +p.search_rank || 160));
    let v = Math.max(8, Math.round(101 - rank * 0.43));
    if (state.qb === "superflex" && p.position === "QB") v = Math.min(99, v + 22);
    if (state.scoring === "ppr" && p.position === "WR") v += 3;
    if (state.scoring === "standard" && p.position === "RB") v += 3;
    if (state.format === "dynasty") {
      const age = +p.age || 27;
      v += Math.max(-20, Math.min(14, (27 - age) * 3));
      if (p.position === "QB") v += 5;
    }
    if (p.injury_status === "Out" || p.injury_status === "IR") v -= 18;
    else if (p.injury_status) v -= 7;
    return Math.max(1, Math.min(99, Math.round(v)));
  }
  function headshot(p) {
    return p.espn_id ? `https://a.espncdn.com/i/headshots/nfl/players/full/${p.espn_id}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${p.player_id}.jpg`;
  }
  function persist() {
    window.store.tradeAnalyzer = state;
    localStorage.setItem("carson-power-rankings", JSON.stringify(window.store));
    window.queueCloudSave?.();
  }
  function decodeTrade() {
    try {
      const m = location.hash.match(/trade=([^&]+)/);
      return m ? JSON.parse(decodeURIComponent(escape(atob(m[1])))) : null;
    } catch { return null; }
  }
  function encodeTrade() {
    const share = { format: state.format, scoring: state.scoring, qb: state.qb, teams: state.teams };
    return btoa(unescape(encodeURIComponent(JSON.stringify(share))));
  }
  function leagueLabel() {
    return `${state.format === "dynasty" ? "Dynasty" : "Redraft"} · ${state.scoring === "ppr" ? "PPR" : state.scoring === "half" ? "Half-PPR" : "Standard"} · ${state.qb === "superflex" ? "Superflex" : "1QB"}`;
  }
  function destinations(team) {
    return state.teams.filter((t) => t.id !== team.id).map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  }
  function assetPlayer(a) {
    return players.find((p) => p.player_id === a.playerId) || a.player || { player_id: a.playerId, first_name: "Unknown", last_name: "Player", position: "", team: "" };
  }
  function totals() {
    const out = {};
    state.teams.forEach((t) => (out[t.id] = { sent: 0, received: 0, risks: [], pieces: 0 }));
    state.teams.forEach((t) => t.assets.forEach((a) => {
      const v = a.type === "faab" ? Math.round((+a.amount || 0) * 0.055) : value(assetPlayer(a));
      out[t.id].sent += v;
      if (out[a.to]) {
        out[a.to].received += v;
        out[a.to].pieces++;
        if (a.type === "player" && assetPlayer(a).injury_status) out[a.to].risks.push(`${assetPlayer(a).first_name} ${assetPlayer(a).last_name} (${assetPlayer(a).injury_status})`);
      }
    }));
    return out;
  }
  function render() {
    const total = totals(), nets = state.teams.map((t) => total[t.id].received - total[t.id].sent), spread = Math.max(...nets) - Math.min(...nets), fair = Math.max(0, Math.round(100 - spread * 2.25)), winner = Math.max(...nets), cols = Math.min(4, state.teams.length);
    view.innerHTML = `<div class="tradeHero"><div><div class="tradeHeroMark">LEDGE FANTASY LAB</div><h1>Trade Analyzer</h1><p>Build two-team deals or full multi-team chaos. Every side gets graded.</p></div><button class="tradeAction primary" data-new-trade>New trade</button></div>
      <div class="tradeSettings"><label class="tradeSetting"><span>League</span><select data-setting="format"><option value="redraft">Redraft</option><option value="dynasty">Dynasty</option></select></label><label class="tradeSetting"><span>Scoring</span><select data-setting="scoring"><option value="ppr">PPR</option><option value="half">Half-PPR</option><option value="standard">Standard</option></select></label><label class="tradeSetting"><span>Quarterbacks</span><select data-setting="qb"><option value="1qb">1QB</option><option value="superflex">Superflex / 2QB</option></select></label><button class="tradeAction sleeperSync" data-sync-sleeper>${state.sleeper?.leagueName ? `✓ ${esc(state.sleeper.leagueName)}` : "Sync Sleeper"}</button><button class="tradeAction" data-add-team ${state.teams.length >= 6 ? "disabled" : ""}>＋ Add team</button><button class="tradeAction" data-save-trade>Save</button><button class="tradeAction" data-share-trade>Share link</button><button class="tradeAction" data-post-trade>Post to feed</button></div>
      <div class="tradeBoard" style="--trade-cols:${cols}">${state.teams.map((t, i) => teamCard(t, i, total[t.id])).join("")}</div>${analysis(total, nets, fair, winner)}${savedList()}`;
    view.querySelectorAll("[data-setting]").forEach((s) => { s.value = state[s.dataset.setting]; s.onchange = () => { state[s.dataset.setting] = s.value; persist(); render(); }; });
    bind();
  }
  function teamCard(t, i, sum) {
    const assets = t.assets.map((a, j) => assetRow(t, a, j)).join("") || '<div class="tradeEmpty">No outgoing assets yet</div>';
    const rosterPick = state.sleeper?.rosters?.length ? `<select class="rosterSelect" aria-label="Sleeper manager"><option value="">Choose manager</option>${state.sleeper.rosters.map((r) => `<option value="${r.rosterId}">${esc(r.name)}</option>`).join("")}</select>` : `<input class="tradeTeamName" value="${esc(t.name)}" aria-label="Team name">`;
    return `<section class="tradeTeam" data-team="${t.id}"><div class="tradeTeamHead"><span class="tradeTeamNum">${i + 1}</span>${rosterPick}<button class="removeTradeTeam" ${state.teams.length <= 2 ? "hidden" : ""} title="Remove team">×</button></div><div class="tradeTeamBody"><div class="tradeLabel"><span>Sends</span><span>${sum.sent} value</span></div><div class="tradeSearch"><input placeholder="Search ${state.sleeper?.leagueName ? "this roster" : "NFL players"}…" aria-label="Search players"><div class="playerResults" hidden></div></div><div class="tradeAssets">${assets}</div><div class="faabRow"><input type="number" min="1" max="1000" placeholder="FAAB $"><select>${destinations(t)}</select><button type="button">Add FAAB</button></div><div class="teamLedger"><div class="ledgerStat"><span>Receives</span><b>${sum.received}</b></div><div class="ledgerStat"><span>Net value</span><b class="${sum.received - sum.sent >= 0 ? "positive" : ""}">${sum.received - sum.sent >= 0 ? "+" : ""}${sum.received - sum.sent}</b></div></div></div></section>`;
  }
  function assetRow(team, a, j) {
    if (a.type === "faab") return `<div class="tradeAsset"><div class="marketValue">$</div><div class="tradeAssetInfo"><b>$${a.amount} FAAB</b><div class="assetRoute"><span>to</span><select data-route="${j}">${destinations(team)}</select></div></div><div class="assetTools"><span class="marketValue">${Math.round(a.amount * 0.055)}</span><button class="assetRemove" data-remove="${j}">×</button></div></div>`;
    const p = assetPlayer(a);
    return `<div class="tradeAsset"><img src="${headshot(p)}" onerror="this.src='assets/ledge-logo.png'"><div class="tradeAssetInfo"><b>${esc(p.first_name)} ${esc(p.last_name)}</b><small>${esc(p.position || "")} · ${esc(p.team || "FA")}${p.injury_status ? ` · ${esc(p.injury_status)}` : ""}</small><div class="assetRoute"><span>to</span><select data-route="${j}">${destinations(team)}</select></div></div><div class="assetTools"><span class="marketValue">${value(p)}</span><button class="assetRemove" data-remove="${j}">×</button></div></div>`;
  }
  function analysis(total, nets, fair, winner) {
    const verdict = fair >= 90 ? "Dead even" : fair >= 75 ? "Fair trade" : fair >= 55 ? "Leans one way" : "Major imbalance";
    return `<section class="tradeAnalysis"><div class="analysisHead"><div><div class="tradeHeroMark">LEDGE VERDICT</div><h2>${verdict}</h2></div><div class="fairness"><b>${fair}%</b><span>Balance score</span></div></div><div class="analysisGrid">${state.teams.map((t, i) => { const x = total[t.id], n = nets[i], win = n === winner && winner > 0, risk = x.risks.length ? ` Injury risk: ${x.risks.join(", ")}.` : ""; return `<article class="analysisTeam ${win ? "winner" : ""}"><h3>${esc(t.name)}${win ? " · Best return" : ""}</h3><div class="analysisNet ${n >= 0 ? "positive" : "negative"}">${n >= 0 ? "+" : ""}${n}</div><p>Receives ${x.pieces} asset${x.pieces === 1 ? "" : "s"} worth ${x.received}; sends ${x.sent}.${risk}</p></article>`; }).join("")}</div><div class="tradeFooter"><span class="tradeSource">Ledge Market Value blends player-market rank, positional scarcity, league settings, age for dynasty, and current injury status. Player and league data powered by Sleeper; values are independent Ledge estimates.</span></div></section>`;
  }
  function savedList() {
    if (!state.saved.length) return "";
    return `<section class="savedTrades"><h3>Saved trades</h3>${state.saved.slice(0, 8).map((s, i) => `<div class="savedTradeRow"><div><b>${esc(s.name)}</b><small>${esc(s.label)} · ${new Date(s.createdAt).toLocaleDateString()}</small></div><button data-load-saved="${i}">Open</button></div>`).join("")}</section>`;
  }
  function bind() {
    view.querySelector("[data-add-team]").onclick = () => { state.teams.push(makeTeam(state.teams.length + 1)); persist(); render(); };
    view.querySelector("[data-new-trade]").onclick = () => { if (confirm("Start a new trade?")) { state.teams = [makeTeam(1), makeTeam(2)]; persist(); render(); } };
    view.querySelector("[data-sync-sleeper]").onclick = openSleeperSync;
    view.querySelectorAll(".tradeTeam").forEach((card) => {
      const t = state.teams.find((x) => x.id === card.dataset.team), name = card.querySelector(".tradeTeamName"), roster = card.querySelector(".rosterSelect"), search = card.querySelector(".tradeSearch input"), results = card.querySelector(".playerResults");
      if (name) name.oninput = () => { t.name = name.value; persist(); };
      if (roster) { roster.value = t.rosterId || ""; roster.onchange = () => { t.rosterId = roster.value; const r = state.sleeper.rosters.find((x) => String(x.rosterId) === roster.value); if (r) t.name = r.name; t.assets = []; persist(); render(); }; }
      card.querySelector(".removeTradeTeam").onclick = () => { state.teams = state.teams.filter((x) => x.id !== t.id); state.teams.forEach((x) => (x.assets = x.assets.filter((a) => a.to !== t.id))); persist(); render(); };
      search.oninput = () => showResults(t, search.value, results);
      search.onfocus = () => showResults(t, search.value, results);
      card.querySelectorAll("[data-route]").forEach((s) => { const a = t.assets[+s.dataset.route]; s.value = a.to || state.teams.find((x) => x.id !== t.id)?.id; s.onchange = () => { a.to = s.value; persist(); render(); }; });
      card.querySelectorAll("[data-remove]").forEach((b) => (b.onclick = () => { t.assets.splice(+b.dataset.remove, 1); persist(); render(); }));
      const f = card.querySelector(".faabRow"), amount = f.querySelector("input"), to = f.querySelector("select");
      f.querySelector("button").onclick = () => { if (+amount.value <= 0) return window.toast?.("Enter a FAAB amount"); t.assets.push({ type: "faab", amount: +amount.value, to: to.value }); persist(); render(); };
    });
    view.querySelector("[data-save-trade]").onclick = () => { const name = prompt("Name this trade", state.teams.map((t) => t.name).join(" / ")); if (!name) return; state.saved.unshift({ name, label: leagueLabel(), createdAt: new Date().toISOString(), trade: JSON.parse(JSON.stringify({ format: state.format, scoring: state.scoring, qb: state.qb, teams: state.teams, sleeper: state.sleeper })) }); persist(); render(); window.toast?.("Trade saved"); };
    view.querySelector("[data-share-trade]").onclick = shareTrade;
    view.querySelector("[data-post-trade]").onclick = postTrade;
    view.querySelectorAll("[data-load-saved]").forEach((b) => (b.onclick = () => { const s = state.saved[+b.dataset.loadSaved]; Object.assign(state, JSON.parse(JSON.stringify(s.trade))); persist(); render(); }));
  }
  function showResults(team, q, box) {
    q = q.trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; return; }
    const roster = state.sleeper?.rosters?.find((r) => String(r.rosterId) === String(team.rosterId)), allowed = roster ? new Set(roster.players) : null;
    const matches = players.filter((p) => p.active !== false && POSITIONS.includes(p.position) && (!allowed || allowed.has(p.player_id)) && `${p.first_name} ${p.last_name} ${p.team}`.toLowerCase().includes(q)).sort((a, b) => (+a.search_rank || 9999) - (+b.search_rank || 9999)).slice(0, 12);
    box.innerHTML = matches.map((p) => `<button class="playerResult" data-player="${p.player_id}"><img src="${headshot(p)}" onerror="this.src='assets/ledge-logo.png'"><span><b>${esc(p.first_name)} ${esc(p.last_name)}</b><small>${esc(p.position)} · ${esc(p.team || "FA")}${p.injury_status ? ` · ${esc(p.injury_status)}` : ""}</small></span><span class="marketValue">${value(p)}</span></button>`).join("") || '<div class="tradeEmpty">No players found on this roster</div>';
    box.hidden = false;
    box.querySelectorAll("[data-player]").forEach((b) => (b.onclick = () => { const p = players.find((x) => x.player_id === b.dataset.player); team.assets.push({ type: "player", playerId: p.player_id, player: p, to: state.teams.find((x) => x.id !== team.id).id }); persist(); render(); }));
  }
  async function shareTrade() {
    const url = `${location.origin}${location.pathname}#trade=${encodeTrade()}`;
    try {
      if (navigator.share) await navigator.share({ title: "Ledge fantasy trade", text: leagueLabel(), url });
      else { await navigator.clipboard.writeText(url); window.toast?.("Trade link copied"); }
    } catch {}
  }
  async function postTrade() {
    const a = window.ledgeAccount;
    if (!a?.session) return window.toast?.("Sign in to post this trade");
    const total = totals(), summary = state.teams.map((t) => `${t.name} receives ${total[t.id].received} / sends ${total[t.id].sent}`).join(" · "), id = crypto.randomUUID?.() || String(Date.now()), url = `${location.origin}${location.pathname}#trade=${encodeTrade()}`, body = `Fantasy trade — ${leagueLabel()}\n${summary}\nWho wins? ${url}`;
    const { error } = await a.sb.from("posts").insert({ author_id: a.session.user.id, client_id: id, post_type: "Discussion", body, created_at: new Date().toISOString() });
    if (error) return window.toast?.(error.message);
    window.toast?.("Trade posted for community voting");
    document.querySelector('[data-global-view="home"]')?.click();
  }
  function syncDialog() {
    let d = document.querySelector("#sleeperSyncDialog");
    if (d) return d;
    d = document.createElement("dialog");
    d.id = "sleeperSyncDialog";
    d.className = "sleeperDialog";
    d.innerHTML = `<form method="dialog" class="sleeperBox"><button class="sleeperClose" value="cancel" aria-label="Close">×</button><div class="tradeHeroMark">SLEEPER SYNC</div><h2>Connect your league</h2><p>Enter your Sleeper username, then choose a 2026 NFL league. No password is needed.</p><div class="sleeperForm"><input id="sleeperUsername" autocomplete="username" placeholder="Sleeper username"><button type="button" id="findSleeperLeagues">Find leagues</button></div><div id="sleeperLeagueResults"></div>${state.sleeper ? '<button type="button" class="disconnectSleeper">Disconnect Sleeper league</button>' : ""}<small>Roster and league data are read-only. Powered by Sleeper.</small></form>`;
    document.body.append(d);
    d.querySelector("#findSleeperLeagues").onclick = findSleeperLeagues;
    d.querySelector(".disconnectSleeper")?.addEventListener("click", () => { state.sleeper = null; state.teams.forEach((t, i) => { delete t.rosterId; t.name = `Team ${i + 1}`; t.assets = []; }); persist(); d.close(); render(); });
    return d;
  }
  function openSleeperSync() {
    const d = syncDialog();
    d.querySelector("#sleeperUsername").value = state.sleeper?.username || "";
    d.querySelector("#sleeperLeagueResults").innerHTML = state.sleeper ? `<div class="sleeperConnected">Connected to <b>${esc(state.sleeper.leagueName)}</b></div>` : "";
    d.showModal();
  }
  async function findSleeperLeagues() {
    const d = document.querySelector("#sleeperSyncDialog"), username = d.querySelector("#sleeperUsername").value.trim(), box = d.querySelector("#sleeperLeagueResults");
    if (!username) return;
    box.innerHTML = '<div class="sleeperLoading">Finding leagues…</div>';
    try {
      const user = await fetch(`https://api.sleeper.app/v1/user/${encodeURIComponent(username)}`).then((r) => r.ok ? r.json() : null);
      if (!user?.user_id) throw Error("Sleeper user not found");
      const leagues = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/2026`).then((r) => r.ok ? r.json() : []);
      if (!leagues.length) throw Error("No 2026 NFL leagues found");
      box.innerHTML = leagues.map((l) => `<button type="button" class="sleeperLeague" data-league="${l.league_id}"><b>${esc(l.name)}</b><span>${l.total_rosters || ""} teams · ${esc(l.status || "league")}</span></button>`).join("");
      box.querySelectorAll("[data-league]").forEach((b) => (b.onclick = () => connectSleeperLeague(username, b.dataset.league, b)));
    } catch (e) { box.innerHTML = `<div class="sleeperError">${esc(e.message || "Could not load Sleeper leagues")}</div>`; }
  }
  async function connectSleeperLeague(username, leagueId, button) {
    button.textContent = "Syncing rosters…";
    try {
      const [league, rosters, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}`).then((r) => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then((r) => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`).then((r) => r.json()),
      ]), names = Object.fromEntries(users.map((u) => [u.user_id, u.metadata?.team_name || u.display_name || u.username || "Manager"])), imported = rosters.map((r) => ({ rosterId: r.roster_id, ownerId: r.owner_id, name: names[r.owner_id] || `Team ${r.roster_id}`, players: r.players || [] }));
      const ppr = +(league.scoring_settings?.rec || 0), superflex = (league.roster_positions || []).some((x) => x === "SUPER_FLEX" || x === "QB" && (league.roster_positions || []).filter((y) => y === "QB").length > 1);
      state.format = league.settings?.type === 2 || league.name?.toLowerCase().includes("dynasty") ? "dynasty" : "redraft";
      state.scoring = ppr >= 1 ? "ppr" : ppr >= 0.5 ? "half" : "standard";
      state.qb = superflex ? "superflex" : "1qb";
      state.sleeper = { username, leagueId, leagueName: league.name, rosters: imported };
      state.teams.forEach((t, i) => { const r = imported[i]; t.rosterId = r?.rosterId || ""; t.name = r?.name || `Team ${i + 1}`; t.assets = []; });
      persist();
      document.querySelector("#sleeperSyncDialog")?.close();
      render();
      window.toast?.(`${league.name} synced`);
    } catch { window.toast?.("Sleeper league could not sync"); }
  }
  async function loadPlayers() {
    try {
      const cached = JSON.parse(localStorage.getItem("ledge-nfl-players") || "null");
      if (cached && Date.now() - cached.at < 86400000) players = cached.players;
      else {
        const sets = await Promise.all(POSITIONS.map((p) => fetch(`https://api.sleeper.app/v1/players/nfl?position=${p}&active=true`).then((r) => r.ok ? r.json() : {})));
        players = sets.flatMap((x) => Object.values(x)).filter((p) => p.player_id && p.first_name && p.last_name);
        localStorage.setItem("ledge-nfl-players", JSON.stringify({ at: Date.now(), players }));
      }
    } catch {}
    render();
  }
  window.initTradeAnalyzer = () => { if (initialized) return; initialized = true; render(); loadPlayers(); };
  if (location.hash.includes("trade=")) setTimeout(() => document.querySelector('[data-global-view="fantasy"]')?.click(), 0);
  if (!view.hidden) window.initTradeAnalyzer();
})();
