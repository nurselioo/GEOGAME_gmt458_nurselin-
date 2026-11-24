/**
 * js/app.js
 * Leaflet map, Turf.js spatial checks, Chart.js profile,
 * DOM updates, and 3 core Event Handlers
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

  const stationCoordsEl = document.getElementById("station-coords");
  const stationElevEl = document.getElementById("station-elev");
  const stationCountEl = document.getElementById("station-count");
  const stationRangeEl = document.getElementById("station-range");

  const targetListEl = document.getElementById("target-list");
  const targetsProgressEl = document.getElementById("targets-progress");
  const profileSelector = document.getElementById("profile-selector");
  const losStatusText = document.getElementById("los-status-text");
  const btnNextStage = document.getElementById("btn-next-stage");

  const startModal = document.getElementById("start-modal");
  const gameoverModal = document.getElementById("gameover-modal");

  // Initialize Leaflet Map centered on Turkey
  const map = L.map("map", { zoomControl: true }).setView([39.0, 35.0], 6);

  const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: "© OpenTopoMap (SRTM)"
  }).addTo(map);

  const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    attribution: "© Esri World Imagery"
  });

  // Map Layer Groups
  let targetMarkersLayer = L.layerGroup().addTo(map);
  let stationLayer = L.layerGroup().addTo(map);
  let sightLinesLayer = L.layerGroup().addTo(map);
  let boundaryLayer = L.layerGroup().addTo(map);

  let currentProfiles = [];
  let targetElevations = {};
  let elevationChart = null;
  let isProcessingClick = false;

  // Initialize Chart.js with Pink Terrain Curve
  function initChart() {
    const ctx = document.getElementById("elevationChart").getContext("2d");
    elevationChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Ground Height (m)",
            data: [],
            borderColor: "#f472b6",
            backgroundColor: "rgba(236, 72, 153, 0.22)",
            fill: true,
            tension: 0.3,
            pointRadius: 2
          },
          {
            label: "Laser Line (LOS)",
            data: [],
            borderColor: "#10b981",
            borderDash: [6, 4],
            borderWidth: 2,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#fdf2f8", font: { size: 11 } } }
        },
        scales: {
          x: { ticks: { color: "#d8b4e2", font: { size: 10 } }, grid: { color: "#281733" } },
          y: { ticks: { color: "#d8b4e2", font: { size: 10 } }, grid: { color: "#462759" } }
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

  // Update Top HUD Elements via DOM Manipulation
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

  async function loadStage(stage) {
    targetMarkersLayer.clearLayers();
    stationLayer.clearLayers();
    sightLinesLayer.clearLayers();
    boundaryLayer.clearLayers();
    currentProfiles = [];
    targetElevations = {};

    regionTitle.textContent = `${stage.name} (${stage.difficulty})`;
    stationCoordsEl.textContent = "Waiting for setup";
    stationElevEl.textContent = "-- m";
    stationCountEl.textContent = "0";
    stationRangeEl.textContent = `${stage.maxRange} m`;
    targetsProgressEl.textContent = `0 / ${stage.targets.length}`;
    profileSelector.disabled = true;
    btnNextStage.classList.add("hidden");
    losStatusText.textContent = "Click on the map to place the station and view the terrain profile.";
    losStatusText.style.color = "#d8b4e2";

    // Study Area Boundary Box (Pink Dashed)
    const rectBounds = [
      [stage.bounds.minLat, stage.bounds.minLng],
      [stage.bounds.maxLat, stage.bounds.maxLng]
    ];
    L.rectangle(rectBounds, {
      color: "#f472b6",
      weight: 1.5,
      dashArray: "6, 6",
      fillOpacity: 0.04
    }).addTo(boundaryLayer);

    // Restricted Crater Lake Zone
    if (stage.waterZone) {
      L.circle([stage.waterZone.lat, stage.waterZone.lng], {
        radius: stage.waterZone.radius,
        color: "#f43f5e",
        fillColor: "#ec4899",
        fillOpacity: 0.22,
        weight: 1.5
      }).bindTooltip("Water Zone: Do Not Place Station Here").addTo(boundaryLayer);
    }

    map.flyTo(stage.center, stage.zoom, { duration: 1.1 });
    showBanner(`💡 <strong>Tip:</strong> ${stage.hint}`);

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

      let markerClass = "target-marker-icon";
      if (isRead) markerClass += " read-success";
      else if (status === "blocked" || status === "out_of_range") markerClass += " read-blocked";

      const icon = L.divIcon({
        className: "",
        html: `<div class="${markerClass}" style="width:28px;height:28px;">${t.id}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([t.lat, t.lng], { icon }).addTo(targetMarkersLayer);
      marker.bindTooltip(`${t.id} - ${t.name}${isRead ? ` (Height: ${targetElevations[t.id]} m)` : " (Hidden)"}`);

      // Build Target List Item in DOM
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
        <div>
          <strong>${t.id}</strong> • ${t.name}
        </div>
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

  // =========================================================================
  // EVENT HANDLER 1: Map Click to Place Total Station & Run Line-of-Sight
  // =========================================================================
  map.on("click", async (e) => {
    const state = game.getState();
    if (!state.isGameActive || isProcessingClick) return;

    const stage = game.getCurrentStage();
    const { lat, lng } = e.latlng;

    // 1. Check Study Area Bounds
    const inBounds =
      lat >= stage.bounds.minLat &&
      lat <= stage.bounds.maxLat &&
      lng >= stage.bounds.minLng &&
      lng <= stage.bounds.maxLng;

    if (!inBounds) {
      const remLives = game.penalizeInvalidPlacement();
      updateHUD(game.getState());
      showBanner("⚠️ Stay inside the pink study box! <strong>-1 Life</strong>", "error");
      if (remLives === 0) triggerGameOver(false);
      return;
    }

    // 2. Check Water Zone
    if (stage.waterZone) {
      const distToLake = turf.distance(
        turf.point([lng, lat]),
        turf.point([stage.waterZone.lng, stage.waterZone.lat]),
        { units: "meters" }
      );
      if (distToLake <= stage.waterZone.radius) {
        const remLives = game.penalizeInvalidPlacement();
        updateHUD(game.getState());
        showBanner("🌊 You cannot place a Total Station in water! <strong>-1 Life</strong>", "error");
        if (remLives === 0) triggerGameOver(false);
        return;
      }
    }

    isProcessingClick = true;
    showBanner("📡 Setting up Total Station and scanning terrain heights...");

    const deployInfo = game.registerStationDeployment();
    updateHUD(game.getState());

    stationLayer.clearLayers();
    sightLinesLayer.clearLayers();

    const stationIcon = L.divIcon({
      className: "",
      html: `<div class="station-marker-icon" style="width:32px;height:32px;">📐</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([lat, lng], { icon: stationIcon })
      .addTo(stationLayer)
      .bindTooltip("Total Station Setup Point");

    L.circle([lat, lng], {
      radius: stage.maxRange,
      color: "#ec4899",
      weight: 1.2,
      dashArray: "4, 6",
      fillColor: "#ec4899",
      fillOpacity: 0.07
    }).addTo(stationLayer);

    // Sample 12 points along each sightline
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
    const stationElev = elevations[0] + 1.6; // +1.6m tripod height

    stationCoordsEl.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    stationElevEl.textContent = `${elevations[0].toFixed(1)} m`;
    stationCountEl.textContent = String(deployInfo.deployCount);

    currentProfiles = [];
    const visibleIds = [];
    const statusMap = {};

    stage.targets.forEach((t, tIdx) => {
      const startIdx = 1 + tIdx * SAMPLES;
      const terrainElevs = [elevations[0], ...elevations.slice(startIdx, startIdx + SAMPLES)];
      const targetGroundElev = targetElevations[t.id] || terrainElevs[terrainElevs.length - 1];
      terrainElevs[terrainElevs.length - 1] = targetGroundElev;

      const distanceMeters = Math.round(
        turf.distance(turf.point([lng, lat]), turf.point([t.lng, t.lat]), { units: "meters" })
      );

      // Straight laser beam from station to target prism
      const losElevs = terrainElevs.map((_, i) => {
        const frac = i / SAMPLES;
        return Math.round((stationElev + (targetGroundElev + 1.5 - stationElev) * frac) * 10) / 10;
      });

      let isBlocked = false;
      for (let i = 1; i < SAMPLES; i++) {
        if (terrainElevs[i] > losElevs[i]) {
          isBlocked = true;
          break;
        }
      }

      const outOfRange = distanceMeters > stage.maxRange;
      let lineColor = "#10b981";
      let status = "visible";

      if (outOfRange) {
        lineColor = "#fbbf24";
        status = "out_of_range";
      } else if (isBlocked) {
        lineColor = "#f43f5e";
        status = "blocked";
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
        deltaH: (targetGroundElev - elevations[0]).toFixed(1)
      });
    });

    const result = game.recordVisibleTargets(visibleIds);
    updateHUD(game.getState());
    renderTargetMarkersAndList(stage, result.readSet, statusMap);

    profileSelector.disabled = false;
    profileSelector.value = "0";
    drawProfileChart(currentProfiles[0]);

    if (result.stageCompleted) {
      const bonusMsg = result.singleStationBonus
        ? ` 🏆 <strong>One-Setup Master (+${result.singleStationBonus} pts)!</strong>`
        : "";
      showBanner(`🎉 All targets measured in this region!${bonusMsg}`, "success");
      btnNextStage.classList.remove("hidden");
    } else {
      const penaltyTxt = deployInfo.timePenalty ? ` (-${deployInfo.timePenalty}s)` : "";
      showBanner(
        `📡 ${visibleIds.length} visible, ${stage.targets.length - visibleIds.length} blocked/far${penaltyTxt}. Click another high spot to move the station!`
      );
    }

    isProcessingClick = false;
  });

  function drawProfileChart(profile) {
    if (!profile || !elevationChart) return;

    const labels = profile.terrainElevs.map((_, i) => {
      const d = Math.round((profile.distanceMeters / (profile.terrainElevs.length - 1)) * i);
      return `${d}m`;
    });

    elevationChart.data.labels = labels;
    elevationChart.data.datasets[0].data = profile.terrainElevs;
    elevationChart.data.datasets[1].data = profile.losElevs;
    elevationChart.data.datasets[1].borderColor =
      profile.status === "visible" ? "#10b981" : "#f43f5e";

    elevationChart.update();

    if (profile.status === "visible") {
      losStatusText.innerHTML = `✅ <strong>${profile.target.id} (${profile.target.name}):</strong> Clear view! Distance: <b>${profile.distanceMeters}m</b> | Height Diff: <b>${profile.deltaH}m</b>`;
      losStatusText.style.color = "#10b981";
    } else if (profile.status === "out_of_range") {
      losStatusText.innerHTML = `⚠️ <strong>${profile.target.id}:</strong> Too far (${profile.distanceMeters}m). Place the station closer.`;
      losStatusText.style.color = "#fbbf24";
    } else {
      losStatusText.innerHTML = `❌ <strong>${profile.target.id}:</strong> A hill blocks the laser! Move to a higher point.`;
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

  // Start, Restart & Next Stage Buttons
  document.getElementById("btn-start-game").addEventListener("click", () => {
    startModal.classList.add("hidden");
    startSession();
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
      loadStage(game.getCurrentStage());
    }
  });

  function startSession() {
    game.startNewGame(
      (state) => updateHUD(state),
      () => triggerGameOver(false, 0)
    );
    updateHUD(game.getState());
    loadStage(game.getCurrentStage());
  }

  function triggerGameOver(isVictory, timeBonus = 0) {
    const finalState = game.getState();
    document.getElementById("gameover-badge").textContent = isVictory
      ? "ALL REGIONS COMPLETE"
      : "TIME OR LIVES RAN OUT";
    document.getElementById("gameover-title").textContent = isVictory
      ? "Great Job, Master Surveyor!"
      : "Survey Session Ended";

    document.getElementById("final-score").textContent = finalState.score;
    document.getElementById("final-highscore").textContent = finalState.highScore;
    document.getElementById("final-targets").textContent = `${finalState.totalTargetsRead} / ${GAME_STAGES.length * 3}`;
    document.getElementById("final-time-bonus").textContent = `+${timeBonus}`;

    gameoverModal.classList.remove("hidden");
  }
});