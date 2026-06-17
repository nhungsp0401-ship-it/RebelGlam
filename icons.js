/* ============================================================
   Rebel Glam — bộ icon UI (line-art, mềm mại, nữ tính)
   - Mỗi icon là SVG nét bo tròn, dùng currentColor -> đổi màu
     theo CSS (muted khi thường, hồng khi đang chọn).
   - Key trùng với GROUPS.key và CATEGORIES.key trong assets.js.
   - svgIcon(key) trả về chuỗi <svg>, fallback null nếu chưa có.
   ============================================================ */
const ICON_SVG = {
  /* ---- nhóm lớn ---- */
  body: `<circle cx="12" cy="7" r="3.3"/>
         <path d="M6 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/>
         <path d="M8.8 6c.7-1.7 5.7-1.7 6.4 0"/>`,
  outfit: `<path d="M8.8 4.2 12 6l3.2-1.8 1.7 3.6-1.8 1.2L17.5 20h-11l1.4-11L6.1 7.8z"/>
           <path d="M8.8 4.2c.9 1.5 5.5 1.5 6.4 0"/>`,
  acc: `<path d="M12 12C9 9 5 10 6 12.5 7 15 10 14 12 12Z"/>
        <path d="M12 12C15 9 19 10 18 12.5 17 15 14 14 12 12Z"/>
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>`,

  /* ---- cơ thể ---- */
  hair: `<path d="M6.5 13.5V9a5.5 5.5 0 0 1 11 0v4.5"/>
         <path d="M6.5 9.5C5.8 12 5.5 15 6 18"/>
         <path d="M17.5 9.5c.7 2.5 1 5.5.5 8.5"/>
         <path d="M9.8 11.5c.7 1.3 3.7 1.3 4.4 0"/>`,
  brows: `<path d="M4.5 11c1.8-1.7 4.2-1.7 6 0"/>
          <path d="M13.5 11c1.8-1.7 4.2-1.7 6 0"/>`,
  eyes: `<path d="M3 12c2.6-3.6 6-5.4 9-5.4s6.4 1.8 9 5.4c-2.6 3.6-6 5.4-9 5.4S5.6 15.6 3 12z"/>
         <circle cx="12" cy="12" r="2.4"/>
         <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none"/>`,
  eyemakeup: `<path d="M3.5 12.5c2.6-3.4 6-5 8.5-5s6 1.4 8.5 4.4"/>
              <path d="M3.5 12.5c2.6 2.8 6 3.8 8.5 3.8 1.8 0 3.6-.5 5.3-1.5"/>
              <circle cx="11" cy="11.8" r="1.8"/>
              <path d="M18.5 9.7l2.6-1.4M19.2 11.8l2.8-.3M18.7 13.6l2.4 1"/>`,
  lips: `<path d="M3.8 11c2-.3 3.2-2 5.1-2 1.3 0 2.1.9 3.1.9s1.8-.9 3.1-.9c1.9 0 3.1 1.7 5.1 2-1.7 3-4.9 4.6-8.2 4.6S5.5 14 3.8 11z"/>
         <path d="M3.8 11c2.6.9 5.2 1.3 8.2 1.3s5.6-.4 8.2-1.3"/>`,
  blush: `<circle cx="12" cy="7.8" r="2.1"/>
          <circle cx="16.2" cy="10.8" r="2.1"/>
          <circle cx="14.6" cy="15.6" r="2.1"/>
          <circle cx="9.4" cy="15.6" r="2.1"/>
          <circle cx="7.8" cy="10.8" r="2.1"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>`,

  /* ---- trang phục ---- */
  top: `<path d="M8.6 4.5 5 7.2l1.7 2.2L8 8.4V19.5h8V8.4l1.3 1L19 7.2l-3.6-2.7-1.6 1.7a3 3 0 0 1-4.6 0z"/>`,
  dress: `<path d="M8.8 4.2 12 6l3.2-1.8 1.7 3.6-1.8 1.2L17.5 20h-11l1.4-11L6.1 7.8z"/>
          <path d="M8.8 4.2c.9 1.5 5.5 1.5 6.4 0"/>`,
  bottom: `<path d="M5.5 5.5h13v4.5L17 19.5h-3.6L12 12l-1.4 7.5H7L5.5 10z"/>
           <path d="M12 6v5"/>`,
  shoes: `<path d="M5 7c.5 4 3 6.6 7.5 8.1H18v1.9H8c-1.6 0-3-1.3-3-3z"/>
          <path d="M15.6 16.8l1 3"/>`,

  /* ---- phụ kiện ---- */
  headwear: `<path d="M5 16.5h14"/>
             <path d="M5 16.5 6 9l3.3 3.2L12 7.5l2.7 4.7L18 9l1 7.5z"/>
             <circle cx="6" cy="8.6" r="0.9" fill="currentColor" stroke="none"/>
             <circle cx="18" cy="8.6" r="0.9" fill="currentColor" stroke="none"/>
             <circle cx="12" cy="6.8" r="0.9" fill="currentColor" stroke="none"/>`,
  eyewear: `<rect x="3" y="9.5" width="6.2" height="5" rx="2.5"/>
            <rect x="14.8" y="9.5" width="6.2" height="5" rx="2.5"/>
            <path d="M9.2 11c1-1 4.6-1 5.6 0"/>`,
  earrings: `<circle cx="9" cy="6" r="1.2"/>
             <path d="M9 7.2c-2.2 2.6-2.2 5.4 0 8 2.2-2.6 2.2-5.4 0-8z"/>
             <circle cx="15.5" cy="9" r="1"/>
             <path d="M15.5 10c-1.4 1.7-1.4 3.5 0 5.2 1.4-1.7 1.4-3.5 0-5.2z"/>`,
  necklace: `<path d="M5 6c.3 4.6 3.4 7.8 7 7.8S18.7 10.6 19 6"/>
             <path d="M12 18.6l-2-2c-1.1-1.1-.3-3 1.2-3 .5 0 .8.3.8.6 0-.3.3-.6.8-.6 1.5 0 2.3 1.9 1.2 3z"/>`,
  bag: `<path d="M6 9.5h12l-1 9.5H7z"/>
        <path d="M9 9.5V8a3 3 0 0 1 6 0v1.5"/>`,
};

function svgIcon(key) {
  const inner = ICON_SVG[key];
  if (!inner) return null;
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
