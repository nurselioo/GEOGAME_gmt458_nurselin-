/**
 * js/data.js
 * Study regions in Turkey with terrain-specific target icons and elevation lookup
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley",
    difficulty: "Easy",
    center: [38.6455, 34.8325],
    zoom: 14,
    maxRange: 3000,
    bounds: { minLat: 38.625, maxLat: 38.665, minLng: 34.805, maxLng: 34.858 },
    hint: "Pick a high hill in the center-north to see all 3 valley targets.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Ridge", name: "Red Valley Gate", lat: 38.6465, lng: 34.8380 },
      { id: "M2", icon: "🏞️", type: "Valley", name: "Love Valley Floor", lat: 38.6510, lng: 34.8220 },
      { id: "M3", icon: "🏛️", type: "Plateau", name: "Goreme Open Museum", lat: 38.6395, lng: 34.8410 }
    ]
  },
  {
    id: 2,
    name: "Region 2: Uludag – Mountain Ridge",
    difficulty: "Medium",
    center: [40.1045, 29.1330],
    zoom: 14,
    maxRange: 3000,
    bounds: { minLat: 40.085, maxLat: 40.125, minLng: 29.105, maxLng: 29.160 },
    hint: "Click on a high mountain peak above 1220 m so your laser clears the slopes.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Slope", name: "North Slope Top", lat: 40.1120, lng: 29.1240 },
      { id: "M2", icon: "⛰️", type: "Ridge", name: "East Ridge Point", lat: 40.1030, lng: 29.1445 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "South Peak Bench", lat: 40.0950, lng: 29.1290 }
    ]
  },
  {
    id: 3,
    name: "Region 3: Kackar – Ayder Highland",
    difficulty: "Hard",
    center: [40.9525, 41.1050],
    zoom: 14,
    maxRange: 2800,
    bounds: { minLat: 40.932, maxLat: 40.972, minLng: 41.075, maxLng: 41.135 },
    hint: "Deep creek valley! Stand on a high hill above the water to see both sides.",
    targets: [
      { id: "M1", icon: "💧", type: "Creek", name: "Firtina Creek Bend", lat: 40.9580, lng: 41.0950 },
      { id: "M2", icon: "🏞️", type: "Highland", name: "Upper Kavrun Path", lat: 40.9465, lng: 41.1160 },
      { id: "M3", icon: "⛰️", type: "Cliff", name: "West Rocky Ridge", lat: 40.9540, lng: 41.1120 }
    ]
  },
  {
    id: 4,
    name: "Region 4: Nemrut Caldera – Bitlis",
    difficulty: "Expert",
    center: [38.6200, 42.2420],
    zoom: 13,
    maxRange: 3200,
    bounds: { minLat: 38.595, maxLat: 38.650, minLng: 42.195, maxLng: 42.280 },
    hint: "Do not click in the lake! Use the high crater rim on the east side.",
    waterZone: { lat: 38.6250, lng: 42.2220, radius: 1350 },
    targets: [
      { id: "M1", icon: "🌋", type: "Volcano", name: "East Lava Hill", lat: 38.6180, lng: 42.2560 },
      { id: "M2", icon: "🌊", type: "Lake Shore", name: "South Crater Rim", lat: 38.6040, lng: 42.2410 },
      { id: "M3", icon: "🏔️", type: "Crater Rim", name: "Northeast Ridge", lat: 38.6360, lng: 42.2520 }
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
  const base = 1180;
  const ridge1 = Math.sin(lat * 210) * 85;
  const ridge2 = Math.cos(lng * 190) * 80;
  const micro = Math.sin((lat + lng) * 750) * 18;
  return Math.round((base + ridge1 + ridge2 + micro) * 10) / 10;
}