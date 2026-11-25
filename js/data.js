/**
 * js/data.js
 * 6 Study regions in Turkey with official Wikipedia article thumbnails +
 * instant built-in regional landscape artwork (never blank, never wrong landmark)
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley (Nevsehir)",
    cityLabel: "NEVSEHIR • CAPPADOCIA RELIEF",
    reliefType: "cappadocia",
    difficulty: "Easy",
    wikiTitle: "Göreme",
    center: [38.6455, 34.8325],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 38.625, maxLat: 38.665, minLng: 34.805, maxLng: 34.858 },
    briefingIntro: "Welcome to Cappadocia (Nevsehir)! Measure 3 targets across the valleys and fairy chimneys:",
    strategyTip: "Click a high hill in the center-north (>1220 m) between M1, M2, and M3.",
    hint: "Click a high hill in the center-north (>1220 m).",
    targets: [
      { id: "M1", icon: "🏔️", type: "Hill Gate", name: "Red Valley Gate", desc: "East rocky slope", lat: 38.6465, lng: 34.8380 },
      { id: "M2", icon: "🏞️", type: "Valley", name: "Love Valley Floor", desc: "Northwest valley floor", lat: 38.6510, lng: 34.8220 },
      { id: "M3", icon: "🏛️", type: "Plateau", name: "Goreme Open Museum", desc: "Southeast open bench", lat: 38.6395, lng: 34.8410 }
    ],
    quiz: {
      question: "How were Cappadocia's famous valleys and fairy chimneys in Nevsehir formed?",
      options: [
        "Glacial ice sheets carving coastal fjords",
        "Coral reef uplift from the Black Sea",
        "Wind and water erosion of soft volcanic tuff layers"
      ],
      correctIndex: 2,
      explanation: "Ancient volcanic eruptions covered Nevsehir in soft tuff and basalt, which wind and rain sculpted into fairy chimneys."
    }
  },
  {
    id: 2,
    name: "Region 2: Salt Lake Basin – Aksaray Plain",
    cityLabel: "AKSARAY • TUZ GOLU BASIN",
    reliefType: "saltlake",
    difficulty: "Easy",
    wikiTitle: "Lake_Tuz",
    center: [38.3950, 33.9950],
    zoom: 14,
    maxRange: 4000,
    bounds: { minLat: 38.375, maxLat: 38.415, minLng: 33.968, maxLng: 34.022 },
    briefingIntro: "Welcome to the Aksaray – Tuz Golu basin! A wide flat plain surrounded by gentle hills:",
    strategyTip: "Click right in the middle between M1, M2, and M3 (>1190 m) to reach all 3 targets easily.",
    hint: "Click in the center between M1, M2, and M3 (>1190 m).",
    targets: [
      { id: "M1", icon: "🌾", type: "Plain", name: "North Steppe Bench", desc: "Flat northern field", lat: 38.4030, lng: 33.9920 },
      { id: "M2", icon: "⛰️", type: "Low Hill", name: "East Ridge Mound", desc: "Gentle eastern rise", lat: 38.3920, lng: 34.0080 },
      { id: "M3", icon: "💧", type: "Canal", name: "South Water Channel", desc: "Low southern plain", lat: 38.3860, lng: 33.9880 }
    ],
    quiz: {
      question: "What makes the Tuz Golu (Salt Lake) basin in Central Anatolia geographically unique?",
      options: [
        "It is Turkey's deepest tectonic ocean trench",
        "It is a closed endorheic basin where shallow water evaporates into white salt flats",
        "It sits inside an active tropical rainforest"
      ],
      correctIndex: 1,
      explanation: "Tuz Golu lies in an arid closed basin in Central Anatolia; summer evaporation leaves behind thick natural salt crusts."
    }
  },
  {
    id: 3,
    name: "Region 3: Uludag – Mountain Ridge (Bursa)",
    cityLabel: "BURSA • ULUDAG MASSIF",
    reliefType: "uludag",
    difficulty: "Medium",
    wikiTitle: "Uludağ",
    center: [40.1045, 29.1330],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 40.085, maxLat: 40.125, minLng: 29.105, maxLng: 29.160 },
    briefingIntro: "Welcome to Uludag in Bursa! Steep mountain slopes surround 3 high targets:",
    strategyTip: "Click on a high central ridge (>1230 m) so mountain shoulders don't block your view.",
    hint: "Find a high ridge (>1230 m) in the middle of the 3 targets.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Mountain", name: "North Slope Top", desc: "Northwest ski slope", lat: 40.1120, lng: 29.1240 },
      { id: "M2", icon: "⛰️", type: "Ridge", name: "East Ridge Point", desc: "Eastern rocky shoulder", lat: 40.1030, lng: 29.1445 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "South Peak Bench", desc: "Southern high terrace", lat: 40.0950, lng: 29.1290 }
    ],
    quiz: {
      question: "What is Uludag's key topographic distinction in Bursa and the Marmara Region?",
      options: [
        "It is a flat sea-level delta plain",
        "It is an underground limestone cave system with no peaks",
        "At 2,543 m, it is the highest peak in the Marmara Region with glacial lakes and steep ridges"
      ],
      correctIndex: 2,
      explanation: "Rising to 2,543 m south of Bursa, Uludag is Marmara's highest mountain and features glacial cirques and steep slopes."
    }
  },
  {
    id: 4,
    name: "Region 4: Pamukkale – Travertine Terraces (Denizli)",
    cityLabel: "DENIZLI • PAMUKKALE TERRACES",
    reliefType: "pamukkale",
    difficulty: "Medium",
    wikiTitle: "Pamukkale",
    center: [37.9240, 29.1230],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 37.905, maxLat: 37.943, minLng: 29.098, maxLng: 29.148 },
    briefingIntro: "Welcome to Pamukkale (Denizli)! Survey the Hierapolis plateau and stepped white terraces:",
    strategyTip: "Click on the high eastern plateau (>1210 m) to look down across all 3 terraces.",
    hint: "Click on the high eastern plateau (>1210 m) above the terraces.",
    targets: [
      { id: "M1", icon: "🏛️", type: "Ruins", name: "Hierapolis Theater", desc: "Upper hillside ruins", lat: 37.9285, lng: 29.1290 },
      { id: "M2", icon: "💧", type: "Terrace", name: "White Travertine Pool", desc: "Mid-slope thermal terrace", lat: 37.9210, lng: 29.1150 },
      { id: "M3", icon: "🏞️", type: "Valley", name: "South Plain Gate", desc: "Lower valley entrance", lat: 37.9145, lng: 29.1265 }
    ],
    quiz: {
      question: "What creates the stepped white terraces on the hillside of Pamukkale in Denizli?",
      options: [
        "Calcium-rich thermal spring water depositing white travertine carbonate steps",
        "Permanent year-round polar snow",
        "Wind-blown white desert sand dunes"
      ],
      correctIndex: 0,
      explanation: "Warm mineral-rich spring water flows down the fault scarp in Denizli, precipitating stepped white travertine pools."
    }
  },
  {
    id: 5,
    name: "Region 5: Kackar – Ayder Highland (Rize)",
    cityLabel: "RIZE • AYDER & FIRTINA VALLEY",
    reliefType: "ayder",
    difficulty: "Hard",
    wikiTitle: "Ayder,_Çamlıhemşin",
    center: [40.9525, 41.1050],
    zoom: 14,
    maxRange: 3600,
    bounds: { minLat: 40.932, maxLat: 40.972, minLng: 41.075, maxLng: 41.135 },
    briefingIntro: "Welcome to Ayder Highland in Rize! Steep green mountain walls drop into Firtina Valley:",
    strategyTip: "Click on a high hillside (>1235 m) above the river so you can see both sides of the deep valley.",
    hint: "Pick a high hillside (>1235 m) above Firtina Creek.",
    targets: [
      { id: "M1", icon: "💧", type: "River", name: "Firtina Creek Bend", desc: "Deep river valley bend", lat: 40.9580, lng: 41.0950 },
      { id: "M2", icon: "🏞️", type: "Highland", name: "Upper Kavrun Path", desc: "Southeast green meadow", lat: 40.9465, lng: 41.1160 },
      { id: "M3", icon: "⛰️", type: "Cliff", name: "West Rocky Ridge", desc: "Steep mountain wall", lat: 40.9540, lng: 41.1120 }
    ],
    quiz: {
      question: "Which topographic feature best describes Rize and the Ayder Highland in the Eastern Black Sea?",
      options: [
        "Flat coastal salt marshes at zero elevation",
        "Steep V-shaped river valleys and high alpine plateaus carved by heavy rainfall and mountain streams",
        "Dry volcanic desert plateaus with no rivers"
      ],
      correctIndex: 1,
      explanation: "Rize's Kackar Mountains receive Turkey's highest rainfall, carving deep V-shaped valleys like Firtina Creek below high yaylas."
    }
  },
  {
    id: 6,
    name: "Region 6: Nemrut Caldera – Tatvan (Bitlis)",
    cityLabel: "BITLIS • NEMRUT CRATER CALDERA",
    reliefType: "nemrut",
    difficulty: "Expert",
    wikiTitle: "Mount_Nemrut_(volcano)",
    center: [38.6200, 42.2420],
    zoom: 13,
    maxRange: 4200,
    bounds: { minLat: 38.595, maxLat: 38.650, minLng: 42.195, maxLng: 42.280 },
    briefingIntro: "Welcome to Nemrut Caldera in Bitlis! A volcanic crater lake fills the western side:",
    strategyTip: "Stay out of the crater lake! Click on the dry eastern ridge (>1225 m) between M1, M2, and M3.",
    hint: "Stay out of the water! Click on the dry eastern ridge (>1225 m).",
    waterZone: { lat: 38.6250, lng: 42.2220, radius: 1300 },
    targets: [
      { id: "M1", icon: "🌋", type: "Volcano", name: "East Lava Hill", desc: "Eastern volcanic ridge", lat: 38.6180, lng: 42.2560 },
      { id: "M2", icon: "🌊", type: "Lake Rim", name: "South Crater Rim", desc: "Dry southern caldera rim", lat: 38.6040, lng: 42.2410 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "Northeast Ridge", desc: "High northeastern peak", lat: 38.6360, lng: 42.2520 }
    ],
    quiz: {
      question: "How was Mount Nemrut's large caldera and crater lake near Bitlis formed?",
      options: [
        "Construction of an artificial concrete hydroelectric dam",
        "Tidal flooding from the Mediterranean Sea",
        "Collapse of a volcanic magma chamber followed by water filling the caldera basin"
      ],
      correctIndex: 2,
      explanation: "Mount Nemrut in Bitlis is a stratovolcano whose summit collapsed into a massive caldera now holding freshwater crater lakes."
    }
  }
];

/**
 * Generates an instant, crisp SVG data-URI landscape illustration for each of the 6 regions
 * so the briefing frame is NEVER blank and always shows the exact Turkish landmark.
 */
function getBuiltInRegionArtworkDataUrl(reliefType) {
  let svg = "";
  switch (reliefType) {
    case "cappadocia":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f97316"/><stop offset="55%" stop-color="#fdba74"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
          <linearGradient id="tuff" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#9a3412"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky)"/>
        <circle cx="630" cy="82" r="34" fill="#fff7ed" opacity="0.85"/>
        <path d="M0 245 Q200 195 420 230 T800 210 L800 340 L0 340 Z" fill="#b45309"/>
        <!-- Fairy Chimneys -->
        <path d="M95 310 L118 145 L142 310 Z" fill="url(#tuff)"/><ellipse cx="118" cy="143" rx="16" ry="8" fill="#7c2d12"/>
        <path d="M155 315 L186 112 L218 315 Z" fill="url(#tuff)"/><ellipse cx="186" cy="110" rx="20" ry="10" fill="#7c2d12"/>
        <path d="M235 310 L254 168 L275 310 Z" fill="url(#tuff)"/><ellipse cx="254" cy="166" rx="13" ry="7" fill="#7c2d12"/>
        <path d="M510 315 L542 125 L574 315 Z" fill="url(#tuff)"/><ellipse cx="542" cy="123" rx="19" ry="9" fill="#7c2d12"/>
        <path d="M590 315 L614 162 L638 315 Z" fill="url(#tuff)"/><ellipse cx="614" cy="160" rx="14" ry="7" fill="#7c2d12"/>
        <!-- Hot air balloons -->
        <ellipse cx="345" cy="96" rx="18" ry="22" fill="#ec4899"/><rect x="340" y="120" width="10" height="6" fill="#78350f"/>
        <ellipse cx="445" cy="74" rx="13" ry="16" fill="#38bdf8"/><rect x="441" y="92" width="8" height="5" fill="#78350f"/>
        <path d="M0 285 Q240 265 480 290 T800 278 L800 340 L0 340 Z" fill="#78350f"/>
      </svg>`;
      break;
    case "saltlake":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="65%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#e0f2fe"/></linearGradient>
          <linearGradient id="salt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky2)"/>
        <!-- Distant Hasan Dagi silhouette -->
        <path d="M470 185 L585 112 L645 135 L725 185 Z" fill="#94a3b8" opacity="0.65"/>
        <!-- Wide white salt lake horizon -->
        <rect x="0" y="182" width="800" height="158" fill="url(#salt)"/>
        <!-- Polygonal salt crust cracks -->
        <g stroke="#94a3b8" stroke-width="1.4" fill="none" opacity="0.55">
          <path d="M40 230 L130 220 L195 242 L115 262 Z"/>
          <path d="M195 242 L310 225 L380 250 L270 272 Z"/>
          <path d="M380 250 L500 232 L590 258 L475 280 Z"/>
          <path d="M115 262 L270 272 L230 315 L75 305 Z"/>
          <path d="M475 280 L650 268 L740 302 L560 322 Z"/>
        </g>
        <!-- Mirror reflection pool -->
        <ellipse cx="400" cy="204" rx="290" ry="12" fill="#bae6fd" opacity="0.65"/>
      </svg>`;
      break;
    case "uludag":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#93c5fd"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky3)"/>
        <!-- Steep snowy Uludag summit -->
        <path d="M0 280 L190 135 L365 56 L530 128 L800 265 L800 340 L0 340 Z" fill="#475569"/>
        <!-- Snow cap -->
        <path d="M190 135 L365 56 L530 128 L470 158 L420 132 L365 168 L305 134 L250 162 Z" fill="#f8fafc"/>
        <!-- Pine forest slopes -->
        <path d="M0 245 Q240 205 460 240 T800 225 L800 340 L0 340 Z" fill="#14532d"/>
        <g fill="#052e16">
          <polygon points="90,265 106,215 122,265"/><polygon points="145,275 164,218 183,275"/>
          <polygon points="240,268 258,212 276,268"/><polygon points="560,264 580,206 600,264"/>
          <polygon points="645,274 664,218 683,274"/><polygon points="710,262 726,214 742,262"/>
        </g>
      </svg>`;
      break;
    case "pamukkale":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0369a1"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky4)"/>
        <!-- Green Denizli valley background -->
        <path d="M0 165 Q400 130 800 165 L800 340 L0 340 Z" fill="#15803d"/>
        <!-- Stepped White Travertine Terraces & Turquoise Thermal Pools -->
        <path d="M70 165 Q400 145 730 165 L765 215 Q400 198 35 215 Z" fill="#f8fafc"/>
        <ellipse cx="260" cy="184" rx="95" ry="13" fill="#38bdf8"/>
        <ellipse cx="530" cy="186" rx="105" ry="13" fill="#38bdf8"/>
        <path d="M35 215 Q400 198 765 215 L790 272 Q400 255 10 272 Z" fill="#f1f5f9"/>
        <ellipse cx="195" cy="240" rx="115" ry="15" fill="#0ea5e9"/>
        <ellipse cx="430" cy="242" rx="110" ry="15" fill="#38bdf8"/>
        <ellipse cx="645" cy="240" rx="90" ry="14" fill="#0ea5e9"/>
        <path d="M10 272 Q400 255 790 272 L800 340 L0 340 Z" fill="#e2e8f0"/>
        <ellipse cx="330" cy="304" rx="145" ry="17" fill="#38bdf8"/>
        <ellipse cx="595" cy="306" rx="120" ry="16" fill="#0ea5e9"/>
      </svg>`;
      break;
    case "ayder":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#e0f2fe"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky5)"/>
        <!-- Steep V-shaped Kackar mountain walls -->
        <polygon points="0,75 410,275 0,340" fill="#166534"/>
        <polygon points="800,65 390,275 800,340" fill="#15803d"/>
        <!-- Misty highland clouds -->
        <ellipse cx="220" cy="145" rx="110" ry="22" fill="#ffffff" opacity="0.65"/>
        <ellipse cx="590" cy="135" rx="120" ry="24" fill="#ffffff" opacity="0.65"/>
        <!-- Wooden Ayder yayla chalets -->
        <rect x="235" y="218" width="38" height="24" fill="#92400e"/><polygon points="230,218 254,202 278,218" fill="#451a03"/>
        <rect x="520" y="212" width="42" height="26" fill="#92400e"/><polygon points="515,212 541,195 567,212" fill="#451a03"/>
        <!-- Firtina Creek rushing through valley bottom -->
        <path d="M395 270 Q415 302 380 340 L435 340 Q450 302 415 270 Z" fill="#0284c7"/>
      </svg>`;
      break;
    case "nemrut":
    default:
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340">
        <defs>
          <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
        </defs>
        <rect width="800" height="340" fill="url(#sky6)"/>
        <!-- Caldera volcanic rim -->
        <path d="M0 220 L135 125 L310 155 L520 142 L685 118 L800 215 L800 340 L0 340 Z" fill="#3f3f46"/>
        <path d="M80 235 Q400 185 720 235 L760 340 L40 340 Z" fill="#27272a"/>
        <!-- Deep blue Nemrut Crater Lake inside caldera -->
        <ellipse cx="400" cy="248" rx="265" ry="48" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
        <ellipse cx="385" cy="244" rx="190" ry="26" fill="#0369a1" opacity="0.7"/>
      </svg>`;
      break;
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

async function fetchElevationProfile(points) {
  const locationsPayload = points.map(p => ({ latitude: p.lat, longitude: p.lng }));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch("https://api.open-elevation.com/api/v1/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ locations: locationsPayload }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("API error");
    const data = await response.json();

    if (data && Array.isArray(data.results) && data.results.length === points.length) {
      return data.results.map(r => Math.round(r.elevation * 10) / 10);
    }
    throw new Error("Invalid data");
  } catch (err) {
    return points.map(p => computeDeterministicElevation(p.lat, p.lng));
  }
}

function computeDeterministicElevation(lat, lng) {
  const base = 1190;
  const ridge1 = Math.sin(lat * 180) * 55;
  const ridge2 = Math.cos(lng * 165) * 52;
  const micro = Math.sin((lat + lng) * 600) * 12;
  return Math.round((base + ridge1 + ridge2 + micro) * 10) / 10;
}