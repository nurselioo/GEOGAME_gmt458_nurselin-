/**
 * js/game.js
 * Game state and scoring engine encapsulated using JavaScript Closures
 */

function createGameEngine(stages) {
  // Private state variables protected by closure scope
  let currentStageIndex = 0;
  let score = 0;
  let highScore = Number(localStorage.getItem("toporush_highscore")) || 0;
  let timeLeft = 90;
  let lives = 3;
  let stationDeployCount = 0;
  let totalTargetsRead = 0;
  let isGameActive = false;
  let timerInterval = null;

  let readTargetsInStage = new Set();

  function updateHighScoreIfNeeded() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("toporush_highscore", String(highScore));
    }
  }

  return {
    startNewGame(onTick, onTimeOut) {
      currentStageIndex = 0;
      score = 0;
      timeLeft = 90;
      lives = 3;
      stationDeployCount = 0;
      totalTargetsRead = 0;
      readTargetsInStage.clear();
      isGameActive = true;

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!isGameActive) return;
        timeLeft -= 1;
        if (timeLeft <= 0) {
          timeLeft = 0;
          this.stopGame();
          if (onTimeOut) onTimeOut();
        }
        if (onTick) onTick(this.getState());
      }, 1000);
    },

    stopGame() {
      isGameActive = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      updateHighScoreIfNeeded();
    },

    getCurrentStage() {
      return stages[currentStageIndex];
    },

    registerStationDeployment() {
      if (!isGameActive) return { allowed: false };
      stationDeployCount += 1;
      // First setup in a region is free; each move costs 4 seconds
      if (stationDeployCount > 1) {
        timeLeft = Math.max(0, timeLeft - 4);
      }
      return {
        allowed: true,
        timePenalty: stationDeployCount > 1 ? 4 : 0,
        deployCount: stationDeployCount
      };
    },

    penalizeInvalidPlacement() {
      if (!isGameActive) return lives;
      lives = Math.max(0, lives - 1);
      if (lives === 0) {
        this.stopGame();
      }
      return lives;
    },

    recordVisibleTargets(visibleTargetIds) {
      let newlyReadCount = 0;
      visibleTargetIds.forEach(id => {
        if (!readTargetsInStage.has(id)) {
          readTargetsInStage.add(id);
          newlyReadCount += 1;
          totalTargetsRead += 1;
          score += 200;
        }
      });

      const stage = stages[currentStageIndex];
      const stageCompleted = readTargetsInStage.size === stage.targets.length;

      // Bonus for measuring all 3 targets from a single station setup
      let singleStationBonus = 0;
      if (stageCompleted && stationDeployCount === 1) {
        singleStationBonus = 300;
        score += singleStationBonus;
      }

      updateHighScoreIfNeeded();

      return {
        newlyReadCount,
        stageCompleted,
        singleStationBonus,
        readSet: new Set(readTargetsInStage)
      };
    },

    advanceToNextStage() {
      if (currentStageIndex + 1 >= stages.length) {
        const timeBonus = timeLeft * 10;
        score += timeBonus;
        this.stopGame();
        return { gameFinished: true, timeBonus };
      }

      currentStageIndex += 1;
      stationDeployCount = 0;
      readTargetsInStage.clear();
      timeLeft += 15;
      return { gameFinished: false, timeBonus: 0 };
    },

    getState() {
      return {
        stageNumber: currentStageIndex + 1,
        totalStages: stages.length,
        score,
        highScore,
        timeLeft,
        lives,
        stationDeployCount,
        totalTargetsRead,
        isGameActive,
        readTargetsCount: readTargetsInStage.size
      };
    }
  };
}