/**
 * js/data.js
 * 6 Study regions in Turkey with clear stage briefings, terrain icons, and elevation lookup
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley",
    difficulty: "Easy",
    center: [38.6455, 34.8325],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 38.625, maxLat: 38.665, minLng: 34.805, maxLng: 34.858 },
    briefingIntro: "Welcome to Goreme! There are 3 targets placed across the valley and ridge:",
    strategyTip: "Click on a high hill in the center-north (around 1220 m or higher) between M1, M2, and M3 so your laser clears the valley floor.",
    hint: "Pick a high spot in the center-north (>1220 m) between the 3 targets.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Hill Gate", name: "Red Valley Gate", desc: "Located on the eastern rocky slope", lat: 38.6465, lng: 34.8380 },
      { id: "M2", icon: "🏞️", type: "Valley", name: "Love Valley Floor", desc: "Low ground in the northwest valley", lat: 38.6510, lng: 34.8220 },
      { id: "M3", icon: "🏛️", type: "Plateau", name: "Goreme Open Museum", desc: "Open bench on the south-east side", lat: 38.6395, lng: 34.8410 }
    ]
  },
  {
    id: 2,
    name: "Region 2: Salt Lake Basin – Aksaray Plain",
    difficulty: "Easy",
    center: [38.3950, 33.9950],
    zoom: 14,
    maxRange: 4000,
    bounds: { minLat: 38.375, maxLat: 38.415, minLng: 33.968, maxLng: 34.022 },
    briefingIntro: "This wide open basin near Tuz Golu has gentle hills and flat plains:",
    strategyTip: "Click right in the middle of the triangle formed by M1, M2, and M3. Almost any high point above 1190 m can see all 3 targets at once!",
    hint: "Stand right in the center between M1, M2, and M3 for an easy 3/3 shot!",
    targets: [
      { id: "M1", icon: "🌾", type: "Plain", name: "North Steppe Bench", desc: "Flat open field in the north", lat: 38.4030, lng: 33.9920 },
      { id: "M2", icon: "⛰️", type: "Low Hill", name: "East Ridge Mound", desc: "Small gentle rise on the east", lat: 38.3920, lng: 34.0080 },
      { id: "M3", icon: "💧", type: "Canal", name: "South Water Channel", desc: "Low plain near the south irrigation line", lat: 38.3860, lng: 33.9880 }
    ]
  },
  {
    id: 3,
    name: "Region 3: Uludag – Mountain Ridge",
    difficulty: "Medium",
    center: [40.1045, 29.1330],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 40.085, maxLat: 40.125, minLng: 29.105, maxLng: 29.160 },
    briefingIntro: "You are on the mountain slopes of Uludag with 3 high-altitude targets:",
    strategyTip: "Do not stand in the low dip! Move your mouse until Cursor Height shows above 1230 m on the central ridge between M1, M2, and M3.",
    hint: "Look for a ridge above 1230 m in the middle of the three targets.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Mountain", name: "North Slope Top", desc: "High ski slope on the northwest", lat: 40.1120, lng: 29.1240 },
      { id: "M2", icon: "⛰️", type: "Ridge", name: "East Ridge Point", desc: "Rocky shoulder on the east side", lat: 40.1030, lng: 29.1445 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "South Peak Bench", desc: "Elevated terrace on the south", lat: 40.0950, lng: 29.1290 }
    ]
  },
  {
    id: 4,
    name: "Region 4: Pamukkale – Travertine Terraces",
    difficulty: "Medium",
    center: [37.9240, 29.1230],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 37.905, maxLat: 37.943, minLng: 29.098, maxLng: 29.148 },
    briefingIntro: "Survey the ancient Hierapolis plateau and white travertine slopes:",
    strategyTip: "Place your Total Station on the upper plateau edge (east of the terraces) above 1210 m so you look down toward all 3 targets.",
    hint: "Stand on the high eastern plateau (>1210 m) looking down at the terraces.",
    targets: [
      { id: "M1", icon: "🏛️", type: "Ruins", name: "Hierapolis Theater", desc: "Upper hillside archaeological site", lat: 37.9285, lng: 29.1290 },
      { id: "M2", icon: "💧", type: "Terrace", name: "White Travertine Pool", desc: "Mid-slope thermal water terrace", lat: 37.9210, lng: 29.1150 },
      { id: "M3", icon: "🏞️", type: "Valley", name: "South Plain Gate", desc: "Lower valley entrance on the south", lat: 37.9145, lng: 29.1265 }
    ]
  },
  {
    id: 5,
    name: "Region 5: Kackar – Ayder Highland",
    difficulty: "Hard",
    center: [40.9525, 41.1050],
    zoom: 14,
    maxRange: 3600,
    bounds: { minLat: 40.932, maxLat: 40.972, minLng: 41.075, maxLng: 41.135 },
    briefingIntro: "Ayder has a deep river valley between steep green mountain walls:",
    strategyTip: "Stand on the high hillside above 1235 m overlooking Firtina Creek so you can see both sides of the valley.",
    hint: "Pick a high hillside (>1235 m) above the creek to see across the valley.",
    targets: [
      { id: "M1", icon: "💧", type: "River", name: "Firtina Creek Bend", desc: "Down along the fast mountain stream", lat: 40.9580, lng: 41.0950 },
      { id: "M2", icon: "🏞️", type: "Highland", name: "Upper Kavrun Path", desc: "Green highland meadow to the southeast", lat: 40.9465, lng: 41.1160 },
      { id: "M3", icon: "⛰️", type: "Cliff", name: "West Rocky Ridge", desc: "Steep mountain wall in the center-east", lat: 40.9540, lng: 41.1120 }
    ]
  },
  {
    id: 6,
    name: "Region 6: Nemrut Caldera – Bitlis",
    difficulty: "Expert",
    center: [38.6200, 42.2420],
    zoom: 13,
    maxRange: 4200,
    bounds: { minLat: 38.595, maxLat: 38.650, minLng: 42.195, maxLng: 42.280 },
    briefingIntro: "Final Challenge! A volcanic crater lake sits on the west side of the area:",
    strategyTip: "Never click inside the pink water circle! Place your station on the high eastern crater ridge (between M1, M2, and M3) above 1225 m.",
    hint: "Stay out of the crater lake! Click on the high eastern ridge (>1225 m).",
    waterZone: { lat: 38.6250, lng: 42.2220, radius: 1300 },
    targets: [
      { id: "M1", icon: "🌋", type: "Volcano", name: "East Lava Hill", desc: "Volcanic ridge on the east side", lat: 38.6180, lng: 42.2560 },
      { id: "M2", icon: "🌊", type: "Lake Rim", name: "South Crater Rim", desc: "Dry ridge south of the crater lake", lat: 38.6040, lng: 42.2410 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "Northeast Ridge", desc: "High volcanic peak in the northeast", lat: 38.6360, lng: 42.2520 }
    ]
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