/**
 * js/data.js
 * 6 Study regions in Turkey with reliable Unsplash photos + Wikipedia API fallback
 * + Stage completion survey/region quiz questions
 */

const GAME_STAGES = [
  {
    id: 1,
    name: "Region 1: Cappadocia – Goreme Valley",
    difficulty: "Easy",
    wikiTitle: "Göreme",
    photo: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=900&q=80",
    center: [38.6455, 34.8325],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 38.625, maxLat: 38.665, minLng: 34.805, maxLng: 34.858 },
    briefingIntro: "Welcome to Goreme! There are 3 reflector targets placed across the valley and ridge:",
    strategyTip: "Click on a high hill in the center-north (>1220 m). Why? If you set up in the low valley floor, volcanic tuff ridges block the straight laser beam to the upper targets.",
    hint: "Pick a high spot in the center-north (>1220 m) so ridges don't block your laser.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Hill Gate", name: "Red Valley Gate", desc: "Located on the eastern rocky slope", lat: 38.6465, lng: 34.8380 },
      { id: "M2", icon: "🏞️", type: "Valley", name: "Love Valley Floor", desc: "Low ground in the northwest valley", lat: 38.6510, lng: 34.8220 },
      { id: "M3", icon: "🏛️", type: "Plateau", name: "Goreme Open Museum", desc: "Open bench on the south-east side", lat: 38.6395, lng: 34.8410 }
    ],
    quiz: {
      question: "Why should a Total Station be placed on high ground rather than inside a deep Cappadocia valley?",
      options: [
        "To keep an unobstructed straight Line-of-Sight over surrounding ridges",
        "Because gravity is weaker at higher elevations",
        "Because reflector prisms only work above 1200 meters"
      ],
      correctIndex: 0,
      explanation: "Total Stations use straight optical/infrared beams—elevated stations clear intervening hills and valleys."
    }
  },
  {
    id: 2,
    name: "Region 2: Salt Lake Basin – Aksaray Plain",
    difficulty: "Easy",
    wikiTitle: "Lake_Tuz",
    photo: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80",
    center: [38.3950, 33.9950],
    zoom: 14,
    maxRange: 4000,
    bounds: { minLat: 38.375, maxLat: 38.415, minLng: 33.968, maxLng: 34.022 },
    briefingIntro: "This wide open basin near Tuz Golu has gentle hills and flat plains:",
    strategyTip: "Stand right in the middle of M1, M2, and M3 (>1190 m). Central positioning keeps every target within the Total Station's optical range.",
    hint: "Stand right in the center between M1, M2, and M3 for an easy 3/3 shot!",
    targets: [
      { id: "M1", icon: "🌾", type: "Plain", name: "North Steppe Bench", desc: "Flat open field in the north", lat: 38.4030, lng: 33.9920 },
      { id: "M2", icon: "⛰️", type: "Low Hill", name: "East Ridge Mound", desc: "Small gentle rise on the east", lat: 38.3920, lng: 34.0080 },
      { id: "M3", icon: "💧", type: "Canal", name: "South Water Channel", desc: "Low plain near the south irrigation line", lat: 38.3860, lng: 33.9880 }
    ],
    quiz: {
      question: "What is the main advantage of setting up the Total Station centrally between M1, M2, and M3 in the Tuz Golu basin?",
      options: [
        "It minimizes maximum laser distance and improves angular geometry",
        "It eliminates the need for a tripod",
        "It automatically increases satellite signal strength"
      ],
      correctIndex: 0,
      explanation: "Central station placement balances sight distances to all three prisms and keeps targets within instrument range."
    }
  },
  {
    id: 3,
    name: "Region 3: Uludag – Mountain Ridge",
    difficulty: "Medium",
    wikiTitle: "Uludağ",
    photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    center: [40.1045, 29.1330],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 40.085, maxLat: 40.125, minLng: 29.105, maxLng: 29.160 },
    briefingIntro: "You are on the mountain slopes of Uludag with 3 high-altitude targets:",
    strategyTip: "Choose a ridge above 1230 m. In steep mountain terrain, placing the Total Station too low causes mountain shoulders to intercept the laser beam.",
    hint: "Look for a ridge above 1230 m in the middle of the three targets.",
    targets: [
      { id: "M1", icon: "🏔️", type: "Mountain", name: "North Slope Top", desc: "High ski slope on the northwest", lat: 40.1120, lng: 29.1240 },
      { id: "M2", icon: "⛰️", type: "Ridge", name: "East Ridge Point", desc: "Rocky shoulder on the east side", lat: 40.1030, lng: 29.1445 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "South Peak Bench", desc: "Elevated terrace on the south", lat: 40.0950, lng: 29.1290 }
    ],
    quiz: {
      question: "On a mountain slope like Uludag, how do you know from the elevation profile chart that a ridge blocks your target?",
      options: [
        "The terrain profile line rises above the dashed laser sight line",
        "The dashed laser line turns completely vertical",
        "The station elevation is higher than the target"
      ],
      correctIndex: 0,
      explanation: "Whenever intermediate ground elevation exceeds the straight Line-of-Sight ray, terrain obstructs the measurement."
    }
  },
  {
    id: 4,
    name: "Region 4: Pamukkale – Travertine Terraces",
    difficulty: "Medium",
    wikiTitle: "Pamukkale",
    photo: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80",
    center: [37.9240, 29.1230],
    zoom: 14,
    maxRange: 3800,
    bounds: { minLat: 37.905, maxLat: 37.943, minLng: 29.098, maxLng: 29.148 },
    briefingIntro: "Survey the ancient Hierapolis plateau and white travertine slopes:",
    strategyTip: "Set up on the upper eastern plateau (>1210 m). Looking downhill from an elevated bench gives a clear angle over stepped travertine terraces.",
    hint: "Stand on the high eastern plateau (>1210 m) looking down at the terraces.",
    targets: [
      { id: "M1", icon: "🏛️", type: "Ruins", name: "Hierapolis Theater", desc: "Upper hillside archaeological site", lat: 37.9285, lng: 29.1290 },
      { id: "M2", icon: "💧", type: "Terrace", name: "White Travertine Pool", desc: "Mid-slope thermal water terrace", lat: 37.9210, lng: 29.1150 },
      { id: "M3", icon: "🏞️", type: "Valley", name: "South Plain Gate", desc: "Lower valley entrance on the south", lat: 37.9145, lng: 29.1265 }
    ],
    quiz: {
      question: "Pamukkale's famous white terraces are formed primarily by which mineral deposited from thermal spring waters?",
      options: [
        "Calcium carbonate (travertine)",
        "Volcanic obsidian glass",
        "Pure sodium chloride halite"
      ],
      correctIndex: 0,
      explanation: "Calcium-rich thermal waters at Pamukkale precipitate white calcium carbonate travertine terraces."
    }
  },
  {
    id: 5,
    name: "Region 5: Kackar – Ayder Highland",
    difficulty: "Hard",
    wikiTitle: "Ayder",
    photo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    center: [40.9525, 41.1050],
    zoom: 14,
    maxRange: 3600,
    bounds: { minLat: 40.932, maxLat: 40.972, minLng: 41.075, maxLng: 41.135 },
    briefingIntro: "Ayder has a deep river valley between steep green mountain walls:",
    strategyTip: "Stand on the high hillside (>1235 m) overlooking Firtina Creek. Deep V-shaped valleys block low stations from seeing across opposite slopes.",
    hint: "Pick a high hillside (>1235 m) above the creek to see across the valley.",
    targets: [
      { id: "M1", icon: "💧", type: "River", name: "Firtina Creek Bend", desc: "Down along the fast mountain stream", lat: 40.9580, lng: 41.0950 },
      { id: "M2", icon: "🏞️", type: "Highland", name: "Upper Kavrun Path", desc: "Green highland meadow to the southeast", lat: 40.9465, lng: 41.1160 },
      { id: "M3", icon: "⛰️", type: "Cliff", name: "West Rocky Ridge", desc: "Steep mountain wall in the center-east", lat: 40.9540, lng: 41.1120 }
    ],
    quiz: {
      question: "What does a Total Station measure at each reflector prism to build a 3D topographic surface?",
      options: [
        "Slope distance, horizontal angle, and vertical angle (ΔX, ΔY, ΔZ)",
        "Only wind speed and air humidity",
        "Subsurface rock radioactivity"
      ],
      correctIndex: 0,
      explanation: "Combining electronic distance measurement (EDM) with horizontal and vertical angles yields 3D coordinates (E, N, Z)."
    }
  },
  {
    id: 6,
    name: "Region 6: Nemrut Caldera – Bitlis",
    difficulty: "Expert",
    wikiTitle: "Nemrut_(volcano)",
    photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80",
    center: [38.6200, 42.2420],
    zoom: 13,
    maxRange: 4200,
    bounds: { minLat: 38.595, maxLat: 38.650, minLng: 42.195, maxLng: 42.280 },
    briefingIntro: "Final Challenge! A volcanic crater lake sits on the west side of the area:",
    strategyTip: "Never click inside the crater lake! A Total Station tripod needs solid rock (>1225 m on the eastern caldera rim)—water cannot stabilize an optical leveling instrument.",
    hint: "Stay out of the crater lake! Click on the solid eastern ridge (>1225 m).",
    waterZone: { lat: 38.6250, lng: 42.2220, radius: 1300 },
    targets: [
      { id: "M1", icon: "🌋", type: "Volcano", name: "East Lava Hill", desc: "Volcanic ridge on the east side", lat: 38.6180, lng: 42.2560 },
      { id: "M2", icon: "🌊", type: "Lake Rim", name: "South Crater Rim", desc: "Dry ridge south of the crater lake", lat: 38.6040, lng: 42.2410 },
      { id: "M3", icon: "🏔️", type: "Peak", name: "Northeast Ridge", desc: "High volcanic peak in the northeast", lat: 38.6360, lng: 42.2520 }
    ],
    quiz: {
      question: "Why is setting up a Total Station inside Nemrut Crater Lake strictly invalid in field surveying?",
      options: [
        "Tripods require solid, stable ground for precise bubble/compensator leveling",
        "Crater lakes have zero atmospheric pressure",
        "Total Stations only operate in sub-zero temperatures"
      ],
      correctIndex: 0,
      explanation: "Millimeter-level angular precision requires a rigid, vibration-free tripod setup on solid ground."
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