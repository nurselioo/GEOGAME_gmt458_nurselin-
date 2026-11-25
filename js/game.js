/**
 * js/game.js
 * Game state management, scoring, timer, lives, and heightened time penalties for wrong setups
 */

const HIGH_SCORE_STORAGE_KEY = "toporush_high_score_v1";

function createGameEngine(stages) {
  let savedHigh = 0;
  try {
    savedHigh = Number(localStorage.getItem(HIGH_SCORE_STORAGE_KEY)) || 0;
  } catch (e) {
    savedHigh = 0;
  }

  let state = {
    currentStageIndex: 0,
    score: 0,
    highScore: savedHigh,
    lives: 3,
    timeLeft: 90,
    isGameActive: false,
    isPaused: false,
    stationCountInStage: 0,
    targetsReadInStage: new Set(),
    totalTargetsRead: 0
  };

  let timerInterval = null;
  let onTickCallback = null;
  let onGameOverCallback = null;

  function saveHighScoreIfNeeded() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(state.highScore));
      } catch (e) {
        // Ignore storage restrictions
      }
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!state.isGameActive || state.isPaused) return;
      state.timeLeft -= 1;

      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        stopGame();
        if (onTickCallback) onTickCallback(getState());
        if (onGameOverCallback) onGameOverCallback(false);
        return;
      }

      if (onTickCallback) onTickCallback(getState());
    }, 1000);
  }

  function pauseTimer() {
    state.isPaused = true;
  }

  function resumeTimer() {
    state.isPaused = false;
  }

  function startNewGame(onTick, onGameOver) {
    onTickCallback = onTick;
    onGameOverCallback = onGameOver;

    state.currentStageIndex = 0;
    state.score = 0;
    state.lives = 3;
    state.timeLeft = 90;
    state.isGameActive = true;
    state.isPaused = false;
    state.stationCountInStage = 0;
    state.targetsReadInStage = new Set();
    state.totalTargetsRead = 0;

    startTimer();
  }

  function retryCurrentStage(onTick, onGameOver) {
    if (onTick) onTickCallback = onTick;
    if (onGameOver) onGameOverCallback = onGameOver;

    state.lives = 3;
    state.timeLeft = 90;
    state.isGameActive = true;
    state.isPaused = false;
    state.stationCountInStage = 0;
    state.targetsReadInStage = new Set();

    startTimer();
  }

  function stopGame() {
    state.isGameActive = false;
    state.isPaused = false;
    clearInterval(timerInterval);
    saveHighScoreIfNeeded();
  }

  function getCurrentStage() {
    return stages[state.currentStageIndex];
  }

  function registerStationDeployment() {
    state.stationCountInStage += 1;
    let timePenalty = 0;
    if (state.stationCountInStage > 1) {
      timePenalty = Math.min(12, 6 + (state.stationCountInStage - 2) * 2);
      state.timeLeft = Math.max(0, state.timeLeft - timePenalty);
      if (state.timeLeft === 0) {
        stopGame();
        if (onGameOverCallback) onGameOverCallback(false);
      }
    }
    return {
      deployCount: state.stationCountInStage,
      timePenalty
    };
  }

  function applyExtraTimePenalty(seconds) {
    state.timeLeft = Math.max(0, state.timeLeft - seconds);
    if (state.timeLeft === 0) {
      stopGame();
      if (onGameOverCallback) onGameOverCallback(false);
    }
    return state.timeLeft;
  }

  function recordVisibleTargets(visibleTargetIds) {
    const stage = getCurrentStage();
    let newlyReadCount = 0;

    visibleTargetIds.forEach(id => {
      if (!state.targetsReadInStage.has(id)) {
        state.targetsReadInStage.add(id);
        state.totalTargetsRead += 1;
        newlyReadCount += 1;
        state.score += 100;
      }
    });

    const stageCompleted = state.targetsReadInStage.size === stage.targets.length;
    let singleStationBonus = 0;

    if (stageCompleted && state.stationCountInStage === 1) {
      singleStationBonus = 250;
      state.score += singleStationBonus;
    }

    saveHighScoreIfNeeded();

    return {
      newlyReadCount,
      stageCompleted,
      singleStationBonus,
      readSet: new Set(state.targetsReadInStage)
    };
  }

  function addBonusScore(points) {
    state.score += points;
    saveHighScoreIfNeeded();
    return state.score;
  }

  function penalizeInvalidPlacement() {
    state.lives = Math.max(0, state.lives - 1);
    state.timeLeft = Math.max(0, state.timeLeft - 10);
    if (state.lives === 0 || state.timeLeft === 0) {
      stopGame();
    }
    return { lives: state.lives, timeLeft: state.timeLeft, timePenalty: 10 };
  }

  function advanceToNextStage() {
    state.isPaused = false;
    if (state.currentStageIndex + 1 < stages.length) {
      state.currentStageIndex += 1;
      state.stationCountInStage = 0;
      state.targetsReadInStage = new Set();
      state.timeLeft += 20;
      return { gameFinished: false, nextStage: getCurrentStage() };
    } else {
      const timeBonus = state.timeLeft * 5;
      state.score += timeBonus;
      saveHighScoreIfNeeded();
      stopGame();
      return { gameFinished: true, timeBonus };
    }
  }

  function getState() {
    return {
      ...state,
      stageNumber: state.currentStageIndex + 1,
      totalStages: stages.length
    };
  }

  return {
    startNewGame,
    retryCurrentStage,
    stopGame,
    pauseTimer,
    resumeTimer,
    getCurrentStage,
    registerStationDeployment,
    applyExtraTimePenalty,
    recordVisibleTargets,
    addBonusScore,
    penalizeInvalidPlacement,
    advanceToNextStage,
    getState
  };
}