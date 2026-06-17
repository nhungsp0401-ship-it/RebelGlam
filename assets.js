/* ============================================================
   Rebel Glam — config ASSET THẬT (pipeline on-body)
   - base (thân doll, đã tách nền) hiển thị dưới cùng.
   - mỗi item là layer FULL-CANVAS đã căn sẵn -> chồng inset:0 tự khớp.
   - Nav 2 cấp: GROUPS (3 tab lớn) -> CATEGORIES (sub-tab).
   ============================================================ */
const BASE_DEFAULT = "assets/bases/__default.png";
const BASE_DIR  = "assets/bases/";
const LAYER_DIR = "assets/layers_png/";
const ICON_DIR  = "assets/items_png/";
const HAIRFRONT_DIR = "assets/hairfront_png/";   // tóc-trước: phủ LÊN makeup/đồ (tóc ở trên cùng)

/* z-order khi chồng layer */
const ZINDEX = {
  // shoes DƯỚI dress: váy dài (có vải ở chân) tự che giày; váy ngắn/quần không có pixel
  // ở bàn chân nên giày vẫn hiện -> không lộ giày dưới gấu váy dài.
  shoes: 25, bottom: 20, dress: 30, top: 40,
  blush: 56, lips: 57, eyes: 58, eyemakeup: 59, brows: 60,
  hairfront: 64,   // TÓC phủ trên makeup/đồ; dưới phụ kiện (kính/khuyên/vương miện vẫn trên tóc)
  necklace: 66, earrings: 67, eyewear: 68, headwear: 75, bag: 80,
};

/* 3 tab lớn -> danh sách sub-tab (theo key category) */
const GROUPS = [
  { key: "body",   label: "Cơ thể",     icon: "🧍‍♀️", cats: ["hair", "brows", "eyes", "eyemakeup", "lips", "blush"] },
  { key: "outfit", label: "Trang phục", icon: "👗",   cats: ["top", "dress", "bottom", "shoes"] },
  { key: "acc",    label: "Phụ kiện",   icon: "💎",   cats: ["headwear", "eyewear", "earrings", "necklace", "bag"] },
];

const CATEGORIES = [
  /* ---------- CƠ THỂ ---------- */
  {
    key: "hair", label: "Tóc", icon: "💇‍♀️", isBase: true,
    items: [
      { id: "__default", label: "Mặc định" },
      { id: "hair_mohawk_pink", label: "Mohawk" },
      { id: "hair_long_curls", label: "Xoăn dài" },
      { id: "hair_bob_black", label: "Bob đen" },
      { id: "hair_ponytail_purple", label: "Pony tím" },
      { id: "hair_buns_space", label: "Búi đôi" },
      { id: "hair_pixie_fire", label: "Pixie đỏ" },
      { id: "hair_braids_silver", label: "Tết bạc" },
      // nhẹ nhàng, hiện đại — buông xoã
      { id: "hair_long_straight", label: "Thẳng dài" },
      { id: "hair_soft_waves", label: "Sóng nhẹ" },
      { id: "hair_curtain_bangs", label: "Mái bay" },
      { id: "hair_wavy_bob", label: "Bob sóng" },
      { id: "hair_shoulder_layers", label: "Layer vai" },
      { id: "hair_side_waves", label: "Sóng lệch" },
      // tạo kiểu
      { id: "hair_low_bun", label: "Búi thấp" },
      { id: "hair_half_up", label: "Nửa buộc" },
      { id: "hair_low_ponytail", label: "Đuôi thấp" },
      { id: "hair_braided_crown", label: "Tết vương miện" },
    ],
  },
  {
    key: "brows", label: "Lông mày", icon: "✏️",
    items: [
      { id: "__none", label: "Gốc" },
      { id: "brow_blonde", label: "Vàng" },
      { id: "brow_brown", label: "Nâu" },
      { id: "brow_black", label: "Đen" },
      { id: "brow_auburn", label: "Nâu đỏ" },
      { id: "brow_ash", label: "Khói" },
      { id: "brow_caramel", label: "Caramel" },
      { id: "brow_bold", label: "Đậm" },
      { id: "brow_thin", label: "Mảnh" },
      { id: "brow_feathered", label: "Tơ" },
      { id: "brow_straight", label: "Ngang" },
    ],
  },
  {
    key: "eyes", label: "Màu mắt", icon: "👁️",
    items: [
      { id: "__none", label: "Gốc" },
      { id: "eye_brown", label: "Nâu" },
      { id: "eye_blue", label: "Xanh dương" },
      { id: "eye_green", label: "Xanh lá" },
      { id: "eye_gray", label: "Xám" },
      { id: "eye_violet", label: "Tím" },
      { id: "eye_amber", label: "Hổ phách" },
      { id: "eye_hazel", label: "Hạt dẻ" },
      { id: "eye_teal", label: "Xanh mòng két" },
      { id: "eye_pink", label: "Hồng" },
      { id: "eye_aqua", label: "Xanh băng" },
    ],
  },
  {
    key: "eyemakeup", label: "Mắt", icon: "💄",
    items: [
      { id: "__none", label: "Mộc" },
      { id: "em_natural", label: "Tự nhiên" },
      { id: "em_smoky", label: "Smoky" },
      { id: "em_pinkglam", label: "Hồng" },
      { id: "em_gold", label: "Nhũ vàng" },
      { id: "em_cateye", label: "Cat-eye" },
      { id: "em_silver", label: "Bạc" },
      { id: "em_sunset", label: "Hoàng hôn" },
      { id: "em_emerald", label: "Lục" },
      { id: "em_purple", label: "Tím nhũ" },
      { id: "em_graphic", label: "Graphic" },
      { id: "em_lilac", label: "Lilac" },
      { id: "em_rainbow", label: "Cầu vồng" },
      { id: "em_copper", label: "Đồng nhũ" },
    ],
  },
  {
    key: "lips", label: "Môi", icon: "👄",
    items: [
      { id: "__none", label: "Gốc" },
      { id: "lips_red", label: "Đỏ" },
      { id: "lips_pink", label: "Hồng" },
      { id: "lips_coral", label: "San hô" },
      { id: "lips_nude", label: "Nude" },
      { id: "lips_berry", label: "Berry" },
      { id: "lips_mauve", label: "Mauve" },
      { id: "lips_orange", label: "Cam" },
      { id: "lips_fuchsia", label: "Fuchsia" },
      { id: "lips_brown", label: "Nâu" },
      { id: "lips_peach", label: "Đào" },
      { id: "lips_ombre", label: "Ombre gloss" },
    ],
  },
  {
    key: "blush", label: "Má", icon: "🌸",
    items: [
      { id: "__none", label: "Gốc" },
      // apple — tròn trên gò má
      { id: "blush_pink", label: "Hồng" },
      { id: "blush_peach", label: "Đào" },
      { id: "blush_coral", label: "San hô" },
      { id: "blush_rosy", label: "Ửng" },
      { id: "blush_mauve", label: "Mauve" },
      { id: "blush_nude", label: "Nude" },
      { id: "blush_salmon", label: "Cá hồi" },
      { id: "blush_coolpink", label: "Hồng lạnh" },
      { id: "blush_dustypink", label: "Hồng khói" },
      { id: "blush_lavender", label: "Lavender" },
      // pop — đậm, tập trung
      { id: "blush_hotpink", label: "Hồng đậm" },
      { id: "blush_fuchsia", label: "Fuchsia" },
      { id: "blush_cherry", label: "Anh đào" },
      { id: "blush_raspberry", label: "Mâm xôi" },
      { id: "blush_berry", label: "Berry" },
      // draped — kéo chéo lên thái dương
      { id: "blush_red", label: "Đỏ kéo" },
      { id: "blush_draped_rose", label: "Hồng kéo" },
      { id: "blush_plum", label: "Mận" },
      { id: "blush_sunset", label: "Hoàng hôn" },
      { id: "blush_brick", label: "Gạch" },
      // cheekbone — dọc gò má
      { id: "blush_terracotta", label: "Terracotta" },
      { id: "blush_bronze", label: "Bronze" },
      { id: "blush_rosegold", label: "Hồng kim" },
      { id: "blush_champagne", label: "Champagne" },
      { id: "blush_tangerine", label: "Quýt" },
      // sun-drunk / aegyo / wash
      { id: "blush_sundrunk", label: "Nắng" },
      { id: "blush_aegyo", label: "Aegyo" },
      { id: "blush_apricot", label: "Mơ" },
      { id: "blush_watermelon", label: "Dưa hấu" },
      { id: "blush_freckles", label: "Tàn nhang" },
    ],
  },

  /* ---------- TRANG PHỤC ---------- */
  {
    key: "top", label: "Áo", icon: "👕",
    items: [
      { id: "__none", label: "Không" },
      { id: "top_crochet_beach", label: "Móc len biển" },
      { id: "top_cardigan_pastel", label: "Cardigan pastel" },
      { id: "top_silk_camisole", label: "Cami lụa" },
      { id: "top_hoodie_lilac", label: "Hoodie tím" },
      { id: "top_tie_front", label: "Buộc eo" },
      { id: "top_trench_beige", label: "Trench be" },
      { id: "top_turtleneck_white", label: "Cổ lọ trắng" },
      { id: "top_striped_tee", label: "Tee kẻ" },
      { id: "top_offshoulder_black", label: "Trễ vai đen" },
      { id: "top_sequin_gold", label: "Sequin vàng" },
      { id: "top_linen_beach", label: "Sơ mi linen" },
      { id: "top_floral_blouse", label: "Blouse hoa" },
      { id: "top_satin_cowl", label: "Satin cổ đổ" },
      { id: "top_bustier_red", label: "Bustier đỏ" },
      { id: "top_turtleneck_black", label: "Cổ lọ đen" },
      { id: "top_knit_vest", label: "Vest len" },
      { id: "top_crop_sparkle", label: "Crop sequin" },
      { id: "top_lace_bodysuit", label: "Bodysuit ren" },
      { id: "top_bikini_white", label: "Bikini trắng" },
      { id: "top_oversized_sweater", label: "Len oversize" },
      { id: "top_halter_satin", label: "Halter đỏ" },
      { id: "top_mesh_black", label: "Lưới đen" },
      { id: "top_zip_track", label: "Track jacket" },
      { id: "top_windbreaker", label: "Windbreaker" },
      { id: "top_denim_shirt", label: "Sơ mi jean" },
      { id: "top_blazer_pink", label: "Blazer hồng" },
      { id: "top_leather_jacket", label: "Jacket da" },
      { id: "top_sports_crop", label: "Croptop thể thao" },
      { id: "top_white_blouse", label: "Sơ mi trắng" },
      { id: "top_corset_white", label: "Corset" },
    ],
  },
  {
    key: "dress", label: "Đầm", icon: "👗",
    items: [
      { id: "__none", label: "Không" },
      { id: "dress_silver_puff", label: "Bạc bồng" },
      { id: "dress_white_couture", label: "Couture xuyên thấu" },
      { id: "dress_shirt_dress", label: "Đầm sơ mi" },
      { id: "dress_cocktail_emerald", label: "Cocktail lục" },
      { id: "dress_ombre_feather", label: "Lông vũ ombre" },
      { id: "dress_knit_sweater", label: "Đầm len" },
      { id: "dress_blue_lace", label: "Ren xanh nhạt" },
      { id: "dress_sequin_silver", label: "Sequin bạc" },
      { id: "dress_navy_starry", label: "Dạ hội sao đêm" },
      { id: "dress_pleated_midi", label: "Midi xếp ly" },
      { id: "dress_pink_tiered", label: "Hồng tầng nơ" },
      { id: "dress_iceblue_gown", label: "Gown xanh băng" },
      { id: "dress_beach_maxi", label: "Maxi biển" },
      { id: "dress_white_beaded", label: "Trắng đính đá" },
      { id: "dress_gothic_lace", label: "Ren gothic" },
      { id: "dress_floral_cottage", label: "Hoa nhí" },
      { id: "dress_black_tulle", label: "Tulle đen" },
      { id: "dress_wrap_green", label: "Wrap xanh" },
      { id: "dress_polka_retro", label: "Chấm bi retro" },
      { id: "dress_slip_satin", label: "Slip satin" },
      { id: "dress_velvet_burgundy", label: "Nhung đỏ rượu" },
      { id: "dress_punk_black", label: "Punk đen" },
      { id: "dress_sundress_yellow", label: "Sundress vàng" },
      { id: "dress_blue_sparkle", label: "Xanh lấp lánh" },
      { id: "dress_gingham_picnic", label: "Gingham picnic" },
      { id: "dress_pink_petal", label: "Cánh hoa hồng" },
      { id: "dress_red_gown", label: "Gown đỏ" },
      { id: "dress_denim_button", label: "Đầm jean" },
      { id: "dress_sheath_navy", label: "Sheath navy" },
      { id: "dress_tulle_pink", label: "Tulle hồng" },
    ],
  },
  {
    key: "bottom", label: "Quần/Váy", icon: "👖",
    items: [
      { id: "__none", label: "Không" },
      { id: "bottom_crochet_shorts", label: "Short móc len" },
      { id: "bottom_sarong_floral", label: "Sarong hoa" },
      { id: "bottom_tutu_pink", label: "Tutu hồng" },
      { id: "bottom_pencil_skirt", label: "Bút chì" },
      { id: "bottom_linen_shorts", label: "Short linen" },
      { id: "bottom_flare_jeans", label: "Jean ống loe" },
      { id: "bottom_cargo_green", label: "Cargo" },
      { id: "bottom_vinyl_pants", label: "Quần vinyl" },
      { id: "bottom_corduroy_skirt", label: "Nhung tăm" },
      { id: "bottom_denim_shorts", label: "Short jean" },
      { id: "bottom_satin_maxi", label: "Maxi satin" },
      { id: "bottom_sequin_skirt", label: "Sequin bạc" },
      { id: "bottom_leather_mini", label: "Mini da" },
      { id: "bottom_wideleg_cream", label: "Ống rộng kem" },
      { id: "bottom_bikini_white", label: "Bikini trắng" },
      { id: "bottom_mom_jeans", label: "Mom jeans" },
      { id: "bottom_leather_pants", label: "Quần da" },
      { id: "bottom_plaid_skirt", label: "Plaid" },
      { id: "bottom_cargo_beige", label: "Cargo be" },
      { id: "bottom_bike_shorts", label: "Short bó" },
      { id: "bottom_jogger_grey", label: "Jogger xám" },
      { id: "bottom_yoga_leggings", label: "Legging" },
      { id: "bottom_culottes_navy", label: "Culottes navy" },
      { id: "bottom_trousers_black", label: "Tây đen" },
      { id: "bottom_plisse_skirt", label: "Plissé sage" },
      { id: "bottom_aline_skirt", label: "Chữ A be" },
      { id: "bottom_skinny_jeans", label: "Skinny" },
      { id: "bottom_tennis_skirt", label: "Váy tennis" },
      { id: "bottom_denim_skirt", label: "Váy jean" },
      { id: "bottom_pleated_skirt", label: "Xếp ly pastel" },
    ],
  },
  {
    key: "shoes", label: "Giày", icon: "👠",
    items: [
      { id: "__none", label: "Không" },
      { id: "shoes_mary_janes", label: "Mary Jane" },
      { id: "shoes_flipflops", label: "Tông xỏ ngón" },
      { id: "shoes_pumps_nude", label: "Pump nude" },
      { id: "shoes_chunky_sneakers", label: "Sneaker bự" },
      { id: "shoes_heels_pink", label: "Gót hồng" },
      { id: "shoes_canvas_pink", label: "Canvas hồng" },
      { id: "shoes_heels_gold", label: "Gót vàng" },
      { id: "shoes_ankle_boots", label: "Bốt cổ thấp" },
      { id: "shoes_boots_combat", label: "Combat" },
      { id: "shoes_chelsea_boots", label: "Chelsea" },
      { id: "shoes_penny_loafers", label: "Penny loafer" },
      { id: "shoes_cowboy_boots", label: "Bốt cowboy" },
      { id: "shoes_oxford_white", label: "Oxford trắng" },
      { id: "shoes_heels_red", label: "Gót đỏ" },
      { id: "shoes_loafers_brown", label: "Loafer nâu" },
      { id: "shoes_sneakers_glitter", label: "Sneaker" },
      { id: "shoes_sneakers_white", label: "Sneaker trắng" },
      { id: "shoes_kitten_black", label: "Kitten đen" },
      { id: "shoes_platform_heels", label: "Gót đế bằng" },
      { id: "shoes_ballet_flats", label: "Búp bê" },
      { id: "shoes_platform_white", label: "Platform" },
      { id: "shoes_running_neon", label: "Chạy bộ neon" },
      { id: "shoes_heels_silver", label: "Gót bạc" },
      { id: "shoes_espadrilles", label: "Espadrille" },
      { id: "shoes_knee_boots", label: "Bốt cao" },
      { id: "shoes_hightops", label: "High-top" },
      { id: "shoes_heels_black", label: "Gót đen" },
      { id: "shoes_strappy_sandals", label: "Sandal dây" },
      { id: "shoes_loafers_chunky", label: "Loafer hầm hố" },
      { id: "shoes_slides_pink", label: "Slide hồng" },
    ],
  },

  /* ---------- PHỤ KIỆN ---------- */
  {
    key: "headwear", label: "Đầu", icon: "👑",
    items: [
      { id: "__none", label: "Không" },
      { id: "acc_tiara", label: "Tiara" },
      { id: "acc_beret", label: "Beret" },
    ],
  },
  {
    key: "eyewear", label: "Kính", icon: "🕶️",
    items: [
      { id: "__none", label: "Không" },
      { id: "acc_sunglasses", label: "Kính" },
    ],
  },
  {
    key: "earrings", label: "Khuyên tai", icon: "💎",
    items: [
      { id: "__none", label: "Không" },
      { id: "acc_earrings", label: "Hoa tai" },
    ],
  },
  {
    key: "necklace", label: "Vòng cổ", icon: "📿",
    items: [
      { id: "__none", label: "Không" },
      { id: "acc_choker", label: "Choker" },
      { id: "acc_pearl_necklace", label: "Vòng ngọc" },
    ],
  },
  {
    key: "bag", label: "Túi", icon: "👜",
    items: [
      { id: "__none", label: "Không" },
      { id: "acc_handbag", label: "Túi" },
    ],
  },
];

/* Mặc định: nhân vật MỘC */
const DEFAULT_LOOK = {
  hair: "__default",
  brows: "__none", eyes: "__none", eyemakeup: "__none", lips: "__none", blush: "__none",
  top: "__none", dress: "__none", bottom: "__none", shoes: "__none",
  headwear: "__none", eyewear: "__none", earrings: "__none", necklace: "__none", bag: "__none",
};
