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
  const collectedPickups = [];
  const pickups = level.pickups || [];
  const totalPickups = pickups.length;

  for (const step of steps) {
    let nextX, nextY, moveDirection;

    if (step.type === 'jump') {
      const dir = DIRECTIONS[step.direction];
      if (!dir) continue;
      const midX = catX + dir.dx;
      const midY = catY + dir.dy;
      nextX = catX + dir.dx * 2;
      nextY = catY + dir.dy * 2;
      moveDirection = step.direction;

      if (midX < 0 || midY < 0 || midX >= level.grid || midY >= level.grid) {
        await callbacks.onWall(catX, catY, step.direction);
        await callbacks.onFail();
        return;
      }
      if (nextX < 0 || nextY < 0 || nextX >= level.grid || nextY >= level.grid) {
        await callbacks.onWall(catX, catY, step.direction);
        await callbacks.onFail();
        return;
      }
      if (level.walls.some(w => w.x === nextX && w.y === nextY)) {
        await callbacks.onWall(catX, catY, step.direction);
        await callbacks.onFail();
        return;
      }
    } else {
      const dir = DIRECTIONS[step.type];
      if (!dir) continue;
      nextX = catX + dir.dx;
      nextY = catY + dir.dy;
      moveDirection = step.type;

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
    }

    // But verrouillé ? (pickups pas tous collectés)
    const isGoal = nextX === level.goal.x && nextY === level.goal.y;
    if (isGoal && totalPickups > 0 && collectedPickups.length < totalPickups) {
      if (callbacks.onGoalLocked) {
        await callbacks.onGoalLocked(nextX, nextY, moveDirection);
      }
      await callbacks.onFail();
      return;
    }

    // Déplacement valide (saut ou pas)
    catX = nextX;
    catY = nextY;
    await callbacks.onStep(catX, catY, moveDirection);

    // Pickup ?
    const pickupKey = `${catX}-${catY}`;
    const pickupHere = pickups.find(p => p.x === catX && p.y === catY && !collectedPickups.includes(pickupKey));
    if (pickupHere) {
      collectedPickups.push(pickupKey);
      if (callbacks.onPickup) {
        await callbacks.onPickup(catX, catY);
      }
      if (collectedPickups.length === totalPickups && callbacks.onAllPickupsCollected) {
        await callbacks.onAllPickupsCollected();
      }
    }

    // Bonus ?
    const bonusIndex = level.bonuses.findIndex(b => b.x === catX && b.y === catY && !collectedBonuses.includes(`${b.x}-${b.y}`));
    if (bonusIndex !== -1) {
      collectedBonuses.push(`${catX}-${catY}`);
      await callbacks.onBonus(catX, catY);
    }

    // Victoire ?
    if (isGoal) {
      await callbacks.onWin(collectedBonuses.length);
      return;
    }

    await delay(STEP_DELAY);
  }

  await callbacks.onIncomplete(catX, catY);
}
