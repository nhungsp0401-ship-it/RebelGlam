/* ============================================================
   Rebel Glam — ÂM THANH & HAPTIC
   - SFX + nhạc nền TỔNG HỢP bằng Web Audio API (không cần file mp3,
     nhẹ, chạy offline, không phụ thuộc asset).
   - Haptic qua navigator.vibrate (điện thoại hỗ trợ).
   - AudioContext chỉ khởi tạo SAU cử chỉ đầu tiên của người dùng
     (chính sách autoplay của trình duyệt) -> không bao giờ kẹt.
   - Tôn trọng prefers-reduced-motion + lưu trạng thái tắt/bật.
   Expose: window.RGSound { sfx, haptic, music, toggleSound,
                            toggleMusic, isOn, isMusicOn }
   ============================================================ */
(function () {
  const LS_SOUND = "rg_sound_on";
  const LS_MUSIC = "rg_music_on";
  const read = (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : v === "1"; } catch (e) { return def; } };
  const write = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch (e) {} };

  let soundOn = read(LS_SOUND, true);
  let musicOn = read(LS_MUSIC, true);

  /* ---------- Web Audio (lazy) ---------- */
  let ac = null;            // AudioContext
  let master = null;        // master gain cho SFX
  let musicGain = null;     // gain riêng cho nhạc nền
  let musicTimer = null;    // bộ lập lịch nhạc nền
  let musicStep = 0;

  function ensureCtx() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);
    musicGain = ac.createGain();
    musicGain.gain.value = 0.0;            // fade-in khi bật nhạc
    musicGain.connect(ac.destination);
    return ac;
  }
  // gọi trong mọi cử chỉ đầu tiên: mở khoá ctx (suspended -> running)
  function resume() {
    const c = ensureCtx();
    if (c && c.state === "suspended") c.resume();
    return c;
  }

  /* ---------- khối tạo nốt cơ bản ---------- */
  // 1 nốt: osc -> gain envelope -> master
  function note(opt) {
    if (!ac) return;
    const t0 = ac.currentTime + (opt.delay || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = opt.type || "sine";
    osc.frequency.setValueAtTime(opt.freq, t0);
    if (opt.glideTo) osc.frequency.exponentialRampToValueAtTime(opt.glideTo, t0 + opt.dur);
    const peak = (opt.gain == null ? 0.25 : opt.gain);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (opt.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.dur);
    osc.connect(g).connect(opt.bus || master);
    osc.start(t0);
    osc.stop(t0 + opt.dur + 0.02);
  }
  // tiếng "noise" ngắn (shutter, whoosh) qua buffer trắng + lọc
  function noise(opt) {
    if (!ac) return;
    const t0 = ac.currentTime + (opt.delay || 0);
    const dur = opt.dur || 0.18;
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = opt.filter || "bandpass";
    f.frequency.setValueAtTime(opt.freq || 1800, t0);
    if (opt.freqTo) f.frequency.exponentialRampToValueAtTime(opt.freqTo, t0 + dur);
    f.Q.value = opt.q || 0.8;
    const g = ac.createGain();
    g.gain.setValueAtTime(opt.gain == null ? 0.18 : opt.gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  // tần số nốt nhạc (A4=440) theo nửa cung so với A4
  const semis = n => 440 * Math.pow(2, n / 12);

  /* ---------- THƯ VIỆN SFX ---------- */
  // mỗi SFX: chuỗi nốt nhỏ tạo cảm giác "glam / pop / dễ thương"
  const SFX = {
    // chạm nhẹ: chọn tab/nhóm
    tap() { note({ freq: semis(7), type: "triangle", dur: 0.08, gain: 0.16 }); },
    // chọn item: ding lấp lánh 2 nốt đi lên
    select() {
      note({ freq: semis(7), type: "triangle", dur: 0.12, gain: 0.2 });
      note({ freq: semis(12), type: "sine", dur: 0.18, gain: 0.16, delay: 0.06 });
    },
    // mặc đồ "sáng bừng": hợp âm rải nhanh
    equip() {
      [0, 4, 7, 12].forEach((s, i) => note({ freq: semis(s), type: "triangle", dur: 0.22, gain: 0.14, delay: i * 0.04 }));
    },
    // xáo trộn (random look): whoosh + chùm hạt
    shuffle() {
      noise({ freq: 600, freqTo: 3200, dur: 0.3, gain: 0.16, filter: "bandpass", q: 1.2 });
      [12, 16, 19, 24].forEach((s, i) => note({ freq: semis(s), type: "sine", dur: 0.14, gain: 0.12, delay: 0.12 + i * 0.05 }));
    },
    // lưu look: chime ấm 3 nốt
    save() {
      [0, 7, 12].forEach((s, i) => note({ freq: semis(s), type: "sine", dur: 0.3, gain: 0.18, delay: i * 0.09 }));
    },
    // chụp ảnh: tiếng màn trập
    snap() {
      noise({ freq: 2600, dur: 0.05, gain: 0.25, filter: "highpass", q: 0.6 });
      noise({ freq: 1500, dur: 0.08, gain: 0.22, filter: "bandpass", q: 1.5, delay: 0.06 });
    },
    // nhận xu
    coin() {
      note({ freq: semis(19), type: "square", dur: 0.09, gain: 0.12 });
      note({ freq: semis(24), type: "square", dur: 0.16, gain: 0.12, delay: 0.07 });
    },
    // mở overlay
    open() { note({ freq: semis(0), glideTo: semis(12), type: "sine", dur: 0.22, gain: 0.16 }); },
    // đóng overlay
    close() { note({ freq: semis(12), glideTo: semis(0), type: "sine", dur: 0.2, gain: 0.14 }); },
    // tiếng tick khi quay số địa điểm
    tick() { note({ freq: semis(14), type: "square", dur: 0.04, gain: 0.1 }); },
    // chốt được địa điểm
    lock() {
      [0, 5, 9].forEach((s, i) => note({ freq: semis(s + 7), type: "triangle", dur: 0.22, gain: 0.16, delay: i * 0.06 }));
    },
    // va chạm khi chấm điểm PK
    clash() {
      noise({ freq: 900, freqTo: 4000, dur: 0.12, gain: 0.14, filter: "bandpass", q: 0.8 });
      note({ freq: semis(-5), type: "sawtooth", dur: 0.1, gain: 0.08 });
    },
    // tìm thấy đối thủ
    match() {
      [0, 4, 7].forEach((s, i) => note({ freq: semis(s), type: "triangle", dur: 0.18, gain: 0.16, delay: i * 0.05 }));
    },
    // THẮNG: fanfare đi lên
    win() {
      [0, 4, 7, 12, 16].forEach((s, i) =>
        note({ freq: semis(s), type: "triangle", dur: 0.45, gain: 0.2, delay: i * 0.11 }));
      [12, 19].forEach((s, i) => note({ freq: semis(s), type: "sine", dur: 0.5, gain: 0.12, delay: 0.55 + i * 0.12 }));
    },
    // THUA: 3 nốt đi xuống nhẹ nhàng
    lose() {
      [0, -3, -7].forEach((s, i) =>
        note({ freq: semis(s), type: "triangle", dur: 0.34, gain: 0.16, delay: i * 0.14 }));
    },
  };

  function sfx(name) {
    if (!soundOn) return;
    resume();
    const fn = SFX[name];
    if (fn) try { fn(); } catch (e) {}
  }

  /* ---------- HAPTIC ---------- */
  const canVibrate = "vibrate" in navigator;
  const HAPTIC = {
    light: 10, medium: 20, heavy: 35,
    select: 12, success: [18, 40, 22], warning: [25, 60, 25],
    win: [30, 50, 30, 50, 60], lose: [60, 40], shuffle: [10, 30, 10, 30, 10],
    snap: [8, 30, 25],
  };
  function haptic(name) {
    if (!soundOn || !canVibrate) return;       // gắn haptic theo công tắc âm thanh
    const p = HAPTIC[name] != null ? HAPTIC[name] : name;
    try { navigator.vibrate(p); } catch (e) {}
  }

  /* ---------- NHẠC NỀN (tổng hợp, vòng lặp glam-pop nhẹ) ----------
     Vòng hợp âm I–vi–IV–V (C–Am–F–G) dạng pad + arpeggio mềm, âm lượng thấp,
     không lấn SFX. Lập lịch từng bước bằng setInterval cho đơn giản & ổn định. */
  const CHORDS = [
    [0, 4, 7],     // C
    [-3, 0, 4],    // Am
    [-7, -3, 0],   // F
    [-5, -1, 2],   // G
  ];
  const ARP = [0, 7, 4, 12];           // nốt rải mỗi nhịp
  const STEP_MS = 480;

  function musicStepTick() {
    if (!ac || !musicOn) return;
    const bar = Math.floor(musicStep / 4) % CHORDS.length;
    const beat = musicStep % 4;
    const chord = CHORDS[bar];
    // pad nhẹ ở đầu mỗi ô nhịp
    if (beat === 0) {
      chord.forEach(s => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine";
        o.frequency.value = semis(s - 12);
        const t0 = ac.currentTime;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + STEP_MS / 1000 * 4);
        o.connect(g).connect(musicGain);
        o.start(t0); o.stop(t0 + STEP_MS / 1000 * 4 + 0.05);
      });
    }
    // arpeggio lấp lánh
    const s = chord[0] + ARP[beat % ARP.length];
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = semis(s + 12);
    const t0 = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.04, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.36);
    o.connect(g).connect(musicGain);
    o.start(t0); o.stop(t0 + 0.4);
    musicStep++;
  }

  function startMusic() {
    if (!musicOn) return;
    const c = resume();
    if (!c || musicTimer) return;
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, c.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.6, c.currentTime + 1.2);   // fade-in
    musicTimer = setInterval(musicStepTick, STEP_MS);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (ac && musicGain) {
      musicGain.gain.cancelScheduledValues(ac.currentTime);
      musicGain.gain.setValueAtTime(musicGain.gain.value, ac.currentTime);
      musicGain.gain.linearRampToValueAtTime(0.0, ac.currentTime + 0.4);
    }
  }

  /* ---------- công tắc ---------- */
  function toggleSound() {
    soundOn = !soundOn; write(LS_SOUND, soundOn);
    if (soundOn) { resume(); sfx("tap"); }
    syncBtns();
    return soundOn;
  }
  function toggleMusic() {
    musicOn = !musicOn; write(LS_MUSIC, musicOn);
    if (musicOn) startMusic(); else stopMusic();
    syncBtns();
    return musicOn;
  }

  /* ---------- nút bấm trên UI ---------- */
  function syncBtns() {
    const s = document.getElementById("btnSound");
    if (s) { s.textContent = soundOn ? "🔊" : "🔇"; s.classList.toggle("off", !soundOn); }
    const m = document.getElementById("btnMusic");
    if (m) { m.textContent = musicOn ? "🎵" : "🎶"; m.classList.toggle("off", !musicOn); }
  }

  /* ---------- mở khoá audio + bật nhạc ở cử chỉ đầu tiên ---------- */
  function firstGesture() {
    resume();
    if (musicOn) startMusic();
    window.removeEventListener("pointerdown", firstGesture, true);
    window.removeEventListener("keydown", firstGesture, true);
  }
  window.addEventListener("pointerdown", firstGesture, true);
  window.addEventListener("keydown", firstGesture, true);

  // chèn 2 nút điều khiển vào topbar (cạnh xu) nếu có chỗ
  function injectButtons() {
    const coins = document.getElementById("coins");
    if (!coins || document.getElementById("btnSound")) return;
    const wrap = document.createElement("div");
    wrap.id = "audioCtrls";
    const mk = (id, txt, title, on) => {
      const b = document.createElement("button");
      b.id = id; b.className = "audio-btn"; b.textContent = txt; b.title = title;
      b.setAttribute("aria-label", title);
      return b;
    };
    const bm = mk("btnMusic", musicOn ? "🎵" : "🎶", "Nhạc nền");
    const bs = mk("btnSound", soundOn ? "🔊" : "🔇", "Âm thanh");
    bm.onclick = toggleMusic;
    bs.onclick = toggleSound;
    wrap.appendChild(bm); wrap.appendChild(bs);
    // gom [nút nhạc][nút âm thanh][xu] vào 1 cụm phải -> topbar vẫn 3 cột, title cân giữa
    const bar = coins.parentNode;
    bar.insertBefore(wrap, coins);
    wrap.appendChild(coins);
    syncBtns();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectButtons);
  else injectButtons();

  /* ---------- API ---------- */
  window.RGSound = {
    sfx, haptic,
    startMusic, stopMusic,
    toggleSound, toggleMusic,
    isOn: () => soundOn,
    isMusicOn: () => musicOn,
  };
})();
