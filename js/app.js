/**
 * js/app.js
 * Leaflet map, Stage Briefing with verified Region Photos, Web Audio SFX,
 * Dual Cinematic Animation (Laser Prisms + Rotating 3D Elevation Mesh),
 * and Hard-Hat Engineer Victory Screen
 */

document.addEventListener("DOMContentLoaded", () => {
  const game = createGameEngine(GAME_STAGES);

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

  function initChart() {
    const ctx = document.getElementById("elevationChart").getContext("2d");
    elevationChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Hill / Ground",
            data: [],
            borderColor: "#f472b6",
            backgroundColor: "rgba(236, 72, 153, 0.25)",
            fill: true,
            tension: 0.35,
            pointRadius: 0
          },
          {
            label: "Laser Sight",
            data: [],
            borderColor: "#10b981",
            borderDash: [5, 5],
            borderWidth: 2.5,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#fdf2f8", font: { size: 11 }, boxWidth: 14 } }
        },
        scales: {
          x: {
            ticks: { color: "#d8b4e2", font: { size: 10 }, maxTicksLimit: 4 },
            grid: { display: false }
          },
          y: {
            ticks: { color: "#d8b4e2", font: { size: 10 }, maxTicksLimit: 4 },
            grid: { color: "rgba(70, 39, 89, 0.5)" }
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

  const FALLBACK_LANDSCAPE_SVG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b1d54"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="800" height="300" fill="url(#sky)"/>
        <polygon points="0,300 180,110 380,300" fill="#281733"/>
        <polygon points="240,300 480,85 740,300" fill="#1b1022"/>
        <polygon points="520,300 690,140 800,240 800,300" fill="#321942"/>
      </svg>`
    );

  function openStageBriefing(stage) {
    game.pauseTimer();

    const state = game.getState();
    const photoEl = document.getElementById("briefing-photo");
    photoEl.onerror = () => {
      photoEl.src = FALLBACK_LANDSCAPE_SVG;
    };
    photoEl.src = stage.photo;

    document.getElementById("briefing-badge").textContent = `STAGE ${state.stageNumber} / ${state.totalStages} • ${stage.difficulty.toUpperCase()}`;
    document.getElementById("briefing-title").textContent = stage.name;
    document.getElementById("briefing-desc").textContent = stage.briefingIntro;
    document.getElementById("briefing-strategy").textContent = stage.strategyTip;

    const listEl = document.getElementById("briefing-targets-list");
    listEl.innerHTML = "";
    stage.targets.forEach((t) => {
      const li = document.createElement("li");
      li.innerHTML = `<span style="font-size:1.25rem;">${t.icon}</span> <strong>${t.id} – ${t.name} (${t.type}):</strong> ${t.desc}`;
      listEl.appendChild(li);
    });

    briefingModal.classList.remove("hidden");
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
    losStatusText.textContent = "Dashed line = Laser beam. If pink ground rises above it, a hill blocks your view.";
    losStatusText.style.color = "#d8b4e2";
    setFeedback(`💡 <strong>Strategy:</strong> ${stage.hint}`, "info");

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
      }).bindTooltip("💧 Crater Lake: Do Not Click Inside").addTo(boundaryLayer);
    }

    map.flyTo(stage.center, stage.zoom, { duration: 1.0 });
    showBanner(`💡 <strong>Tip:</strong> ${stage.hint}`);

    if (showBriefingPopup) {
      openStageBriefing(stage);
    }

    const elevations = await fetchElevationProfile(stage.targets);
    stage.targets.forEach((t, idx) => {
      targetElevations[t.id] = elevations[idx];
    });

    renderTargetMarkersAndList(stage, new Set(), {});
  }

  function renderTargetMarkersAndList(stage, readSet, statusMap) {
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
      marker.bindTooltip(`${t.icon} ${t.id} (${t.type}): ${t.name}${isRead ? ` • ${targetElevations[t.id]} m` : ""}`);

      const li = document.createElement("li");
      li.className = "target-item";
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
        }
      });

      targetListEl.appendChild(li);
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
  // EVENT HANDLER 1: Map Click to Place Total Station
  // =========================================================================
  map.on("click", async (e) => {
    const state = game.getState();
    if (!state.isGameActive || isProcessingClick) return;

    const stage = game.getCurrentStage();
    const { lat, lng } = e.latlng;

    // 1. Out of bounds check
    const inBounds =
      lat >= stage.bounds.minLat &&
      lat <= stage.bounds.maxLat &&
      lng >= stage.bounds.minLng &&
      lng <= stage.bounds.maxLng;

    if (!inBounds) {
      playErrorSound();
      const remLives = game.penalizeInvalidPlacement();
      updateHUD(game.getState());
      setFeedback("❄️ <strong>FREEZING (Outside Box):</strong> Click inside the pink dashed rectangle near M1–M3!", "bad");
      showBanner("⚠️ Stay inside the pink dashed box! <strong>-1 Life</strong>", "error");
      if (remLives === 0) triggerGameOver(false);
      return;
    }

    // 2. Water check
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
        setFeedback("❄️ <strong>COLD (Water Hazard):</strong> You cannot set up on water! Click on the dry ridge on the east side.", "bad");
        showBanner("🌊 Cannot place station in water! <strong>-1 Life</strong>", "error");
        if (remLives === 0) triggerGameOver(false);
        return;
      }
    }

    isProcessingClick = true;
    playDeploySound();
    showBanner("📡 Total Station locked! Firing laser beams...");

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
      for (let i = 1; i < SAMPLES; i++) {
        if (terrainElevs[i] > losElevs[i]) {
          isBlocked = true;
          if (terrainElevs[i] > maxRidgeOnLine) maxRidgeOnLine = terrainElevs[i];
        }
      }

      if (maxRidgeOnLine > highestObstacle) highestObstacle = maxRidgeOnLine;

      const outOfRange = distanceMeters > stage.maxRange;
      let lineColor = "#10b981";
      let status = "visible";

      if (outOfRange) {
        lineColor = "#fbbf24";
        status = "out_of_range";
        const dir = getCardinalDirection(lat, lng, t.lat, t.lng);
        farDetails.push({ id: t.id, dist: distanceMeters, dir });
      } else if (isBlocked) {
        lineColor = "#f43f5e";
        status = "blocked";
        const dir = getCardinalDirection(lat, lng, t.lat, t.lng);
        blockedDetails.push({ id: t.id, ridgeHeight: Math.round(maxRidgeOnLine), dir });
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
        distanceMeters,
        terrainElevs,
        losElevs,
        status,
        deltaH: (targetGroundElev - groundHeight).toFixed(1)
      });
    });

    const result = game.recordVisibleTargets(visibleIds);
    updateHUD(game.getState());
    renderTargetMarkersAndList(stage, result.readSet, statusMap);

    buildHotColdCoaching(groundHeight, visibleIds, blockedDetails, farDetails, highestObstacle, result);

    profileSelector.disabled = false;
    profileSelector.value = "0";
    drawProfileChart(currentProfiles[0]);

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
        ? ` 🏆 <strong>One-Setup Bonus (+${result.singleStationBonus} pts)!</strong>`
        : "";
      showBanner(`🎉 All 3 targets measured!${bonusMsg}`, "success");
      btnNextStage.classList.remove("hidden");

      setTimeout(() => {
        openCinematicSurveyModal(stage, result.singleStationBonus);
      }, 1150);
    } else {
      if (result.newlyReadCount > 0) playTargetSuccessSound();
      const penaltyTxt = deployInfo.timePenalty ? ` (-${deployInfo.timePenalty}s)` : "";
      showBanner(`📡 ${result.readSet.size}/3 done${penaltyTxt}. Check the Station Coach advice on the right!`);
    }

    isProcessingClick = false;
  });

  // =========================================================================
  // DUAL CINEMATIC VISUALIZATION:
  // LEFT: Total Station -> 3 Reflector Prisms | RIGHT: Rotating 3D DEM Mesh
  // =========================================================================
  function openCinematicSurveyModal(stage, singleBonus) {
    game.pauseTimer();

    document.getElementById("cinematic-title").textContent = `${stage.name} — 3D Model Ready!`;
    document.getElementById("cinematic-subtitle").textContent =
      `Left: Laser beams locked onto the 3 reflector prisms. Right: Generated 3D elevation surface mesh:`;

    const summaryEl = document.getElementById("cinematic-summary");
    summaryEl.innerHTML =
      stage.targets
        .map((t) => `<span>${t.icon} <strong>${t.id}:</strong> ${targetElevations[t.id]} m</span>`)
        .join("") +
      (singleBonus ? `<span style="color:#34d399;font-weight:700;">🏆 +${singleBonus} Bonus</span>` : "");

    stageCompleteModal.classList.remove("hidden");
    startSurveyCanvasAnimation(stage);
  }

  function startSurveyCanvasAnimation(stage) {
    if (cinematicAnimId) cancelAnimationFrame(cinematicAnimId);
    const canvas = document.getElementById("surveyCinematicCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;

    // Left half coordinates (Laser -> 3 Reflector Prisms)
    const reflectors = [
      { id: "M1", icon: stage.targets[0].icon, elev: targetElevations["M1"] || 1210, x: 205, y: 52 },
      { id: "M2", icon: stage.targets[1].icon, elev: targetElevations["M2"] || 1195, x: 232, y: 118 },
      { id: "M3", icon: stage.targets[2].icon, elev: targetElevations["M3"] || 1205, x: 198, y: 175 }
    ];
    const station = { x: 46, y: 120 };

    // Normalize relative heights for 3D surface peaks
    const h0 = lastStationHeight || 1200;
    const h1 = targetElevations["M1"] || 1210;
    const h2 = targetElevations["M2"] || 1190;
    const h3 = targetElevations["M3"] || 1205;
    const avgH = (h0 + h1 + h2 + h3) / 4;

    function render() {
      frame += 1;
      ctx.clearRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = "rgba(236, 72, 153, 0.12)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 25) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      // Vertical divider between Laser View (Left) & 3D Elevation Mesh (Right)
      ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(268, 12);
      ctx.lineTo(268, h - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      // ---------------------------------------------------------------------
      // LEFT PANEL: Total Station -> Reflector Prisms Laser Measurement
      // ---------------------------------------------------------------------
      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText("1. LASER PRISM LOCK", 14, 18);

      // Completed triangle area
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

        // Moving laser pulse
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

        // Prism tripod
        ctx.strokeStyle = "#d8b4e2";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ref.x, ref.y + 4);
        ctx.lineTo(ref.x - 6, ref.y + 18);
        ctx.moveTo(ref.x, ref.y + 4);
        ctx.lineTo(ref.x + 6, ref.y + 18);
        ctx.stroke();

        // Prism diamond
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

      // Total Station Tripod (Left)
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

      // ---------------------------------------------------------------------
      // RIGHT PANEL: Rotating 3D Elevation Surface Mesh (3D DEM Wireframe)
      // ---------------------------------------------------------------------
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText("2. 3D ELEVATION MODEL", 282, 18);

      const cx = 385;
      const cy = 136;
      const angle = frame * 0.022;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const gridN = 8;
      const scale = 15;

      function project3D(gx, gz) {
        // Synthetic 3D terrain surface shaped by measured station & target heights
        const nx = gx / gridN;
        const nz = gz / gridN;
        const hill1 = ((h1 - avgH) * 0.35 + 18) * Math.exp(-((nx - 0.5) ** 2 + (nz + 0.4) ** 2) * 3.2);
        const hill2 = ((h2 - avgH) * 0.35 + 14) * Math.exp(-((nx + 0.5) ** 2 + (nz - 0.3) ** 2) * 3.2);
        const stnPeak = ((h0 - avgH) * 0.4 + 22) * Math.exp(-(nx ** 2 + nz ** 2) * 2.5);
        const yElev = hill1 + hill2 + stnPeak + Math.sin(nx * 4) * 4;

        // Rotate around Y axis
        const rx = gx * cosA - gz * sinA;
        const rz = gx * sinA + gz * cosA;

        // Isometric projection
        const sx = cx + rx * scale;
        const sy = cy + rz * (scale * 0.52) - yElev;
        return { sx, sy, yElev };
      }

      const pts = [];
      for (let i = 0; i <= gridN; i++) {
        pts[i] = [];
        for (let j = 0; j <= gridN; j++) {
          const gx = i - gridN / 2;
          const gz = j - gridN / 2;
          pts[i][j] = project3D(gx, gz);
        }
      }

      // Draw 3D wireframe grid lines with elevation color gradient
      for (let i = 0; i < gridN; i++) {
        for (let j = 0; j < gridN; j++) {
          const p1 = pts[i][j];
          const p2 = pts[i + 1][j];
          const p3 = pts[i + 1][j + 1];
          const p4 = pts[i][j + 1];

          const isHigh = p1.yElev > 16;
          ctx.fillStyle = isHigh ? "rgba(16, 185, 129, 0.22)" : "rgba(236, 72, 153, 0.18)";
          ctx.strokeStyle = isHigh ? "#34d399" : "#f472b6";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // 3D Elevation Peak Pin on Center
      const peakPt = pts[gridN / 2][gridN / 2];
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(peakPt.sx, peakPt.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fdf2f8";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText(`Z=${Math.round(h0)}m`, peakPt.sx - 18, peakPt.sy - 8);

      cinematicAnimId = requestAnimationFrame(render);
    }

    render();
  }

  document.getElementById("btn-continue-next").addEventListener("click", () => {
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

  function buildHotColdCoaching(height, visibleIds, blockedDetails, farDetails, highestObstacle, result) {
    if (result.stageCompleted) {
      setFeedback(
        `🔥 <strong>BULLSEYE! Region Complete (${Math.round(height)} m):</strong> All 3 reflector prisms locked!`,
        "good"
      );
      return;
    }

    let tempBadge = "";
    let level = "warn";

    if (visibleIds.length === 2) {
      tempBadge = "🔥 <strong>VERY HOT (2/3 Visible):</strong> Almost there! Just 1 target left.";
      level = "good";
    } else if (visibleIds.length === 1) {
      tempBadge = "🌤️ <strong>WARM (1/3 Visible):</strong> Good start! Move slightly higher to catch the rest.";
      level = "warn";
    } else {
      tempBadge = "❄️ <strong>COLD (0/3 Visible):</strong> You are in a low dip behind a hill.";
      level = "bad";
    }

    let advice = "";
    if (farDetails.length > 0) {
      const f = farDetails[0];
      advice = `📏 <b>Rule:</b> <b>${f.id}</b> is too far (${f.dist}m). Move <b>${f.dir}</b> toward the middle of the targets.`;
    } else if (blockedDetails.length > 0) {
      const b = blockedDetails[0];
      const recommendedHeight = Math.round(highestObstacle + 10);
      advice = `⛰️ <b>Rule:</b> A <b>${b.ridgeHeight} m</b> hill blocks <b>${b.id}</b>. Move your cursor to find a hill higher than <b>${recommendedHeight} m</b> toward the <b>${b.dir}</b>!`;
    }

    setFeedback(`${tempBadge}<br>${advice}`, level);
  }

  function drawProfileChart(profile) {
    if (!profile || !elevationChart) return;

    const labels = profile.terrainElevs.map((_, i) => {
      if (i === 0) return "Station";
      if (i === profile.terrainElevs.length - 1) return profile.target.id;
      return "";
    });

    elevationChart.data.labels = labels;
    elevationChart.data.datasets[0].data = profile.terrainElevs;
    elevationChart.data.datasets[1].data = profile.losElevs;
    elevationChart.data.datasets[1].borderColor =
      profile.status === "visible" ? "#10b981" : "#f43f5e";

    elevationChart.update();

    if (profile.status === "visible") {
      losStatusText.innerHTML = `✅ <strong>${profile.target.id}:</strong> Clear sight! (${profile.distanceMeters}m away)`;
      losStatusText.style.color = "#10b981";
    } else if (profile.status === "out_of_range") {
      losStatusText.innerHTML = `⚠️ <strong>${profile.target.id}:</strong> Too far (${profile.distanceMeters}m). Move closer.`;
      losStatusText.style.color = "#fbbf24";
    } else {
      losStatusText.innerHTML = `❌ <strong>${profile.target.id}:</strong> Pink hill crosses the dashed laser line!`;
      losStatusText.style.color = "#f43f5e";
    }
  }

  // =========================================================================
  // EVENT HANDLER 2: Target Profile Dropdown Selector
  // =========================================================================
  profileSelector.addEventListener("change", (e) => {
    const idx = Number(e.target.value);
    if (currentProfiles[idx]) {
      drawProfileChart(currentProfiles[idx]);
    }
  });

  // =========================================================================
  // EVENT HANDLER 3: Map Base Layer Switcher (Topo Map / Satellite)
  // =========================================================================
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
    gameoverModal.classList.add("hidden");
    game.retryCurrentStage(
      (state) => updateHUD(state),
      () => triggerGameOver(false, 0)
    );
    updateHUD(game.getState());
    loadStage(game.getCurrentStage(), true);
  });

  document.getElementById("btn-restart-game").addEventListener("click", () => {
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
    stageCompleteModal.classList.add("hidden");

    const finalState = game.getState();
    const engineerStageEl = document.getElementById("victory-engineer-stage");
    const inviteNoteEl = document.getElementById("victory-invite-note");

    if (isVictory) {
      document.getElementById("gameover-badge").textContent = "ALL 6 REGIONS COMPLETE • MASTER SURVEYOR";
      document.getElementById("gameover-title").textContent = "Sen harika bir haritacısın! 🎉";
      engineerStageEl.classList.remove("hidden");
      inviteNoteEl.classList.remove("hidden");
      btnRetryStage.classList.add("hidden");
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