// Original illustrated avatars (SVG, 100×100). Drawn for Do-Own; no external assets.
export type AvatarCategory = "Flores" | "Tiernos" | "Intrépidos" | "Paisajes";

export interface AvatarPreset {
  id: string;
  label: string;
  category: AvatarCategory;
  svg: string;
}

const wrap = (bg: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/>${body}</svg>`;

const eyes = (y: number, dx = 9, r = 3.2, cx = 50) =>
  `<circle cx="${cx - dx}" cy="${y}" r="${r}" fill="#2b2140"/><circle cx="${cx + dx}" cy="${y}" r="${r}" fill="#2b2140"/><circle cx="${cx - dx + 1}" cy="${y - 1.2}" r="1" fill="#fff"/><circle cx="${cx + dx + 1}" cy="${y - 1.2}" r="1" fill="#fff"/>`;

const petals = (n: number, r: number, rx: number, ry: number, color: string) =>
  Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    return `<ellipse cx="50" cy="${50 - r}" rx="${rx}" ry="${ry}" fill="${color}" transform="rotate(${a} 50 50)"/>`;
  }).join("");

export const avatarPresets: AvatarPreset[] = [
  // ---------- Flores ----------
  {
    id: "girasol",
    label: "Girasol",
    category: "Flores",
    svg: wrap(
      "#dff3ff",
      `<rect x="47" y="60" width="6" height="40" fill="#3f9b5a"/><ellipse cx="38" cy="82" rx="11" ry="5" fill="#4fb36b" transform="rotate(-25 38 82)"/>${petals(14, 22, 7, 14, "#ffc928")}<circle cx="50" cy="50" r="15" fill="#7a4a22"/><circle cx="46" cy="46" r="2" fill="#5b3415"/><circle cx="54" cy="50" r="2" fill="#5b3415"/><circle cx="48" cy="55" r="2" fill="#5b3415"/>`,
    ),
  },
  {
    id: "tulipan",
    label: "Tulipán",
    category: "Flores",
    svg: wrap(
      "#fff0f4",
      `<rect x="48" y="52" width="4" height="48" fill="#3f9b5a"/><path d="M50 92 C30 80 26 64 30 58 C40 66 46 78 50 92Z" fill="#59bf74"/><path d="M50 92 C70 80 74 64 70 58 C60 66 54 78 50 92Z" fill="#4fb36b"/><path d="M30 30 L38 40 L50 24 L62 40 L70 30 L70 46 C70 60 30 60 30 46Z" fill="#ff5d8f"/><path d="M50 24 L62 40 L70 30 L70 46 C70 56 58 58 50 58Z" fill="#e8467a"/>`,
    ),
  },
  {
    id: "cerezo",
    label: "Flor de cerezo",
    category: "Flores",
    svg: wrap(
      "#f3ecff",
      `${petals(5, 18, 13, 17, "#ffc2d6")}${petals(5, 18, 5, 7, "#ffa3c0")}<circle cx="50" cy="50" r="8" fill="#ff7ba5"/><circle cx="50" cy="50" r="3" fill="#ffe27a"/><circle cx="20" cy="22" r="4" fill="#ffd1e0"/><circle cx="82" cy="78" r="5" fill="#ffd1e0"/>`,
    ),
  },
  {
    id: "cactus",
    label: "Cactus en flor",
    category: "Flores",
    svg: wrap(
      "#fff6e0",
      `<path d="M30 78 h40 l-5 20 h-30z" fill="#e0794a"/><rect x="28" y="74" width="44" height="8" rx="3" fill="#f08a5a"/><rect x="40" y="30" width="20" height="46" rx="10" fill="#4fb36b"/><path d="M40 58 h-8 a6 6 0 0 1 -6 -6 v-10 a4 4 0 0 1 8 0 v8 h6z" fill="#4fb36b"/><path d="M60 50 h8 v-8 a4 4 0 0 1 8 0 v10 a6 6 0 0 1 -6 6 h-10z" fill="#4fb36b"/>${petals(
        6,
        6,
        4,
        6,
        "#ff5d8f",
      )
        .replace(/cy="44"/g, 'cy="26"')
        .replace(
          /50 50\)/g,
          "50 30)",
        )}<circle cx="50" cy="30" r="3" fill="#ffe27a"/>${eyes(52, 5, 2)}<path d="M46 59 q4 3 8 0" stroke="#2b2140" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    ),
  },
  // ---------- Tiernos ----------
  {
    id: "gato",
    label: "Gatito",
    category: "Tiernos",
    svg: wrap(
      "#ffe9d6",
      `<path d="M24 40 L30 14 L46 30Z" fill="#f2a65a"/><path d="M76 40 L70 14 L54 30Z" fill="#f2a65a"/><path d="M29 34 L32 21 L40 30Z" fill="#ffc9d6"/><path d="M71 34 L68 21 L60 30Z" fill="#ffc9d6"/><ellipse cx="50" cy="56" rx="32" ry="28" fill="#f2a65a"/><ellipse cx="50" cy="66" rx="18" ry="13" fill="#fff3e6"/>${eyes(52, 12, 4)}<path d="M47 62 h6 l-3 3z" fill="#ff7ba5"/><path d="M50 65 q-4 5 -8 2 M50 65 q4 5 8 2" stroke="#2b2140" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M22 60 h-12 M22 66 h-10 M78 60 h12 M78 66 h10" stroke="#c97a35" stroke-width="1.5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "panda",
    label: "Panda",
    category: "Tiernos",
    svg: wrap(
      "#e6f7ea",
      `<circle cx="24" cy="28" r="12" fill="#2b2140"/><circle cx="76" cy="28" r="12" fill="#2b2140"/><circle cx="50" cy="55" r="34" fill="#ffffff"/><ellipse cx="37" cy="52" rx="9" ry="11" fill="#2b2140" transform="rotate(-20 37 52)"/><ellipse cx="63" cy="52" rx="9" ry="11" fill="#2b2140" transform="rotate(20 63 52)"/><circle cx="38" cy="51" r="3" fill="#fff"/><circle cx="62" cy="51" r="3" fill="#fff"/><ellipse cx="50" cy="66" rx="5" ry="3.5" fill="#2b2140"/><path d="M50 69 q-4 5 -8 1 M50 69 q4 5 8 1" stroke="#2b2140" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="66" r="4" fill="#ffc2d6"/><circle cx="70" cy="66" r="4" fill="#ffc2d6"/>`,
    ),
  },
  {
    id: "conejo",
    label: "Conejito",
    category: "Tiernos",
    svg: wrap(
      "#efe9ff",
      `<ellipse cx="38" cy="22" rx="8" ry="22" fill="#f4f1fb"/><ellipse cx="62" cy="22" rx="8" ry="22" fill="#f4f1fb"/><ellipse cx="38" cy="24" rx="4" ry="16" fill="#ffc2d6"/><ellipse cx="62" cy="24" rx="4" ry="16" fill="#ffc2d6"/><circle cx="50" cy="62" r="30" fill="#f4f1fb"/>${eyes(58, 11, 3.6)}<ellipse cx="50" cy="67" rx="3.5" ry="2.5" fill="#ff7ba5"/><path d="M50 69 v4 M50 73 q-4 3 -7 0 M50 73 q4 3 7 0" stroke="#2b2140" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="70" r="4.5" fill="#ffd1e0"/><circle cx="70" cy="70" r="4.5" fill="#ffd1e0"/>`,
    ),
  },
  {
    id: "pollito",
    label: "Pollito",
    category: "Tiernos",
    svg: wrap(
      "#e3f2ff",
      `<path d="M44 20 q6 -10 8 2 q6 -8 6 4" stroke="#f5b400" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="50" cy="56" r="32" fill="#ffd93d"/><ellipse cx="22" cy="62" rx="8" ry="13" fill="#f5c400" transform="rotate(20 22 62)"/><ellipse cx="78" cy="62" rx="8" ry="13" fill="#f5c400" transform="rotate(-20 78 62)"/>${eyes(50, 11, 4)}<path d="M43 58 L57 58 L50 67Z" fill="#ff8c3a"/><circle cx="32" cy="62" r="4" fill="#ffb3a1"/><circle cx="68" cy="62" r="4" fill="#ffb3a1"/>`,
    ),
  },
  // ---------- Intrépidos ----------
  {
    id: "leon",
    label: "León",
    category: "Intrépidos",
    svg: wrap(
      "#fff1d6",
      `${petals(16, 26, 10, 14, "#c9611f")}<circle cx="50" cy="52" r="26" fill="#f2b04a"/><circle cx="30" cy="32" r="7" fill="#f2b04a"/><circle cx="70" cy="32" r="7" fill="#f2b04a"/>${eyes(48, 10, 3.6)}<path d="M38 41 l7 3 M62 41 l-7 3" stroke="#7a3a10" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="50" cy="63" rx="11" ry="8" fill="#ffe2a8"/><path d="M45 58 h10 l-5 5z" fill="#5b2a0c"/><path d="M50 63 q-4 4 -7 1 M50 63 q4 4 7 1" stroke="#5b2a0c" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "tiburon",
    label: "Tiburón",
    category: "Intrépidos",
    svg: wrap(
      "#d6f1ff",
      `<path d="M0 82 q12 -6 25 0 t25 0 t25 0 t25 0 v18 h-100z" fill="#7fd0f5"/><path d="M50 8 L64 34 L36 34Z" fill="#5d7ea3"/><ellipse cx="50" cy="56" rx="34" ry="26" fill="#6f92b8"/><ellipse cx="50" cy="66" rx="24" ry="14" fill="#eef4fb"/>${eyes(48, 14, 3.6)}<path d="M38 41 l7 4 M62 41 l-7 4" stroke="#2b2140" stroke-width="2.2" stroke-linecap="round"/><path d="M34 64 h32 l-4 6 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5z" fill="#fff" stroke="#2b2140" stroke-width="1.2" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "aguila",
    label: "Águila",
    category: "Intrépidos",
    svg: wrap(
      "#e8f0ff",
      `<path d="M10 70 q20 -30 40 -18 q20 -12 40 18 q-20 -8 -40 6 q-20 -14 -40 -6z" fill="#7a4a22"/><ellipse cx="50" cy="66" rx="20" ry="24" fill="#8b5a2b"/><circle cx="50" cy="40" r="20" fill="#fbfbfb"/>${eyes(38, 8, 3.4)}<path d="M38 31 l8 4 M62 31 l-8 4" stroke="#2b2140" stroke-width="2.2" stroke-linecap="round"/><path d="M42 44 h16 q-2 12 -8 14 q-2 -6 -8 -14z" fill="#ffb21e"/>`,
    ),
  },
  {
    id: "lobo",
    label: "Lobo",
    category: "Intrépidos",
    svg: wrap(
      "#2f2a5a",
      `<circle cx="78" cy="22" r="10" fill="#fff6c8"/><circle cx="20" cy="18" r="1.4" fill="#fff"/><circle cx="34" cy="10" r="1" fill="#fff"/><circle cx="60" cy="14" r="1.2" fill="#fff"/><path d="M22 46 L28 14 L44 32Z" fill="#9aa3b8"/><path d="M78 46 L72 14 L56 32Z" fill="#9aa3b8"/><path d="M28 40 L31 22 L40 32Z" fill="#5a6178"/><path d="M72 40 L69 22 L60 32Z" fill="#5a6178"/><path d="M20 50 Q50 20 80 50 L66 84 Q50 96 34 84Z" fill="#9aa3b8"/><path d="M38 64 Q50 56 62 64 L56 86 Q50 90 44 86Z" fill="#e8ebf2"/><circle cx="40" cy="54" r="3.4" fill="#ffd93d"/><circle cx="60" cy="54" r="3.4" fill="#ffd93d"/><circle cx="40" cy="54" r="1.4" fill="#2b2140"/><circle cx="60" cy="54" r="1.4" fill="#2b2140"/><ellipse cx="50" cy="72" rx="5" ry="3.5" fill="#2b2140"/>`,
    ),
  },
  // ---------- Paisajes ----------
  {
    id: "montanas",
    label: "Montañas",
    category: "Paisajes",
    svg: wrap(
      "#bfe6ff",
      `<circle cx="74" cy="26" r="10" fill="#ffd93d"/><path d="M0 80 L30 36 L50 62 L70 30 L100 74 V100 H0Z" fill="#6c7fd6"/><path d="M30 36 L38 48 L33 46 L28 50 L24 45Z M70 30 L79 44 L73 41 L68 45 L63 41Z" fill="#fff"/><path d="M0 86 Q25 74 50 84 T100 82 V100 H0Z" fill="#4fb36b"/>`,
    ),
  },
  {
    id: "playa",
    label: "Atardecer en la playa",
    category: "Paisajes",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fab"/><stop offset="0.6" stop-color="#ffc46b"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="58" r="16" fill="#fff1a8"/><rect y="58" width="100" height="22" fill="#3fa9d6"/><path d="M30 64 h40 M38 70 h24 M44 76 h12" stroke="#fff1a8" stroke-width="2" stroke-linecap="round"/><path d="M0 80 Q50 72 100 80 V100 H0Z" fill="#f5d9a0"/><path d="M80 82 q-4 -24 4 -40" stroke="#7a4a22" stroke-width="3" fill="none"/><path d="M84 42 q-14 -2 -18 8 M84 42 q12 -6 16 4 M84 42 q-6 -10 -16 -8 M84 42 q8 -12 14 -8" stroke="#3f9b5a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: "noche",
    label: "Noche estrellada",
    category: "Paisajes",
    svg: wrap(
      "#1f1b4a",
      `<circle cx="70" cy="28" r="12" fill="#fff6c8"/><circle cx="75" cy="24" r="11" fill="#1f1b4a"/><circle cx="18" cy="20" r="1.6" fill="#fff"/><circle cx="32" cy="34" r="1.2" fill="#fff"/><circle cx="46" cy="14" r="1.8" fill="#ffe27a"/><circle cx="88" cy="48" r="1.2" fill="#fff"/><circle cx="12" cy="46" r="1" fill="#fff"/><path d="M40 26 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#ffe27a"/><path d="M0 78 Q30 58 55 74 T100 70 V100 H0Z" fill="#3b3478"/><path d="M0 88 Q40 76 100 86 V100 H0Z" fill="#7c3aed"/>`,
    ),
  },
];

export const avatarDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const DEFAULT_AVATAR = "/images/ana.jpg";
