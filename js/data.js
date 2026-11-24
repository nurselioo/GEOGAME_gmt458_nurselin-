/**
 * js/data.js
 * Study regions in Turkey and Open-Elevation (SRTM DEM) height service
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley",
    difficulty: "Easy",
    center: [38.6431, 34.8305],
    zoom: 14,
    maxRange: 2500,
    bounds: { minLat: 38.625, maxLat: 38.662, minLng: 34.805, maxLng: 34.855 },
    hint: "Pick a high ridge on the north or south side to see all 3 valley targets.",
    targets: [
      { id: "M1", name: "Red Valley Gate", lat: 38.6465, lng: 34.8380 },
      { id: "M2", name: "Love Valley Floor", lat: 38.6510, lng: 34.8220 },
      { id: "M3", name: "Goreme Open Museum", lat: 38.6395, lng: 34.8410 }
    ]
  },
  {
    id: 2,
    name: "Region 2: Uludag – Mountain Ridge",
    difficulty: "Medium",
    center: [40.1055, 29.1310],
    zoom: 14,
    maxRange: 2500,
    bounds: { minLat: 40.085, maxLat: 40.125, minLng: 29.105, maxLng: 29.158 },
    hint: "Steep slopes! Targets behind a ridge will be blocked from view.",
    targets: [
      { id: "M1", name: "North Slope Top", lat: 40.1120, lng: 29.1240 },
      { id: "M2", name: "East Ridge Point", lat: 40.1030, lng: 29.1445 },
      { id: "M3", name: "South Peak Bench", lat: 40.0950, lng: 29.1290 }
    ]
  },
  {
    id: 3,
    name: "Region 3: Kackar – Ayder Highland",
    difficulty: "Hard",
    center: [40.9525, 41.1040],
    zoom: 14,
    maxRange: 2400,
    bounds: { minLat: 40.932, maxLat: 40.972, minLng: 41.075, maxLng: 41.132 },
    hint: "Deep valley and steep hills. Find a high hill that sees across the river.",
    targets: [
      { id: "M1", name: "Firtina Creek Bend", lat: 40.9580, lng: 41.0950 },
      { id: "M2", name: "Upper Kavrun Path", lat: 40.9465, lng: 41.1160 },
      { id: "M3", name: "West Rocky Ridge", lat: 40.9540, lng: 41.1120 }
    ]
  },
  {
    id: 4,
    name: "Region 4: Nemrut Caldera – Bitlis",
    difficulty: "Expert",
    center: [38.6220, 42.2380],
    zoom: 13,
    maxRange: 3000,
    bounds: { minLat: 38.595, maxLat: 38.650, minLng: 42.195, maxLng: 42.280 },
    hint: "Do not click inside the crater lake! Use the high crater rim on the east side.",
    waterZone: { lat: 38.6250, lng: 42.2220, radius: 1350 },
    targets: [
      { id: "M1", name: "East Lava Hill", lat: 38.6180, lng: 42.2560 },
      { id: "M2", name: "South Crater Rim", lat: 38.6040, lng: 42.2410 },
      { id: "M3", name: "Northeast Ridge", lat: 38.6360, lng: 42.2520 }
    ]
  }
];

/**
 * Fetches real elevation (height in meters) from the open SRTM DEM dataset.
 * Uses a fast deterministic terrain fallback if the public API is busy.
 */
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

    if (!response.ok) throw new Error("Open-Elevation API error");
    const data = await response.json();

    if (data && Array.isArray(data.results) && data.results.length === points.length) {
      return data.results.map(r => Math.round(r.elevation * 10) / 10);
    }
    throw new Error("Invalid elevation payload");
  } catch (err) {
    return points.map(p => computeDeterministicElevation(p.lat, p.lng));
  }
}

function computeDeterministicElevation(lat, lng) {
  const base = 1150;
  const ridge1 = Math.sin(lat * 420) * 140;
  const ridge2 = Math.cos(lng * 380) * 130;
  const micro = Math.sin((lat + lng) * 1800) * 35;
  return Math.round((base + ridge1 + ridge2 + micro) * 10) / 10;
}