/* ============================================================
   Rebel Glam — tính năng MỞ RỘNG
   1) LƯU look (localStorage) + tủ đồ "Look đã lưu"
   2) Đấu PK giả lập: chọn địa điểm random -> phối đồ trong 2:30
      đấu với 1 bot (tên như người thật) -> chấm điểm 10s -> kết quả.
   Dùng API window.RG do game.js expose: getLook/setLook/reset/
   makeDollNode/addCoins/toast/sparkle.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const phone = $("#phone");
  const RG = window.RG;
  // âm thanh + haptic (an toàn nếu sound.js chưa nạp)
  const snd = n => { if (window.RGSound) RGSound.sfx(n); };
  const hap = n => { if (window.RGSound) RGSound.haptic(n); };

  /* ============================================================
     1) LƯU LOOK + TỦ ĐỒ
     ============================================================ */
  const SAVE_KEY = "rg_saved_looks";
  const loadSaves = () => {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; }
    catch (e) { return []; }
  };
  const writeSaves = arr => localStorage.setItem(SAVE_KEY, JSON.stringify(arr));

  function saveCurrentLook() {
    const arr = loadSaves();
    if (arr.length >= 24) arr.pop();               // giữ tối đa 24 look gần nhất
    const n = arr.length + 1;
    const cur = RG.getLook();
    arr.unshift({ id: "look_" + n + "_" + idStamp(), name: "Look " + n, look: cur });
    writeSaves(arr);
    commitHomeLook(cur);                            // bấm Lưu -> Home mới cập nhật look đang mặc
    snd("save"); hap("success");
    RG.toast("💾 Đã lưu look!");
  }
  // tránh Date.now (không bắt buộc), tạo hậu tố ngẫu nhiên ngắn ổn định
  let stampCtr = 0;
  function idStamp() { stampCtr += 1; return (stampCtr * 7919 % 100000).toString(36); }

  function openWardrobe() {
    const arr = loadSaves();
    const ov = overlay("rg-wardrobe");

    const head = document.createElement("div");
    head.className = "pk-head";
    head.innerHTML = `<h2>📁 Look đã lưu</h2>` +
      (arr.length ? `<p class="pk-sub">${arr.length} look • chạm để mặc lại</p>` : ``);
    ov.appendChild(head);

    if (!arr.length) {
      const empty = document.createElement("div");
      empty.className = "save-empty";
      empty.innerHTML =
        `<div class="se-ic">👗</div>
         <p>Chưa có look nào</p>
         <span>Phối đồ xong bấm 💾 để cất vào tủ nhé!</span>`;
      ov.appendChild(empty);
    } else {
      const grid = document.createElement("div");
      grid.className = "save-grid";
      arr.forEach((entry) => {
        const card = document.createElement("div");
        card.className = "save-card";
        const thumb = document.createElement("div");
        thumb.className = "save-thumb";
        thumb.appendChild(RG.makeDollNode(entry.look));
        const name = document.createElement("div");
        name.className = "save-name";
        name.textContent = entry.name;
        const del = document.createElement("button");
        del.className = "save-del";
        del.textContent = "✕";
        del.title = "Xoá";
        del.onclick = (e) => {
          e.stopPropagation();
          const a = loadSaves().filter(x => x.id !== entry.id);  // xoá theo id, tránh lệch chỉ số
          writeSaves(a);
          card.classList.add("removing");
          setTimeout(() => {
            card.remove();
            if (!a.length) { closeOverlay(ov); openWardrobe(); }  // rỗng -> hiện empty-state
          }, 180);
        };
        card.onclick = () => { snd("equip"); hap("select"); RG.setLook(entry.look); commitHomeLook(entry.look); closeOverlay(ov); RG.toast("✨ Đã mặc lại " + entry.name); };
        card.appendChild(thumb); card.appendChild(name); card.appendChild(del);
        grid.appendChild(card);
      });
      ov.appendChild(grid);
    }

    const footer = document.createElement("div");
    footer.className = "pk-row wardrobe-foot";
    const close = btn("Đóng", "pk-btn ghost");
    close.onclick = () => closeOverlay(ov);
    footer.appendChild(close);
    ov.appendChild(footer);

    phone.appendChild(ov);
  }

  /* ============================================================
     2) ĐẤU PK GIẢ LẬP
     ============================================================ */
  const LOCATIONS = [
    { key: "beach",   icon: "🏖️", label: "Bãi biển",      hint: "Mát mẻ: hoa nhí, màu biển, sneaker/denim", tags: ["floral", "aqua", "teal", "sundrunk", "watermelon", "apricot", "sneaker", "crop", "denim", "sunglass", "peach", "coral", "tangerine", "cottage"] },
    { key: "museum",  icon: "🏛️", label: "Bảo tàng",      hint: "Thanh lịch: blazer/beret, tông trầm, ngọc trai", tags: ["blazer", "beret", "plaid", "brown", "nude", "ash", "mauve", "pearl", "gray", "straight", "caramel", "corset_white"] },
    { key: "gala",    icon: "🥂", label: "Dạ tiệc",       hint: "Sang trọng: đầm dạ hội, lấp lánh, cao gót, tiara", tags: ["gown", "sequin", "gold", "silver", "heels", "tiara", "choker", "smoky", "red", "fuchsia", "navy_starry", "couture", "beaded"] },
    { key: "runway",  icon: "💃", label: "Sàn diễn",      hint: "Cá tính: da/lưới, phá cách, platform, makeup đậm", tags: ["mesh", "graphic", "rainbow", "leather", "corset", "platform", "bold", "cateye", "punk", "mohawk", "feather", "puff"] },
    { key: "cafe",    icon: "☕", label: "Quán cà phê",   hint: "Nhẹ nhàng: hoa nhí, denim, pastel, beret", tags: ["cottage", "floral", "denim", "beret", "nude", "peach", "blush", "caramel", "sneaker", "petal", "plaid"] },
    { key: "wedding", icon: "💒", label: "Tiệc cưới",     hint: "Tinh khôi: trắng, ren, tulle, ngọc trai, tiara", tags: ["white", "beaded", "tulle", "pearl", "nude", "rosy", "peach", "tiara", "couture", "blue_lace"] },
    { key: "club",    icon: "🌃", label: "Phố đêm",       hint: "Nổi bật: sequin, da, smoky, tông neon/hồng đậm", tags: ["sparkle", "sequin", "mesh", "leather", "smoky", "bold", "hotpink", "fuchsia", "heels_black", "fire", "punk", "combat"] },
    { key: "park",    icon: "🌳", label: "Dạo phố",       hint: "Năng động: jeans/cargo, sneaker, denim", tags: ["jeans", "skinny", "cargo", "sneaker", "denim", "plaid", "natural", "brown", "crop", "cottage", "glitter"] },
    { key: "redcarpet", icon: "✨", label: "Thảm đỏ",     hint: "Đẳng cấp: gown, ánh kim, cao gót, tiara", tags: ["gown", "couture", "red_gown", "sequin", "silver", "gold", "tiara", "heels", "smoky", "draped", "iceblue", "ombre"] },
  ];

  const BOT_NAMES = [
    // English / international
    "Emma", "Olivia", "Sophia", "Isabella", "Mia", "Ava", "Chloe", "Luna",
    "Scarlett", "Aurora", "Bella", "Zoe", "Ruby", "Stella",
    // Korean
    "Jisoo", "Jennie", "Rosé", "Lisa", "Nayeon", "Tzuyu", "Yuna", "Wonyoung",
    "Karina", "Minji", "Hanni",
    // Chinese
    "Mei Lin", "Xiao Yu", "Li Wei", "Yuki Chen", "Zhang Na", "Wang Fei",
    "Liu Yan", "Chen Xi",
    // Japanese / other international
    "Sakura", "Hina", "Aiko", "Nina", "Chiara", "Camila", "Sofia", "Yara"];

  const rand = a => a[Math.floor(Math.random() * a.length)];

  /* ---- CHỈ DÙNG item CÓ ẢNH HỢP LỆ ----
     Config có nhiều item chưa gen ảnh layer -> mặc lên không hiện. Trước đây vẫn được CỘNG ĐIỂM
     -> bot "tàng hình" mà vẫn thắng. Dò sẵn ảnh layer lúc khởi động; bot chỉ mặc + chỉ chấm điểm
     item render được. (Tóc là base -> luôn hiện nhờ fallback body, không cần dò.) */
  const RENDERABLE = new Set();
  let renderReady = false;
  (function probeLayers() {
    const ids = [];
    for (const cat of CATEGORIES) { if (cat.isBase) continue; for (const it of cat.items) { if (it.id !== "__none" && it.id !== "__default") ids.push(it.id); } }
    if (!ids.length) { renderReady = true; return; }
    let done = 0;
    ids.forEach(id => {
      const im = new Image();
      const fin = ok => { if (ok) RENDERABLE.add(id); if (++done === ids.length) renderReady = true; };
      im.onload = () => fin(im.naturalWidth > 0);
      im.onerror = () => fin(false);
      im.src = "assets/layers_png/" + id + ".png";
    });
  })();
  // item có hiện lên người không? (chưa dò xong -> tạm chấp nhận hết để không vỡ điểm)
  const isWorn = (key, id) => {
    if (!id || id === "__none" || id === "__default") return false;
    if (key === "hair") return true;
    return !renderReady || RENDERABLE.has(id);
  };
  const realItems = cat => cat.items.filter(i =>
    i.id !== "__none" && i.id !== "__default" && (cat.isBase || !renderReady || RENDERABLE.has(i.id)));

  /* ---- CHẤM ĐIỂM (tất định, minh bạch) ----
     score = theme (hợp chủ đề) + complete (độ hoàn thiện). KHÔNG random -> bộ đồ tốt hơn
     LUÔN thắng, kết quả giải thích được. Trả về cả thành phần để hiển thị. */
  function scoreLook(look, loc) {
    let theme = 0, matches = 0;
    for (const cat of CATEGORIES) {
      const id = look[cat.key];
      if (!isWorn(cat.key, id)) continue;          // chỉ tính món THẬT SỰ hiện lên người
      if (loc.tags.some(t => id.indexOf(t) >= 0)) { matches++; theme += 8; }
    }
    theme += Math.min(matches, 5) * 2;             // thưởng đồng bộ cả bộ theo chủ đề

    const has = key => isWorn(key, look[key]);
    let complete = 0;
    if (look.hair && look.hair !== "__default") complete += 8;
    const hasDress = has("dress");
    const fullOutfit = hasDress || (has("top") && has("bottom"));
    if (fullOutfit) complete += 18;
    else if (hasDress || has("top") || has("bottom")) complete += 8;
    if (has("shoes")) complete += 8;
    if (has("eyemakeup") || has("lips")) complete += 9;
    if (has("blush") || has("eyes") || has("brows")) complete += 5;
    let acc = 0;
    for (const k of ["headwear", "eyewear", "earrings", "necklace", "bag"]) if (has(k)) acc++;
    complete += Math.min(acc, 3) * 4;

    theme = Math.round(theme); complete = Math.round(complete);
    const score = Math.max(5, Math.min(100, theme + complete));
    return { score, theme, complete, matches };
  }

  /* sinh 1 look cho bot. themeProb điều chỉnh độ "bám chủ đề" -> cho phép tạo nhiều mức điểm.
     LUÔN có tóc + outfit đủ + giày -> bot trông được mặc tử tế. */
  function makeLookFor(loc, themeProb = 0.85) {
    const look = {};
    const useDress = Math.random() < 0.5;
    const pickFrom = (reals, fits) => {
      if (!reals.length) return "__none";
      if (fits.length && Math.random() < themeProb) return rand(fits).id;
      return rand(reals).id;
    };
    for (const cat of CATEGORIES) {
      const reals = realItems(cat);
      const fits = reals.filter(i => loc.tags.some(t => i.id.indexOf(t) >= 0));
      let pick;
      if (cat.key === "hair") pick = pickFrom(reals, fits);                    // luôn có tóc
      else if (cat.key === "dress") pick = useDress ? pickFrom(reals, fits) : "__none";
      else if (cat.key === "top" || cat.key === "bottom") pick = useDress ? "__none" : pickFrom(reals, fits);
      else if (cat.key === "shoes") pick = pickFrom(reals, fits);              // luôn có giày
      else if (cat.key === "eyemakeup" || cat.key === "lips") pick = Math.random() < 0.9 ? pickFrom(reals, fits) : "__none";
      else if (["headwear", "eyewear", "earrings", "necklace", "bag"].includes(cat.key))
        pick = Math.random() < 0.5 ? pickFrom(reals, fits) : "__none";
      else pick = Math.random() < 0.7 ? pickFrom(reals, fits) : "__none";     // eyes/brows/blush
      look[cat.key] = pick;
    }
    return look;
  }

  /* ---- ĐỘ KHÓ (chỉnh ở đây) ----
     Bot là đối thủ TẦM TRUNG: điểm rơi vào dải [BOT_MIN, BOT_MAX]. Phối đồ đúng chủ đề + đủ
     bộ (~90-100đ) sẽ thắng chắc; phối qua loa sẽ ~50/50; bỏ trống sẽ thua. */
  const BOT_MIN = 60, BOT_MAX = 80;
  function botLookFor(loc) {
    const target = BOT_MIN + Math.floor(Math.random() * (BOT_MAX - BOT_MIN + 1));
    let best = null, bestD = 1e9;
    for (let i = 0; i < 18; i++) {
      const l = makeLookFor(loc, 0.15 + Math.random() * 0.8);   // đa dạng mức bám chủ đề
      const d = Math.abs(scoreLook(l, loc).score - target);
      if (d < bestD) { bestD = d; best = l; }
    }
    return best;
  }

  /* ---------- state PK ---------- */
  let pk = null;
  // look người chơi đã chọn TRƯỚC khi vào PK — để khôi phục khi rời PK,
  // tránh việc đồ phối tạm trong trận "đè" lên look hiển thị ở Home/studio.
  let pkPrevLook = null;
  function leavePK() {
    if (pk) clearInterval(pk.timer);               // dừng đồng hồ nếu đang đấu dở
    const hud = $("#pkHud"); if (hud) hud.remove(); // gỡ HUD trận
    pk = null;
    if (pkPrevLook) { RG.setLook(pkPrevLook); pkPrevLook = null; }  // trả lại look trước khi vào PK
  }

  const HAIR_CAT = CATEGORIES.find(c => c.key === "hair");
  const randHair = () => rand(HAIR_CAT.items.filter(i => i.id !== "__default")).id;

  // avatar chân dung (cắt vùng đầu/vai) từ 1 look
  function makeAvatar(look) {
    const a = document.createElement("div");
    a.className = "match-ava";
    a.appendChild(RG.makeDollNode(look));
    return a;
  }
  function exitBtn(ov) {
    const x = document.createElement("button");
    x.className = "pk-exit"; x.textContent = "✕"; x.title = "Thoát";
    x.onclick = () => { closeOverlay(ov); leavePK(); showHome(); };  // thoát PK -> về Home (main)
    return x;
  }

  // 1) Vào PK -> tự ghép đối thủ (màn loading), rồi tự quay địa điểm
  function openPK() {
    if (pk) return;
    // nhớ look đang chọn (giữ nguyên qua các lần "Đấu lại" nhờ ||)
    pkPrevLook = pkPrevLook || RG.getLook();
    showMatchmaking(rand(BOT_NAMES), randHair());
  }

  // ----- màn loading: ghép 2 đối thủ -----
  function showMatchmaking(botName, botHair) {
    const ov = overlay("rg-match");
    ov.innerHTML = `<div class="pk-head"><h2>⚔️ Tìm đối thủ</h2><p class="pk-sub">Đang ghép trận đấu PK…</p></div>`;
    ov.appendChild(exitBtn(ov));

    const arena = document.createElement("div");
    arena.className = "match-arena";
    const meSide = document.createElement("div");
    meSide.className = "match-side";
    meSide.appendChild(makeAvatar({ ...RG.getLook() }));
    meSide.insertAdjacentHTML("beforeend", `<div class="match-name">Bạn</div>`);
    const vs = document.createElement("div"); vs.className = "match-vs"; vs.textContent = "VS";
    const boSide = document.createElement("div"); boSide.className = "match-side";
    boSide.appendChild(makeAvatar({ hair: botHair }));
    const boName = document.createElement("div"); boName.className = "match-name"; boName.textContent = "???";
    boSide.appendChild(boName);
    arena.append(meSide, vs, boSide);
    ov.appendChild(arena);

    const bar = document.createElement("div"); bar.className = "match-bar"; bar.innerHTML = "<i></i>";
    ov.appendChild(bar);
    const status = document.createElement("div"); status.className = "match-status"; status.textContent = "Đang tìm đối thủ…";
    ov.appendChild(status);
    phone.appendChild(ov);

    // tên đối thủ chạy ngẫu nhiên rồi chốt
    const cyc = setInterval(() => { boName.textContent = rand(BOT_NAMES); }, 110);
    setTimeout(() => {
      if (!ov.isConnected) { clearInterval(cyc); return; }
      clearInterval(cyc);
      boName.textContent = botName;
      boSide.classList.add("locked");
      snd("match"); hap("success");
      status.textContent = "Đã tìm thấy đối thủ: " + botName + "!";
    }, 1700);
    setTimeout(() => {
      if (!ov.isConnected) return;
      closeOverlay(ov);
      openLocationScreen(botName, botHair);
    }, 2900);
  }

  // ----- màn địa điểm: tự quay -----
  function openLocationScreen(botName, botHair) {
    const ov = overlay("rg-pk");
    ov.innerHTML = `<div class="pk-head"><h2>🎰 Quay số địa điểm</h2><p class="pk-sub">Hệ thống đang chọn bối cảnh thi đấu…</p></div>`;
    ov.appendChild(exitBtn(ov));
    const grid = document.createElement("div");
    grid.className = "pk-grid";
    LOCATIONS.forEach(loc => {
      const c = document.createElement("div");
      c.className = "loc-card";
      c.dataset.key = loc.key;
      c.innerHTML = `<span class="loc-ic">${loc.icon}</span><span class="loc-lb">${loc.label}</span>`;
      grid.appendChild(c);
    });
    ov.appendChild(grid);
    phone.appendChild(ov);
    setTimeout(() => { if (ov.isConnected) spinLocation(grid, ov, botName, botHair); }, 600);
  }

  function spinLocation(grid, ov, botName, botHair) {
    const cards = [...grid.querySelectorAll(".loc-card")];
    const target = Math.floor(Math.random() * LOCATIONS.length);
    let i = 0, ticks = 0;
    const total = 22 + target;
    const step = () => {
      if (!ov.isConnected) return;                 // bị thoát -> dừng quay
      cards.forEach(c => c.classList.remove("hot"));
      cards[i % cards.length].classList.add("hot");
      snd("tick");
      ticks++;
      if (ticks >= total) {
        const loc = LOCATIONS[i % cards.length];
        cards[i % cards.length].classList.add("won");
        snd("lock"); hap("success");
        const sub = ov.querySelector(".pk-sub"); if (sub) sub.textContent = "📍 " + loc.label + " • " + loc.hint;
        setTimeout(() => { if (ov.isConnected) startBattle(loc, ov, botName, botHair); }, 950);
        return;
      }
      i++;
      setTimeout(step, 60 + ticks * 7);            // chậm dần
    };
    step();
  }

  /* ---------- vào trận: HUD + đếm ngược 2:30 ---------- */
  function startBattle(loc, selectOv, botName, botHair) {
    closeOverlay(selectOv);
    RG.reset();                                    // bắt đầu từ look mộc cho công bằng
    const botLook = botLookFor(loc);
    if (botHair) botLook.hair = botHair;           // giữ đúng đối thủ đã gặp ở màn ghép trận
    pk = { loc, botName, botLook, left: 150, timer: null, ended: false };

    const hud = document.createElement("div");
    hud.id = "pkHud";
    hud.innerHTML =
      `<div class="pk-timepill"><span class="pk-clock">⏱️</span><b class="pk-time" id="pkTime">2:30</b></div>
       <button id="pkFinish" class="pk-finish">Xong ✓</button>`;
    $("#stage").appendChild(hud);
    $("#pkFinish").onclick = () => endBattle(false);

    // thông tin trận đưa vào toast (không chiếm chỗ che nhân vật)
    RG.toast(`${loc.icon} ${loc.label} vs ${botName} • 💡 ${loc.hint}`);

    pk.timer = setInterval(() => {
      pk.left--;
      const m = Math.floor(pk.left / 60), s = pk.left % 60;
      const t = $("#pkTime"); if (t) t.textContent = m + ":" + (s < 10 ? "0" + s : s);
      if (t && pk.left <= 15) t.classList.add("danger");
      if (pk.left <= 0) endBattle(true);
    }, 1000);
  }

  function endBattle(timeUp) {
    if (!pk || pk.ended) return;
    pk.ended = true;
    clearInterval(pk.timer);
    const hud = $("#pkHud"); if (hud) hud.remove();
    scoring(pk.loc, pk.botName, RG.getLook(), pk.botLook, timeUp);
  }

  /* ---------- chấm điểm 10s + diễn cảm + kết quả ---------- */
  function scoring(loc, botName, playerLook, botLook, timeUp) {
    const pB = scoreLook(playerLook, loc);
    const bB = scoreLook(botLook, loc);
    const ov = overlay("rg-score");

    ov.innerHTML = `<div class="pk-head">
        <h2>${loc.icon} ${loc.label}</h2>
        <p class="pk-sub">${timeUp ? "Hết giờ! " : ""}Giám khảo đang chấm điểm…</p>
      </div>`;

    const arena = document.createElement("div");
    arena.className = "vs-arena";
    const side = (name, lookObj, who, brk) => {
      const w = document.createElement("div"); w.className = "vs-side " + who;
      const stg = document.createElement("div"); stg.className = "vs-stage";
      stg.appendChild(RG.makeDollNode(lookObj));
      const nm = document.createElement("div"); nm.className = "vs-name"; nm.textContent = name;
      const sc = document.createElement("div"); sc.className = "vs-score"; sc.textContent = "0";
      const bd = document.createElement("div"); bd.className = "vs-break";
      bd.innerHTML = `<span>🎯 Hợp gu <b>${brk.theme}</b></span><span>👗 Hoàn thiện <b>${brk.complete}</b></span>`;
      w.appendChild(stg); w.appendChild(nm); w.appendChild(sc); w.appendChild(bd);
      return { w, sc };
    };
    const pl = side("Bạn", playerLook, "me", pB);
    const bo = side(botName, botLook, "bot", bB);
    const vs = document.createElement("div"); vs.className = "vs-mid"; vs.textContent = "VS";
    arena.appendChild(pl.w); arena.appendChild(vs); arena.appendChild(bo.w);
    ov.appendChild(arena);
    phone.appendChild(ov);

    // diễn cảm: tia lửa va chạm + đếm điểm trong ~ vài giây, tổng quy trình 10s
    let clashN = 0;
    const clash = setInterval(() => { vsSpark(vs); snd("clash"); hap("light"); if (++clashN > 6) clearInterval(clash); }, 280);
    countTo(pl.sc, pB.score, 1800);
    countTo(bo.sc, bB.score, 1800);

    setTimeout(() => showResult(ov, loc, pl, bo, pB.score, bB.score), 10000);
  }

  function showResult(ov, loc, pl, bo, ps, bs) {
    const win = ps >= bs, draw = false;           // hoà điểm -> xử người chơi thắng
    if (win) pl.w.classList.add("winner"), bo.w.classList.add("loser");
    else if (!draw) bo.w.classList.add("winner"), pl.w.classList.add("loser");

    const reward = win ? 200 : draw ? 80 : 30;
    RG.addCoins(reward);
    syncCoins();                                  // cập nhật xu hiển thị ở Home
    if (win) { snd("win"); hap("win"); setTimeout(() => snd("coin"), 700); }
    else { snd("lose"); hap("lose"); }

    const ban = document.createElement("div");
    ban.className = "pk-result " + (win ? "win" : draw ? "draw" : "lose");
    ban.innerHTML =
      `<div class="pk-rtitle">${win ? "🏆 CHIẾN THẮNG!" : draw ? "🤝 HOÀ!" : "💔 THUA RỒI"}</div>
       <div class="pk-rsub">${win ? "Gu thời trang đỉnh cao!" : draw ? "Bất phân thắng bại!" : "Lần sau cố lên nhé!"}</div>
       <div class="pk-reward">+${reward} ◈</div>`;
    ov.appendChild(ban);

    if (win) RG.sparkle("full", 18);

    const again = btn("Đấu lại", "pk-btn");
    const home = btn("Về phối đồ", "pk-btn ghost");
    again.onclick = () => { closeOverlay(ov); pk = null; openPK(); };
    home.onclick = () => { closeOverlay(ov); leavePK(); };
    const row = document.createElement("div"); row.className = "pk-row";
    row.appendChild(again); row.appendChild(home);
    ov.appendChild(row);
  }

  /* ---------- helpers ---------- */
  function overlay(cls) {
    const ov = document.createElement("div");
    ov.className = "rg-overlay " + cls;
    requestAnimationFrame(() => ov.classList.add("in"));
    snd("open"); hap("light");
    return ov;
  }
  function closeOverlay(ov) { ov.classList.remove("in"); snd("close"); setTimeout(() => ov.remove(), 220); }
  function btn(label, cls) { const b = document.createElement("button"); b.className = cls; b.textContent = label; return b; }
  function countTo(el, target, dur) {
    const start = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick); else el.textContent = target;
    };
    requestAnimationFrame(tick);
  }
  function vsSpark(host) {
    for (let i = 0; i < 5; i++) {
      const p = document.createElement("div");
      p.className = "vs-spark";
      p.textContent = rand(["✦", "✸", "⚡", "✶", "★"]);
      p.style.left = (40 + Math.random() * 20) + "%";
      p.style.top = (38 + Math.random() * 20) + "%";
      p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      p.style.setProperty("--dy", (Math.random() * 120 - 60) + "px");
      host.parentNode.appendChild(p);
      setTimeout(() => p.remove(), 620);
    }
  }

  /* ============================================================
     3) ĐIỀU HƯỚNG MÀN HÌNH CHÍNH (Home)
        - Home phủ lên studio. "Phối đồ" -> ẩn Home (vào studio).
        - "PK VS" -> ẩn Home rồi vào PK (PK cần studio để phối đồ).
        - "Bộ sưu tập" -> mở tủ đồ dạng overlay ngay trên Home.
     ============================================================ */
  const home = $("#home");
  function syncCoins() {
    const c = $("#coinCount"), h = $("#homeCoinCount");
    if (c && h) h.textContent = c.textContent;
  }

  /* ---- LOOK HIỂN THỊ Ở HOME ----
     Home KHÔNG bám look đang phối trong studio; nó chỉ hiện look đã "chốt".
     - chốt khi: bấm Lưu (💾) hoặc mặc lại 1 look từ tủ đồ.
     - phối đồ tự do trong studio mà không lưu -> Home vẫn giữ look cũ.
     - lần đầu chưa lưu -> DEFAULT_LOOK (mộc). Lưu vào localStorage để nhớ qua phiên. */
  const HOME_KEY = "rg_home_look";
  function loadHomeLook() { try { return JSON.parse(localStorage.getItem(HOME_KEY)); } catch (e) { return null; } }
  let homeLook = loadHomeLook() || { ...DEFAULT_LOOK };
  function buildHomeChar() {
    const host = $("#homeChar");
    if (!host) return;
    host.innerHTML = "";
    host.appendChild(RG.makeDollNode(homeLook));
  }
  function commitHomeLook(l) {            // chốt look mới cho Home + lưu lại
    homeLook = { ...l };
    try { localStorage.setItem(HOME_KEY, JSON.stringify(homeLook)); } catch (e) {}
    buildHomeChar();
  }
  window.RG_commitHomeLook = commitHomeLook;   // cho saveCurrentLook gọi

  function showHome() { syncCoins(); buildHomeChar(); home.classList.remove("hidden"); }
  function hideHome() { home.classList.add("hidden"); }
  window.RG_showHome = showHome;                 // cho features khác gọi nếu cần

  /* ---------- wiring ---------- */
  $("#btnSave").onclick = saveCurrentLook;
  $("#btnHome").onclick = () => { leavePK(); showHome(); };  // back: nếu đang trong trận PK thì dọn trận, rồi về Home
  $("#goDress").onclick = hideHome;
  $("#goPK").onclick = () => { hideHome(); openPK(); };
  $("#goCollection").onclick = openWardrobe;

  buildHomeChar();                                // dựng nhân vật Home theo look đã chốt (đã lưu / default)
})();
