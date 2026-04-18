/* animations.js — SVG cat animations + canvas-confetti */

import { createSvgCat, setSvgCatState } from './svg-cat.js?v=20260418d';

let catContainer = null;
let catEl = null;
let currentState = null;

export function initCatAnimation(gridContainerEl) {
  const old = gridContainerEl.querySelector('#cat-container');
  if (old) old.remove();

  catContainer = document.createElement('div');
  catContainer.id = 'cat-container';
  gridContainerEl.querySelector('.grid').appendChild(catContainer);

  catEl = createSvgCat(catContainer, 'idle');
  currentState = 'idle';

  return catContainer;
}

export function playState(state) {
  if (!catEl) return;
  if (currentState === state) return;
  currentState = state;
  setSvgCatState(catEl, state);
  // Auto-return to idle after a one-shot state
  if (state === 'fail' || state === 'win') {
    setTimeout(() => {
      if (currentState === state) playState('idle');
    }, state === 'win' ? 2200 : 1200);
  }
}

export function positionCatOnCell(x, y, gridElement) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      const cell = gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (!cell || !catContainer) { resolve(); return; }
      const gridRect = gridElement.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      const offsetX = cellRect.left - gridRect.left + cellRect.width * 0.1;
      const offsetY = cellRect.top - gridRect.top + cellRect.height * 0.1;
      catContainer.style.width = `${cellRect.width * 0.8}px`;
      catContainer.style.height = `${cellRect.height * 0.8}px`;
      catContainer.style.position = 'absolute';
      catContainer.style.left = `${offsetX}px`;
      catContainer.style.top = `${offsetY}px`;
      catContainer.style.transition = 'none';
      resolve();
    });
  });
}

export async function moveCatTo(x, y, direction, gridElement) {
  const cell = gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell || !catContainer) return;

  catContainer.style.transform = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

  const gridRect = gridElement.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const offsetX = cellRect.left - gridRect.left + cellRect.width * 0.1;
  const offsetY = cellRect.top - gridRect.top + cellRect.height * 0.1;

  catContainer.style.transition = 'left 0.4s ease-in-out, top 0.4s ease-in-out';
  catContainer.style.left = `${offsetX}px`;
  catContainer.style.top = `${offsetY}px`;

  catContainer.classList.add('anim-hop');
  await new Promise(resolve => setTimeout(resolve, 400));
  catContainer.classList.remove('anim-hop');
}

export async function teleportCatTo(x, y, gridElement) {
  const cell = gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell || !catContainer) return;

  catContainer.classList.add('anim-teleport-flash');
  await new Promise(r => setTimeout(r, 200));

  const gridRect = gridElement.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const offsetX = cellRect.left - gridRect.left + cellRect.width * 0.1;
  const offsetY = cellRect.top - gridRect.top + cellRect.height * 0.1;
  catContainer.style.transition = 'none';
  catContainer.style.left = `${offsetX}px`;
  catContainer.style.top = `${offsetY}px`;

  await new Promise(r => setTimeout(r, 200));
  catContainer.classList.remove('anim-teleport-flash');
}

export function playBounceWall(direction) {
  if (!catContainer) return;

  const bounceMap = {
    up:    { x: '0px', y: '-15px' },
    down:  { x: '0px', y: '15px' },
    left:  { x: '-15px', y: '0px' },
    right: { x: '15px', y: '0px' },
  };

  const bounce = bounceMap[direction] ?? bounceMap.up;
  catContainer.style.setProperty('--bounce-x', bounce.x);
  catContainer.style.setProperty('--bounce-y', bounce.y);

  catContainer.classList.add('anim-bounce-wall');
  catContainer.addEventListener('animationend', () => {
    catContainer.classList.remove('anim-bounce-wall');
  }, { once: true });
}

export function playCelebrate() {
  if (!catContainer) return;

  catContainer.classList.add('anim-celebrate-spin');
  catContainer.addEventListener('animationend', () => {
    catContainer.classList.remove('anim-celebrate-spin');
  }, { once: true });
}

export function fireConfetti(threeStars = false) {
  if (typeof confetti !== 'function') return;

  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FF6B9D', '#C490E4', '#7ED957', '#FFD93D', '#4ECDC4'],
  });

  if (threeStars) {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FFEF00'],
      });
    }, 500);
  }
}
