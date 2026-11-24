/**
 * js/app.js
 * Leaflet map, Stage Briefing modal, custom SVG Total Station icon,
 * large terrain target markers, Hot/Cold Surveyor Coach, and Event Handlers
 */

document.addEventListener("DOMContentLoaded", () => {
  const game = createGameEngine(GAME_STAGES);

  // DOM References
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
  const gameoverModal = document.getElementById("gameover-modal");
  const btnRetryStage = document.getElementById("btn-retry-stage");

  // Clean SVG Total Station Marker (no persistent white text box)
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
  let elevationChart = null;
  let isProcessingClick = false;

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

  // Show Stage Briefing Guide Modal before starting each region
  function openStageBriefing(stage) {
    game.pauseTimer(); // Pause clock while player reads the stage guide

    const state = game.getState();
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

  // Live cursor height preview while moving mouse over map
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

    regionTitle.textContent = `${stage.name} (${stage.difficulty})`;
    stationElevEl.textContent = "-- m";
    stationCountEl.textContent = "0";
    targetsProgressEl.textContent = `0 / ${stage.targets.length}`;
    profileSelector.disabled = true;
    btnNextStage.classList.add("hidden");
    losStatusText.textContent = "Dashed line = Laser beam. If pink ground rises above it, a hill blocks your view.";
    losStatusText.style.color = "#d8b4e2";
    setFeedback(`💡 <strong>Strategy:</strong> ${stage.hint}`, "info");

    // Clean Pink Dashed Study Area Box (No confusing extra circle)
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
  // EVENT HANDLER 1: Map Click to Place Total Station & Hot/Cold Guidance
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
        const remLives = game.penalizeInvalidPlacement();
        updateHUD(game.getState());
        setFeedback("❄️ <strong>COLD (Water Hazard):</strong> You cannot set up on water! Click on the dry ridge on the east side.", "bad");
        showBanner("🌊 Cannot place station in water! <strong>-1 Life</strong>", "error");
        if (remLives === 0) triggerGameOver(false);
        return;
      }
    }

    isProcessingClick = true;
    showBanner("📡 Measuring terrain heights...");

    const deployInfo = game.registerStationDeployment();
    updateHUD(game.getState());

    stationLayer.clearLayers();
    sightLinesLayer.clearLayers();

    const stationIcon = L.divIcon({
      className: "",
      html: TOTAL_STATION_MARKER_HTML,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    // Clean marker without persistent popup label
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
    const stationElev = groundHeight + 2.0; // Tripod + instrument height

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
      const bonusMsg = result.singleStationBonus
        ? ` 🏆 <strong>One-Setup Bonus (+${result.singleStationBonus} pts)!</strong>`
        : "";
      showBanner(`🎉 All 3 targets measured!${bonusMsg}`, "success");
      btnNextStage.classList.remove("hidden");
    } else {
      const penaltyTxt = deployInfo.timePenalty ? ` (-${deployInfo.timePenalty}s)` : "";
      showBanner(`📡 ${result.readSet.size}/3 done${penaltyTxt}. Check the Station Coach advice on the right!`);
    }

    isProcessingClick = false;
  });

  function buildHotColdCoaching(height, visibleIds, blockedDetails, farDetails, highestObstacle, result) {
    if (result.stageCompleted) {
      setFeedback(
        `🔥 <strong>BULLSEYE! Region Complete (${Math.round(height)} m):</strong> Great job! Click the glowing <b>Next Region</b> button on the map.`,
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

  // Start, Retry Current Stage, Restart & Next Stage Buttons
  document.getElementById("btn-start-game").addEventListener("click", () => {
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
    const res = game.advanceToNextStage();
    updateHUD(game.getState());
    if (res.gameFinished) {
      triggerGameOver(true, res.timeBonus);
    } else {
      loadStage(game.getCurrentStage(), true);
    }
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
    const finalState = game.getState();
    document.getElementById("gameover-badge").textContent = isVictory
      ? "ALL 6 REGIONS COMPLETE"
      : `STOPPED AT STAGE ${finalState.stageNumber} / ${finalState.totalStages}`;
    document.getElementById("gameover-title").textContent = isVictory
      ? "Great Job, Master Surveyor!"
      : "Out of Time or Lives!";

    document.getElementById("final-score").textContent = finalState.score;
    document.getElementById("final-highscore").textContent = finalState.highScore;
    document.getElementById("final-targets").textContent = `${finalState.totalTargetsRead} / ${GAME_STAGES.length * 3}`;
    document.getElementById("final-time-bonus").textContent = `+${timeBonus}`;

    // Show "Retry This Stage" only if the player lost mid-game
    if (isVictory) {
      btnRetryStage.classList.add("hidden");
    } else {
      btnRetryStage.classList.remove("hidden");
    }

    gameoverModal.classList.remove("hidden");
  }
});