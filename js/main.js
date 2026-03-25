import levels from './levels/index.js';
import { renderGrid } from './grid.js';

const PLAYER_NAME = 'Loulou';

const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');
const gridContainer = document.getElementById('grid-container');
const levelTitle = document.getElementById('level-title');
const levelGrid = document.getElementById('level-grid');

let currentLevelIndex = 0;

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Sauvegarde localStorage
function getSave() {
  const raw = localStorage.getItem('minou-code-save');
  return raw ? JSON.parse(raw) : { unlocked: 1, stars: {} };
}

function saveSave(save) {
  localStorage.setItem('minou-code-save', JSON.stringify(save));
}

// Écran sélection
function renderLevelSelect() {
  const save = getSave();
  levelGrid.innerHTML = '';

  levels.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const num = i + 1;

    if (num > save.unlocked) {
      btn.classList.add('locked');
      btn.innerHTML = `🔒`;
    } else {
      const starCount = save.stars[num] || 0;
      const starsStr = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);
      btn.innerHTML = `<span>${num}</span><span class="stars">${starCount > 0 ? starsStr : ''}</span>`;
      btn.addEventListener('click', () => startLevel(i));
    }

    levelGrid.appendChild(btn);
  });
}

// Lancer un niveau
function startLevel(index) {
  currentLevelIndex = index;
  const level = levels[index];
  levelTitle.textContent = `🐱 Niveau ${index + 1} : "${level.name}"`;

  renderGrid(level, gridContainer);
  showScreen(screenGame);
}

// Bouton retour
document.getElementById('btn-back').addEventListener('click', () => {
  renderLevelSelect();
  showScreen(screenSelect);
});

// Init
function init() {
  document.getElementById('welcome-message').textContent =
    `Coucou ${PLAYER_NAME} ! 🐱 Prête à aider Minou ?`;
  renderLevelSelect();
  showScreen(screenSelect);
}

document.addEventListener('DOMContentLoaded', init);

export { PLAYER_NAME, showScreen, currentLevelIndex, getSave, saveSave };
