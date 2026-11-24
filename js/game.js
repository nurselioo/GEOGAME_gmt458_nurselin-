/**
 * js/game.js
 * Core game state, scoring engine, stage progression, pause/resume timer
 */

function createGameEngine(stages) {
  const STORAGE_KEY = "toporush_highscore_v2";

  const state = {
    currentStageIndex: 0,
    score: 0,
    highScore: Number(localStorage.getItem(STORAGE_KEY)) || 0,
    lives: 3,
    timeLeft: 90,
    isGameActive: false,
    isPaused: false,
    timerId: null,
    targetsReadInStage: new Set(),
    totalTargetsRead: 0,
    stationsDeployedInStage: 0
  };

  function saveHighScore() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem(STORAGE_KEY, String(state.highScore));
    }
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer(onTick, onTimeOut) {
    stopTimer();
    state.timerId = setInterval(() => {
      if (!state.isGameActive || state.isPaused) return;
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.isGameActive = false;
        stopTimer();
        onTick(getPublicState());
        onTimeOut();
      } else {
        onTick(getPublicState());
      }
    }, 1000);
  }

  function pauseTimer() {
    state.isPaused = true;
  }

  function resumeTimer() {
    state.isPaused = false;
  }

  function startNewGame(onTick, onTimeOut) {
    state.currentStageIndex = 0;
    state.score = 0;
    state.lives = 3;
    state.timeLeft = 90;
    state.isGameActive = true;
    state.isPaused = false;
    state.targetsReadInStage = new Set();
    state.totalTargetsRead = 0;
    state.stationsDeployedInStage = 0;
    startTimer(onTick, onTimeOut);
  }

  function retryCurrentStage(onTick, onTimeOut) {
    state.lives = 3;
    state.timeLeft = 60;
    state.isGameActive = true;
    state.isPaused = false;
    state.targetsReadInStage = new Set();
    state.stationsDeployedInStage = 0;
    startTimer(onTick, onTimeOut);
  }

  function registerStationDeployment() {
    state.stationsDeployedInStage += 1;
    let timePenalty = 0;
    if (state.stationsDeployedInStage > 1) {
      timePenalty = 3;
      state.timeLeft = Math.max(1, state.timeLeft - timePenalty);
    }
    return {
      deployCount: state.stationsDeployedInStage,
      timePenalty
    };
  }

  function penalizeInvalidPlacement() {
    state.lives = Math.max(0, state.lives - 1);
    if (state.lives === 0) {
      state.isGameActive = false;
      stopTimer();
    }
    return state.lives;
  }

  function addBonusScore(points) {
    state.score += points;
    saveHighScore();
    return state.score;
  }

  function recordVisibleTargets(visibleTargetIds) {
    let newlyReadCount = 0;
    visibleTargetIds.forEach(id => {
      if (!state.targetsReadInStage.has(id)) {
        state.targetsReadInStage.add(id);
        state.totalTargetsRead += 1;
        newlyReadCount += 1;
      }
    });

    const stage = stages[state.currentStageIndex];
    const stageCompleted = state.targetsReadInStage.size === stage.targets.length;

    let pointsEarned = newlyReadCount * 150;
    let singleStationBonus = 0;

    if (stageCompleted && state.stationsDeployedInStage === 1) {
      singleStationBonus = 300;
      pointsEarned += singleStationBonus;
    }

    state.score += pointsEarned;
    saveHighScore();

    return {
      newlyReadCount,
      pointsEarned,
      singleStationBonus,
      stageCompleted,
      readSet: new Set(state.targetsReadInStage)
    };
  }

  function advanceToNextStage() {
    if (state.currentStageIndex + 1 < stages.length) {
      state.currentStageIndex += 1;
      state.targetsReadInStage = new Set();
      state.stationsDeployedInStage = 0;
      state.timeLeft += 20;
      return { gameFinished: false };
    } else {
      state.isGameActive = false;
      stopTimer();
      const timeBonus = state.timeLeft * 10;
      state.score += timeBonus;
      saveHighScore();
      return { gameFinished: true, timeBonus };
    }
  }

  function getPublicState() {
    return {
      stageIndex: state.currentStageIndex,
      stageNumber: state.currentStageIndex + 1,
      totalStages: stages.length,
      score: state.score,
      highScore: state.highScore,
      lives: state.lives,
      timeLeft: state.timeLeft,
      isGameActive: state.isGameActive,
      totalTargetsRead: state.totalTargetsRead,
      stationsDeployedInStage: state.stationsDeployedInStage
    };
  }

  function getCurrentStage() {
    return stages[state.currentStageIndex];
  }

  return {
    startNewGame,
    retryCurrentStage,
    pauseTimer,
    resumeTimer,
    registerStationDeployment,
    penalizeInvalidPlacement,
    addBonusScore,
    recordVisibleTargets,
    advanceToNextStage,
    getState: getPublicState,
    getCurrentStage,
    stopTimer
  };
}