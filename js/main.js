import { PLAYER_NAME } from './state.js?v=20260419a';
import { renderLevelSelect, showScreen, screenSelect } from './navigation.js?v=20260419a';
import { initUIEvents } from './ui-events.js?v=20260419a';

function init() {
  document.getElementById('welcome-message').textContent =
    `Coucou ${PLAYER_NAME} ! 🐱 Prête à aider Minou ?`;
  initUIEvents();
  renderLevelSelect();
  showScreen(screenSelect);
}

document.addEventListener('DOMContentLoaded', init);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) =>
      console.warn('[SW] Registration failed', err)
    );
  });
}
