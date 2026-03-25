let gridElement = null;
let gridSize = 0;

export function renderGrid(level, container) {
  container.innerHTML = '';
  gridSize = level.grid;

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

      // Gamelle
      if (level.goal.x === x && level.goal.y === y) {
        const goalEl = document.createElement('span');
        goalEl.className = 'goal';
        goalEl.textContent = level.goal.type === 'fish' ? '🐟' : '🧶';
        cell.appendChild(goalEl);
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
