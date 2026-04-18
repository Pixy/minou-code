let gridElement = null;
let gridSize = 0;

export function renderGrid(level, container) {
  container.innerHTML = '';
  gridSize = level.grid;
  const pickups = level.pickups || [];
  const hasPickups = pickups.length > 0;
  const teleporters = level.teleporters || [];
  const boxes = level.boxes || [];

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Murs
      if (level.walls.some(w => w.x === x && w.y === y)) {
        cell.classList.add('wall');
      }

      // Gamelle (verrouillée si pickups)
      if (level.goal.x === x && level.goal.y === y) {
        const goalEl = document.createElement('span');
        goalEl.className = 'goal';
        goalEl.id = 'goal-icon';
        if (hasPickups) {
          goalEl.textContent = '🔒';
          cell.classList.add('locked-goal');
        } else {
          goalEl.textContent = level.goal.type === 'fish' ? '🐟' : '🧶';
        }
        cell.appendChild(goalEl);
      }

      // Pickup
      const pickup = pickups.find(p => p.x === x && p.y === y);
      if (pickup) {
        const pickupEl = document.createElement('span');
        pickupEl.className = 'pickup';
        pickupEl.id = `pickup-${x}-${y}`;
        pickupEl.textContent = '🔑';
        cell.classList.add('has-pickup');
        cell.appendChild(pickupEl);
      }

      // Téléporteur (case a ou b d'une paire)
      const teleporter = teleporters.find(t =>
        (t.a.x === x && t.a.y === y) || (t.b.x === x && t.b.y === y)
      );
      if (teleporter) {
        const teleEl = document.createElement('span');
        teleEl.className = 'teleporter';
        teleEl.textContent = '🌀';
        cell.classList.add('has-teleporter');
        cell.appendChild(teleEl);
      }

      // Bloc poussable
      const boxIndex = boxes.findIndex(b => b.x === x && b.y === y);
      if (boxIndex !== -1) {
        const boxEl = document.createElement('span');
        boxEl.className = 'box';
        boxEl.id = `box-${boxIndex}`;
        boxEl.textContent = '📦';
        cell.classList.add('has-box');
        cell.appendChild(boxEl);
      }

      // Bonus
      const bonus = level.bonuses.find(b => b.x === x && b.y === y);
      if (bonus) {
        const bonusEl = document.createElement('span');
        bonusEl.className = 'bonus';
        bonusEl.id = `bonus-${x}-${y}`;
        bonusEl.textContent = '🧶';
        cell.appendChild(bonusEl);
      }

      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
  gridElement = grid;
}

export function getCellElement(x, y) {
  if (!gridElement) return null;
  return gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}

export function isWall(level, x, y) {
  if (x < 0 || y < 0 || x >= level.grid || y >= level.grid) return true;
  return level.walls.some(w => w.x === x && w.y === y);
}

export function getGridSize() { return gridSize; }
