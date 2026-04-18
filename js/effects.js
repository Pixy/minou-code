/* effects.js — Visual effects for movement, collisions and victory.
   All effects mount DOM nodes and self-clean up.

   Mounting strategy:
   - Cell-bound effects (grass squash, rock shake, rock hop) use the grid.
   - Point effects that can spill outside the island (splash, droplets, comic
     text, jumping fish) mount on #grid-container so they aren't clipped by
     the grid's `overflow: hidden`.
   - Firework / sunrise mount inside the grid (they stay within the island).
*/

/* ---------- helpers ---------- */
function getCellRect(gridEl, x, y) {
  const cell = gridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell) return null;
  const gridRect = gridEl.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  return {
    cell,
    left: cellRect.left - gridRect.left,
    top: cellRect.top - gridRect.top,
    w: cellRect.width,
    h: cellRect.height,
  };
}

// Cell rect expressed in the coordinate space of #grid-container
// (used when we need to paint OUTSIDE the grid, which is clipped).
function getCellRectInContainer(gridEl, x, y) {
  const cell = gridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell) return null;
  const container = gridEl.parentElement; // #grid-container
  const cRect = container.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  return {
    container,
    left: cellRect.left - cRect.left,
    top: cellRect.top - cRect.top,
    w: cellRect.width,
    h: cellRect.height,
  };
}

/* ========================================================
   1) GRASS SQUASH — flatten grass on the cell the cat walks on
   ======================================================== */
export function squashGrass(gridEl, x, y) {
  const r = getCellRect(gridEl, x, y);
  if (!r || r.cell.classList.contains('wall')) return;
  r.cell.classList.add('grass-squashed');
  setTimeout(() => r.cell.classList.remove('grass-squashed'), 900);
}

/* ========================================================
   2) WATER SPLASH — droplets + concentric ripples
   Mounted on #grid-container so the splash extends beyond the island.
   ======================================================== */
export function waterSplash(gridEl, fromX, fromY, direction) {
  const r = getCellRectInContainer(gridEl, fromX, fromY);
  if (!r) return;

  // Impact point = edge of the starting cell in the direction of travel,
  // nudged outward so the effect clearly sits in the ocean.
  const NUDGE = 18;
  const offsets = {
    up:    { x: r.w / 2, y: -NUDGE },
    down:  { x: r.w / 2, y: r.h + NUDGE },
    left:  { x: -NUDGE,  y: r.h / 2 },
    right: { x: r.w + NUDGE, y: r.h / 2 },
  };
  const o = offsets[direction] ?? offsets.up;
  const cx = r.left + o.x;
  const cy = r.top + o.y;

  // Ripples — 2 concentric circles
  for (let i = 0; i < 2; i++) {
    const ripple = document.createElement('span');
    ripple.className = 'fx-ripple';
    ripple.style.left = `${cx}px`;
    ripple.style.top = `${cy}px`;
    ripple.style.animationDelay = `${i * 0.15}s`;
    r.container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 900 + i * 150);
  }

  // Droplets — fly back toward the island (away from ocean direction)
  const back = { up: [0,1], down: [0,-1], left: [1,0], right: [-1,0] }[direction] || [0,-1];
  for (let i = 0; i < 7; i++) {
    const d = document.createElement('span');
    d.className = 'fx-droplet';
    d.textContent = '💧';
    d.style.left = `${cx}px`;
    d.style.top = `${cy}px`;
    // Spread droplets in a fan opposing the travel direction
    const spread = (i / 6 - 0.5) * Math.PI * 0.95; // -π/2 .. π/2
    // Base angle = direction opposite to travel
    const baseAngle = Math.atan2(back[1], back[0]);
    const angle = baseAngle + spread;
    const dist = 28 + Math.random() * 22;
    d.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    d.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    d.style.animationDelay = `${i * 0.03}s`;
    r.container.appendChild(d);
    setTimeout(() => d.remove(), 800);
  }
}

/* ========================================================
   3) ROCK SHAKE — the hit rock (wall cell) trembles
   ======================================================== */
export function shakeRock(gridEl, x, y, direction) {
  const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
  const d = dirs[direction];
  if (!d) return;
  const wallX = x + d[0];
  const wallY = y + d[1];
  const cell = gridEl.querySelector(`[data-x="${wallX}"][data-y="${wallY}"]`);
  if (!cell) return;
  cell.classList.add('fx-rock-shake');
  setTimeout(() => cell.classList.remove('fx-rock-shake'), 500);
}

/* ========================================================
   4) COMIC TEXT — "BONK!" / "PLOUF!" at impact point
   Mounted on #grid-container so it can sit just outside the grid edge.
   ======================================================== */
export function comicText(gridEl, fromX, fromY, direction, text = 'BONK !') {
  const r = getCellRectInContainer(gridEl, fromX, fromY);
  if (!r) return;
  const NUDGE = 30;
  const offsets = {
    up:    { x: r.w / 2, y: -NUDGE },
    down:  { x: r.w / 2, y: r.h + NUDGE },
    left:  { x: -NUDGE,  y: r.h / 2 },
    right: { x: r.w + NUDGE, y: r.h / 2 },
  };
  const o = offsets[direction] ?? offsets.up;
  const el = document.createElement('span');
  el.className = 'fx-comic';
  el.textContent = text;
  el.style.left = `${r.left + o.x}px`;
  el.style.top = `${r.top + o.y}px`;
  el.style.setProperty('--tilt', `${(Math.random() - 0.5) * 20}deg`);
  r.container.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

/* ========================================================
   5) LAUGHING FISH — jumps in the ocean near the impact side
   Mounted on #grid-container, positioned in the ocean beyond the impact.
   ======================================================== */
export function laughingFish(gridEl, fromX, fromY, direction) {
  const r = getCellRectInContainer(gridEl, fromX, fromY);
  if (!r) return;

  // Random spot in the ocean roughly in the direction of the splash
  const NUDGE_MIN = 40;
  const NUDGE_MAX = 80;
  const nudge = NUDGE_MIN + Math.random() * (NUDGE_MAX - NUDGE_MIN);
  const lateralJitter = (Math.random() - 0.5) * r.w;

  const offsets = {
    up:    { x: r.w / 2 + lateralJitter, y: -nudge },
    down:  { x: r.w / 2 + lateralJitter, y: r.h + nudge },
    left:  { x: -nudge, y: r.h / 2 + lateralJitter },
    right: { x: r.w + nudge, y: r.h / 2 + lateralJitter },
  };
  const o = offsets[direction] ?? offsets.up;
  const x = r.left + o.x;
  const y = r.top + o.y;

  const fish = document.createElement('span');
  fish.className = 'fx-fish';
  fish.textContent = '🐟';
  fish.style.left = `${x}px`;
  fish.style.top = `${y}px`;
  r.container.appendChild(fish);
  setTimeout(() => fish.remove(), 1500);

  const ha = document.createElement('span');
  ha.className = 'fx-fish-laugh';
  ha.textContent = '😂';
  ha.style.left = `${x + 20}px`;
  ha.style.top = `${y - 10}px`;
  r.container.appendChild(ha);
  setTimeout(() => ha.remove(), 1500);
}

/* ========================================================
   6) FIREWORK on the goal cell — radial burst of stars
   Mounts inside the grid (stays on the island).
   ======================================================== */
export function fireworkOnGoal(gridEl, x, y) {
  const r = getCellRect(gridEl, x, y);
  if (!r) return;
  const cx = r.left + r.w / 2;
  const cy = r.top + r.h / 2;

  const colors = ['#FFD700', '#FF6B9D', '#7EDAB9', '#7EC8E3', '#FF8A80', '#FFED6B'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.className = 'fx-firework';
    s.textContent = '✦';
    s.style.left = `${cx}px`;
    s.style.top = `${cy}px`;
    s.style.color = colors[i % colors.length];
    const angle = (i / 14) * Math.PI * 2;
    const dist = 40 + Math.random() * 25;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    gridEl.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

/* ========================================================
   7) SUN RISE — warm golden flash that sweeps up across the grid
   ======================================================== */
export function sunRise(gridEl) {
  const el = document.createElement('div');
  el.className = 'fx-sunrise';
  gridEl.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

/* ========================================================
   8) ROCKS CELEBRATE — each wall cell hops in sequence
   ======================================================== */
export function rocksCelebrate(gridEl) {
  const rocks = gridEl.querySelectorAll('.cell.wall');
  rocks.forEach((rock, i) => {
    setTimeout(() => {
      rock.classList.add('fx-rock-hop');
      setTimeout(() => rock.classList.remove('fx-rock-hop'), 500);
    }, i * 100);
  });
}
