const PLAYER_NAME = 'Loulou';
const DEV_UNLOCK_ALL = true;
const SAVE_KEY = 'minou-code-save';

const state = {
  currentLevelIndex: 0,
  isRunning: false,
  lastFailWasLocked: false,
  catPosition: { x: 0, y: 0 },
};

function getSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  const save = raw ? JSON.parse(raw) : { unlocked: 1, stars: {} };
  if (DEV_UNLOCK_ALL) save.unlocked = 99;
  return save;
}

function saveSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export { PLAYER_NAME, state, getSave, saveSave };
