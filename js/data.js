/**
 * js/data.js
 * 6 Study regions in Turkey with dedicated high-resolution photography,
 * simplified coach hints, relief profile types, and randomized-choice geography quizzes
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley (Nevsehir)",
    cityLabel: "NEVSEHIR • CAPPADOCIA RELIEF",
    reliefType: "cappadocia",
    difficulty: "Easy",
    photo: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1000&q=85",
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
    photo: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=85",
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
    photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
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
    photo: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1000&q=85",
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
    photo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85",
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
    photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=85",
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