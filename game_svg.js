/* Rebel Glam — demo logic */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const catByKey = k => CATEGORIES.find(c => c.key === k);
  const itemById = (cat, id) => cat.items.find(i => i.id === id);

  // state = bản sao DEFAULT_LOOK
  let look = JSON.parse(JSON.stringify(DEFAULT_LOOK));
  let activeCat = "hair";

  /* ---------- render nhân vật ---------- */
  function renderDoll() {
    $("#layer-body").innerHTML = bodySVG(look.skin);
    $("#layer-face").innerHTML = FACE_BASE;
    for (const cat of CATEGORIES) {
      const sel = look[cat.key];
      const it = itemById(cat, sel.id);
      $("#" + cat.layer).innerHTML = it ? it.draw(sel.color) : "";
    }
  }

  /* ---------- tabs ---------- */
  function renderTabs() {
    const nav = $("#tabs");
    nav.innerHTML = "";
    for (const cat of CATEGORIES) {
      const el = document.createElement("div");
      el.className = "tab" + (cat.key === activeCat ? " on" : "");
      el.innerHTML = `<span class="ti">${cat.icon}</span><span>${cat.label}</span>`;
      el.onclick = () => { activeCat = cat.key; renderTabs(); renderPanel(); };
      nav.appendChild(el);
    }
  }

  /* ---------- swatches + items của category đang chọn ---------- */
  function renderPanel() {
    const cat = catByKey(activeCat);
    const sel = look[cat.key];

    // swatches màu
    const sw = $("#swatches");
    sw.innerHTML = "";
    const colors = PALETTES[cat.palette] || [];
    colors.forEach(c => {
      const d = document.createElement("div");
      d.className = "swatch" + (c === sel.color ? " on" : "");
      d.style.background = c;
      d.onclick = () => { sel.color = c; renderDoll(); renderPanel(); };
      sw.appendChild(d);
    });

    // items
    const box = $("#items");
    box.innerHTML = "";
    cat.items.forEach(it => {
      const d = document.createElement("div");
      d.className = "item" + (it.id === sel.id ? " on" : "");
      d.innerHTML = `<span class="emo">${it.icon}</span><span class="nm">${it.name}</span>`;
      d.onclick = () => {
        sel.id = it.id;
        renderDoll(); renderPanel();
        if (it.id.endsWith("_none")) return;
        toast("Đã mặc: " + it.name);
      };
      box.appendChild(d);
    });
  }

  /* ---------- skin tone đặt trong tab Tóc cho gọn? -> để riêng nút? ----------
     Demo: thêm skin vào panel khi cat = hair (gắn cuối swatches) */
  // (giữ đơn giản: bỏ qua, skin random qua nút 🎲)

  /* ---------- actions ---------- */
  function shuffle() {
    look.skin = rand(PALETTES.skin);
    for (const cat of CATEGORIES) {
      // ưu tiên mặc đồ thật (tránh toàn _none)
      const real = cat.items.filter(i => !i.id.endsWith("_none"));
      const pool = Math.random() < 0.82 && real.length ? real : cat.items;
      look[cat.key] = { id: rand(pool).id, color: rand(PALETTES[cat.palette] || PALETTES.fabric) };
    }
    // tránh mặc cả váy lẫn áo+quần
    if (look.dress.id !== "dress_none") { look.top.id = "top_none"; look.bottom.id = "bottom_none"; }
    renderDoll(); renderTabs(); renderPanel();
    toast("✨ Look ngẫu nhiên!");
  }

  function snap() {
    const f = $("#flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
    toast("📷 Đã lưu look vào bộ sưu tập!");
    bumpCoins(50);
  }

  function reset() { look = JSON.parse(JSON.stringify(DEFAULT_LOOK)); renderDoll(); renderTabs(); renderPanel(); toast("Đã reset"); }

  /* ---------- helpers ---------- */
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  let coins = 1250;
  function bumpCoins(n) { coins += n; $("#coinCount").textContent = coins; }
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1500);
  }

  /* ---------- init ---------- */
  $("#btnShuffle").onclick = shuffle;
  $("#btnSnap").onclick = snap;
  $("#btnReset").onclick = reset;
  renderDoll(); renderTabs(); renderPanel();
})();
