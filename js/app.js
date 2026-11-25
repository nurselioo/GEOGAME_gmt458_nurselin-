/**
 * js/app.js
 * Leaflet map, Guaranteed Instant Landmark Artwork + Official Wikipedia Landmark Photos,
 * Left-Side Floating Hot/Cold Coach, Dynamic Next-Move Terrain & Laser Analyzer,
 * 3D Side-View Relief Block Model, Shuffled Regional Quizzes,
 * and Victory Screen with Hard-Hat Surveyor + Full 3D Elevation Relief Map of Turkey
 */

document.addEventListener("DOMContentLoaded", () => {
  const game = createGameEngine(GAME_STAGES);

  // =========================================================================
  // OFFICIAL WIKIPEDIA LANDMARK PHOTO RESOLVER + INSTANT BUILT-IN FALLBACK
  // =========================================================================
  const resolvedPhotoUrls = {};

  async function resolveOfficialLandmarkPhoto(stage) {
    if (resolvedPhotoUrls[stage.id]) return resolvedPhotoUrls[stage.id];
    const fallbackSvg = getBuiltInRegionArtworkDataUrl(stage.reliefType);
    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(stage.wikiTitle)}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        const imgUrl = data?.originalimage?.source || data?.thumbnail?.source;
        if (imgUrl) {
          resolvedPhotoUrls[stage.id] = imgUrl;
          return imgUrl;
        }
      }
    } catch (e) {
      // Offline or blocked: use built-in landmark illustration
    }
    resolvedPhotoUrls[stage.id] = fallbackSvg;
    return fallbackSvg;
  }

  GAME_STAGES.forEach((st) => {
    resolveOfficialLandmarkPhoto(st).then((url) => {
      const img = new Image();
      img.src = url;
    });
  });

  // =========================================================================
  // SOUND EFFECTS ENGINE (Web Audio API)
  // =========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function ensureAudio() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = "sine", delay = 0, vol = 0.12) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playDeploySound() {
    playTone(220, 0.08, "triangle", 0, 0.14);
    playTone(880, 0.12, "sine", 0.07, 0.10);
    playTone(1320, 0.14, "sine", 0.15, 0.09);
  }

  function playTargetSuccessSound() {
    playTone(587.33, 0.12, "sine", 0, 0.12);
    playTone(880, 0.22, "sine", 0.1, 0.14);
  }

  function playErrorSound() {
    playTone(170, 0.18, "sawtooth", 0, 0.12);
    playTone(130, 0.24, "sawtooth", 0.14, 0.12);
  }

  function playStageCompleteSound() {
    playTone(523.25, 0.14, "triangle", 0, 0.14);
    playTone(659.25, 0.14, "triangle", 0.12, 0.14);
    playTone(783.99, 0.16, "triangle", 0.24, 0.14);
    playTone(1046.5, 0.38, "triangle", 0.36, 0.16);
  }

  const btnSoundToggle = document.getElementById("btn-sound-toggle");
  btnSoundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btnSoundToggle.textContent = "🔊 Sound";
      btnSoundToggle.classList.remove("muted");
      playDeploySound();
    } else {
      btnSoundToggle.textContent = "🔇 Muted";
      btnSoundToggle.classList.add("muted");
    }
  });

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================
  const hudStage = document.getElementById("hud-stage");
  const hudTimer = document.getElementById("hud-timer");
  const timerBox = document.getElementById("timer-box");
  const hudLives = document.getElementById("hud-lives");
  const hudScore = document.getElementById("hud-score");
  const hudHighscore = document.getElementById("hud-highscore");
  const regionTitle = document.getElementById("region-title");
  const toastBanner = document.getElementById("toast-banner");

  const cursorElevBadge = document.getElementById("cursor-elev-badge");
  const stationElevEl = document.getElementById("station-elev");
  const stationCountEl = document.getElementById("station-count");
  const stationFeedbackBox = document.getElementById("station-feedback-box");

  const targetListEl = document.getElementById("target-list");
  const targetsProgressEl = document.getElementById("targets-progress");
  const profileSelector = document.getElementById("profile-selector");
  const losStatusText = document.getElementById("los-status-text");
  const chartGuidanceStrip = document.getElementById("chart-guidance-strip");
  const metricClearanceEl = document.getElementById("metric-clearance");
  const metricReqElevEl = document.getElementById("metric-req-elev");
  const btnNextStage = document.getElementById("btn-next-stage");

  const startModal = document.getElementById("start-modal");
  const briefingModal = document.getElementById("briefing-modal");
  const stageCompleteModal = document.getElementById("stage-complete-modal");
  const gameoverModal = document.getElementById("gameover-modal");
  const btnRetryStage = document.getElementById("btn-retry-stage");

  const TOTAL_STATION_MARKER_HTML = `
    <div class="station-marker-svg-wrap" style="width:42px;height:42px;">
      <svg viewBox="0 0 64 64" width="30" height="30" aria-label="Total Station">
        <line x1="32" y1="34" x2="14" y2="60" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="34" x2="50" y2="60" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="34" x2="32" y2="62" stroke="#fbcfe8" stroke-width="4" stroke-linecap="round"/>
        <rect x="22" y="29" width="20" height="5" rx="2" fill="#fbcfe8"/>
        <rect x="20" y="11" width="24" height="18" rx="4" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
        <circle cx="28" cy="20" r="5" fill="#130b18" stroke="#38bdf8" stroke-width="2"/>
        <path d="M24 11 V7 H40 V11" fill="none" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>
  `;

  // Initialize Leaflet Map
  const map = L.map("map", { zoomControl: true }).setView([39.0, 35.0], 6);

  const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: "© OpenTopoMap (SRTM)"
  }).addTo(map);

  const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    attribution: "© Esri World Imagery"
  });

  let targetMarkersLayer = L.layerGroup().addTo(map);
  let stationLayer = L.layerGroup().addTo(map);
  let sightLinesLayer = L.layerGroup().addTo(map);
  let boundaryLayer = L.layerGroup().addTo(map);

  let currentProfiles = [];
  let targetElevations = {};
  let lastStationCoords = null;
  let lastStationHeight = 1200;
  let elevationChart = null;
  let isProcessingClick = false;
  let cinematicAnimId = null;
  let turkeyReliefAnimId = null;

  function initChart() {
    const ctx = document.getElementById("elevationChart").getContext("2d");
    const terrainGrad = ctx.createLinearGradient(0, 0, 0, 160);
    terrainGrad.addColorStop(0, "rgba(244, 114, 182, 0.55)");
    terrainGrad.addColorStop(1, "rgba(40, 23, 51, 0.15)");

    elevationChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Terrain Elevation",
            data: [],
            borderColor: "#f472b6",
            borderWidth: 2,
            backgroundColor: terrainGrad,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointBackgroundColor: "#f472b6"
          },
          {
            label: "Laser Line-of-Sight",
            data: [],
            borderColor: "#10b981",
            borderDash: [6, 4],
            borderWidth: 2.5,
            fill: false,
            pointRadius: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
            pointBackgroundColor: "#38bdf8"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 420 },
        plugins: {
          legend: { labels: { color: "#fdf2f8", font: { size: 10 }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctxItem) => `${ctxItem.dataset.label}: ${ctxItem.parsed.y} m`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#d8b4e2", font: { size: 10 }, maxTicksLimit: 5 },
            grid: { color: "rgba(70, 39, 89, 0.25)" }
          },
          y: {
            ticks: { color: "#d8b4e2", font: { size: 10 }, maxTicksLimit: 4 },
            grid: { color: "rgba(70, 39, 89, 0.45)" }
          }
        }
      }
    });
  }

  initChart();
  hudHighscore.textContent = game.getState().highScore;

  function showBanner(htmlText, type = "info") {
    toastBanner.innerHTML = htmlText;
    toastBanner.className = "toast-banner";
    if (type === "error") toastBanner.classList.add("error");
    if (type === "success") toastBanner.classList.add("success");
  }

  function setFeedback(htmlText, level = "info") {
    stationFeedbackBox.innerHTML = htmlText;
    stationFeedbackBox.className = "feedback-box";
    if (level === "good") stationFeedbackBox.classList.add("good");
    if (level === "warn") stationFeedbackBox.classList.add("warn");
    if (level === "bad") stationFeedbackBox.classList.add("bad");
  }

  function updateHUD(state) {
    hudStage.textContent = `${state.stageNumber} / ${state.totalStages}`;
    const mins = String(Math.floor(state.timeLeft / 60)).padStart(2, "0");
    const secs = String(state.timeLeft % 60).padStart(2, "0");
    hudTimer.textContent = `${mins}:${secs}`;

    if (state.timeLeft <= 15 && state.isGameActive) {
      timerBox.classList.add("timer-danger");
    } else {
      timerBox.classList.remove("timer-danger");
    }

    hudLives.textContent = "♥ ".repeat(state.lives).trim() || "💀";
    hudScore.textContent = state.score;
    hudHighscore.textContent = state.highScore;
  }

  // Instant Landmark Artwork + Official Wikipedia Photo Upgrade (NEVER blank!)
  async function openStageBriefing(stage) {
    game.pauseTimer();

    const state = game.getState();
    const photoEl = document.getElementById("briefing-photo");
    const builtInArt = getBuiltInRegionArtworkDataUrl(stage.reliefType);

    // 1. Immediately display the crisp built-in regional landmark artwork so it is NEVER empty
    photoEl.onload = () => photoEl.classList.add("loaded");
    photoEl.onerror = () => {
      photoEl.src = builtInArt;
      photoEl.classList.add("loaded");
    };
    photoEl.src = builtInArt;
    photoEl.classList.add("loaded");

    document.getElementById("briefing-badge").textContent = `STAGE ${state.stageNumber} / ${state.totalStages} • ${stage.difficulty.toUpperCase()}`;
    document.getElementById("briefing-title").textContent = stage.name;
    document.getElementById("briefing-desc").textContent = stage.briefingIntro;
    document.getElementById("briefing-strategy").textContent = stage.strategyTip;

    const listEl = document.getElementById("briefing-targets-list");
    listEl.innerHTML = "";
    stage.targets.forEach((t) => {
      const li = document.createElement("li");
      li.innerHTML = `<span style="font-size:1.25rem;">${t.icon}</span> <strong>${t.id} – ${t.name}:</strong> ${t.desc}`;
      listEl.appendChild(li);
    });

    briefingModal.classList.remove("hidden");

    // 2. Seamlessly upgrade to the real Wikipedia photograph once preloaded in memory
    const realPhotoUrl = await resolveOfficialLandmarkPhoto(stage);
    if (realPhotoUrl && realPhotoUrl !== builtInArt && game.getCurrentStage().id === stage.id) {
      const preloader = new Image();
      preloader.onload = () => {
        if (game.getCurrentStage().id === stage.id) {
          photoEl.src = realPhotoUrl;
          photoEl.classList.add("loaded");
        }
      };
      preloader.src = realPhotoUrl;
    }
  }

  document.getElementById("btn-close-briefing").addEventListener("click", () => {
    briefingModal.classList.add("hidden");
    game.resumeTimer();
  });

  document.getElementById("btn-show-briefing").addEventListener("click", () => {
    openStageBriefing(game.getCurrentStage());
  });

  map.on("mousemove", (e) => {
    if (!game.getState().isGameActive) return;
    const estHeight = computeDeterministicElevation(e.latlng.lat, e.latlng.lng);
    cursorElevBadge.textContent = `Cursor: ~${Math.round(estHeight)} m`;
  });

  async function loadStage(stage, showBriefingPopup = true) {
    targetMarkersLayer.clearLayers();
    stationLayer.clearLayers();
    sightLinesLayer.clearLayers();
    boundaryLayer.clearLayers();
    currentProfiles = [];
    targetElevations = {};
    lastStationCoords = null;

    regionTitle.textContent = `${stage.name} (${stage.difficulty})`;
    stationElevEl.textContent = "-- m";
    stationCountEl.textContent = "0";
    targetsProgressEl.textContent = `0 / ${stage.targets.length}`;
    profileSelector.disabled = true;
    btnNextStage.classList.add("hidden");

    chartGuidanceStrip.className = "chart-guidance-strip";
    chartGuidanceStrip.innerHTML = `<span>🎯 <strong>Next Pick Guide:</strong> ${stage.hint}</span>`;
    metricClearanceEl.textContent = "Clearance: --";
    metricReqElevEl.textContent = "Min Hill Needed: --";
    losStatusText.textContent = "Dashed line = Laser beam. Pick a hill higher than any ridge between you and the target.";
    losStatusText.style.color = "#d8b4e2";
    setFeedback(`💡 ${stage.hint}`, "info");

    const rectBounds = [
      [stage.bounds.minLat, stage.bounds.minLng],
      [stage.bounds.maxLat, stage.bounds.maxLng]
    ];
    L.rectangle(rectBounds, {
      color: "#f472b6",
      weight: 2,
      dashArray: "7, 7",
      fillOpacity: 0.04
    }).addTo(boundaryLayer);

    if (stage.waterZone) {
      L.circle([stage.waterZone.lat, stage.waterZone.lng], {
        radius: stage.waterZone.radius,
        color: "#f43f5e",
        fillColor: "#ec4899",
        fillOpacity: 0.24,
        weight: 1.5
      }).bindTooltip("💧 Crater Lake: Click dry ground instead").addTo(boundaryLayer);
    }

    map.flyTo(stage.center, stage.zoom, { duration: 1.0 });
    showBanner(`💡 ${stage.hint}`);

    if (showBriefingPopup) {
      openStageBriefing(stage);
    }

    const elevations = await fetchElevationProfile(stage.targets);
    stage.targets.forEach((t, idx) => {
      targetElevations[t.id] = elevations[idx];
    });

    renderTargetMarkersAndList(stage, new Set(), {}, 0);
  }

  function renderTargetMarkersAndList(stage, readSet, statusMap, activeIndex = -1) {
    targetMarkersLayer.clearLayers();
    targetListEl.innerHTML = "";
    targetsProgressEl.textContent = `${readSet.size} / ${stage.targets.length}`;

    stage.targets.forEach((t, index) => {
      const isRead = readSet.has(t.id);
      const status = statusMap[t.id];

      let pillClass = "target-marker-pill";
      if (isRead) pillClass += " read-success";
      else if (status === "blocked" || status === "out_of_range") pillClass += " read-blocked";

      const icon = L.divIcon({
        className: "",
        html: `<div class="${pillClass}"><span class="t-ico">${t.icon}</span><span>${t.id}</span></div>`,
        iconSize: [64, 30],
        iconAnchor: [32, 15]
      });

      const marker = L.marker([t.lat, t.lng], { icon }).addTo(targetMarkersLayer);
      marker.bindTooltip(`${t.icon} ${t.id}: ${t.name}${isRead ? ` (${targetElevations[t.id]} m)` : ""}`);

      const li = document.createElement("li");
      li.className = "target-item";
      if (index === activeIndex) li.classList.add("active-ray");
      if (isRead) li.classList.add("visible-ok");
      else if (status === "blocked" || status === "out_of_range") li.classList.add("blocked-err");

      let statusBadge = `<span class="small-text">⏳ Waiting</span>`;
      if (isRead) {
        statusBadge = `<span class="mono" style="color:#10b981;font-weight:700;">✅ ${targetElevations[t.id]} m</span>`;
      } else if (status === "blocked") {
        statusBadge = `<span style="color:#f43f5e;font-weight:600;">❌ Blocked</span>`;
      } else if (status === "out_of_range") {
        statusBadge = `<span style="color:#fbbf24;font-weight:600;">⚠️ Too Far</span>`;
      }

      li.innerHTML = `
        <div><span class="target-emoji-lg">${t.icon}</span> <strong>${t.id}</strong> • ${t.name}</div>
        <div>${statusBadge}</div>
      `;

      li.addEventListener("click", () => {
        if (currentProfiles[index]) {
          profileSelector.value = String(index);
          drawProfileChart(currentProfiles[index]);
          highlightActiveTargetRow(index);
        }
      });

      targetListEl.appendChild(li);
    });
  }

  function highlightActiveTargetRow(idx) {
    const items = targetListEl.querySelectorAll(".target-item");
    items.forEach((el, i) => {
      el.classList.toggle("active-ray", i === idx);
    });
  }

  function getCardinalDirection(fromLat, fromLng, toLat, toLng) {
    const dLat = toLat - fromLat;
    const dLng = toLng - fromLng;
    const ns = dLat > 0.002 ? "North" : dLat < -0.002 ? "South" : "";
    const ew = dLng > 0.002 ? "East" : dLng < -0.002 ? "West" : "";
    return [ns, ew].filter(Boolean).join("-") || "Center";
  }

  // =========================================================================
  // MAP CLICK TO PLACE TOTAL STATION
  // =========================================================================
  map.on("click", async (e) => {
    const state = game.getState();
    if (!state.isGameActive || isProcessingClick) return;

    const stage = game.getCurrentStage();
    const { lat, lng } = e.latlng;

    const inBounds =
      lat >= stage.bounds.minLat &&
      lat <= stage.bounds.maxLat &&
      lng >= stage.bounds.minLng &&
      lng <= stage.bounds.maxLng;

    if (!inBounds) {
      playErrorSound();
      const remLives = game.penalizeInvalidPlacement();
      updateHUD(game.getState());
      setFeedback("❄️ <strong>Outside Box:</strong> Click inside the pink dashed box!", "bad");
      showBanner("⚠️ Click inside the pink box! <strong>-1 Life</strong>", "error");
      if (remLives === 0) triggerGameOver(false);
      return;
    }

    if (stage.waterZone) {
      const distToLake = turf.distance(
        turf.point([lng, lat]),
        turf.point([stage.waterZone.lng, stage.waterZone.lat]),
        { units: "meters" }
      );
      if (distToLake <= stage.waterZone.radius) {
        playErrorSound();
        const remLives = game.penalizeInvalidPlacement();
        updateHUD(game.getState());
        setFeedback("❄️ <strong>Water!</strong> Tripods need dry ground. Click on the east ridge.", "bad");
        showBanner("🌊 Water! Click on dry ground. <strong>-1 Life</strong>", "error");
        if (remLives === 0) triggerGameOver(false);
        return;
      }
    }

    isProcessingClick = true;
    playDeploySound();
    showBanner("📡 Measuring targets...");

    const deployInfo = game.registerStationDeployment();
    updateHUD(game.getState());

    stationLayer.clearLayers();
    sightLinesLayer.clearLayers();

    lastStationCoords = [lat, lng];

    const stationIcon = L.divIcon({
      className: "",
      html: TOTAL_STATION_MARKER_HTML,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    L.marker([lat, lng], { icon: stationIcon }).addTo(stationLayer);

    const SAMPLES = 12;
    const allSamplePoints = [{ lat, lng }];

    stage.targets.forEach((t) => {
      for (let i = 1; i <= SAMPLES; i++) {
        const frac = i / SAMPLES;
        allSamplePoints.push({
          lat: lat + (t.lat - lat) * frac,
          lng: lng + (t.lng - lng) * frac
        });
      }
    });

    const elevations = await fetchElevationProfile(allSamplePoints);
    const groundHeight = elevations[0];
    lastStationHeight = groundHeight;
    const stationElev = groundHeight + 2.0;

    stationElevEl.textContent = `${groundHeight.toFixed(1)} m`;
    stationCountEl.textContent = String(deployInfo.deployCount);

    currentProfiles = [];
    const visibleIds = [];
    const blockedDetails = [];
    const farDetails = [];
    let highestObstacle = 0;
    let firstProblemIndex = 0;
    let foundProblem = false;

    const statusMap = {};

    stage.targets.forEach((t, tIdx) => {
      const startIdx = 1 + tIdx * SAMPLES;
      const terrainElevs = [groundHeight, ...elevations.slice(startIdx, startIdx + SAMPLES)];
      const targetGroundElev = targetElevations[t.id] || terrainElevs[terrainElevs.length - 1];
      terrainElevs[terrainElevs.length - 1] = targetGroundElev;

      const distanceMeters = Math.round(
        turf.distance(turf.point([lng, lat]), turf.point([t.lng, t.lat]), { units: "meters" })
      );

      const losElevs = terrainElevs.map((_, i) => {
        const frac = i / SAMPLES;
        return Math.round((stationElev + (targetGroundElev + 1.8 - stationElev) * frac) * 10) / 10;
      });

      let isBlocked = false;
      let maxRidgeOnLine = 0;
      let minClearance = Infinity;
      let blockingSampleIndex = -1;

      for (let i = 1; i < SAMPLES; i++) {
        const clearance = losElevs[i] - terrainElevs[i];
        if (clearance < minClearance) {
          minClearance = clearance;
        }
        if (terrainElevs[i] > losElevs[i]) {
          isBlocked = true;
          if (terrainElevs[i] > maxRidgeOnLine) {
            maxRidgeOnLine = terrainElevs[i];
            blockingSampleIndex = i;
          }
        }
      }

      if (maxRidgeOnLine > highestObstacle) highestObstacle = maxRidgeOnLine;

      const outOfRange = distanceMeters > stage.maxRange;
      let lineColor = "#10b981";
      let status = "visible";
      const dir = getCardinalDirection(lat, lng, t.lat, t.lng);

      if (outOfRange) {
        lineColor = "#fbbf24";
        status = "out_of_range";
        farDetails.push({ id: t.id, dist: distanceMeters, dir });
        if (!foundProblem) {
          firstProblemIndex = tIdx;
          foundProblem = true;
        }
      } else if (isBlocked) {
        lineColor = "#f43f5e";
        status = "blocked";
        blockedDetails.push({ id: t.id, ridgeHeight: Math.round(maxRidgeOnLine), dir });
        if (!foundProblem) {
          firstProblemIndex = tIdx;
          foundProblem = true;
        }
      } else {
        visibleIds.push(t.id);
      }

      statusMap[t.id] = status;

      L.polyline(
        [
          [lat, lng],
          [t.lat, t.lng]
        ],
        {
          color: lineColor,
          weight: 3,
          dashArray: "8, 6",
          className: "laser-line-anim"
        }
      ).addTo(sightLinesLayer);

      currentProfiles.push({
        target: t,
        stationGround: groundHeight,
        targetGround: targetGroundElev,
        distanceMeters,
        terrainElevs,
        losElevs,
        status,
        dir,
        minClearance: Math.round(minClearance * 10) / 10,
        maxRidgeOnLine: Math.round(maxRidgeOnLine),
        blockingSampleIndex
      });
    });

    const result = game.recordVisibleTargets(visibleIds);
    updateHUD(game.getState());
    renderTargetMarkersAndList(stage, result.readSet, statusMap, firstProblemIndex);

    buildSimpleCoaching(groundHeight, visibleIds, blockedDetails, farDetails, highestObstacle, result);

    profileSelector.disabled = false;
    profileSelector.value = String(firstProblemIndex);
    drawProfileChart(currentProfiles[firstProblemIndex]);

    if (result.stageCompleted) {
      playStageCompleteSound();

      const triangleCoords = stage.targets.map((t) => [t.lat, t.lng]);
      L.polygon(triangleCoords, {
        color: "#10b981",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.16
      }).addTo(sightLinesLayer);

      if (lastStationCoords) {
        map.flyTo(lastStationCoords, stage.zoom + 1, { duration: 1.1 });
      }

      const bonusMsg = result.singleStationBonus
        ? ` 🏆 <strong>1-Shot Bonus (+${result.singleStationBonus})!</strong>`
        : "";
      showBanner(`🎉 All 3 targets done!${bonusMsg}`, "success");
      btnNextStage.classList.remove("hidden");

      setTimeout(() => {
        openCinematicSurveyModal(stage, result.singleStationBonus);
      }, 1150);
    } else {
      if (result.newlyReadCount > 0) playTargetSuccessSound();
      const penaltyTxt = deployInfo.timePenalty ? ` (-${deployInfo.timePenalty}s)` : "";
      showBanner(`📡 ${result.readSet.size}/3 done${penaltyTxt}. Check the Coach box on the left!`);
    }

    isProcessingClick = false;
  });

  function buildSimpleCoaching(height, visibleIds, blockedDetails, farDetails, highestObstacle, result) {
    if (result.stageCompleted) {
      setFeedback(`🔥 <strong>Bullseye (${Math.round(height)} m)!</strong> All 3 targets measured!`, "good");
      return;
    }

    if (farDetails.length > 0) {
      const f = farDetails[0];
      setFeedback(
        `⚠️ <strong>Too far from ${f.id}!</strong> Move <strong>${f.dir}</strong> toward the center.`,
        "warn"
      );
      return;
    }

    const recommendedHeight = Math.round(highestObstacle + 8);
    const dirHint = blockedDetails.length > 0 ? blockedDetails[0].dir : "center";

    if (visibleIds.length === 2) {
      setFeedback(
        `🔥 <strong>VERY HOT (2/3)!</strong> Almost there! Click a slightly higher spot (<strong>>${recommendedHeight} m</strong>) toward <strong>${dirHint}</strong>.`,
        "good"
      );
    } else if (visibleIds.length === 1) {
      setFeedback(
        `🌤️ <strong>WARM (1/3)!</strong> A hill blocks the rest. Pick higher ground (<strong>>${recommendedHeight} m</strong>) to the <strong>${dirHint}</strong>.`,
        "warn"
      );
    } else {
      setFeedback(
        `❄️ <strong>COLD (0/3)!</strong> Too low—hills block your laser. Click a higher hill (<strong>>${recommendedHeight} m</strong>) to the <strong>${dirHint}</strong>.`,
        "bad"
      );
    }
  }

  function drawProfileChart(profile) {
    if (!profile || !elevationChart) return;

    const labels = profile.terrainElevs.map((_, i) => {
      if (i === 0) return "Station";
      if (i === profile.terrainElevs.length - 1) return profile.target.id;
      if (i === profile.blockingSampleIndex) return "⚠️ Ridge";
      return `${Math.round((profile.distanceMeters * i) / 12)}m`;
    });

    const terrainPointRadii = profile.terrainElevs.map((_, i) =>
      i === profile.blockingSampleIndex ? 6 : 2
    );
    const terrainPointColors = profile.terrainElevs.map((_, i) =>
      i === profile.blockingSampleIndex ? "#f43f5e" : "#f472b6"
    );

    elevationChart.data.labels = labels;
    elevationChart.data.datasets[0].data = profile.terrainElevs;
    elevationChart.data.datasets[0].pointRadius = terrainPointRadii;
    elevationChart.data.datasets[0].pointBackgroundColor = terrainPointColors;

    elevationChart.data.datasets[1].data = profile.losElevs;
    elevationChart.data.datasets[1].borderColor =
      profile.status === "visible" ? "#10b981" : "#f43f5e";

    elevationChart.update();

    if (profile.status === "visible") {
      chartGuidanceStrip.className = "chart-guidance-strip clear";
      chartGuidanceStrip.innerHTML = `✅ <strong>${profile.target.id} Locked!</strong> Your laser clears the terrain by <strong>+${Math.max(1, profile.minClearance)} m</strong>.`;
      metricClearanceEl.textContent = `Clearance: +${Math.max(1, profile.minClearance)} m`;
      metricReqElevEl.textContent = `Station Z: ${Math.round(profile.stationGround)} m`;
      losStatusText.innerHTML = `✅ Clear Line-of-Sight to <strong>${profile.target.name}</strong> (${profile.distanceMeters} m).`;
      losStatusText.style.color = "#10b981";
    } else if (profile.status === "out_of_range") {
      chartGuidanceStrip.className = "chart-guidance-strip blocked";
      chartGuidanceStrip.innerHTML = `⚠️ <strong>Next Move:</strong> Step <strong>${profile.dir}</strong> to bring <strong>${profile.target.id}</strong> inside optical range.`;
      metricClearanceEl.textContent = `Dist: ${profile.distanceMeters} m`;
      metricReqElevEl.textContent = `Move: ${profile.dir}`;
      losStatusText.innerHTML = `⚠️ Target is too far (${profile.distanceMeters} m). Move closer toward ${profile.dir}.`;
      losStatusText.style.color = "#fbbf24";
    } else {
      const neededZ = profile.maxRidgeOnLine + 8;
      chartGuidanceStrip.className = "chart-guidance-strip blocked";
      chartGuidanceStrip.innerHTML = `🎯 <strong>Next Pick:</strong> Move <strong>${profile.dir}</strong> onto a hill with Cursor <strong>> ${neededZ} m</strong> to shoot over the ${profile.maxRidgeOnLine} m ridge.`;
      metricClearanceEl.textContent = `Blocked: ${profile.minClearance} m`;
      metricReqElevEl.textContent = `Need Hill: >${neededZ} m`;
      losStatusText.innerHTML = `❌ A <strong>${profile.maxRidgeOnLine} m</strong> hill blocks the dashed laser ray to ${profile.target.id}.`;
      losStatusText.style.color = "#f43f5e";
    }
  }

  profileSelector.addEventListener("change", (e) => {
    const idx = Number(e.target.value);
    if (currentProfiles[idx]) {
      drawProfileChart(currentProfiles[idx]);
      highlightActiveTargetRow(idx);
    }
  });

  // =========================================================================
  // DUAL CINEMATIC VISUALIZATION + SHUFFLED REGION TOPOGRAPHY QUIZ
  // =========================================================================
  const btnContinueNext = document.getElementById("btn-continue-next");

  function openCinematicSurveyModal(stage, singleBonus) {
    game.pauseTimer();

    document.getElementById("cinematic-title").textContent = `${stage.name} — Mapped!`;
    document.getElementById("cinematic-subtitle").textContent =
      `Left: Laser lock on 3 targets. Right: 3D side-view elevation relief of ${stage.cityLabel.split("•")[0].trim()}:`;

    const summaryEl = document.getElementById("cinematic-summary");
    summaryEl.innerHTML =
      stage.targets
        .map((t) => `<span>${t.icon} <strong>${t.id}:</strong> ${targetElevations[t.id]} m</span>`)
        .join("") +
      (singleBonus ? `<span style="color:#34d399;font-weight:700;">🏆 +${singleBonus} Bonus</span>` : "");

    setupStageQuiz(stage);

    stageCompleteModal.classList.remove("hidden");
    startSurveyCanvasAnimation(stage);
  }

  function setupStageQuiz(stage) {
    const qObj = stage.quiz;
    const questionEl = document.getElementById("stage-quiz-question");
    const optionsEl = document.getElementById("stage-quiz-options");
    const feedbackEl = document.getElementById("stage-quiz-feedback");

    questionEl.textContent = qObj.question;
    optionsEl.innerHTML = "";
    feedbackEl.classList.add("hidden");
    feedbackEl.className = "quiz-feedback hidden";

    btnContinueNext.disabled = true;
    btnContinueNext.textContent = "Select an Answer Above to Continue ➔";

    const indexedOptions = qObj.options.map((text, idx) => ({
      text,
      isCorrect: idx === qObj.correctIndex
    }));
    for (let i = indexedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }

    indexedOptions.forEach((optItem, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option-btn";
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${optItem.text}`;

      btn.addEventListener("click", () => {
        const allBtns = optionsEl.querySelectorAll("button");
        allBtns.forEach((b, bIdx) => {
          b.disabled = true;
          if (indexedOptions[bIdx].isCorrect) b.classList.add("correct-ans");
        });

        if (optItem.isCorrect) {
          playTargetSuccessSound();
          game.addBonusScore(100);
          updateHUD(game.getState());
          feedbackEl.innerHTML = `✅ <strong>Correct (+100 pts)!</strong> ${qObj.explanation}`;
          feedbackEl.className = "quiz-feedback ok";
        } else {
          btn.classList.add("wrong-ans");
          playTone(300, 0.14, "sine", 0, 0.08);
          feedbackEl.innerHTML = `💡 <strong>Region Fact:</strong> ${qObj.explanation}`;
          feedbackEl.className = "quiz-feedback info";
        }

        feedbackEl.classList.remove("hidden");
        btnContinueNext.disabled = false;
        btnContinueNext.textContent = "Continue to Next Region (+20s) ➔";
      });

      optionsEl.appendChild(btn);
    });
  }

  function getHypsometricColor(normZ, alpha = 0.9) {
    const t = Math.max(0, Math.min(1, normZ));
    let r, g, b;
    if (t < 0.35) {
      const k = t / 0.35;
      r = Math.round(56 + (16 - 56) * k);
      g = Math.round(189 + (185 - 189) * k);
      b = Math.round(248 + (129 - 248) * k);
    } else if (t < 0.72) {
      const k = (t - 0.35) / 0.37;
      r = Math.round(16 + (250 - 16) * k);
      g = Math.round(185 + (204 - 185) * k);
      b = Math.round(129 + (21 - 129) * k);
    } else {
      const k = (t - 0.72) / 0.28;
      r = Math.round(250 + (244 - 250) * k);
      g = Math.round(204 + (114 - 204) * k);
      b = Math.round(21 + (182 - 21) * k);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getRegionReliefHeight(reliefType, nx, nz, phase) {
    const gentleWave = Math.sin((nx + phase) * 3) * 2.5;
    switch (reliefType) {
      case "cappadocia": {
        const valley = -12 * Math.exp(-((nx + 0.1) ** 2) * 5);
        const spire1 = 28 * Math.exp(-((nx - 0.45) ** 2 + (nz + 0.2) ** 2) * 18);
        const spire2 = 24 * Math.exp(-((nx + 0.55) ** 2 + (nz - 0.25) ** 2) * 16);
        const plateau = 18 * Math.exp(-((nx - 0.1) ** 2 + (nz + 0.45) ** 2) * 4);
        return 18 + valley + spire1 + spire2 + plateau + gentleWave;
      }
      case "saltlake": {
        const flatSalt = 6;
        const steppeHill = 22 * Math.exp(-((nx - 0.35) ** 2 + (nz + 0.3) ** 2) * 2.6);
        const lowMound = 14 * Math.exp(-((nx + 0.45) ** 2 + (nz + 0.2) ** 2) * 3.0);
        return flatSalt + steppeHill + lowMound + Math.sin(nx * 4) * 1.5;
      }
      case "uludag": {
        const mainPeak = 44 * Math.exp(-((nx - 0.05) ** 2 + (nz + 0.1) ** 2) * 2.4);
        const eastShoulder = 26 * Math.exp(-((nx - 0.58) ** 2 + (nz - 0.15) ** 2) * 4.2);
        const westRidge = 22 * Math.exp(-((nx + 0.55) ** 2 + (nz + 0.2) ** 2) * 4.0);
        return 8 + mainPeak + eastShoulder + westRidge + gentleWave;
      }
      case "pamukkale": {
        const slope = (nx + 1) * 14;
        const steps = Math.floor((nx + 1) * 4.5) * 3.8;
        const ridgeDepth = 8 * Math.exp(-(nz ** 2) * 2.5);
        return 6 + slope * 0.45 + steps + ridgeDepth;
      }
      case "ayder": {
        const vValley = Math.abs(nx) * 36;
        const alpinePeak = 14 * Math.exp(-((nz + 0.3) ** 2) * 2.5);
        return 5 + vValley + alpinePeak + Math.sin(nz * 6) * 2.5;
      }
      case "nemrut":
      default: {
        const distFromCrater = Math.sqrt((nx + 0.12) ** 2 + nz ** 2);
        const rimRing = 36 * Math.exp(-((distFromCrater - 0.58) ** 2) * 14);
        const calderaFloor = distFromCrater < 0.42 ? 5 : 12;
        return calderaFloor + rimRing;
      }
    }
  }

  function startSurveyCanvasAnimation(stage) {
    if (cinematicAnimId) cancelAnimationFrame(cinematicAnimId);
    const canvas = document.getElementById("surveyCinematicCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;

    const reflectors = [
      { id: "M1", icon: stage.targets[0].icon, elev: targetElevations["M1"] || 1210, x: 195, y: 56 },
      { id: "M2", icon: stage.targets[1].icon, elev: targetElevations["M2"] || 1195, x: 222, y: 126 },
      { id: "M3", icon: stage.targets[2].icon, elev: targetElevations["M3"] || 1205, x: 188, y: 192 }
    ];
    const station = { x: 42, y: 130 };

    const h0 = lastStationHeight || 1200;
    const h1 = targetElevations["M1"] || 1210;
    const h2 = targetElevations["M2"] || 1190;
    const h3 = targetElevations["M3"] || 1205;
    const minH = Math.min(h0, h1, h2, h3) - 15;
    const maxH = Math.max(h0, h1, h2, h3) + 15;

    function render() {
      frame += 1;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(236, 72, 153, 0.08)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(252, 12);
      ctx.lineTo(252, h - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText("1. LASER PRISM LOCK", 12, 18);

      ctx.fillStyle = "rgba(16, 185, 129, 0.16)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(reflectors[0].x, reflectors[0].y);
      ctx.lineTo(reflectors[1].x, reflectors[1].y);
      ctx.lineTo(reflectors[2].x, reflectors[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      reflectors.forEach((ref, idx) => {
        const progress = Math.min(1, Math.max(0, (frame - idx * 10) / 22));
        const curX = station.x + (ref.x - station.x) * progress;
        const curY = station.y + (ref.y - station.y) * progress;

        ctx.save();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -frame * 1.4;
        ctx.beginPath();
        ctx.moveTo(station.x, station.y - 6);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.restore();

        const pulseT = (frame * 0.035 + idx * 0.33) % 1;
        ctx.fillStyle = "#a7f3d0";
        ctx.beginPath();
        ctx.arc(
          station.x + (ref.x - station.x) * pulseT,
          station.y - 6 + (ref.y - (station.y - 6)) * pulseT,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#d8b4e2";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ref.x, ref.y + 4);
        ctx.lineTo(ref.x - 6, ref.y + 18);
        ctx.moveTo(ref.x, ref.y + 4);
        ctx.lineTo(ref.x + 6, ref.y + 18);
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(ref.x, ref.y - 7);
        ctx.lineTo(ref.x + 7, ref.y);
        ctx.lineTo(ref.x, ref.y + 7);
        ctx.lineTo(ref.x - 7, ref.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fdf2f8";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText(`${ref.id}: ${ref.elev}m`, ref.x - 28, ref.y - 11);
      });

      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(station.x, station.y + 5);
      ctx.lineTo(station.x - 13, station.y + 34);
      ctx.moveTo(station.x, station.y + 5);
      ctx.lineTo(station.x + 13, station.y + 34);
      ctx.moveTo(station.x, station.y + 5);
      ctx.lineTo(station.x, station.y + 36);
      ctx.stroke();

      ctx.fillStyle = "#ec4899";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(station.x - 11, station.y - 14, 22, 17, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(station.x + 4, station.y - 5, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText(`STN ${Math.round(lastStationHeight)}m`, station.x - 28, station.y + 49);

      // RIGHT PANEL: 3D Side-View Relief Block Model of the City/Region
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText(`2. ${stage.cityLabel}`, 264, 18);

      const originX = 274;
      const baseY = 205;
      const widthX = 185;
      const depthShiftX = 46;
      const depthShiftY = -44;
      const cols = 22;
      const rows = 12;
      const sway = Math.sin(frame * 0.025) * 0.06;

      function projectSide3D(colIdx, rowIdx) {
        const u = colIdx / cols;
        const v = rowIdx / rows;
        const nx = u * 2 - 1;
        const nz = v * 2 - 1;
        const elev = getRegionReliefHeight(stage.reliefType, nx, nz, sway);

        const sx = originX + u * widthX + v * depthShiftX;
        const sy = baseY + v * depthShiftY - elev;
        return { sx, sy, elev, u, v };
      }

      const grid = [];
      for (let r = 0; r <= rows; r++) {
        grid[r] = [];
        for (let c = 0; c <= cols; c++) {
          grid[r][c] = projectSide3D(c, r);
        }
      }

      for (let r = rows - 1; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
          const p00 = grid[r][c];
          const p10 = grid[r][c + 1];
          const p11 = grid[r + 1][c + 1];
          const p01 = grid[r + 1][c];

          const avgElev = (p00.elev + p10.elev + p11.elev + p01.elev) / 4;
          const normZ = (avgElev - 4) / 42;

          ctx.fillStyle = getHypsometricColor(normZ, 0.42);
          ctx.strokeStyle = getHypsometricColor(normZ, 0.85);
          ctx.lineWidth = 0.75;

          ctx.beginPath();
          ctx.moveTo(p00.sx, p00.sy);
          ctx.lineTo(p10.sx, p10.sy);
          ctx.lineTo(p11.sx, p11.sy);
          ctx.lineTo(p01.sx, p01.sy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.moveTo(originX, baseY + 12);
      for (let c = 0; c <= cols; c++) {
        ctx.lineTo(grid[0][c].sx, grid[0][c].sy);
      }
      ctx.lineTo(originX + widthX, baseY + 12);
      ctx.closePath();
      const wallGrad = ctx.createLinearGradient(0, baseY - 45, 0, baseY + 12);
      wallGrad.addColorStop(0, "rgba(236, 72, 153, 0.65)");
      wallGrad.addColorStop(1, "rgba(27, 16, 34, 0.95)");
      ctx.fillStyle = wallGrad;
      ctx.fill();
      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(originX + widthX, baseY + 12);
      for (let r = 0; r <= rows; r++) {
        ctx.lineTo(grid[r][cols].sx, grid[r][cols].sy);
      }
      ctx.lineTo(originX + widthX + depthShiftX, baseY + depthShiftY + 12);
      ctx.closePath();
      ctx.fillStyle = "rgba(40, 23, 51, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 114, 182, 0.6)";
      ctx.stroke();

      if (stage.reliefType === "nemrut") {
        const lakeCenter = grid[Math.floor(rows * 0.5)][Math.floor(cols * 0.44)];
        ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
        ctx.beginPath();
        ctx.ellipse(lakeCenter.sx, lakeCenter.sy + 2, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const pins = [
        { label: `STN ${Math.round(h0)}m`, pt: grid[Math.floor(rows * 0.55)][Math.floor(cols * 0.5)], color: "#fde047" },
        { label: `M1`, pt: grid[Math.floor(rows * 0.75)][Math.floor(cols * 0.75)], color: "#34d399" },
        { label: `M2`, pt: grid[Math.floor(rows * 0.35)][Math.floor(cols * 0.25)], color: "#38bdf8" }
      ];

      pins.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pt.sx, p.pt.sy, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#130b18";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#fdf2f8";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.fillText(p.label, p.pt.sx - 12, p.pt.sy - 7);
      });

      const barX = 516;
      const barY = 42;
      const barH = 148;
      const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      grad.addColorStop(0, "#f472b6");
      grad.addColorStop(0.35, "#facc15");
      grad.addColorStop(0.7, "#10b981");
      grad.addColorStop(1, "#38bdf8");
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, 7, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.strokeRect(barX, barY, 7, barH);

      ctx.fillStyle = "#d8b4e2";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.fillText(`${Math.round(maxH)}m`, barX - 15, barY - 5);
      ctx.fillText(`${Math.round(minH)}m`, barX - 15, barY + barH + 11);

      cinematicAnimId = requestAnimationFrame(render);
    }

    render();
  }

  // =========================================================================
  // FULL 3D ELEVATION RELIEF MAP OF TURKEY (ON VICTORY SCREEN)
  // =========================================================================
  function startTurkey3DReliefAnimation() {
    if (turkeyReliefAnimId) cancelAnimationFrame(turkeyReliefAnimId);
    const canvas = document.getElementById("turkeyReliefCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;

    const turkeyOutline = [
      [0.03, 0.88], [0.09, 0.92], [0.16, 0.86], [0.22, 0.85], [0.33, 0.87],
      [0.45, 0.90], [0.56, 0.84], [0.68, 0.82], [0.80, 0.86], [0.92, 0.88],
      [0.97, 0.78], [0.96, 0.56], [0.95, 0.36], [0.86, 0.32], [0.72, 0.30],
      [0.58, 0.28], [0.47, 0.14], [0.42, 0.24], [0.30, 0.26], [0.21, 0.18],
      [0.12, 0.22], [0.05, 0.34], [0.04, 0.56], [0.06, 0.72]
    ];

    function isInsideTurkey(u, v) {
      let inside = false;
      for (let i = 0, j = turkeyOutline.length - 1; i < turkeyOutline.length; j = i++) {
        const xi = turkeyOutline[i][0], yi = turkeyOutline[i][1];
        const xj = turkeyOutline[j][0], yj = turkeyOutline[j][1];
        const intersect = ((yi > v) !== (yj > v)) && (u < ((xj - xi) * (v - yi)) / (yj - yi + 1e-6) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    function getTurkeyReliefZ(u, v) {
      const eastRise = u * 16;
      const ponticMountains = 11 * Math.exp(-((v - 0.80) ** 2) * 55) * Math.min(1, u * 1.4);
      const taurusMountains = 10 * Math.exp(-((v - 0.27) ** 2) * 50) * Math.min(1, u * 1.5);
      const kackarPeak = 13 * Math.exp(-((u - 0.82) ** 2 * 35 + (v - 0.81) ** 2 * 45));
      const araratAndNemrut = 15 * Math.exp(-((u - 0.90) ** 2 * 30 + (v - 0.56) ** 2 * 35));
      const uludagPeak = 8 * Math.exp(-((u - 0.18) ** 2 * 65 + (v - 0.72) ** 2 * 65));
      const saltLakeDip = -5 * Math.exp(-((u - 0.43) ** 2 * 55 + (v - 0.54) ** 2 * 55));
      return Math.max(2, 3 + eastRise + ponticMountains + taurusMountains + kackarPeak + araratAndNemrut + uludagPeak + saltLakeDip);
    }

    const surveyedCities = [
      { id: "1", name: "Nevsehir", u: 0.49, v: 0.50 },
      { id: "2", name: "Aksaray", u: 0.44, v: 0.48 },
      { id: "3", name: "Bursa", u: 0.18, v: 0.72 },
      { id: "4", name: "Denizli", u: 0.18, v: 0.34 },
      { id: "5", name: "Rize", u: 0.82, v: 0.82 },
      { id: "6", name: "Bitlis", u: 0.88, v: 0.49 }
    ];

    function projectTurkey(u, v, z) {
      const tilt = Math.sin(frame * 0.025) * 4;
      const sx = 22 + u * 255 + v * 28 + tilt;
      const sy = 148 - v * 92 - z;
      return { sx, sy };
    }

    function renderTurkey() {
      frame += 1;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;
      for (let y = 25; y < h; y += 22) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }

      const cols = 38;
      const rows = 18;
      for (let r = rows; r >= 0; r--) {
        const v = r / rows;
        ctx.beginPath();
        let started = false;
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          if (isInsideTurkey(u, v)) {
            const z = getTurkeyReliefZ(u, v);
            const pt = projectTurkey(u, v, z);
            if (!started) {
              ctx.moveTo(pt.sx, pt.sy);
              started = true;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          } else {
            started = false;
          }
        }
        const norm = v * 0.4 + 0.35;
        ctx.strokeStyle = getHypsometricColor(norm, 0.82);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      for (let c = 1; c < cols; c += 2) {
        const u = c / cols;
        ctx.beginPath();
        let started = false;
        for (let r = 0; r <= rows; r++) {
          const v = r / rows;
          if (isInsideTurkey(u, v)) {
            const z = getTurkeyReliefZ(u, v);
            const pt = projectTurkey(u, v, z);
            if (!started) {
              ctx.moveTo(pt.sx, pt.sy);
              started = true;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = getHypsometricColor(u, 0.42);
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      surveyedCities.forEach((city, idx) => {
        const z = getTurkeyReliefZ(city.u, city.v);
        const topPt = projectTurkey(city.u, city.v, z + 5);
        const basePt = projectTurkey(city.u, city.v, z);

        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(basePt.sx, basePt.sy);
        ctx.lineTo(topPt.sx, topPt.sy);
        ctx.stroke();

        const pulse = 2.6 + Math.sin(frame * 0.1 + idx) * 0.9;
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#fdf2f8";
        ctx.font = "bold 8px JetBrains Mono, monospace";
        ctx.fillText(city.name, topPt.sx - 14, topPt.sy - 5);
      });

      turkeyReliefAnimId = requestAnimationFrame(renderTurkey);
    }

    renderTurkey();
  }

  btnContinueNext.addEventListener("click", () => {
    if (cinematicAnimId) cancelAnimationFrame(cinematicAnimId);
    stageCompleteModal.classList.add("hidden");
    const res = game.advanceToNextStage();
    updateHUD(game.getState());
    if (res.gameFinished) {
      triggerGameOver(true, res.timeBonus);
    } else {
      loadStage(game.getCurrentStage(), true);
    }
  });

  const btnTopo = document.getElementById("btn-layer-topo");
  const btnSat = document.getElementById("btn-layer-sat");

  btnTopo.addEventListener("click", () => {
    if (!map.hasLayer(topoLayer)) {
      map.removeLayer(satLayer);
      map.addLayer(topoLayer);
      btnTopo.classList.add("active");
      btnSat.classList.remove("active");
    }
  });

  btnSat.addEventListener("click", () => {
    if (!map.hasLayer(satLayer)) {
      map.removeLayer(topoLayer);
      map.addLayer(satLayer);
      btnSat.classList.add("active");
      btnTopo.classList.remove("active");
    }
  });

  document.getElementById("btn-start-game").addEventListener("click", () => {
    ensureAudio();
    startModal.classList.add("hidden");
    startSession();
  });

  btnRetryStage.addEventListener("click", () => {
    if (turkeyReliefAnimId) cancelAnimationFrame(turkeyReliefAnimId);
    gameoverModal.classList.add("hidden");
    game.retryCurrentStage(
      (state) => updateHUD(state),
      () => triggerGameOver(false, 0)
    );
    updateHUD(game.getState());
    loadStage(game.getCurrentStage(), true);
  });

  document.getElementById("btn-restart-game").addEventListener("click", () => {
    if (turkeyReliefAnimId) cancelAnimationFrame(turkeyReliefAnimId);
    gameoverModal.classList.add("hidden");
    startSession();
  });

  btnNextStage.addEventListener("click", () => {
    openCinematicSurveyModal(game.getCurrentStage(), 0);
  });

  function startSession() {
    game.startNewGame(
      (state) => updateHUD(state),
      () => triggerGameOver(false, 0)
    );
    updateHUD(game.getState());
    loadStage(game.getCurrentStage(), true);
  }

  function triggerGameOver(isVictory, timeBonus = 0) {
    if (cinematicAnimId) cancelAnimationFrame(cinematicAnimId);
    if (turkeyReliefAnimId) cancelAnimationFrame(turkeyReliefAnimId);
    stageCompleteModal.classList.add("hidden");

    const finalState = game.getState();
    const engineerStageEl = document.getElementById("victory-engineer-stage");
    const inviteNoteEl = document.getElementById("victory-invite-note");

    if (isVictory) {
      document.getElementById("gameover-badge").textContent = "ALL 6 REGIONS COMPLETE • MASTER SURVEYOR";
      document.getElementById("gameover-title").textContent = "You are an amazing surveyor! 🎉";
      engineerStageEl.classList.remove("hidden");
      inviteNoteEl.classList.remove("hidden");
      btnRetryStage.classList.add("hidden");
      startTurkey3DReliefAnimation();
    } else {
      document.getElementById("gameover-badge").textContent = `STOPPED AT STAGE ${finalState.stageNumber} / ${finalState.totalStages}`;
      document.getElementById("gameover-title").textContent = "Out of Time or Lives!";
      engineerStageEl.classList.add("hidden");
      inviteNoteEl.classList.add("hidden");
      btnRetryStage.classList.remove("hidden");
    }

    document.getElementById("final-score").textContent = finalState.score;
    document.getElementById("final-highscore").textContent = finalState.highScore;
    document.getElementById("final-targets").textContent = `${finalState.totalTargetsRead} / ${GAME_STAGES.length * 3}`;
    document.getElementById("final-time-bonus").textContent = `+${timeBonus}`;

    gameoverModal.classList.remove("hidden");
  }
});