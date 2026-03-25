import levels from './levels/index.js';
import { renderGrid } from './grid.js';
import { initCards, clearProgram, getProgram, countVisualCards } from './cards.js';
import { executeProgram } from './engine.js';
import { initCatAnimation, playState, positionCatOnCell, moveCatTo, playBounceWall, playCelebrate, fireConfetti } from './animations.js';

const PLAYER_NAME = 'Loulou';

const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');
const gridContainer = document.getElementById('grid-container');
const levelTitle = document.getElementById('level-title');
const levelGrid = document.getElementById('level-grid');

let currentLevelIndex = 0;
let isRunning = false;
let catPosition = { x: 0, y: 0 };

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
  initCards(level);
  showScreen(screenGame);

  initCatAnimation(gridContainer);
  positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
  catPosition = { ...level.cat };
}

// Messages personnalisés
const WIN_MESSAGES = [
  `OUIIIII ! Bravo ${PLAYER_NAME} ! 🐱🎉`,
  `${PLAYER_NAME} la championne ! 🏆✨`,
  `Minou te fait un gros câlin ${PLAYER_NAME} ! 🐱❤️`,
  `Le poisson n'avait aucune chance ${PLAYER_NAME} ! 🐟💨`,
  `Génie absolu détecté : ${PLAYER_NAME} ! 🧠✨`,
  `Minou te dit MIAOU DU TONNERRE ${PLAYER_NAME} ! ⚡🐱`,
  `T'es trop forte ${PLAYER_NAME} ! 💪🌟`,
  `${PLAYER_NAME} + Minou = équipe de choc ! 🐱🚀`,
  `Minou est trop content grâce à toi ${PLAYER_NAME} ! 😻`,
  `Woooow ${PLAYER_NAME}, c'était parfait ! 🎯✨`,
];

const FAIL_MESSAGES = [
  `T'inquiète ${PLAYER_NAME}, tu vas y arriver ! 💪`,
  `Minou croit en toi ${PLAYER_NAME} ! 🐱🌟`,
  `Aïe aïe aïe ! Le mur a gagné cette fois 😹`,
  `Oups ! Le poisson rigole là 🐟😂`,
  `Ce mur est vraiment mal élevé ! 😤`,
  `Essaie encore ${PLAYER_NAME}, Minou ne lâche pas ! 🐱❤️`,
  `Presque ${PLAYER_NAME} ! Encore un petit effort ! 🌈`,
  `Minou s'est cogné mais il va bien ! 😹💫`,
  `Le chemin est par là... ou pas 🤔😸`,
  `Allez ${PLAYER_NAME}, on recommence ! 🔄✨`,
];

const INCOMPLETE_MESSAGES = [
  `Hmm... Minou n'est pas encore arrivé ! Il manque des pas ${PLAYER_NAME} 🐱🤔`,
  `Minou attend... il lui faut plus de cartes ${PLAYER_NAME} ! 📋`,
];

const TRANSITION_MESSAGES = [
  `Allez ${PLAYER_NAME}, on continue ! 🚀`,
  `Niveau suivant ${PLAYER_NAME}, c'est parti ! 🐱💨`,
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showFeedback(type, bonusCount = 0) {
  const overlay = document.getElementById('feedback-overlay');
  const messageEl = document.getElementById('feedback-message');
  const starsEl = document.getElementById('feedback-stars');
  const btnNext = document.getElementById('btn-next');
  const btnRetry = document.getElementById('btn-retry');

  overlay.classList.remove('hidden');
  starsEl.textContent = '';
  btnNext.classList.add('hidden');
  btnRetry.classList.add('hidden');

  if (type === 'win') {
    messageEl.textContent = randomFrom(WIN_MESSAGES);

    // Calcul étoiles
    const level = levels[currentLevelIndex];
    const cardCount = countVisualCards();
    let starCount = 1;
    if (cardCount <= level.stars[2]) starCount = 2;
    if (cardCount <= level.stars[3]) starCount = 3;

    // Bonus étoile
    const totalBonuses = level.bonuses.length;
    if (totalBonuses > 0 && bonusCount >= totalBonuses && starCount < 3) {
      starCount++;
    }

    starsEl.textContent = '⭐'.repeat(starCount);

    // Sauvegarder
    const save = getSave();
    const num = currentLevelIndex + 1;
    save.stars[num] = Math.max(save.stars[num] || 0, starCount);
    if (num >= save.unlocked) save.unlocked = num + 1;
    saveSave(save);

    // playFanfare(); // TODO: Task 7 — son uniquement si 3 étoiles

    btnNext.classList.remove('hidden');
    btnNext.onclick = () => {
      if (currentLevelIndex + 1 < levels.length) {
        messageEl.textContent = randomFrom(TRANSITION_MESSAGES);
        starsEl.textContent = '';
        btnNext.classList.add('hidden');
        btnRetry.classList.add('hidden');
        setTimeout(() => {
          overlay.classList.add('hidden');
          startLevel(currentLevelIndex + 1);
        }, 800);
      } else {
        overlay.classList.add('hidden');
        renderLevelSelect();
        showScreen(screenSelect);
      }
    };
  } else {
    messageEl.textContent = type === 'fail' ? randomFrom(FAIL_MESSAGES) : randomFrom(INCOMPLETE_MESSAGES);
    btnRetry.classList.remove('hidden');
    btnRetry.onclick = () => {
      overlay.classList.add('hidden');
    };
  }
}

// Bouton C'est parti !
document.getElementById('btn-run').addEventListener('click', async () => {
  if (isRunning) return;
  isRunning = true;
  document.getElementById('btn-run').disabled = true;

  const level = levels[currentLevelIndex];
  const program = getProgram();

  // Reset position
  catPosition = { ...level.cat };
  renderGrid(level, gridContainer);
  initCatAnimation(gridContainer);
  positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));

  await executeProgram(program, level, {
    onStep: async (x, y, direction) => {
      playState('walk');
      await moveCatTo(x, y, direction, gridContainer.querySelector('.grid'));
      catPosition = { x, y };
    },
    onWall: async (_x, _y, direction) => {
      playBounceWall(direction);
      playState('fail');
      await new Promise(r => setTimeout(r, 600));
    },
    onBonus: async (x, y) => {
      const bonusEl = document.getElementById(`bonus-${x}-${y}`);
      if (bonusEl) bonusEl.classList.add('anim-bonus-collect');
    },
    onWin: async (bonusCount) => {
      playState('win');
      playCelebrate();
      fireConfetti(false);
      await new Promise(r => setTimeout(r, 800));
      showFeedback('win', bonusCount);
    },
    onFail: async () => {
      await new Promise(r => setTimeout(r, 800));
      showFeedback('fail');
    },
    onIncomplete: async (_x, _y) => {
      playState('idle');
      showFeedback('incomplete');
    },
  });

  isRunning = false;
  document.getElementById('btn-run').disabled = false;
});

// Bouton reset grille
document.getElementById('btn-reset').addEventListener('click', () => {
  if (isRunning) return;
  const level = levels[currentLevelIndex];
  renderGrid(level, gridContainer);
  initCatAnimation(gridContainer);
  positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
  catPosition = { ...level.cat };
});

// Bouton effacer programme
document.getElementById('btn-clear').addEventListener('click', () => {
  clearProgram();
});

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
