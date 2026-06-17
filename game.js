/* Rebel Glam — logic: base (thân) + layer căn sẵn */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const catByKey = k => CATEGORIES.find(c => c.key === k);
  // âm thanh + haptic (an toàn nếu sound.js chưa nạp)
  const snd = n => { if (window.RGSound) RGSound.sfx(n); };
  const hap = n => { if (window.RGSound) RGSound.haptic(n); };

  let look = { ...DEFAULT_LOOK };
  let activeGroup = "body";
  let activeCat = "hair";
  let coins = 1250;
  const groupByKey = k => GROUPS.find(g => g.key === k);

  const V = "?v=" + (window.ASSET_VER || "31");   // cache-busting: bump khi đổi asset
  const baseUrl = hairId => ((hairId && hairId !== "__default") ? BASE_DIR + hairId + ".png" : BASE_DEFAULT) + V;
  const layerUrl = id => LAYER_DIR + id + ".png" + V;
  const iconUrl = id => ICON_DIR + id + ".png" + V;

  /* ---------- dựng nhân vật (CẬP NHẬT KHÁC BIỆT — không dựng lại toàn bộ) ----------
     Trước đây mỗi lần chọn item là xoá & tạo lại TẤT CẢ layer -> cả người chớp/giật.
     Giờ chỉ đụng vào layer thực sự đổi, và nạp ảnh mới xong mới thay -> mượt, không chớp. */
  function renderDoll() {
    // base = thân theo kiểu tóc; chỉ set src khi đổi (set lại cùng src cũng gây decode lại)
    const doll = $("#doll");
    const wantBase = baseUrl(look.hair);
    if (doll.getAttribute("src") !== wantBase) {
      doll.onerror = () => { if (doll.src.indexOf("__default") < 0) doll.src = BASE_DEFAULT; };
      doll.src = wantBase;
    }

    const wrap = $("#dollFx");
    for (const cat of CATEGORIES) {
      if (cat.isBase) continue;               // tóc xử lý ở base
      const id = look[cat.key];
      let div = wrap.querySelector(".layer-" + cat.key);

      if (!id || id === "__none") { if (div) div.remove(); continue; }  // bỏ món -> gỡ layer
      const url = layerUrl(id);

      if (div) {
        // layer đã có: chỉ đổi ảnh khi item khác, và đổi sau khi tải xong để khỏi chớp
        const img = div.firstChild;
        if (img.dataset.id !== id) {
          const next = new Image();
          next.onload = () => { img.src = url; img.dataset.id = id; };
          next.onerror = () => div.remove();
          next.src = url;
        }
      } else {
        // layer mới
        div = document.createElement("div");
        div.className = "layer layer-" + cat.key;
        div.style.zIndex = ZINDEX[cat.key] || 30;
        const img = new Image();
        img.dataset.id = id;
        img.onerror = () => div.remove();
        img.src = url;
        div.appendChild(img);
        wrap.appendChild(div);
      }
    }

    // TÓC TRƯỚC: phủ tóc LÊN TRÊN makeup/đồ (tóc ở trên cùng). __default không có hairfront.
    {
      const hid = look.hair;
      let hdiv = wrap.querySelector(".layer-hairfront");
      if (!hid || hid === "__default") { if (hdiv) hdiv.remove(); }
      else {
        const hurl = HAIRFRONT_DIR + hid + ".png" + V;
        if (hdiv) {
          const img = hdiv.firstChild;
          if (img.dataset.id !== hid) {
            const next = new Image();
            next.onload = () => { img.src = hurl; img.dataset.id = hid; };
            next.onerror = () => hdiv.remove();
            next.src = hurl;
          }
        } else {
          hdiv = document.createElement("div");
          hdiv.className = "layer layer-hairfront";
          hdiv.style.zIndex = ZINDEX.hairfront || 64;
          const img = new Image();
          img.dataset.id = hid;
          img.onerror = () => hdiv.remove();
          img.src = hurl;
          hdiv.appendChild(img);
          wrap.appendChild(hdiv);
        }
      }
    }
  }

  /* ---------- nav cấp 1: 3 nhóm lớn ---------- */
  function renderGroups() {
    const nav = $("#groups"); nav.innerHTML = "";
    for (const g of GROUPS) {
      const el = document.createElement("div");
      el.className = "group" + (g.key === activeGroup ? " on" : "");
      el.title = g.label;
      el.innerHTML = `<span class="gi">${svgIcon(g.key) || g.icon}</span>`;
      el.onclick = () => {
        engaged = true;
        activeGroup = g.key;
        activeCat = g.cats[0];
        snd("tap"); hap("light");
        renderGroups(); renderTabs(); renderItems();
      };
      nav.appendChild(el);
    }
  }

  /* ---------- nav cấp 2: sub-tab của nhóm đang chọn ---------- */
  function renderTabs() {
    const nav = $("#tabs"); nav.innerHTML = "";
    const cats = groupByKey(activeGroup).cats;
    for (const key of cats) {
      const cat = catByKey(key);
      const el = document.createElement("div");
      el.className = "tab" + (cat.key === activeCat ? " on" : "");
      el.title = cat.label;
      el.innerHTML = `<span class="ti">${svgIcon(cat.key) || cat.icon}</span>`;
      el.onclick = () => { engaged = true; activeCat = cat.key; snd("tap"); hap("light"); renderTabs(); renderItems(); };
      nav.appendChild(el);
    }
  }

  /* ---------- "feeling": camera + chuyển động theo việc đang chỉnh ----------
     - hair   : zoom nửa người, khuôn mặt ở giữa, có effect ở tóc
     - face   : zoom mặt, chớp mắt + cắn môi + đung đưa váy theo nhịp
     - outfit : full body, tạo dáng chụp ảnh, có effect khi chọn item
     - full   : (phụ kiện & mặc định) full body, idle thở nhẹ            */
  const FACE_CATS = new Set(["brows", "eyes", "eyemakeup", "lips", "blush"]);
  const OUTFIT_CATS = new Set(["top", "dress", "bottom", "shoes"]);
  function poseFor(cat) {
    if (cat === "hair") return "hair";
    if (FACE_CATS.has(cat)) return "face";
    if (OUTFIT_CATS.has(cat)) return "outfit";
    return "full";
  }
  let engaged = false;        // chưa tap chọn gì -> luôn idle full body
  let blinkTimer = null;
  function applyPose() {
    const pose = engaged ? poseFor(activeCat) : "full";
    const stage = $("#stage");
    stage.classList.remove("pose-full", "pose-hair", "pose-face", "pose-outfit");
    stage.classList.add("pose-" + pose);
    // chuyển động nền theo trạng thái
    const p = $("#dollPose");
    p.classList.remove("cont-photo", "cont-sway");
    if (pose === "face") p.classList.add("cont-sway");
    else if (pose === "outfit") p.classList.add("cont-photo");
    // chế độ chỉnh nét mặt: chớp mắt định kỳ theo nhịp
    clearInterval(blinkTimer); blinkTimer = null;
    if (pose === "face") blinkTimer = setInterval(blink, 2600);
  }

  /* ---------- bảng item ---------- */
  function renderItems() {
    applyPose();
    const cat = catByKey(activeCat);
    const sel = look[cat.key];
    const box = $("#items"); box.innerHTML = "";
    cat.items.forEach(it => {
      const d = document.createElement("div");
      d.className = "item" + (it.id === sel ? " on" : "");
      const none = it.id === "__none" || it.id === "__default";
      d.title = it.label;
      if (none) {
        d.innerHTML = `<span class="none">${it.id === "__default" ? "👤" : "🚫"}</span>`;
      } else {
        d.innerHTML = `<img src="${iconUrl(it.id)}" alt="${it.label}" onerror="this.parentNode.classList.add('miss')"/>`;
      }
      d.onclick = () => {
        engaged = true;                // bắt đầu tương tác -> đổi trạng thái theo mục đang chỉnh
        look[cat.key] = it.id;
        if (cat.key === "dress" && it.id !== "__none") { look.top = "__none"; look.bottom = "__none"; }
        if ((cat.key === "top" || cat.key === "bottom") && it.id !== "__none") look.dress = "__none";
        renderDoll(); renderItems();
        if (none) { snd("tap"); hap("light"); }
        else { snd("equip"); hap("select"); reactFor(cat.key); }  // hiệu ứng "Feeling" theo nhóm
      };
      box.appendChild(d);
    });
  }

  /* ---------- actions ---------- */
  const ACCISH = new Set(["headwear", "eyewear", "earrings", "necklace", "bag",
    "eyemakeup", "brows", "eyes", "lips", "blush"]);
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle() {
    const useDress = Math.random() < 0.4;
    for (const cat of CATEGORIES) {
      const real = cat.items.filter(i => i.id !== "__none");
      if (cat.key === "dress") look.dress = useDress ? rand(real).id : "__none";
      else if (cat.key === "top" || cat.key === "bottom") look[cat.key] = useDress ? "__none" : rand(real).id;
      else if (ACCISH.has(cat.key)) look[cat.key] = Math.random() < 0.55 ? rand(real).id : "__none";
      else look[cat.key] = rand(real).id;   // tóc, giày
    }
    engaged = true;
    renderDoll(); renderItems();
    snd("shuffle"); hap("shuffle");
    reactionBubble("✨ Lột xác!"); poseSnap(); sparkle("full");
  }
  function snap() {
    const f = $("#flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
    snd("snap"); hap("snap");
    coins += 50; $("#coinCount").textContent = coins;
    setTimeout(() => snd("coin"), 220);
    toast("📷 Đã lưu look! +50 ◈");
  }
  function reset() { look = { ...DEFAULT_LOOK }; engaged = false; renderDoll(); renderItems(); snd("close"); hap("medium"); toast("Đã reset"); }

  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1500);
  }

  /* ---------- "Feeling": phản hồi khi chọn item ---------- */
  const REACTIONS = ["Lộng lẫy! 💖", "Yêu quá! 😍", "Cá tính! 🔥", "Xinh xỉu! ✨",
    "Sang chảnh! 👑", "Chất! 🖤", "Ngọt ngào! 🍬", "Slay! 💅", "Tuyệt vời! 🌟"];
  const PARTS = ["✨", "💖", "⭐", "💫", "🌸", "🖤"];

  // phản hồi gọn theo nhóm đang chỉnh
  function reactFor(catKey) {
    const pose = poseFor(catKey);
    // FEELING: nghiêng khoe đồ + lấp lánh (KHÔNG hào quang, KHÔNG loé sáng item)
    if (pose === "hair") { hairBurst(); return; }
    if (pose === "face") { blink(); setTimeout(lipBite, 380); sparkle("face"); }
    else { showOff(); sparkle("full"); }   // trang phục & phụ kiện: nghiêng người khoe đồ + lấp lánh
  }

  // bong bóng chữ
  function reactionBubble(msg) {
    const stage = $("#stage");
    const b = document.createElement("div");
    b.className = "reaction";
    b.textContent = msg || REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    stage.appendChild(b);
    setTimeout(() => b.remove(), 1100);
  }

  // hạt lấp lánh theo vùng (face / hair / full)
  function sparkle(zone, n) {
    const stage = $("#stage");
    const Z = zone === "face" ? { x: [38, 62], y: [22, 48] }
      : zone === "hair" ? { x: [36, 64], y: [14, 40] }
        : { x: [28, 72], y: [30, 74] };
    const count = n || (zone === "full" ? 13 : 9);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = PARTS[Math.floor(Math.random() * PARTS.length)];
      p.style.left = (Z.x[0] + Math.random() * (Z.x[1] - Z.x[0])) + "%";
      p.style.top = (Z.y[0] + Math.random() * (Z.y[1] - Z.y[0])) + "%";
      p.style.setProperty("--dx", (Math.random() * 90 - 45) + "px");
      p.style.setProperty("--dy", (-55 - Math.random() * 90) + "px");
      p.style.fontSize = (12 + Math.random() * 16) + "px";
      p.style.animationDelay = (Math.random() * 0.12) + "s";
      stage.appendChild(p);
      setTimeout(() => p.remove(), 1050);
    }
  }

  // effect ở phần tóc
  function hairBurst() {
    const stage = $("#stage");
    const g = document.createElement("div"); g.className = "hair-glow";
    stage.appendChild(g); setTimeout(() => g.remove(), 950);
    sparkle("hair", 12);
  }

  /* ---------- FEELING MỚI: "mặc đồ là sáng bừng" (không đụng hình thể -> không nảy) ----------
     - item vừa chọn loé sáng (brightness) như vừa khoác lên
     - vầng hào quang glam toả quanh người
     - lấp lánh bay lên                                                                 */
  function pulseEquipped(catKey) {
    const el = catKey === "hair" ? $("#doll") : $("#dollFx .layer-" + catKey);
    if (!el) return;
    el.classList.remove("just-equipped"); void el.offsetWidth; el.classList.add("just-equipped");
    setTimeout(() => el.classList.remove("just-equipped"), 560);
  }
  function glamPop() {
    const stage = $("#stage");
    const g = document.createElement("div"); g.className = "equip-glow";
    stage.appendChild(g); setTimeout(() => g.remove(), 620);
    sparkle("full");
  }

  // chuyển động một nhịp trên #dollFx (lớp riêng — KHÔNG đụng idle ở #dollPose,
  // nhờ vậy phản hồi compose mượt với nhịp thở, không bị giật/nhảy)
  function fx(cls, dur) {
    const p = $("#dollFx");
    p.classList.remove(cls); void p.offsetWidth; p.classList.add(cls);
    setTimeout(() => p.classList.remove(cls), dur);
  }
  function blink() { fx("fx-blink", 360); }
  function lipBite() { fx("fx-bite", 520); }
  function bodyReact() { fx("fx-react", 640); }
  function poseSnap() { fx("fx-pose", 720); }
  function showOff() { fx("fx-show", 820); }   // nghiêng người khoe đồ (mượt, chỉ xoay)

  /* ---------- cuộn hàng item: kéo chuột + lăn dọc -> ngang ---------- */
  function initScroll(el) {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener("wheel", e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { el.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
    el.addEventListener("pointerdown", e => {
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft;
    });
    window.addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; el.classList.add("drag"); }
      el.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", () => { down = false; el.classList.remove("drag"); });
    // nếu vừa kéo thì chặn click chọn nhầm item
    el.addEventListener("click", e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }
  initScroll($("#tabs"));

  $("#btnShuffle").onclick = shuffle;
  $("#btnSnap").onclick = snap;
  $("#btnReset").onclick = reset;

  /* ---------- dựng 1 doll rời (cho preview / đối thủ PK) ---------- */
  function makeDollNode(forLook) {
    const wrap = document.createElement("div");
    wrap.className = "rg-doll";
    const pose = document.createElement("div");
    pose.className = "rg-pose";
    const base = new Image();
    base.className = "rg-base";
    base.src = baseUrl(forLook.hair);
    base.onerror = () => { if (base.src.indexOf("__default") < 0) base.src = BASE_DEFAULT; };
    pose.appendChild(base);
    for (const cat of CATEGORIES) {
      if (cat.isBase) continue;
      const id = forLook[cat.key];
      if (!id || id === "__none") continue;
      const div = document.createElement("div");
      div.className = "layer layer-" + cat.key;
      div.style.zIndex = ZINDEX[cat.key] || 30;
      const img = new Image();
      img.src = layerUrl(id);
      img.onerror = () => div.remove();
      div.appendChild(img);
      pose.appendChild(div);
    }
    // tóc-trước (đồng bộ với editor): phủ tóc lên makeup, KHÔNG che mắt
    if (forLook.hair && forLook.hair !== "__default") {
      const hdiv = document.createElement("div");
      hdiv.className = "layer layer-hairfront";
      hdiv.style.zIndex = ZINDEX.hairfront || 64;
      const himg = new Image();
      himg.src = HAIRFRONT_DIR + forLook.hair + ".png" + V;
      himg.onerror = () => hdiv.remove();
      hdiv.appendChild(himg);
      pose.appendChild(hdiv);
    }
    wrap.appendChild(pose);
    return wrap;
  }

  /* ---------- API cho các tính năng ngoài (lưu look, PK) ---------- */
  window.RG = {
    getLook: () => ({ ...look }),
    setLook(l) { look = { ...DEFAULT_LOOK, ...l }; engaged = true; renderDoll(); renderItems(); },
    reset,
    makeDollNode,
    addCoins(n) { coins += n; $("#coinCount").textContent = coins; },
    toast,
    sparkle,
  };

  renderDoll(); renderGroups(); renderTabs(); renderItems();
})();
