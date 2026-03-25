// Configuration
const PLAYER_NAME = 'Loulou';

// Écrans
const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Init
function init() {
  document.getElementById('welcome-message').textContent =
    `Coucou ${PLAYER_NAME} ! 🐱 Prête à aider Minou ?`;
  showScreen(screenSelect);
}

document.addEventListener('DOMContentLoaded', init);

export { PLAYER_NAME, showScreen };
