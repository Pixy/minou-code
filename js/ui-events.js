import levels from './levels/index.js?v=20260419a';
import { state } from './state.js?v=20260419a';
import { renderGrid } from './grid.js?v=20260419a';
import { clearProgram, getProgram } from './cards.js?v=20260419a';
import { executeProgram } from './engine.js?v=20260419a';
import {
  initCatAnimation,
  playState,
  positionCatOnCell,
  moveCatTo,
  teleportCatTo,
  playBounceWall,
  playCelebrate,
  fireConfetti,
} from './animations.js?v=20260419a';
import {
  playStep,
  playBonk,
  playMeowHappy,
  playMeowSad,
  playPop,
} from './audio.js?v=20260419a';
import {
  squashGrass,
  waterSplash,
  shakeRock,
  comicText,
  laughingFish,
  fireworkOnGoal,
  sunRise,
  rocksCelebrate,
} from './effects.js?v=20260419a';
import { showFeedback, calculateStarCount } from './feedback.js?v=20260419a';
import {
  gridContainer,
  resetCurrentLevel,
  backToSelect,
} from './navigation.js?v=20260419a';

function enableControls() {
  state.isRunning = false;
  document.getElementById('btn-run').disabled = false;
}

function initUIEvents() {
  document.getElementById('btn-run').addEventListener('click', async () => {
    if (state.isRunning) return;
    state.isRunning = true;
    document.getElementById('btn-run').disabled = true;
    state.lastFailWasLocked = false;

    const level = levels[state.currentLevelIndex];
    const program = getProgram();

    state.catPosition = { ...level.cat };
    renderGrid(level, gridContainer);
    initCatAnimation(gridContainer);
    await positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));

    await executeProgram(program, level, {
      onStep: async (x, y, direction) => {
        playStep();
        playState('walk');
        await moveCatTo(x, y, direction, gridContainer.querySelector('.grid'));
        squashGrass(gridContainer.querySelector('.grid'), x, y);
        state.catPosition = { x, y };
      },
      onWall: async (x, y, direction) => {
        playBonk();
        playBounceWall(direction);
        playState('fail');
        const gridEl = gridContainer.querySelector('.grid');
        const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        const d = dirs[direction] || [0, -1];
        const nx = x + d[0], ny = y + d[1];
        const lvl = levels[state.currentLevelIndex];
        const isRock = lvl.walls.some(w => w.x === nx && w.y === ny);
        const isOutOfBounds = nx < 0 || ny < 0 || nx >= lvl.grid || ny >= lvl.grid;

        if (isRock) {
          shakeRock(gridEl, x, y, direction);
          comicText(gridEl, x, y, direction, 'BONK !');
        } else if (isOutOfBounds) {
          waterSplash(gridEl, x, y, direction);
          comicText(gridEl, x, y, direction, 'PLOUF !');
          laughingFish(gridEl, x, y, direction);
        } else {
          comicText(gridEl, x, y, direction, 'OUPS !');
        }
        await new Promise(r => setTimeout(r, 700));
        playMeowSad();
      },
      onBoxPush: async (i, x, y) => {
        playPop();
        const boxEl = document.getElementById(`box-${i}`);
        if (!boxEl) return;
        const oldCell = boxEl.parentElement;
        const newCell = gridContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (newCell && oldCell) {
          oldCell.classList.remove('has-box');
          newCell.classList.add('has-box');
          newCell.appendChild(boxEl);
          boxEl.classList.add('anim-box-slide');
          await new Promise(r => setTimeout(r, 350));
          boxEl.classList.remove('anim-box-slide');
        }
      },
      onTeleport: async (x, y) => {
        playPop();
        await teleportCatTo(x, y, gridContainer.querySelector('.grid'));
        state.catPosition = { x, y };
      },
      onBonus: async (x, y) => {
        playPop();
        const bonusEl = document.getElementById(`bonus-${x}-${y}`);
        if (bonusEl) bonusEl.classList.add('anim-bonus-collect');
      },
      onPickup: async (x, y) => {
        playPop();
        const pickupEl = document.getElementById(`pickup-${x}-${y}`);
        if (pickupEl) {
          pickupEl.classList.add('anim-key-collect');
          await new Promise(r => setTimeout(r, 600));
          pickupEl.remove();
        }
      },
      onAllPickupsCollected: async () => {
        const lvl = levels[state.currentLevelIndex];
        const goalIcon = document.getElementById('goal-icon');
        const goalCell = gridContainer.querySelector(`[data-x="${lvl.goal.x}"][data-y="${lvl.goal.y}"]`);
        if (goalIcon) {
          goalIcon.classList.add('anim-lock-break');
          await new Promise(r => setTimeout(r, 400));
          goalIcon.textContent = lvl.goal.type === 'fish' ? '🐟' : '🧶';
          goalIcon.classList.remove('anim-lock-break');
          goalIcon.classList.add('anim-goal-appear');
        }
        if (goalCell) {
          goalCell.classList.remove('locked-goal');
        }
        await new Promise(r => setTimeout(r, 500));
      },
      onGoalLocked: async (x, y, direction) => {
        state.lastFailWasLocked = true;
        playBonk();
        const goalIcon = document.getElementById('goal-icon');
        if (goalIcon) {
          goalIcon.classList.add('anim-lock-wiggle');
          goalIcon.addEventListener('animationend', () => {
            goalIcon.classList.remove('anim-lock-wiggle');
          }, { once: true });
        }
        playBounceWall(direction);
        playState('fail');
        await new Promise(r => setTimeout(r, 600));
        playMeowSad();
      },
      onWin: async (bonusCount) => {
        playMeowHappy();
        playState('win');
        playCelebrate();
        const starCount = calculateStarCount(bonusCount);
        const gridEl = gridContainer.querySelector('.grid');
        const lvl = levels[state.currentLevelIndex];
        sunRise(gridEl);
        fireworkOnGoal(gridEl, lvl.goal.x, lvl.goal.y);
        rocksCelebrate(gridEl);
        fireConfetti(starCount === 3);
        await new Promise(r => setTimeout(r, 2000));
        showFeedback('win', bonusCount, { onBeforeLeave: enableControls });
      },
      onFail: async () => {
        await new Promise(r => setTimeout(r, 800));
        showFeedback('fail', 0, { onBeforeLeave: enableControls });
      },
      onIncomplete: async () => {
        playState('idle');
        showFeedback('incomplete', 0, { onBeforeLeave: enableControls });
      },
    });

    if (document.getElementById('feedback-overlay').classList.contains('hidden')) {
      enableControls();
    }
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    if (state.isRunning) return;
    await resetCurrentLevel();
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    clearProgram();
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    backToSelect();
  });

  document.addEventListener('card-dropped', () => playPop());
}

export { initUIEvents, enableControls };
