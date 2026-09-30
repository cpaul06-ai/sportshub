(() => {
  const YEAR = 2026,
    divisions = {
      "AFC East": ["buf", "mia", "ne", "nyj"],
      "AFC North": ["bal", "cin", "cle", "pit"],
      "AFC South": ["hou", "ind", "jax", "ten"],
      "AFC West": ["den", "kc", "lv", "lac"],
      "NFC East": ["dal", "nyg", "phi", "wsh"],
      "NFC North": ["chi", "det", "gb", "min"],
      "NFC South": ["atl", "car", "no", "tb"],
      "NFC West": ["ari", "lar", "sf", "sea"],
    };
  const header = document.querySelector(".topbar"),
    hero = document.querySelector(".hero"),
    main = document.querySelector("main.grid"),
    nflView = document.querySelector("#nflView");
  const nav = document.createElement("nav");
  nav.className = "productNav";
  nav.innerHTML =
    '<button class="productTab active" data-view="rankings">Power Rankings</button><button class="productTab" data-view="pickem">Pick’em</button>';
  nflView.prepend(nav);
  const rankings = document.createElement("div");
  rankings.id = "rankingsView";
  hero.before(rankings);
  rankings.append(hero, main);
  const pickem = document.createElement("section");
  pickem.id = "pickemView";
  pickem.className = "pickemView";
  pickem.hidden = true;
  rankings.after(pickem);
  const accuracyStyles = document.createElement("style");
  accuracyStyles.textContent =
    '.accuracyMetric{position:relative;overflow:hidden;transition:background .25s,border-color .25s,box-shadow .25s}.accuracyMetric b,.accuracyMetric span{position:relative;z-index:1}.accuracyMetric span{color:#fff}.accuracyMetric.accRed{background:linear-gradient(145deg,#7d1824,#310910);border-color:#d54a59;box-shadow:inset 0 1px #ff8d982e}.accuracyMetric.accYellow{background:linear-gradient(145deg,#8f6c05,#392800);border-color:#d7ad2b;box-shadow:inset 0 1px #ffe68838}.accuracyMetric.accGreen{background:linear-gradient(145deg,#14724e,#082e21);border-color:#35c98c;box-shadow:inset 0 1px #95ffd03d}.accuracyMetric.accGold{background:linear-gradient(135deg,#3a2807 0%,#a97513 28%,#f0d170 49%,#8b5e0c 69%,#2d1d04 100%);border-color:#f5dc83;box-shadow:inset 0 1px #fff5bd91,0 0 18px #d8a62620}.accuracyMetric.accGold:after{content:"";position:absolute;inset:-75% -20%;background:linear-gradient(105deg,transparent 39%,#fff7c875 48%,transparent 57%);transform:translateX(-45%);pointer-events:none}.upsetSummary{display:grid;grid-template-columns:1fr repeat(3,minmax(100px,150px));gap:12px;align-items:center;background:linear-gradient(135deg,#161123,#0c1422);border:1px solid #583f83;border-radius:14px;padding:13px 15px;margin:-6px 0 18px}.upsetTitle b{display:block;font-size:16px}.upsetTitle span{color:#958ca6;font-size:12px}.upsetStat{text-align:center;border-left:1px solid #3a2c50}.upsetStat b{display:block;font-size:20px}.upsetStat span{color:#a59bb5;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.oddsBar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px}.oddsBar span{background:#0a101b;border:1px solid #2a3951;border-radius:7px;padding:5px 8px;color:#b8c2d1;font-size:11px;font-weight:800}.oddsBar .dogOdds{color:#e0c6ff;border-color:#664792;background:#1d132b}.actualDivision h3{color:#31d18b}.standLabel{margin:0 0 12px;color:#8995aa;font-size:13px}.teamLine .divisionLeader{color:#ffc75b;margin-left:6px;font-size:10px}@media(max-width:620px){.upsetSummary{grid-template-columns:1fr 1fr 1fr}.upsetTitle{grid-column:1/-1}.upsetStat:first-of-type{border-left:0}}';
  document.head.append(accuracyStyles);
  const goatStyles = document.createElement("style");
  goatStyles.textContent =
    '.accuracyMetric.accGold b,.accuracyMetric.accGold span{z-index:3}.accuracyMetric.accGold:before{content:"";position:absolute;width:190px;height:165px;right:-48px;top:50%;transform:translateY(-50%);background:url("assets/gold-goat.png") center/contain no-repeat;opacity:.42;filter:saturate(1.15) contrast(1.08) drop-shadow(0 5px 10px #241400);z-index:1;pointer-events:none}.accuracyMetric.accGold:after{z-index:2}';
  document.head.append(goatStyles);
  const detailStyles = document.createElement("style");
  detailStyles.textContent =
    ".gameCard[data-game-id]{cursor:pointer}.gameCard[data-game-id]:hover{border-color:#3a4d6c}.liveBadge{display:inline-flex;align-items:center;gap:6px;color:#ff727d;font-weight:950;letter-spacing:.08em}.liveDot{width:8px;height:8px;border-radius:50%;background:#ff3045;box-shadow:0 0 0 4px #ff304526;animation:livePulse 1.25s infinite}@keyframes livePulse{50%{opacity:.35;transform:scale(.8)}}.gameDetail{width:min(900px,calc(100vw - 28px));max-height:88vh;padding:0;border:1px solid #33435d;border-radius:20px;background:#0b111d;color:#f6f8fc;box-shadow:0 24px 100px #000b;overflow:hidden}.gameDetail::backdrop{background:#02050bcc;backdrop-filter:blur(6px)}.detailInner{max-height:88vh;overflow:auto;padding:22px}.detailClose{position:sticky;float:right;top:0;z-index:4;border:1px solid #43516a;background:#151f30;color:#fff;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer}.detailStatus{display:flex;justify-content:center;min-height:24px;margin-bottom:8px;color:#8f9db1;font-size:13px;font-weight:850}.detailScore{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;margin:8px 30px 22px}.detailTeam{display:flex;align-items:center;gap:13px;font-size:18px;font-weight:950}.detailTeam:last-child{flex-direction:row-reverse;text-align:right}.detailTeam img{width:68px;height:68px;object-fit:contain}.detailPoints{font-size:44px;font-weight:950;letter-spacing:-.05em;white-space:nowrap}.detailSection{background:#0f1827;border:1px solid #243249;border-radius:14px;padding:15px;margin-top:13px}.detailSection h3{margin:0 0 11px;font-size:15px}.statRow{display:grid;grid-template-columns:1fr minmax(130px,1.3fr) 1fr;gap:10px;padding:7px 0;border-bottom:1px solid #202d40;text-align:center}.statRow:last-child{border:0}.statRow span:first-child{text-align:left;font-weight:850}.statRow span:last-child{text-align:right;font-weight:850}.statRow b{color:#8290a6;font-size:12px}.playRow{padding:10px 0;border-bottom:1px solid #202d40}.playRow:last-child{border:0}.playMeta{display:flex;gap:8px;color:#7f8da2;font-size:11px;font-weight:850;margin-bottom:3px}.playRow.scoring{color:#fff1bf}.detailLoading,.detailEmpty{padding:48px 15px;text-align:center;color:#8c99ad}.detailHint{color:#718097;font-size:11px;text-align:right;margin-top:8px}@media(max-width:620px){.detailInner{padding:14px}.detailScore{margin:8px 0 18px;gap:8px}.detailTeam{display:block;font-size:14px}.detailTeam:last-child{display:block}.detailTeam img{width:52px;height:52px}.detailPoints{font-size:30px}.statRow{grid-template-columns:1fr 1.2fr 1fr}}";
  document.head.append(detailStyles);
  const interactionStyles = document.createElement("style");
  interactionStyles.textContent =
    ".pickTeam.correctPick{border-color:#39dc91;background:linear-gradient(145deg,#174d38,#102b23);box-shadow:0 0 0 2px #31d18b55,0 0 18px #31d18b1f}.pickTeam.wrongPick{border-color:#ff6370;background:linear-gradient(145deg,#57202a,#2d1219);box-shadow:0 0 0 2px #ff5d6c4d,0 0 18px #ff5d6c1c}.pickTeam.correctPick small{color:#72ecb2}.pickTeam.wrongPick small{color:#ff9aa3}.teamGameScore{font-weight:900;font-variant-numeric:tabular-nums}.teamGameScore.liveScore{color:#ff727d}.teamGameScore.finalScore{color:#c8d1df}.standRow[data-team-code],.seedRow[data-team-code]{cursor:pointer;border-radius:8px;padding-left:5px;padding-right:5px;transition:.16s}.standRow[data-team-code]:hover,.seedRow[data-team-code]:hover{background:#17243a;transform:translateX(2px)}.teamProfileHead{display:flex;align-items:center;gap:17px;margin:4px 0 18px}.teamProfileHead img{width:82px;height:82px;object-fit:contain}.teamProfileHead h2{margin:0;font-size:29px}.teamProfileHead p{margin:3px 0 0;color:#8996aa}.teamMetrics{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.teamMetric{background:#101a2a;border:1px solid #2a3850;border-radius:12px;padding:12px;text-align:center}.teamMetric b{display:block;font-size:21px}.teamMetric span{color:#8b98ab;font-size:10px;font-weight:850;text-transform:uppercase}.scheduleRow{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:10px;padding:10px 5px;border-bottom:1px solid #202d40;cursor:pointer}.scheduleRow:hover{background:#17243a}.scheduleOpponent{display:flex;align-items:center;gap:9px;font-weight:850}.scheduleOpponent img{width:30px;height:30px;object-fit:contain}.scheduleResult{font-weight:900;text-align:right}.scheduleResult.win{color:#42dc96}.scheduleResult.loss{color:#ff6a77}@media(max-width:620px){.teamMetrics{grid-template-columns:1fr 1fr}.teamProfileHead img{width:62px;height:62px}.teamProfileHead h2{font-size:23px}.scheduleRow{grid-template-columns:55px 1fr auto;font-size:12px}}";
  document.head.append(interactionStyles);
  const scoreBoxStyles = document.createElement("style");
  scoreBoxStyles.textContent =
    ".pickTeam .pickIdentity{min-width:0;flex:1}.pickTeam .teamRecord{flex:none;color:#8e9bb0;font-size:11px;font-weight:900;white-space:nowrap}.pickTeam .scoreBox{min-width:42px;min-height:38px;display:grid;place-items:center;border-radius:9px;background:#09101b;border:1px solid #33445f;color:#fff;font-size:20px;font-weight:950;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px #ffffff12}.pickTeam .scoreBox.live.leading{border-color:#43e49a;background:#103d2c;color:#8ff2c0;box-shadow:0 0 14px #31d18b2e,inset 0 1px #b8ffdc2e}.pickTeam .scoreBox.live.trailing{border-color:#ff5363;background:#45151d;color:#ffabb3}.pickTeam .scoreBox.live.tied{border-color:#627590;background:#192638;color:#dce6f4}.pickTeam .scoreBox.final{border-color:#51617a;background:#172234}.pickTeam.correctPick .scoreBox{border-color:#65eaae;background:#0d3828}.pickTeam.wrongPick .scoreBox{border-color:#ff7b86;background:#46151d}@media(max-width:620px){.pickTeam .scoreBox{min-width:38px;min-height:34px;font-size:18px}.pickTeam .teamRecord{font-size:10px}}";
  document.head.append(scoreBoxStyles);
  const matchupAlignment = document.createElement("style");
  matchupAlignment.textContent =
    ".matchup .pickTeam:last-child{flex-direction:row;text-align:right}.matchup .pickTeam:first-child .scoreBox{margin-left:2px}.matchup .pickTeam:last-child .scoreBox{margin-right:2px}";
  document.head.append(matchupAlignment);
  if (!store.pickem)
    store.pickem = { picks: {}, games: {}, week: 1, section: "picks" };
  const ps = store.pickem;
  const gameDetail = document.createElement("dialog");
  gameDetail.className = "gameDetail";
  gameDetail.innerHTML =
    '<div class="detailInner"><button class="detailClose" aria-label="Close game details">×</button><div id="detailBody"></div></div>';
  document.body.append(gameDetail);
  let detailTimer = null;
  gameDetail.querySelector(".detailClose").onclick = () => gameDetail.close();
  gameDetail.addEventListener("close", () => {
    clearTimeout(detailTimer);
    detailTimer = null;
  });
  gameDetail.addEventListener("click", (e) => {
    if (e.target === gameDetail) gameDetail.close();
  });
  nav.onclick = (e) => {
    const b = e.target.closest(".productTab");
    if (!b) return;
    nav
      .querySelectorAll("button")
      .forEach((x) => x.classList.toggle("active", x === b));
    const on = b.dataset.view === "pickem";
    rankings.hidden = on;
    pickem.hidden = !on;
    if (on) initPickem();
  };
  let loaded = false,
    loading = false;
  function norm(x) {
    return (
      { WAS: "wsh", WSH: "wsh", JAC: "jax", LA: "lar" }[x] || x
    ).toLowerCase();
  }
  function teamName(c) {
    const t = info[c];
    return t ? t.city + " " + t.name : c.toUpperCase();
  }
  function shortName(c) {
    return info[c]?.name || c.toUpperCase();
  }
  function savePickem() {
    save();
  }
  async function initPickem() {
    if (!loading && (!loaded || Date.now() - (ps.lastSync || 0) > 300000))
      await loadSeason();
    renderPickem();
  }
  async function loadSeason(silent = false) {
    loading = true;
    if (!silent) renderLoading();
    try {
      const jobs = [];
      for (let w = 1; w <= 18; w++) jobs.push(fetchWeek(w, 2));
      for (let w = 1; w <= 5; w++) jobs.push(fetchWeek(w, 3));
      await Promise.all(jobs);
      await backfillHistoricalOdds();
      loaded = true;
      ps.lastSync = Date.now();
      ps.error = "";
    } catch (e) {
      loaded = Object.keys(ps.games).length > 0;
      ps.error = loaded
        ? "Live refresh failed; showing saved schedule and odds."
        : "Schedule could not load. Check your connection and try again.";
    } finally {
      loading = false;
      savePickem();
    }
  }
  setInterval(async () => {
    if (!pickem.hidden && !loading) {
      await loadSeason(true);
      renderPickem();
    }
  }, 300000);
  async function fetchWeek(w, type) {
    const u = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=${type}&week=${w}&dates=${YEAR}&limit=100&enableOdds=true&region=us&lang=en&_=${Date.now()}`,
      r = await fetch(u, { cache: "no-store" });
    if (!r.ok) throw Error("schedule");
    const j = await r.json();
    (j.events || []).forEach((ev) => {
      const comp = ev.competitions?.[0],
        cs = comp?.competitors || [],
        home = cs.find((x) => x.homeAway === "home"),
        away = cs.find((x) => x.homeAway === "away");
      if (!home || !away) return;
      const hc = norm(home.team.abbreviation),
        ac = norm(away.team.abbreviation),
        completed = !!ev.status?.type?.completed,
        odd = comp.odds?.[0] || {},
        old = ps.games[ev.id] || {},
        rawHome = Number.isFinite(+odd.homeTeamOdds?.moneyLine)
          ? +odd.homeTeamOdds.moneyLine
          : null,
        rawAway = Number.isFinite(+odd.awayTeamOdds?.moneyLine)
          ? +odd.awayTeamOdds.moneyLine
          : null,
        homeML = rawHome ?? old.homeML ?? null,
        awayML = rawAway ?? old.awayML ?? null,
        underdog =
          homeML !== null && awayML !== null && homeML !== awayML
            ? homeML > awayML
              ? hc
              : ac
            : old.underdog || null;
      ps.games[ev.id] = {
        id: ev.id,
        week: type === 2 ? w : 18 + w,
        seasonType: type,
        date: ev.date,
        home: hc,
        away: ac,
        homeScore: +home.score || 0,
        awayScore: +away.score || 0,
        completed,
        winner: completed ? (home.winner ? hc : away.winner ? ac : null) : null,
        status:
          ev.status?.type?.shortDetail || ev.status?.type?.description || "",
        statusState: ev.status?.type?.state || "",
        oddsDetails: odd.details || old.oddsDetails || "",
        overUnder: Number.isFinite(+odd.overUnder)
          ? +odd.overUnder
          : (old.overUnder ?? null),
        homeML,
        awayML,
        underdog,
      };
    });
  }
  async function backfillHistoricalOdds() {
    const missing = Object.values(ps.games).filter(
      (g) => !g.underdog && (ps.picks[g.id] || g.week === ps.week),
    );
    for (let i = 0; i < missing.length; i += 8)
      await Promise.allSettled(
        missing.slice(i, i + 8).map(async (g) => {
          const r = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${g.id}&region=us&lang=en&_=${Date.now()}`,
            { cache: "no-store" },
          );
          if (!r.ok) return;
          const j = await r.json(),
            odd = j.pickcenter?.[0] || j.header?.competitions?.[0]?.odds?.[0];
          if (!odd) return;
          const homeML = Number.isFinite(+odd.homeTeamOdds?.moneyLine)
              ? +odd.homeTeamOdds.moneyLine
              : null,
            awayML = Number.isFinite(+odd.awayTeamOdds?.moneyLine)
              ? +odd.awayTeamOdds.moneyLine
              : null;
          if (homeML === null || awayML === null || homeML === awayML) return;
          g.homeML = homeML;
          g.awayML = awayML;
          g.underdog = homeML > awayML ? g.home : g.away;
          g.oddsDetails = odd.details || g.oddsDetails || "";
          g.overUnder = Number.isFinite(+odd.overUnder)
            ? +odd.overUnder
            : (g.overUnder ?? null);
          g.oddsArchived = !!g.completed;
        }),
      );
  }
  function renderLoading() {
    pickem.innerHTML =
      '<div class="emptyPick">Loading the 2026 NFL schedule and results…</div>';
  }
  function renderPickem() {
    if (ps.section === "actual") ps.section = "picks";
    const games = Object.values(ps.games),
      done = games.filter((g) => g.completed && g.winner && ps.picks[g.id]),
      correct = done.filter((g) => ps.picks[g.id] === g.winner).length,
      totalPicks = Object.keys(ps.picks).length,
      accuracy = done.length ? Math.round((correct / done.length) * 100) : 0,
      accuracyClass =
        accuracy <= 45
          ? "accRed"
          : accuracy <= 50
            ? "accYellow"
            : accuracy <= 57
              ? "accGreen"
              : "accGold",
      upsetPicks = games.filter(
        (g) => g.underdog && ps.picks[g.id] === g.underdog,
      ),
      gradedUpsets = upsetPicks.filter((g) => g.completed && g.winner),
      correctUpsets = gradedUpsets.filter(
        (g) => g.winner === g.underdog,
      ).length,
      upsetAccuracy = gradedUpsets.length
        ? Math.round((correctUpsets / gradedUpsets.length) * 100)
        : 0;
    pickem.innerHTML = `<div class="pickHead"><div><div class="eyebrow">Season predictor</div><h1>NFL Pick’em</h1><p>Predict every game, follow the real results, and build your projected playoff field.</p></div><div class="pickControls"><button class="btn" id="pickPrev">‹ Previous week</button><label class="selectWrap"><span>Week / round</span><select id="pickWeek"></select></label><button class="btn" id="pickNext">Next week ›</button><button class="btn" id="syncScores">↻ Sync results</button></div></div>
<div class="pickTabs"><button class="pickSubTab" data-section="picks">My Picks</button><button class="pickSubTab" data-section="standings">Predicted Divisions</button><button class="pickSubTab" data-section="playoffs">Playoff Seeding</button><button class="pickSubTab" data-section="actualStandings">Actual Standings</button></div>
<div class="pickSummary"><div class="metric"><b>${totalPicks}</b><span>Games picked</span></div><div class="metric"><b>${done.length}</b><span>Graded picks</span></div><div class="metric"><b>${correct}</b><span>Correct</span></div><div class="metric accuracyMetric ${accuracyClass}"><b>${accuracy}%</b><span>Accuracy</span></div></div>
<div class="upsetSummary"><div class="upsetTitle"><b>⚡ Upset tracker</b><span>A pick counts when you choose the listed moneyline underdog.</span></div><div class="upsetStat"><b>${upsetPicks.length}</b><span>Upsets picked</span></div><div class="upsetStat"><b>${correctUpsets}</b><span>Upsets hit</span></div><div class="upsetStat"><b>${upsetAccuracy}%</b><span>Upset accuracy</span></div></div>
<div id="pickContent"></div><div class="syncState">${ps.error || "Final scores update automatically whenever you sync or reopen this tab."}</div>`;
    const sel = pickem.querySelector("#pickWeek"),
      prev = pickem.querySelector("#pickPrev"),
      next = pickem.querySelector("#pickNext");
    for (let w = 1; w <= 22; w++)
      sel.add(
        new Option(
          w <= 18
            ? "Week " + w
            : w === 19
              ? "Wild Card"
              : w === 20
                ? "Divisional"
                : w === 21
                  ? "Conference Championships"
                  : "Super Bowl",
          w,
        ),
      );
    function updateWeekNav() {
      prev.disabled = ps.week === 1;
      next.disabled = ps.week === 22;
    }
    function changeWeek(step) {
      ps.week = Math.max(1, Math.min(22, ps.week + step));
      savePickem();
      renderPickem();
    }
    sel.value = ps.week;
    sel.onchange = () => {
      ps.week = +sel.value;
      savePickem();
      renderSection();
      updateWeekNav();
    };
    prev.onclick = () => changeWeek(-1);
    next.onclick = () => changeWeek(1);
    updateWeekNav();
    pickem.querySelector("#syncScores").onclick = async () => {
      loaded = false;
      await loadSeason();
      renderPickem();
    };
    pickem.querySelectorAll(".pickSubTab").forEach((b) => {
      b.classList.toggle("active", b.dataset.section === ps.section);
      b.onclick = () => {
        ps.section = b.dataset.section;
        savePickem();
        pickem
          .querySelectorAll(".pickSubTab")
          .forEach((x) => x.classList.toggle("active", x === b));
        renderSection();
      };
    });
    renderSection();
  }
  function renderSection() {
    const c = pickem.querySelector("#pickContent");
    if (!c) return;
    if (ps.section === "standings") return renderStandings(c);
    if (ps.section === "actualStandings") return renderActualStandings(c);
    if (ps.section === "playoffs") return renderSeeds(c);
    if (ps.section === "actual") return renderActual(c);
    renderPicks(c);
  }
  function weekGames(w) {
    if (w <= 18)
      return Object.values(ps.games)
        .filter((g) => g.seasonType === 2 && g.week === w)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    return projectedRound(w);
  }
  function liveGame(team) {
    return Object.values(ps.games).find(
      (g) => g.statusState === "in" && (g.home === team || g.away === team),
    );
  }
  function liveMark(team) {
    return liveGame(team) ? '<span class="standLive"><i></i>LIVE</span>' : "";
  }
  function liveClass(team) {
    return liveGame(team) ? "teamLive" : "";
  }
  function ml(v) {
    return v === null || v === undefined ? "—" : v > 0 ? "+" + v : String(v);
  }
  function oddsBar(g) {
    if (
      !g.oddsDetails &&
      g.homeML == null &&
      g.awayML == null &&
      g.overUnder == null
    )
      return '<div class="oddsBar"><span>Odds not posted yet</span></div>';
    return `<div class="oddsBar"><span>${g.completed ? "Closing odds" : "Live odds"}</span><span>${g.oddsDetails || "Current line"}</span><span>${shortName(g.away)} ${ml(g.awayML)}</span><span>${shortName(g.home)} ${ml(g.homeML)}</span>${g.overUnder != null ? `<span>O/U ${g.overUnder}</span>` : ""}${g.underdog ? `<span class="dogOdds">⚡ Underdog: ${shortName(g.underdog)}</span>` : ""}</div>`;
  }
  function gameCard(g, actual = false) {
    const pick = ps.picks[g.id],
      winner = g.winner,
      graded = g.completed && winner,
      isReal = !String(g.id).startsWith("pred-"),
      live = g.statusState === "in",
      locked =
        isReal &&
        (live ||
          g.completed ||
          (g.date && Date.now() >= new Date(g.date).getTime())),
      r = actualRecords(),
      rec = (team) =>
        `${r[team]?.w || 0}-${r[team]?.l || 0}${r[team]?.t ? "-" + r[team].t : ""}`,
      liveClass = (side) => {
        const own = +g[side + "Score"],
          other = +g[(side === "home" ? "away" : "home") + "Score"];
        return own > other ? "leading" : own < other ? "trailing" : "tied";
      },
      score = (side) =>
        live
          ? `<span class="scoreBox live ${liveClass(side)} ${side}CardScore">${g[side + "Score"]}</span>`
          : g.completed
            ? `<span class="scoreBox final ${side}CardScore">${g[side + "Score"]}</span>`
            : `<span class="scoreBox ${side}CardScore" hidden></span>`,
      pickClass = (team) =>
        graded && pick === team
          ? pick === winner
            ? "correctPick"
            : "wrongPick"
          : "";
    return `<article class="gameCard ${locked ? "pickLocked" : ""}" ${isReal ? `data-game-id="${g.id}" tabindex="0" role="button" aria-label="Open ${teamName(g.away)} at ${teamName(g.home)} game details"` : ""}><div class="gameMeta"><span>${new Date(g.date || Date.now()).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span><span>${live ? '<span class="liveBadge"><i class="liveDot"></i>LIVE</span>' : locked && !g.completed ? "PICKS LOCKED" : g.status || ""}</span></div>${oddsBar(g)}<div class="matchup">
<button class="pickTeam ${pick === g.away ? "selected" : ""} ${pickClass(g.away)}" data-game="${g.id}" data-team="${g.away}" ${actual || locked ? "disabled" : ""}><img src="${logo(g.away)}"><span class="pickIdentity"><strong>${shortName(g.away)}</strong><small>Away</small></span><span class="teamRecord">${rec(g.away)}</span>${score("away")}</button><div class="vs">AT</div>
<button class="pickTeam ${pick === g.home ? "selected" : ""} ${pickClass(g.home)}" data-game="${g.id}" data-team="${g.home}" ${actual || locked ? "disabled" : ""}>${score("home")}<span class="teamRecord">${rec(g.home)}</span><span class="pickIdentity"><strong>${shortName(g.home)}</strong><small>Home</small></span><img src="${logo(g.home)}"></button></div>
${actual ? `<div class="resultBadge ${!g.completed ? "pending" : !pick ? "pending" : pick === winner ? "correct" : "wrong"}">${!g.completed ? "Not final" : !pick ? "No pick made" : pick === winner ? "✓ Correct pick" : "✕ Pick missed"}</div>` : ""}${isReal ? '<div class="detailHint">Click anywhere outside the team buttons for game details</div>' : ""}</article>`;
  }
  function cardAction(e, allowPick) {
    const b = e.target.closest(".pickTeam");
    if (b && allowPick) {
      const game = ps.games[b.dataset.game],
        locked =
          game &&
          (game.completed ||
            game.statusState === "in" ||
            (game.date && Date.now() >= new Date(game.date).getTime()));
      if (locked) return window.toast?.("Picks lock at kickoff");
      ps.picks[b.dataset.game] = b.dataset.team;
      savePickem();
      renderPickem();
      return;
    }
    if (b) return;
    const card = e.target.closest("[data-game-id]");
    if (card) openGameDetail(card.dataset.gameId);
  }
  function renderPicks(c) {
    const gs = weekGames(ps.week);
    c.innerHTML = `<div class="pickLayout"><div class="gameList">${gs.length ? gs.map((g) => gameCard(g)).join("") : '<div class="emptyPick">Complete the earlier playoff round to create these matchups.</div>'}</div><aside class="standPanel"><h3>Projected seeds</h3>${seedMini()}</aside></div>`;
    bindTeamLinks(c);
    c.onclick = (e) => cardAction(e, true);
    c.onkeydown = (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        !e.target.closest("button") &&
        !e.target.closest("[data-team-code]")
      ) {
        e.preventDefault();
        cardAction(e, true);
      }
    };
  }
  function renderActual(c) {
    let gs;
    if (ps.week <= 18) gs = weekGames(ps.week);
    else
      gs = Object.values(ps.games)
        .filter((g) => g.seasonType === 3 && g.week === ps.week)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    c.innerHTML = `<div class="gameList">${gs.length ? gs.map((g) => gameCard(g, true)).join("") : '<div class="emptyPick">Actual playoff matchups will appear here when the NFL schedule is set.</div>'}</div>`;
    c.onclick = (e) => cardAction(e, false);
    c.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cardAction(e, false);
      }
    };
  }
  function esc(v) {
    return String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function openGameDetail(id) {
    clearTimeout(detailTimer);
    if (!gameDetail.open) gameDetail.showModal();
    gameDetail.querySelector("#detailBody").innerHTML =
      '<div class="detailLoading">Loading game details…</div>';
    loadGameDetail(id);
  }
  window.openNFLGame = openGameDetail;
  async function loadGameDetail(id) {
    clearTimeout(detailTimer);
    try {
      const r = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${id}&region=us&lang=en&_=${Date.now()}`,
        { cache: "no-store" },
      );
      if (!r.ok) throw Error("details");
      const j = await r.json(),
        comp = j.header?.competitions?.[0],
        status = comp?.status?.type || {},
        cs = comp?.competitors || [],
        home = cs.find((x) => x.homeAway === "home"),
        away = cs.find((x) => x.homeAway === "away");
      if (!home || !away) throw Error("teams");
      renderGameDetail(j, comp, home, away, status);
      const saved = ps.games[id];
      if (saved) {
        saved.homeScore = +home.score || 0;
        saved.awayScore = +away.score || 0;
        saved.completed = !!status.completed;
        saved.statusState = status.state || "";
        saved.status =
          status.shortDetail ||
          status.detail ||
          status.description ||
          saved.status;
        if (saved.completed)
          saved.winner = home.winner
            ? saved.home
            : away.winner
              ? saved.away
              : null;
        savePickem();
        updateVisibleGameCard(saved);
      }
      if (status.state === "in" && gameDetail.open)
        detailTimer = setTimeout(() => loadGameDetail(id), 10000);
    } catch (e) {
      gameDetail.querySelector("#detailBody").innerHTML =
        '<div class="detailEmpty">Game details are temporarily unavailable. Retrying live coverage…</div>';
      if (ps.games[id]?.statusState === "in" && gameDetail.open)
        detailTimer = setTimeout(() => loadGameDetail(id), 10000);
    }
  }
  function updateVisibleGameCard(g) {
    document.querySelectorAll("[data-game-id]").forEach((card) => {
      if (card.dataset.gameId !== String(g.id)) return;
      const live = g.statusState === "in",
        away = card.querySelector(".awayCardScore"),
        home = card.querySelector(".homeCardScore");
      [
        [away, g.awayScore, g.homeScore],
        [home, g.homeScore, g.awayScore],
      ].forEach(([box, score, other]) => {
        if (!box) return;
        box.hidden = !(live || g.completed);
        box.textContent = score;
        box.classList.toggle("live", live);
        box.classList.toggle("final", g.completed);
        box.classList.remove("leading", "trailing", "tied");
        if (live)
          box.classList.add(
            +score > +other ? "leading" : +score < +other ? "trailing" : "tied",
          );
      });
      const pick = ps.picks[g.id];
      card.querySelectorAll(".pickTeam").forEach((b) => {
        b.classList.remove("correctPick", "wrongPick");
        if (g.completed && pick === b.dataset.team)
          b.classList.add(pick === g.winner ? "correctPick" : "wrongPick");
      });
    });
  }
  function renderGameDetail(j, comp, home, away, status) {
    const live = status.state === "in",
      final = !!status.completed,
      hc = norm(home.team.abbreviation),
      ac = norm(away.team.abbreviation),
      statusText =
        status.shortDetail || status.detail || status.description || "",
      teams = j.boxscore?.teams || [],
      homeStats =
        teams.find((x) => norm(x.team?.abbreviation) === hc)?.statistics || [],
      awayStats =
        teams.find((x) => norm(x.team?.abbreviation) === ac)?.statistics || [],
      statMap = (list) =>
        Object.fromEntries(
          list.map((x) => [
            x.name || x.label,
            {
              label: x.label || x.name,
              value: x.displayValue ?? x.value ?? "—",
            },
          ]),
        ),
      hs = statMap(homeStats),
      as = statMap(awayStats),
      keys = [
        ...new Set([...awayStats, ...homeStats].map((x) => x.name || x.label)),
      ].slice(0, 14),
      drivePlays = [
        ...(j.drives?.previous || []),
        ...(j.drives?.current ? [j.drives.current] : []),
      ].flatMap((d) => d.plays || []),
      plays = j.plays?.length ? j.plays : drivePlays,
      scoring = j.scoringPlays?.length
        ? j.scoringPlays
        : plays.filter((x) => x.scoringPlay),
      shownPlays = live ? [...plays].slice(-30).reverse() : scoring;
    const statHtml = keys.length
      ? `<section class="detailSection"><h3>${live ? "Live team stats" : "Box score"}</h3>${keys.map((k) => `<div class="statRow"><span>${esc(as[k]?.value || "—")}</span><b>${esc(as[k]?.label || hs[k]?.label || k)}</b><span>${esc(hs[k]?.value || "—")}</span></div>`).join("")}</section>`
      : "";
    const playTitle = live
        ? "Live play-by-play"
        : final
          ? "Scoring summary"
          : "Game preview",
      playHtml = shownPlays.length
        ? `<section class="detailSection"><h3>${playTitle}</h3>${shownPlays.map((p) => `<div class="playRow ${p.scoringPlay ? "scoring" : ""}"><div class="playMeta"><span>${p.period?.number ? "Q" + p.period.number : ""}</span><span>${esc(p.clock?.displayValue || "")}</span>${p.homeScore != null && p.awayScore != null ? `<span>${esc(away.team.abbreviation)} ${p.awayScore} · ${esc(home.team.abbreviation)} ${p.homeScore}</span>` : ""}</div><div>${esc(p.text || p.shortText || "Play update")}</div></div>`).join("")}</section>`
        : `<section class="detailSection"><div class="detailEmpty">${final ? "No scoring-play details were returned for this game." : "Game coverage will appear here when play begins."}</div></section>`;
    gameDetail.querySelector("#detailBody").innerHTML =
      `<div class="detailStatus">${live ? '<span class="liveBadge"><i class="liveDot"></i>LIVE</span>' : esc(statusText)}</div><div class="detailScore"><div class="detailTeam"><img src="${logo(ac)}"><span>${esc(teamName(ac))}</span></div><div class="detailPoints">${esc(away.score || 0)}–${esc(home.score || 0)}</div><div class="detailTeam"><img src="${logo(hc)}"><span>${esc(teamName(hc))}</span></div></div>${statHtml}${playHtml}`;
  }
  function records() {
    const r = {};
    teams.forEach((t) => (r[t[0]] = { w: 0, l: 0, divW: 0, divL: 0 }));
    Object.values(ps.games)
      .filter((g) => g.seasonType === 2)
      .forEach((g) => {
        const p = ps.picks[g.id];
        if (!p) return;
        const loser = p === g.home ? g.away : g.home;
        r[p].w++;
        r[loser].l++;
        const div = Object.values(divisions).find(
          (x) => x.includes(p) && x.includes(loser),
        );
        if (div) {
          r[p].divW++;
          r[loser].divL++;
        }
      });
    return r;
  }
  function actualRecords() {
    const r = {};
    teams.forEach((t) => (r[t[0]] = { w: 0, l: 0, t: 0, divW: 0, divL: 0 }));
    Object.values(ps.games)
      .filter((g) => g.seasonType === 2 && g.completed)
      .forEach((g) => {
        const tied = g.homeScore === g.awayScore;
        if (tied) {
          r[g.home].t++;
          r[g.away].t++;
          return;
        }
        const winner = g.winner,
          loser = winner === g.home ? g.away : g.home;
        if (!winner) return;
        r[winner].w++;
        r[loser].l++;
        const div = Object.values(divisions).find(
          (x) => x.includes(winner) && x.includes(loser),
        );
        if (div) {
          r[winner].divW++;
          r[loser].divL++;
        }
      });
    return r;
  }
  function rankingSnapshot(rankingWeek) {
    const throughWeek = Math.max(0, Math.min(18, Number(rankingWeek || 1) - 1)),
      result = {};
    teams.forEach((t) => {
      const code = t[0],
        games = Object.values(ps.games)
          .filter(
            (g) =>
              g.seasonType === 2 &&
              g.completed &&
              g.week <= throughWeek &&
              (g.home === code || g.away === code),
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      let w = 0,
        l = 0,
        tied = 0;
      games.forEach((g) => {
        if (g.homeScore === g.awayScore) tied++;
        else if (g.winner === code) w++;
        else l++;
      });
      let winStreak = 0;
      for (let i = games.length - 1; i >= 0; i--) {
        if (games[i].winner !== code) break;
        winStreak++;
      }
      result[code] = {
        record: `${w}-${l}${tied ? "-" + tied : ""}`,
        w,
        l,
        t: tied,
        winStreak,
      };
    });
    return result;
  }
  async function syncRankingResults(rankingWeek, force = false) {
    const throughWeek = Math.max(0, Math.min(18, Number(rankingWeek || 1) - 1));
    ps.rankingSync ||= {};
    const fresh = Date.now() - (ps.rankingSync[throughWeek] || 0) < 300000;
    if (throughWeek && (!fresh || force)) {
      await Promise.allSettled(
        Array.from({ length: throughWeek }, (_, i) => fetchWeek(i + 1, 2)),
      );
      ps.rankingSync[throughWeek] = Date.now();
      savePickem();
    }
    window.dispatchEvent(new CustomEvent("ledge-ranking-results"));
    return rankingSnapshot(rankingWeek);
  }
  function sortedTeams(list, r) {
    const power = current();
    return [...list].sort(
      (a, b) =>
        r[b].w - r[a].w ||
        r[b].divW - r[a].divW ||
        power.indexOf(a) - power.indexOf(b),
    );
  }
  function sortedActualTeams(list, r) {
    const power = current();
    return [...list].sort((a, b) => {
      const ga = r[a].w + r[a].l + r[a].t,
        gb = r[b].w + r[b].l + r[b].t,
        pa = ga ? (r[a].w + 0.5 * r[a].t) / ga : 0,
        pb = gb ? (r[b].w + 0.5 * r[b].t) / gb : 0;
      return (
        pb - pa ||
        r[b].w - r[a].w ||
        r[b].divW - r[a].divW ||
        power.indexOf(a) - power.indexOf(b)
      );
    });
  }
  function seeds() {
    const r = records(),
      out = { AFC: [], NFC: [] };
    ["AFC", "NFC"].forEach((conf) => {
      const ds = Object.entries(divisions).filter(([n]) => n.startsWith(conf)),
        leaders = ds.map(([, ts]) => sortedTeams(ts, r)[0]);
      out[conf] = sortedTeams(leaders, r);
      const rest = Object.keys(r).filter(
        (t) =>
          Object.entries(divisions).some(
            ([n, ts]) => n.startsWith(conf) && ts.includes(t),
          ) && !leaders.includes(t),
      );
      out[conf].push(...sortedTeams(rest, r).slice(0, 3));
    });
    return { r, out };
  }
  function actualSeeds() {
    const r = actualRecords(),
      out = { AFC: [], NFC: [] };
    ["AFC", "NFC"].forEach((conf) => {
      const ds = Object.entries(divisions).filter(([n]) => n.startsWith(conf)),
        leaders = ds.map(([, ts]) => sortedActualTeams(ts, r)[0]);
      out[conf] = sortedActualTeams(leaders, r);
      const rest = Object.keys(r).filter(
        (t) =>
          Object.entries(divisions).some(
            ([n, ts]) => n.startsWith(conf) && ts.includes(t),
          ) && !leaders.includes(t),
      );
      out[conf].push(...sortedActualTeams(rest, r).slice(0, 3));
    });
    return { r, out };
  }
  function seedMini() {
    const { r, out } = seeds();
    return ["AFC", "NFC"]
      .map(
        (conf) =>
          `<div class="sideTitle">${conf}</div>${out[conf].map((t, i) => `<div class="seedRow ${liveClass(t)}" data-team-code="${t}" tabindex="0" role="button"><b>${i + 1}</b><div class="teamLine"><img src="${logo(t)}">${shortName(t)}${liveMark(t)}</div><span class="record">${r[t].w}-${r[t].l}</span></div>`).join("")}`,
      )
      .join("");
  }
  function bindTeamLinks(c) {
    c.querySelectorAll("[data-team-code]").forEach((row) => {
      row.onclick = () => openTeamDetail(row.dataset.teamCode);
      row.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTeamDetail(row.dataset.teamCode);
        }
      };
    });
  }
  function openTeamDetail(code) {
    clearTimeout(detailTimer);
    if (!gameDetail.open) gameDetail.showModal();
    const actual = actualRecords()[code],
      pred = records()[code],
      games = Object.values(ps.games)
        .filter((g) => g.home === code || g.away === code)
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      completed = games.filter((g) => g.seasonType === 2 && g.completed),
      pf = completed.reduce(
        (n, g) => n + (g.home === code ? g.homeScore : g.awayScore),
        0,
      ),
      pa = completed.reduce(
        (n, g) => n + (g.home === code ? g.awayScore : g.homeScore),
        0,
      ),
      schedule = games
        .map((g) => {
          const home = g.home === code,
            opp = home ? g.away : g.home,
            result = g.completed
              ? g.winner === code
                ? "W"
                : g.winner
                  ? "L"
                  : "T"
              : g.statusState === "in"
                ? "LIVE"
                : "UPCOMING",
            score =
              g.completed || g.statusState === "in"
                ? `${home ? g.homeScore : g.awayScore}-${home ? g.awayScore : g.homeScore}`
                : new Date(g.date).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });
          return `<div class="scheduleRow" data-open-game="${g.id}"><span>${g.week <= 18 ? "Wk " + g.week : g.week === 19 ? "WC" : g.week === 20 ? "DIV" : g.week === 21 ? "CONF" : "SB"}</span><div class="scheduleOpponent"><img src="${logo(opp)}"><span>${home ? "vs" : "@"} ${shortName(opp)}</span></div><span class="scheduleResult ${result === "W" ? "win" : result === "L" ? "loss" : ""}">${result} · ${score}</span></div>`;
        })
        .join("");
    gameDetail.querySelector("#detailBody").innerHTML =
      `<div class="teamProfileHead"><img src="${logo(code)}"><div><h2>${esc(teamName(code))}</h2><p>Team schedule, results, and season snapshot</p></div></div><div class="teamMetrics"><div class="teamMetric"><b>${actual.w}-${actual.l}${actual.t ? "-" + actual.t : ""}</b><span>Actual record</span></div><div class="teamMetric"><b>${pred.w}-${pred.l}</b><span>Your projection</span></div><div class="teamMetric"><b>${pf}-${pa}</b><span>Points for–against</span></div><div class="teamMetric"><b>${actual.divW}-${actual.divL}</b><span>Division record</span></div></div><section class="detailSection"><h3>2026 schedule</h3>${schedule || '<div class="detailEmpty">Schedule unavailable.</div>'}</section>`;
  }
  gameDetail.addEventListener("click", (e) => {
    const row = e.target.closest("[data-open-game]");
    if (row) openGameDetail(row.dataset.openGame);
  });
  function renderStandings(c) {
    const r = records();
    c.innerHTML = `<div class="divisionGrid">${Object.entries(divisions)
      .map(
        ([n, ts]) =>
          `<section class="division"><h3>${n}</h3>${sortedTeams(ts, r)
            .map(
              (t, i) =>
                `<div class="standRow ${liveClass(t)}" data-team-code="${t}" tabindex="0" role="button"><b>${i + 1}</b><div class="teamLine"><img src="${logo(t)}">${teamName(t)}${liveMark(t)}</div><span class="record">${r[t].w}-${r[t].l}</span></div>`,
            )
            .join("")}</section>`,
      )
      .join("")}</div>`;
    bindTeamLinks(c);
  }
  function renderActualStandings(c) {
    const { r, out } = actualSeeds(),
      record = (t) => `${r[t].w}-${r[t].l}${r[t].t ? "-" + r[t].t : ""}`;
    c.innerHTML = `<p class="standLabel">Updated from completed regular-season games. Ties are included in the records.</p><div class="divisionGrid">${Object.entries(
      divisions,
    )
      .map(
        ([n, ts]) =>
          `<section class="division actualDivision"><h3>${n}</h3>${sortedActualTeams(
            ts,
            r,
          )
            .map(
              (t, i) =>
                `<div class="standRow ${liveClass(t)}" data-team-code="${t}" tabindex="0" role="button"><b>${i + 1}</b><div class="teamLine"><img src="${logo(t)}">${teamName(t)}${liveMark(t)}${i === 0 ? '<span class="divisionLeader">LEADER</span>' : ""}</div><span class="record">${record(t)}</span></div>`,
            )
            .join("")}</section>`,
      )
      .join(
        "",
      )}</div><div class="playoffTitle" style="margin-top:24px">Current Playoff Picture</div><p class="standLabel">Based on games completed so far. Division leaders occupy seeds 1–4; the next three teams are wild cards.</p><div class="conferenceGrid">${["AFC", "NFC"].map((conf) => `<section class="conference"><h2>${conf}</h2>${out[conf].map((t, i) => `<div class="seedRow ${liveClass(t)}" data-team-code="${t}" tabindex="0" role="button"><b>${i + 1}</b><div class="teamLine"><img src="${logo(t)}">${teamName(t)}${liveMark(t)}${i < 4 ? '<span class="divisionLeader">DIV</span>' : '<span class="divisionLeader" style="color:#8fa4c2">WC</span>'}</div><span class="record">${record(t)}</span></div>`).join("")}</section>`).join("")}</div>`;
    bindTeamLinks(c);
  }
  function renderSeeds(c) {
    const { r, out } = seeds();
    c.innerHTML = `<div class="conferenceGrid">${["AFC", "NFC"].map((conf) => `<section class="conference"><h2>${conf} Playoff Picture</h2>${out[conf].map((t, i) => `<div class="seedRow ${liveClass(t)}" data-team-code="${t}" tabindex="0" role="button"><b>${i + 1}</b><div class="teamLine"><img src="${logo(t)}">${teamName(t)}${liveMark(t)}</div><span class="record">${r[t].w}-${r[t].l}</span></div>`).join("")}</section>`).join("")}</div>`;
    bindTeamLinks(c);
  }
  function projectedRound(w) {
    const { out } = seeds(),
      games = [];
    function mk(id, a, b) {
      if (a && b)
        games.push({
          id,
          away: b,
          home: a,
          date: null,
          status: "Projected matchup",
        });
    }
    if (w === 19) {
      ["AFC", "NFC"].forEach((c) => {
        const s = out[c];
        mk("pred-wc-" + c + "-2v7", s[1], s[6]);
        mk("pred-wc-" + c + "-3v6", s[2], s[5]);
        mk("pred-wc-" + c + "-4v5", s[3], s[4]);
      });
    } else if (w === 20) {
      ["AFC", "NFC"].forEach((c) => {
        const s = out[c],
          wins = projectedWinners(19, c),
          low = wins.sort((a, b) => s.indexOf(b) - s.indexOf(a))[0],
          others = wins.filter((x) => x !== low);
        mk("pred-div-" + c + "-1", s[0], low);
        mk("pred-div-" + c + "-2", others[0], others[1]);
      });
    } else if (w === 21) {
      ["AFC", "NFC"].forEach((c) => {
        const wins = projectedWinners(20, c);
        mk("pred-conf-" + c, wins[0], wins[1]);
      });
    } else if (w === 22) {
      mk("pred-sb", ps.picks["pred-conf-AFC"], ps.picks["pred-conf-NFC"]);
    }
    return games;
  }
  function projectedWinners(w, conf) {
    return projectedRoundBase(w, conf)
      .map((g) => ps.picks[g.id])
      .filter(Boolean);
  }
  function projectedRoundBase(w, conf) {
    if (w === 19) {
      const s = seeds().out[conf];
      return [
        { id: "pred-wc-" + conf + "-2v7", home: s[1], away: s[6] },
        { id: "pred-wc-" + conf + "-3v6", home: s[2], away: s[5] },
        { id: "pred-wc-" + conf + "-4v5", home: s[3], away: s[4] },
      ];
    }
    if (w === 20) return projectedRound(20).filter((g) => g.id.includes(conf));
    return [];
  }
  window.openNFLTeam = async (code) => {
    if (!loaded) await loadSeason(true);
    openTeamDetail(code);
  };
  window.getRankingSnapshot = rankingSnapshot;
  window.syncRankingResults = syncRankingResults;
  syncRankingResults(window.store?.week || store.week || 1);
})();
