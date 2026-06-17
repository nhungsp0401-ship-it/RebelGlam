/* ============================================================
   Rebel Glam — DEMO data
   Toàn bộ art ở đây là SVG GỐC, tự vẽ — không dùng asset bản quyền.
   Mỗi item là 1 đoạn <path>/<g> vẽ trong khung viewBox 300x520.
   color: {fill} cho phép đổi màu theo swatch.
   ============================================================ */

// Bảng màu dùng chung cho swatches
const PALETTES = {
  hair:   ["#1a1a1f", "#b8174d", "#7b2ff7", "#16a3b0", "#e84393", "#f6c945", "#e8e8ef"],
  fabric: ["#15151c", "#e8174d", "#7b2ff7", "#16a3b0", "#ff7ab8", "#f6c945", "#2d2d3a"],
  skin:   ["#f3c9a8", "#e3a780", "#c8855a", "#8d5524"],
};

// Nền cơ thể (skin) — vẽ theo biến màu da
function bodySVG(skin) {
  return `
  <g>
    <!-- chân -->
    <path d="M126 330 q-6 70 -10 150 q-1 14 13 14 q14 0 14 -14 l6 -120 l6 120 q0 14 14 14 q14 0 13 -14 q-4 -80 -10 -150 z" fill="${skin}"/>
    <!-- thân -->
    <path d="M150 150 q-40 4 -42 60 q-2 60 18 130 q24 12 48 0 q20 -70 18 -130 q-2 -56 -42 -60z" fill="${skin}"/>
    <!-- tay -->
    <path d="M112 200 q-22 36 -30 84 q-2 12 9 13 q9 1 12 -9 q12 -42 28 -74z" fill="${skin}"/>
    <path d="M188 200 q22 36 30 84 q2 12 -9 13 q-9 1 -12 -9 q-12 -42 -28 -74z" fill="${skin}"/>
    <!-- cổ -->
    <path d="M138 120 l0 34 q12 8 24 0 l0 -34z" fill="${skin}"/>
    <!-- đầu -->
    <ellipse cx="150" cy="92" rx="42" ry="48" fill="${skin}"/>
    <!-- tai -->
    <circle cx="109" cy="94" r="8" fill="${skin}"/>
    <circle cx="191" cy="94" r="8" fill="${skin}"/>
  </g>`;
}

// Khuôn mặt cơ bản (mắt, môi) — luôn hiển thị
const FACE_BASE = `
  <g>
    <ellipse cx="134" cy="92" rx="7" ry="9" fill="#fff"/>
    <ellipse cx="166" cy="92" rx="7" ry="9" fill="#fff"/>
    <circle cx="135" cy="93" r="4.5" fill="#2a1a12"/>
    <circle cx="165" cy="93" r="4.5" fill="#2a1a12"/>
    <path d="M124 80 q10 -7 20 -2" stroke="#3a2418" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M156 78 q10 -5 20 2" stroke="#3a2418" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M140 116 q10 8 20 0 q-10 5 -20 0z" fill="#c0285a"/>
  </g>`;

/* ---------- Định nghĩa items theo từng category ----------
   id, name, emoji (icon nút), draw(color) -> svg string, palette dùng */
const CATEGORIES = [
  {
    key: "hair", label: "Tóc", icon: "💇‍♀️", layer: "layer-hair", palette: "hair",
    items: [
      { id: "hair_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "hair_punk", name: "Mohawk", icon: "🦔", draw: c => `
        <path d="M108 70 q42 -64 84 0 q-12 -10 -30 -12 q14 -30 -2 -44 q-6 26 -14 38 q-4 -30 -12 -42 q-6 28 -10 44 q-10 4 -16 16z" fill="${c}"/>
        <path d="M108 70 q-14 30 -8 70 l14 -4 q-6 -34 6 -58z" fill="${c}"/>
        <path d="M192 70 q14 30 8 70 l-14 -4 q6 -34 -6 -58z" fill="${c}"/>` },
      { id: "hair_long", name: "Dài xoăn", icon: "🌊", draw: c => `
        <path d="M105 80 q45 -60 90 0 q12 50 4 120 q-10 -20 -20 -24 q8 -50 -2 -86 q-32 -26 -54 0 q-10 36 -2 86 q-10 4 -20 24 q-8 -70 4 -120z" fill="${c}"/>` },
      { id: "hair_bob", name: "Bob", icon: "👩", draw: c => `
        <path d="M106 86 q44 -58 88 0 q6 40 0 60 q-14 6 -18 -2 q6 -34 -4 -56 q-30 -22 -60 0 q-10 22 -4 56 q-4 8 -18 2 q-6 -20 -0 -60z" fill="${c}"/>` },
      { id: "hair_pony", name: "Đuôi ngựa", icon: "🐎", draw: c => `
        <path d="M106 84 q44 -56 88 0 q5 26 2 44 q-14 6 -18 -2 q5 -28 -4 -44 q-30 -20 -56 0 q-9 16 -4 44 q-4 8 -18 2 q-3 -18 2 -44z" fill="${c}"/>
        <path d="M188 96 q34 20 24 90 q-6 22 -22 28 q14 -40 4 -70 q-6 -28 -22 -36z" fill="${c}"/>` },
    ],
  },
  {
    key: "top", label: "Áo", icon: "👕", layer: "layer-top", palette: "fabric",
    items: [
      { id: "top_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "top_crop", name: "Crop top", icon: "🎽", draw: c => `
        <path d="M150 150 q-40 4 -42 56 q44 16 84 0 q-2 -52 -42 -56z" fill="${c}"/>
        <path d="M112 156 q-8 16 -4 30 l16 -6 q-2 -16 4 -28z" fill="${c}"/>
        <path d="M188 156 q8 16 4 30 l-16 -6 q2 -16 -4 -28z" fill="${c}"/>` },
      { id: "top_jacket", name: "Jacket da", icon: "🧥", draw: c => `
        <path d="M150 150 q-44 4 -46 64 q-4 40 8 76 q12 6 18 0 q-6 -50 -2 -78 l4 0 l0 80 q20 8 40 0 l0 -80 l4 0 q4 28 -2 78 q6 6 18 0 q12 -36 8 -76 q-2 -60 -46 -64z" fill="${c}"/>
        <path d="M150 150 l0 110" stroke="#000" stroke-width="2" opacity=".4"/>
        <circle cx="138" cy="200" r="3" fill="#ddd"/><circle cx="138" cy="220" r="3" fill="#ddd"/>` },
      { id: "top_tank", name: "Áo hai dây", icon: "👚", draw: c => `
        <path d="M150 152 q-34 4 -36 50 q-2 40 10 88 q26 10 52 0 q12 -48 10 -88 q-2 -46 -36 -50z" fill="${c}"/>
        <rect x="128" y="150" width="6" height="20" rx="3" fill="${c}"/>
        <rect x="166" y="150" width="6" height="20" rx="3" fill="${c}"/>` },
    ],
  },
  {
    key: "dress", label: "Váy", icon: "👗", layer: "layer-dress", palette: "fabric",
    items: [
      { id: "dress_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "dress_punk", name: "Đầm punk", icon: "🖤", draw: c => `
        <path d="M150 150 q-38 4 -40 54 q-30 60 -34 130 q40 22 148 0 q-4 -70 -34 -130 q-2 -50 -40 -54z" fill="${c}"/>
        <path d="M100 300 l100 0" stroke="#000" stroke-width="2" opacity=".3"/>` },
      { id: "dress_gown", name: "Gown dạ hội", icon: "👑", draw: c => `
        <path d="M150 150 q-34 4 -36 50 q-44 80 -40 180 q76 26 152 0 q4 -100 -40 -180 q-2 -46 -36 -50z" fill="${c}"/>
        <path d="M114 200 q36 16 72 0" stroke="#fff" stroke-width="2" opacity=".4" fill="none"/>` },
      { id: "dress_mini", name: "Mini sequin", icon: "✨", draw: c => `
        <path d="M150 150 q-36 4 -38 52 q-10 40 -8 78 q46 18 92 0 q2 -38 -8 -78 q-2 -48 -38 -52z" fill="${c}"/>
        <circle cx="135" cy="210" r="2" fill="#fff"/><circle cx="160" cy="225" r="2" fill="#fff"/>
        <circle cx="170" cy="200" r="2" fill="#fff"/><circle cx="148" cy="245" r="2" fill="#fff"/>` },
    ],
  },
  {
    key: "bottom", label: "Quần", icon: "👖", layer: "layer-bottom", palette: "fabric",
    items: [
      { id: "bottom_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "bottom_jeans", name: "Skinny jeans", icon: "👖", draw: c => `
        <path d="M124 280 q-6 80 -10 154 q-1 12 13 12 q12 0 13 -12 l7 -120 l7 120 q1 12 13 12 q14 0 13 -12 q-4 -74 -10 -154 q-30 -12 -66 0z" fill="${c}"/>` },
      { id: "bottom_skirt", name: "Chân váy", icon: "🩳", draw: c => `
        <path d="M120 280 q-8 36 -16 70 q40 18 92 0 q-8 -34 -16 -70 q-30 -12 -60 0z" fill="${c}"/>` },
      { id: "bottom_shorts", name: "Short rách", icon: "🩲", draw: c => `
        <path d="M122 280 q-4 28 -8 52 q14 6 22 0 l6 -36 l6 36 q8 6 22 0 q-4 -24 -8 -52 q-30 -12 -60 0z" fill="${c}"/>` },
    ],
  },
  {
    key: "shoes", label: "Giày", icon: "👠", layer: "layer-shoes", palette: "fabric",
    items: [
      { id: "shoes_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "shoes_boot", name: "Boots", icon: "🥾", draw: c => `
        <path d="M125 470 q-2 20 -2 26 q14 6 30 2 l0 -28z" fill="${c}"/>
        <path d="M175 470 q2 20 2 26 q-14 6 -30 2 l0 -28z" fill="${c}"/>` },
      { id: "shoes_heel", name: "Cao gót", icon: "👠", draw: c => `
        <path d="M126 478 l22 0 l0 12 l-22 4z" fill="${c}"/><path d="M148 490 l4 8" stroke="${c}" stroke-width="3"/>
        <path d="M174 478 l-22 0 l0 12 l22 4z" fill="${c}"/><path d="M152 490 l-4 8" stroke="${c}" stroke-width="3"/>` },
      { id: "shoes_sneak", name: "Sneaker", icon: "👟", draw: c => `
        <path d="M122 478 q-2 12 16 14 q14 1 14 -6 l0 -10z" fill="${c}"/>
        <path d="M178 478 q2 12 -16 14 q-14 1 -14 -6 l0 -10z" fill="${c}"/>` },
    ],
  },
  {
    key: "accessory", label: "Phụ kiện", icon: "💎", layer: "layer-accessory", palette: "fabric",
    items: [
      { id: "acc_none", name: "Không", icon: "🚫", draw: () => "" },
      { id: "acc_glasses", name: "Kính", icon: "🕶️", draw: () => `
        <rect x="122" y="86" width="22" height="14" rx="4" fill="#111" opacity=".85"/>
        <rect x="156" y="86" width="22" height="14" rx="4" fill="#111" opacity=".85"/>
        <line x1="144" y1="90" x2="156" y2="90" stroke="#111" stroke-width="3"/>` },
      { id: "acc_choker", name: "Choker", icon: "🖤", draw: c => `
        <path d="M138 122 q12 8 24 0" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="150" cy="128" r="3" fill="#f6c945"/>` },
      { id: "acc_earring", name: "Hoa tai", icon: "💎", draw: () => `
        <circle cx="109" cy="106" r="4" fill="#f6c945"/><circle cx="191" cy="106" r="4" fill="#f6c945"/>` },
      { id: "acc_crown", name: "Vương miện", icon: "👑", draw: c => `
        <path d="M124 56 l8 14 l8 -18 l10 18 l8 -18 l8 18 l8 -14 l-4 22 l-52 0z" fill="${c||'#f6c945'}"/>` },
    ],
  },
];

// Look mặc định khi mở game
const DEFAULT_LOOK = {
  skin: PALETTES.skin[0],
  hair: { id: "hair_punk", color: PALETTES.hair[1] },
  top: { id: "top_jacket", color: PALETTES.fabric[0] },
  dress: { id: "dress_none", color: PALETTES.fabric[1] },
  bottom: { id: "bottom_jeans", color: PALETTES.fabric[0] },
  shoes: { id: "shoes_boot", color: PALETTES.fabric[0] },
  accessory: { id: "acc_choker", color: PALETTES.fabric[0] },
};
