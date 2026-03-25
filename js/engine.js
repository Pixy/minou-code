const STEP_DELAY = 500;
const DIRECTIONS = {
  up:    { dx: 0, dy: -1 },
  down:  { dx: 0, dy: 1 },
  left:  { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flattenProgram(program) {
  const steps = [];
  for (const instruction of program) {
    if (instruction.type === 'repeat') {
      for (let i = 0; i < instruction.count; i++) {
        steps.push(...flattenProgram(instruction.children));
      }
    } else {
      steps.push(instruction);
    }
  }
  return steps;
}

export async function executeProgram(program, level, callbacks) {
  const steps = flattenProgram(program);
  let catX = level.cat.x;
  let catY = level.cat.y;
  const collectedBonuses = [];

  for (const step of steps) {
    const dir = DIRECTIONS[step.type];
    if (!dir) continue;

    const nextX = catX + dir.dx;
    const nextY = catY + dir.dy;

    // Hors grille ou mur → arrêt immédiat
    if (nextX < 0 || nextY < 0 || nextX >= level.grid || nextY >= level.grid) {
      await callbacks.onWall(catX, catY, step.type);
      await callbacks.onFail();
      return;
    }
    if (level.walls.some(w => w.x === nextX && w.y === nextY)) {
      await callbacks.onWall(catX, catY, step.type);
      await callbacks.onFail();
      return;
    }

    // Déplacement valide
    catX = nextX;
    catY = nextY;
    await callbacks.onStep(catX, catY, step.type);

    // Bonus ?
    const bonusIndex = level.bonuses.findIndex(b => b.x === catX && b.y === catY && !collectedBonuses.includes(`${b.x}-${b.y}`));
    if (bonusIndex !== -1) {
      collectedBonuses.push(`${catX}-${catY}`);
      await callbacks.onBonus(catX, catY);
    }

    // Victoire ?
    if (catX === level.goal.x && catY === level.goal.y) {
      await callbacks.onWin(collectedBonuses.length);
      return;
    }

    await delay(STEP_DELAY);
  }

  // Programme terminé sans atteindre le goal
  await callbacks.onIncomplete(catX, catY);
}
