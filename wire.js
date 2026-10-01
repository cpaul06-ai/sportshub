(() => {
  const home = document.querySelector("#homeView"),
    nfl = document.querySelector("#nflView"),
    fantasy = document.querySelector("#fantasyView"),
    tabs = document.querySelectorAll("[data-global-view]"),
    feed = document.querySelector("#wireFeed"),
    live = document.querySelector("#wireLive"),
    input = document.querySelector("#callText");
  let type = "Take",
    mediaFile = null,
    announcements = [],
    communityPosts = [],
    channel = null,
    postsChannel = null,
    interactionChannel = null,
    interactionTimer = null;
  const account = () => window.ledgeAccount || {},
    isOwner = () => !!account().profile?.site_owner,
    me = () => account().session?.user?.id || "",
    profile = () => account().profile || {};
  tabs.forEach(
    (b) =>
      (b.onclick = () => {
        tabs.forEach((x) => x.classList.toggle("active", x === b));
        const selected = b.dataset.globalView,
          isHome = selected === "home";
        home.hidden = selected !== "home";
        nfl.hidden = selected !== "nfl";
        if (fantasy) fantasy.hidden = selected !== "fantasy";
        if (selected === "fantasy") window.initTradeAnalyzer?.();
        if (isHome) {
          renderFeed();
          loadAnnouncements();
        }
      }),
  );
  function bindTypes() {
    document.querySelectorAll("[data-call-type]").forEach(
      (b) =>
        (b.onclick = () => {
          type = b.dataset.callType;
          document
            .querySelectorAll("[data-call-type]")
            .forEach((x) => x.classList.toggle("active", x === b));
        }),
    );
  }
  bindTypes();
  function authorSnapshot() {
    const p = profile();
    return {
      authorId: me(),
      authorUsername:
        p.username ||
        account().session?.user?.user_metadata?.preferred_username ||
        "member",
      authorAvatar: p.avatar_url || "",
      authorOwner: !!p.site_owner,
      authorVerified: !!p.verified,
    };
  }
  async function migratePosts() {
    if (!me() || !store.wirePosts?.length) return;
    let changed = false;
    store.wirePosts = store.wirePosts.map((p) => {
      if (p.authorId) return p;
      changed = true;
      return { ...p, ...authorSnapshot() };
    });
    if (changed) save();
    const rows = store.wirePosts
      .filter((p) => !p.receipt)
      .map((p) => ({
        author_id: me(),
        client_id: String(p.id || new Date(p.createdAt).getTime()),
        post_type: ["Hot Take", "Discussion"].includes(p.type)
          ? p.type
          : "Take",
        body: p.text,
        media_url: p.mediaUrl || null,
        media_type: p.mediaType || null,
        created_at: p.createdAt || new Date().toISOString(),
      }));
    if (rows.length)
      await account().sb.from("posts").upsert(rows, {
        onConflict: "author_id,client_id",
        ignoreDuplicates: true,
      });
  }
  function activateAccount() {
    const slot = document.querySelector("#ownerCallType");
    if (isOwner() && !slot.querySelector('[data-call-type="Announcement"]')) {
      slot.innerHTML =
        '<button class="callType" data-call-type="Announcement">✦ Announcement</button>';
      bindTypes();
    }
    paintComposer();
    migratePosts().then(loadPosts);
    loadAnnouncements();
    renderFeed();
    subscribeInteractions();
  }
  window.addEventListener("ledge-account-ready", activateAccount);
  if (window.ledgeAccount) activateAccount();
  function paintComposer() {
    const el = document.querySelector(".composerAvatar"),
      p = profile(),
      avatar = p.avatar_url || "";
    if (!el) return;
    el.innerHTML = avatar
      ? `<img src="${esc(avatar)}" alt="">`
      : esc((p.username || "U").slice(0, 2).toUpperCase());
    el.classList.toggle("ownerComposer", !!p.site_owner);
  }
  const mediaInput = document.querySelector("#postMedia"),
    mediaButton = document.querySelector("#attachMedia"),
    mediaLabel = document.querySelector("#mediaLabel");
  if (mediaButton && mediaInput) {
    mediaButton.onclick = () => mediaInput.click();
    mediaInput.onchange = () => {
      mediaFile = mediaInput.files?.[0] || null;
      if (mediaFile && mediaFile.size > 26214400) {
        window.toast?.("Choose media smaller than 25 MB");
        mediaFile = null;
        mediaInput.value = "";
      }
      mediaLabel.textContent = mediaFile
        ? "✓ " + mediaFile.name
        : "＋ Photo / video";
    };
  }
  document.querySelector("#postCall").onclick = async () => {
    const text = input.value.trim();
    if (!text && !mediaFile)
      return window.toast?.("Write a call or attach media first");
    if (!me()) return window.toast?.("Sign in to post");
    if (type === "Announcement") {
      if (!text) return window.toast?.("Write the announcement first");
      if (!isOwner()) return window.toast?.("Owner access required");
      const { error } = await account()
        .sb.from("announcements")
        .insert({ author_id: me(), body: text });
      if (error) return window.toast?.(error.message);
      input.value = "";
      await loadAnnouncements();
      window.toast?.("Announcement broadcast to every account");
      return;
    }
    if (!store.wirePosts) store.wirePosts = [];
    const id = crypto.randomUUID?.() || String(Date.now()),
      createdAt = new Date().toISOString();
    let mediaUrl = null,
      mediaType = null;
    if (mediaFile) {
      mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
      const ext = (mediaFile.name.split(".").pop() || "bin")
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase(),
        path = me() + "/" + id + "." + ext;
      const { error: uploadError } = await account()
        .sb.storage.from("post-media")
        .upload(path, mediaFile, {
          contentType: mediaFile.type,
          upsert: false,
        });
      if (uploadError) return window.toast?.(uploadError.message);
      mediaUrl = account().sb.storage.from("post-media").getPublicUrl(path)
        .data.publicUrl;
    }
    const bodyText =
        text || (mediaType === "video" ? "Shared a video." : "Shared a photo."),
      post = {
        id,
        type,
        text: bodyText,
        createdAt,
        mediaUrl,
        mediaType,
        ...authorSnapshot(),
      };
    const { error } = await account()
      .sb.from("posts")
      .insert({
        author_id: me(),
        client_id: String(id),
        post_type: ["Hot Take", "Discussion"].includes(type) ? type : "Take",
        body: bodyText,
        media_url: mediaUrl,
        media_type: mediaType,
        created_at: createdAt,
      });
    if (error) return window.toast?.(error.message);
    store.wirePosts.unshift(post);
    input.value = "";
    mediaFile = null;
    if (mediaInput) mediaInput.value = "";
    if (mediaLabel) mediaLabel.textContent = "＋ Photo / video";
    save();
    await loadPosts();
    window.toast?.(
      type === "Hot Take"
        ? "Hot take locked in"
        : "Call posted to the Ledge feed",
    );
  };
  document.querySelector("#wireRefresh").onclick = () => {
    loadLive();
    loadAnnouncements();
    loadPosts();
  };
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
  function ago(date) {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(date)) / 60000));
    return mins < 1
      ? "now"
      : mins < 60
        ? mins + "m"
        : mins < 1440
          ? Math.floor(mins / 60) + "h"
          : Math.floor(mins / 1440) + "d";
  }
  function bigUpsetReceipts() {
    const a = authorSnapshot(),
      games = Object.values(store.pickem?.games || {}),
      picks = store.pickem?.picks || {};
    return games
      .filter(
        (g) =>
          g.completed &&
          g.winner &&
          picks[g.id] === g.winner &&
          g.underdog === g.winner &&
          +(g.winner === g.home ? g.homeML : g.awayML) >= 200,
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2)
      .map((g) => ({
        id: "upset-" + g.id,
        receipt: true,
        correct: true,
        type: "UPSET RECEIPT",
        text:
          "Called the " +
          (info[g.winner]?.name || g.winner.toUpperCase()) +
          " upset at " +
          (g.winner === g.home ? "+" + g.homeML : "+" + g.awayML) +
          ".",
        createdAt: g.date,
        ...a,
      }));
  }
  async function loadPosts() {
    if (!me() || !account().sb) return;
    const { data, error } = await account()
      .sb.from("posts")
      .select(
        "id,author_id,client_id,post_type,body,media_url,media_type,created_at,profiles(username,avatar_url,site_owner,verified)",
      )
      .order("created_at", { ascending: false })
      .limit(80);
    if (!error) communityPosts = data || [];
    if (!postsChannel) {
      postsChannel = account()
        .sb.channel("ledge-posts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          () => loadPosts(),
        )
        .subscribe();
    }
    renderFeed();
  }
  async function loadAnnouncements() {
    if (!account().session || !account().sb) return;
    const { data } = await account()
      .sb.from("announcements")
      .select(
        "id,body,created_at,author_id,profiles(username,avatar_url,site_owner,verified)",
      )
      .order("created_at", { ascending: false })
      .limit(20);
    announcements = data || [];
    if (!channel) {
      channel = account()
        .sb.channel("ledge-announcements")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "announcements" },
          () => loadAnnouncements(),
        )
        .subscribe();
    }
    renderFeed();
  }
  function postKey(kind, id, author) {
    return kind + ":" + author + ":" + id;
  }
  function avatarMarkup(a, fallback = "U") {
    return a
      ? `<img src="${esc(a)}" alt="">`
      : esc(fallback.slice(0, 2).toUpperCase());
  }
  function authorHead(a, meta, open = true) {
    const owner = !!a.owner,
      verified = !!a.verified,
      attrs = open ? `data-profile-id="${esc(a.id)}"` : "",
      klass = owner ? "ownerIdentity" : "postWho";
    return `<div class="postHead"><div class="postAvatar" ${attrs}>${avatarMarkup(a.avatar, a.username || "U")}</div><div ${attrs}><div class="${klass}">${owner ? '<img class="ownerCPMark" src="assets/cp-logo.png?v=20260921-8" alt="CP">' : ""}<span>@${esc(a.username || "member")} ${verified ? '<span class="verifiedStar" title="Verified account">☆</span>' : ""}${owner ? " · FOUNDING OWNER" : ""}</span></div><div class="postMeta">${meta}</div></div>`;
  }
  function socialShell(key) {
    return `<div class="postSocial" data-social="${esc(key)}"><div class="reactionBar" aria-label="React to post">${["🔥", "😂", "💯", "🤝", "🧠"].map((e) => `<button type="button" data-react="${e}"><span>${e}</span><b>0</b></button>`).join("")}</div><button class="commentSummary" type="button" data-view-comments>Be the first to comment</button><div class="topComment" hidden></div><div class="inlineThread" hidden><div class="inlineComments"></div><form class="inlineCommentForm"><input maxlength="500" placeholder="Add your take…" required><button>Post</button></form></div></div>`;
  }
  function renderFeed() {
    const shared = communityPosts.map((x) => ({
        id: x.client_id,
        type: x.post_type,
        text: x.body,
        createdAt: x.created_at,
        authorId: x.author_id,
        authorUsername: x.profiles?.username || "member",
        authorAvatar: x.profiles?.avatar_url || "",
        authorOwner: !!x.profiles?.site_owner,
        authorVerified: !!x.profiles?.verified,
        mediaUrl: x.media_url || "",
        mediaType: x.media_type || "",
        dbId: x.id,
      })),
      posts = [...shared, ...bigUpsetReceipts()].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    const ann = announcements
      .map((x) => {
        const p = x.profiles || {},
          a = {
            id: x.author_id,
            username: p.username || "Carson",
            avatar: p.avatar_url || "",
            owner: !!p.site_owner,
            verified: !!p.verified,
          };
        return `<article class="wirePost announcementPost ${a.owner ? "ownerPost" : ""}" data-post-key="${postKey("announcement", x.id, x.author_id)}">${authorHead(a, ago(x.created_at) + " · Broadcast to Ledge")}<span class="postBadge">ANNOUNCEMENT</span>${isOwner() ? `<button class="postDelete" data-delete-ann="${x.id}" title="Delete announcement">×</button>` : ""}</div><p>${esc(x.body)}</p>${socialShell(postKey("announcement", x.id, x.author_id))}</article>`;
      })
      .join("");
    const own = posts
      .map((p) => {
        const a = {
            id: p.authorId || me(),
            username: p.authorUsername || profile().username || "member",
            avatar: p.authorAvatar || profile().avatar_url || "",
            owner: p.authorOwner ?? !!profile().site_owner,
            verified: p.authorVerified ?? !!profile().verified,
          },
          key = postKey(
            p.receipt ? "receipt" : "post",
            p.id || p.createdAt,
            a.id,
          );
        const canDelete =
          p.dbId && (isOwner() || (a.id === me() && p.type === "Discussion"));
        return `<article class="wirePost ${p.receipt ? (p.correct ? "correctReceipt" : "missedReceipt") : ""} ${a.owner ? "ownerPost" : ""} ${p.type === "Hot Take" ? "hotTakePost" : ""}" data-post-key="${esc(key)}">${authorHead(a, ago(p.createdAt) + " · On the record")}<span class="postBadge">${esc(p.type)}</span>${canDelete ? `<button class="postDelete" data-delete-post="${p.dbId}" title="Delete post">×</button>` : ""}</div><p>${esc(p.text)}</p>${p.mediaUrl ? (p.mediaType === "video" ? `<video class="postMedia" controls playsinline preload="metadata" src="${esc(p.mediaUrl)}"></video>` : `<img class="postMedia" src="${esc(p.mediaUrl)}" alt="Post attachment">`) : ""}${socialShell(key)}</article>`;
      })
      .join("");
    feed.innerHTML =
      ann +
      (own ||
        '<div class="wireEmpty">Your calls and major upset receipts will appear here. Ordinary picks stay on your profile.</div>') +
      `<article class="wirePost sourcePost"><div class="postHead"><div class="postAvatar">L</div><div><div class="postWho">Ledge Wire</div><div class="postMeta">Source feed preview</div></div><span class="postBadge">BREAKING</span></div><p>Verified NFL news from trusted reporters will appear here alongside the calls it affects.</p><a class="sourceLink" href="https://x.com/AdamSchefter" target="_blank" rel="noopener">Open Adam Schefter on X ↗</a></article>`;
    feed
      .querySelectorAll("[data-profile-id]")
      .forEach(
        (x) =>
          (x.onclick = () =>
            x.dataset.profileId === me()
              ? window.openLedgeProfile?.()
              : window.openLedgeProfileById?.(x.dataset.profileId)),
      );
    feed
      .querySelectorAll("[data-delete-post]")
      .forEach(
        (b) => (b.onclick = () => deleteSharedPost(b.dataset.deletePost)),
      );
    feed
      .querySelectorAll("[data-delete-ann]")
      .forEach(
        (b) => (b.onclick = () => deleteAnnouncement(b.dataset.deleteAnn)),
      );
    bindSocial();
    hydrateSocial();
  }
  async function deleteSharedPost(id) {
    if (!confirm("Delete this post?")) return;
    const { error } = await account().sb.from("posts").delete().eq("id", id);
    if (error) return window.toast?.(error.message);
    window.toast?.("Post deleted");
    loadPosts();
  }
  async function deleteAnnouncement(id) {
    if (!isOwner() || !confirm("Delete this announcement?")) return;
    const { error } = await account()
      .sb.from("announcements")
      .delete()
      .eq("id", id);
    if (error) return window.toast?.(error.message);
    window.toast?.("Announcement deleted");
    loadAnnouncements();
  }
  function bindSocial() {
    feed.querySelectorAll("[data-social]").forEach((box) => {
      const key = box.dataset.social;
      box
        .querySelectorAll("[data-react]")
        .forEach(
          (b) => (b.onclick = () => toggleReaction(key, b.dataset.react)),
        );
      box.querySelector("[data-view-comments]").onclick = () =>
        toggleInlineThread(box, key);
      box.querySelector(".inlineCommentForm").onsubmit = (e) =>
        submitInlineComment(e, box, key);
    });
  }
  async function fetchCommentData(keys) {
    const { data: comments, error } = await account()
      .sb.from("post_comments")
      .select("id,post_id,body,created_at,author_id")
      .in("post_id", keys);
    if (error) throw error;
    const authorIds = [...new Set((comments || []).map((c) => c.author_id))],
      commentIds = (comments || []).map((c) => c.id);
    const [{ data: profiles }, { data: likes }] = await Promise.all([
      authorIds.length
        ? account()
            .sb.from("profiles")
            .select("id,username,avatar_url,site_owner,verified")
            .in("id", authorIds)
        : Promise.resolve({ data: [] }),
      commentIds.length
        ? account()
            .sb.from("comment_likes")
            .select("comment_id,user_id")
            .in("comment_id", commentIds)
        : Promise.resolve({ data: [] }),
    ]);
    const profileMap = Object.fromEntries(
      (profiles || []).map((p) => [p.id, p]),
    );
    return (comments || []).map((c) => ({
      ...c,
      profiles: profileMap[c.author_id] || {},
      comment_likes: (likes || []).filter((l) => l.comment_id === c.id),
    }));
  }
  async function hydrateSocial() {
    if (!me() || !account().sb) return;
    const keys = [...feed.querySelectorAll("[data-post-key]")].map(
      (x) => x.dataset.postKey,
    );
    if (!keys.length) return;
    const [{ data: reactions }, comments] = await Promise.all([
      account()
        .sb.from("post_reactions")
        .select("post_id,user_id,emoji")
        .in("post_id", keys),
      fetchCommentData(keys).catch(() => []),
    ]);
    keys.forEach((key) => {
      const box = feed.querySelector(`[data-social="${CSS.escape(key)}"]`);
      if (!box) return;
      const rr = (reactions || []).filter((r) => r.post_id === key);
      box.querySelectorAll("[data-react]").forEach((b) => {
        const list = rr.filter((r) => r.emoji === b.dataset.react);
        b.querySelector("b").textContent = list.length;
        b.classList.toggle(
          "active",
          list.some((r) => r.user_id === me()),
        );
      });
      const cc = (comments || [])
        .filter((c) => c.post_id === key)
        .sort(
          (a, b) =>
            (b.comment_likes?.length || 0) - (a.comment_likes?.length || 0) ||
            new Date(b.created_at) - new Date(a.created_at),
        );
      const summary = box.querySelector("[data-view-comments]"),
        top = box.querySelector(".topComment");
      summary.textContent = cc.length
        ? `View all ${cc.length} comment${cc.length === 1 ? "" : "s"}`
        : "Be the first to comment";
      if (cc[0]) {
        top.hidden = false;
        top.innerHTML = `<b>@${esc(cc[0].profiles?.username || "member")}</b> ${esc(cc[0].body)} <span>♥ ${cc[0].comment_likes?.length || 0}</span>`;
      } else top.hidden = true;
    });
  }
  async function toggleReaction(key, emoji) {
    if (!me()) return window.toast?.("Sign in to react");
    const sb = account().sb,
      { data } = await sb
        .from("post_reactions")
        .select("post_id")
        .eq("post_id", key)
        .eq("user_id", me())
        .eq("emoji", emoji)
        .maybeSingle();
    const q = data
      ? sb
          .from("post_reactions")
          .delete()
          .eq("post_id", key)
          .eq("user_id", me())
          .eq("emoji", emoji)
      : sb
          .from("post_reactions")
          .insert({ post_id: key, user_id: me(), emoji });
    const { error } = await q;
    if (error) return window.toast?.(error.message);
    hydrateSocial();
  }
  async function toggleInlineThread(box, key) {
    if (!me())
      return window.toast?.("Sign in to view and join the conversation");
    const thread = box.querySelector(".inlineThread"),
      opening = thread.hidden;
    thread.hidden = !opening;
    box.querySelector(".topComment").hidden = opening;
    if (opening) await loadInlineThread(box, key);
  }
  async function submitInlineComment(e, box, key) {
    e.preventDefault();
    if (!me()) return window.toast?.("Sign in to comment");
    const input = e.currentTarget.querySelector("input"),
      body = input.value.trim();
    if (!body) return;
    const { error } = await account()
      .sb.from("post_comments")
      .insert({ post_id: key, author_id: me(), body });
    if (error) return window.toast?.(error.message);
    input.value = "";
    await loadInlineThread(box, key);
    hydrateSocial();
  }
  async function loadInlineThread(box, key) {
    const list = box.querySelector(".inlineComments");
    list.innerHTML = '<div class="wireEmpty">Loading comments…</div>';
    let data;
    try {
      data = await fetchCommentData([key]);
    } catch (error) {
      list.innerHTML = '<div class="wireEmpty">Comments could not load.</div>';
      return;
    }
    const rows = (data || []).sort(
      (a, b) =>
        (b.comment_likes?.length || 0) - (a.comment_likes?.length || 0) ||
        new Date(b.created_at) - new Date(a.created_at),
    );
    list.innerHTML = rows.length
      ? rows
          .map(
            (c) =>
              `<article class="commentCard"><div class="commentAvatar">${avatarMarkup(c.profiles?.avatar_url, c.profiles?.username || "U")}</div><div><div class="commentWho">@${esc(c.profiles?.username || "member")} ${c.profiles?.verified ? '<span class="verifiedStar" title="Verified account">☆</span>' : ""}${c.profiles?.site_owner ? ' <span><img src="assets/cp-logo.png?v=20260921-8" alt="CP"> OWNER</span>' : ""} · <small>${ago(c.created_at)}</small></div><p>${esc(c.body)}</p><button data-like-comment="${c.id}" class="${c.comment_likes?.some((l) => l.user_id === me()) ? "liked" : ""}">♥ ${c.comment_likes?.length || 0}</button></div></article>`,
          )
          .join("")
      : '<div class="wireEmpty">No comments yet. Start the conversation.</div>';
    list
      .querySelectorAll("[data-like-comment]")
      .forEach(
        (b) =>
          (b.onclick = () => toggleInlineLike(box, key, b.dataset.likeComment)),
      );
  }
  async function toggleInlineLike(box, key, id) {
    const sb = account().sb,
      { data } = await sb
        .from("comment_likes")
        .select("comment_id")
        .eq("comment_id", id)
        .eq("user_id", me())
        .maybeSingle();
    const q = data
      ? sb
          .from("comment_likes")
          .delete()
          .eq("comment_id", id)
          .eq("user_id", me())
      : sb.from("comment_likes").insert({ comment_id: id, user_id: me() });
    const { error } = await q;
    if (error) return window.toast?.(error.message);
    await loadInlineThread(box, key);
    hydrateSocial();
  }
  function subscribeInteractions() {
    if (interactionChannel || !account().sb) return;
    interactionChannel = account()
      .sb.channel("ledge-social")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_reactions" },
        refreshInteractions,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_comments" },
        refreshInteractions,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_likes" },
        refreshInteractions,
      )
      .subscribe();
  }
  function refreshInteractions() {
    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => {
      hydrateSocial();
      feed.querySelectorAll(".inlineThread:not([hidden])").forEach((thread) => {
        const box = thread.closest("[data-social]");
        loadInlineThread(box, box.dataset.social);
      });
    }, 180);
  }
  async function loadLive() {
    live.innerHTML = '<div class="wireGame">Refreshing the NFL slate…</div>';
    try {
      const now = new Date(),
        w =
          store.pickem?.week && store.pickem.week <= 18 ? store.pickem.week : 2,
        dateKey = (d) =>
          `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`,
        yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const urls = [
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${dateKey(now)}&limit=100&_=${Date.now()}`,
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${dateKey(yesterday)}&limit=100&_=${Date.now()}`,
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${w}&dates=2026&limit=100&_=${Date.now()}`,
        ],
        payloads = await Promise.all(
          urls.map((url) =>
            fetch(url, { cache: "no-store" }).then((r) => r.json()),
          ),
        ),
        unique = new Map();
      payloads
        .flatMap((j) => j.events || [])
        .forEach((event) => unique.set(event.id, event));
      const events = [...unique.values()]
        .sort((a, b) => {
          const sa = a.status?.type?.state,
            sb = b.status?.type?.state,
            pa = sa === "in" ? 0 : sa === "pre" ? 1 : 2,
            pb = sb === "in" ? 0 : sb === "pre" ? 1 : 2;
          if (pa !== pb) return pa - pb;
          return pa === 2
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        })
        .slice(0, 12);
      live.innerHTML = events.length
        ? events
            .map((ev) => {
              const c = ev.competitions?.[0],
                teams = c?.competitors || [],
                h = teams.find((x) => x.homeAway === "home"),
                a = teams.find((x) => x.homeAway === "away"),
                state = ev.status?.type?.state,
                isLive = state === "in",
                kick = new Date(ev.date),
                time =
                  state === "pre"
                    ? (kick.toDateString() === new Date(now).toDateString()
                        ? "Tonight · "
                        : "") +
                      kick.toLocaleString([], {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ev.status?.type?.shortDetail || "";
              return `<article class="wireGame ${isLive ? "live" : ""}" data-live-game="${ev.id}" tabindex="0" role="button" aria-label="Open ${esc(a?.team?.shortDisplayName || "away")} at ${esc(h?.team?.shortDisplayName || "home")} game"><div class="wireGameTop"><span>${esc(time || "NFL")}</span><span class="${isLive ? "live" : ""}">${isLive ? "● LIVE" : state === "post" ? "FINAL" : "UPCOMING"}</span></div><div class="wireTeam"><img src="${a?.team?.logo || ""}"><span>${esc(a?.team?.shortDisplayName || "Away")}</span><b>${state === "pre" ? "" : esc(a?.score || 0)}</b></div><div class="wireTeam"><img src="${h?.team?.logo || ""}"><span>${esc(h?.team?.shortDisplayName || "Home")}</span><b>${state === "pre" ? "" : esc(h?.score || 0)}</b></div></article>`;
            })
            .join("")
        : '<div class="wireGame">No games found for this week.</div>';
      live.querySelectorAll("[data-live-game]").forEach((card) => {
        const open = () => window.openNFLGame?.(card.dataset.liveGame);
        card.onclick = open;
        card.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        };
      });
    } catch (e) {
      live.innerHTML =
        '<div class="wireGame">Live scores are temporarily unavailable.</div>';
    }
  }
  renderFeed();
  loadLive();
})();
