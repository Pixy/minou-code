import levels from './levels/index.js?v=20260419a';
import { state, getSave, saveSave, PLAYER_NAME } from './state.js?v=20260419a';
import { countVisualCards } from './cards.js?v=20260419a';
import { createSvgCat } from './svg-cat.js?v=20260419a';
import { playFanfare } from './audio.js?v=20260419a';
import { startLevel, backToSelect, resetCurrentLevel } from './navigation.js?v=20260419a';

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

const LOCKED_MESSAGES = [
  `Oups ! Il manque la clé ${PLAYER_NAME} ! 🔑🔒`,
  `Minou a besoin de la clé d'abord ! 🐱🔑`,
  `Le poisson est enfermé, trouve la clé ${PLAYER_NAME} ! 🐟🔒`,
  `Clé d'abord, poisson ensuite ${PLAYER_NAME} ! 🔑➡️🐟`,
];

const TRANSITION_MESSAGES = [
  `Allez ${PLAYER_NAME}, on continue ! 🚀`,
  `Niveau suivant ${PLAYER_NAME}, c'est parti ! 🐱💨`,
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateStarCount(bonusCount) {
  const level = levels[state.currentLevelIndex];
  const cardCount = countVisualCards();
  let starCount = 1;
  if (cardCount <= level.stars[2]) starCount = 2;
  if (cardCount <= level.stars[3]) starCount = 3;
  const totalBonuses = level.bonuses.length;
  if (totalBonuses > 0 && bonusCount >= totalBonuses && starCount < 3) {
    starCount++;
  }
  return starCount;
}

function showFeedback(type, bonusCount = 0, { onBeforeLeave } = {}) {
  const overlay = document.getElementById('feedback-overlay');
  const messageEl = document.getElementById('feedback-message');
  const starsEl = document.getElementById('feedback-stars');
  const catEl = document.getElementById('feedback-cat');
  const btnNext = document.getElementById('btn-next');
  const btnRetry = document.getElementById('btn-retry');

  overlay.classList.remove('hidden');
  starsEl.textContent = '';
  btnNext.classList.add('hidden');
  btnRetry.classList.add('hidden');

  catEl.textContent = '';

  if (type === 'win') {
    createSvgCat(catEl, 'win');
    messageEl.textContent = randomFrom(WIN_MESSAGES);

    const starCount = calculateStarCount(bonusCount);

    starsEl.textContent = '';
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('span');
      star.textContent = '⭐';
      star.className = 'anim-star-pop';
      star.style.animationDelay = `${i * 0.3}s`;
      starsEl.appendChild(star);
    }

    const save = getSave();
    const num = state.currentLevelIndex + 1;
    save.stars[num] = Math.max(save.stars[num] || 0, starCount);
    if (num >= save.unlocked) save.unlocked = num + 1;
    saveSave(save);

    if (starCount === 3) playFanfare();

    btnNext.classList.remove('hidden');
    btnNext.onclick = () => {
      if (state.currentLevelIndex + 1 < levels.length) {
        messageEl.textContent = randomFrom(TRANSITION_MESSAGES);
        starsEl.textContent = '';
        btnNext.classList.add('hidden');
        btnRetry.classList.add('hidden');
        setTimeout(() => {
          overlay.classList.add('hidden');
          onBeforeLeave?.();
          startLevel(state.currentLevelIndex + 1);
        }, 800);
      } else {
        overlay.classList.add('hidden');
        onBeforeLeave?.();
        backToSelect();
      }
    };
  } else {
    if (type === 'fail' && state.lastFailWasLocked) {
      messageEl.textContent = randomFrom(LOCKED_MESSAGES);
    } else {
      messageEl.textContent = type === 'fail' ? randomFrom(FAIL_MESSAGES) : randomFrom(INCOMPLETE_MESSAGES);
    }
    createSvgCat(catEl, 'fail');
    btnRetry.classList.remove('hidden');
    btnRetry.onclick = async () => {
      overlay.classList.add('hidden');
      onBeforeLeave?.();
      await resetCurrentLevel();
    };
  }
}

export { showFeedback, calculateStarCount };
