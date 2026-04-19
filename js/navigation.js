import levels from './levels/index.js?v=20260419a';
import { state, getSave } from './state.js?v=20260419a';
import { renderGrid } from './grid.js?v=20260419a';
import { initCards } from './cards.js?v=20260419a';
import { initCatAnimation, positionCatOnCell } from './animations.js?v=20260419a';
import { initAudio } from './audio.js?v=20260419a';

const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');
const gridContainer = document.getElementById('grid-container');
const levelTitle = document.getElementById('level-title');
const levelGrid = document.getElementById('level-grid');

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function renderLevelSelect() {
  const save = getSave();
  levelGrid.textContent = '';

  levels.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const num = i + 1;

    if (num > save.unlocked) {
      btn.classList.add('locked');
      btn.textContent = '🔒';
    } else {
      const starCount = save.stars[num] || 0;
      const numSpan = document.createElement('span');
      numSpan.textContent = String(num);
      const starsSpan = document.createElement('span');
      starsSpan.className = 'stars';
      starsSpan.textContent = starCount > 0
        ? '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount)
        : '';
      btn.append(numSpan, starsSpan);
      btn.addEventListener('click', () => startLevel(i));
    }

    levelGrid.appendChild(btn);
  });
}

async function startLevel(index) {
  initAudio();
  state.currentLevelIndex = index;
  const level = levels[index];
  levelTitle.textContent = `🐱 Niveau ${index + 1} : "${level.name}"`;

  renderGrid(level, gridContainer);
  initCards(level);
  showScreen(screenGame);

  initCatAnimation(gridContainer);
  await positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
  state.catPosition = { ...level.cat };
}

async function resetCurrentLevel() {
  const level = levels[state.currentLevelIndex];
  renderGrid(level, gridContainer);
  initCatAnimation(gridContainer);
  await positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
  state.catPosition = { ...level.cat };
}

function backToSelect() {
  renderLevelSelect();
  showScreen(screenSelect);
}

export {
  showScreen,
  renderLevelSelect,
  startLevel,
  resetCurrentLevel,
  backToSelect,
  screenSelect,
  screenGame,
  gridContainer,
};
