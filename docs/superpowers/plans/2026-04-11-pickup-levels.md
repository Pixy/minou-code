# Pick up Mechanic + Levels 11-13 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "pick up" mechanic (mandatory key collection) and 3 new levels (11-13) to the game.

**Architecture:** New `pickups` array in level definitions. The engine tracks collected pickups and treats the goal as a wall until all are collected. Grid renders pickup cells (key with glow) and locked/unlocked goal (lock/fish). Animations for collection (spin+fly to lock), unlock (lock-break + goal-appear), and goal-locked bump (wiggle). No new card type needed.

**Tech Stack:** Vanilla JS (ES modules), CSS animations, Lottie (existing)

**Spec:** `docs/superpowers/specs/2026-04-11-pickup-levels-design.md`

**Note on innerHTML:** This project uses innerHTML throughout for card/grid rendering with hardcoded emoji strings only (no user input). All existing code follows this pattern — new code does the same. No XSS risk as content is never user-supplied.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `js/levels/level-11.js` | Create | Level 11 definition |
| `js/levels/level-12.js` | Create | Level 12 definition |
| `js/levels/level-13.js` | Create | Level 13 definition |
| `js/levels/index.js` | Modify | Import + export new levels |
| `js/engine.js` | Modify | Pickup collection tracking, goal-locked wall logic |
| `js/grid.js` | Modify | Render pickup cells and locked goal |
| `js/main.js` | Modify | Wire pickup callbacks, manage collected state, animations |
| `style.css` | Modify | Pickup cell styles, locked goal styles, keyframe animations |

---

### Task 1: Create level definitions

**Files:**
- Create: `js/levels/level-11.js`
- Create: `js/levels/level-12.js`
- Create: `js/levels/level-13.js`
- Modify: `js/levels/index.js`

- [ ] **Step 1: Create level-11.js**

```js
export default {
  name: "La cle magique",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 0, type: "fish" },
  walls: [],
  bonuses: [],
  pickups: [{ x: 2, y: 1, type: "key" }],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: false,
  allowJump: false,
};
```

- [ ] **Step 2: Create level-12.js**

```js
export default {
  name: "Le coffre au tresor",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }],
  bonuses: [],
  pickups: [{ x: 0, y: 2, type: "key" }, { x: 4, y: 2, type: "key" }],
  stars: { 3: 10, 2: 13, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
```

- [ ] **Step 3: Create level-13.js**

```js
export default {
  name: "Saute et ramasse !",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }],
  bonuses: [],
  pickups: [{ x: 1, y: 2, type: "key" }],
  stars: { 3: 8, 2: 11, 1: Infinity },
  allowRepeat: true,
  allowJump: true,
};
```

- [ ] **Step 4: Update index.js — import and add new levels**

Add after existing imports:

```js
import level11 from './level-11.js';
import level12 from './level-12.js';
import level13 from './level-13.js';
```

Update the array:

```js
const levels = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10, level11, level12, level13];
```

- [ ] **Step 5: Commit**

```bash
git add js/levels/level-11.js js/levels/level-12.js js/levels/level-13.js js/levels/index.js
git commit -m "feat: add level 11-13 definitions (pickup mechanic)"
```

---

### Task 2: Engine — pickup tracking + goal-locked logic

**Files:**
- Modify: `js/engine.js`

The engine needs to:
1. Track collected pickups (like bonuses)
2. Check if cat lands on a pickup -> call `onPickup`
3. When all pickups collected -> call `onAllPickupsCollected`
4. At the goal: if not all pickups collected -> treat as wall (bump) via `onGoalLocked`, then `onFail`

- [ ] **Step 1: Add pickup tracking and goal-locked logic to executeProgram**

Replace the entire `executeProgram` function in `js/engine.js`. Key changes vs current code:
- Add `collectedPickups` array and `pickups`/`totalPickups` from level
- After wall checks but BEFORE moving: check if destination is the goal AND pickups remain -> call `onGoalLocked` + `onFail` + return
- After moving: check if landed on a pickup -> call `onPickup`, then check if all collected -> call `onAllPickupsCollected`

```js
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

    // But verrouille ? (pickups pas tous collectes)
    const isGoal = nextX === level.goal.x && nextY === level.goal.y;
    if (isGoal && totalPickups > 0 && collectedPickups.length < totalPickups) {
      if (callbacks.onGoalLocked) {
        await callbacks.onGoalLocked(nextX, nextY, moveDirection);
      }
      await callbacks.onFail();
      return;
    }

    // Deplacement valide (saut ou pas)
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
```

- [ ] **Step 2: Commit**

```bash
git add js/engine.js
git commit -m "feat: engine pickup tracking + goal-locked wall logic"
```

---

### Task 3: Grid — render pickups and locked goal

**Files:**
- Modify: `js/grid.js`

- [ ] **Step 1: Add pickup rendering and locked goal to renderGrid**

Replace the `renderGrid` function in `js/grid.js`. Changes: render pickup cells with key emoji, render goal as lock emoji when level has pickups. Uses DOM methods (createElement, textContent) consistent with existing code.

```js
export function renderGrid(level, container) {
  container.textContent = '';
  gridSize = level.grid;
  const pickups = level.pickups || [];
  const hasPickups = pickups.length > 0;

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

      // Gamelle (verrouillee si pickups)
      if (level.goal.x === x && level.goal.y === y) {
        const goalEl = document.createElement('span');
        goalEl.className = 'goal';
        goalEl.id = 'goal-icon';
        if (hasPickups) {
          goalEl.textContent = '\u{1F512}';
          cell.classList.add('locked-goal');
        } else {
          goalEl.textContent = level.goal.type === 'fish' ? '\u{1F41F}' : '\u{1F9F6}';
        }
        cell.appendChild(goalEl);
      }

      // Pickup
      const pickup = pickups.find(p => p.x === x && p.y === y);
      if (pickup) {
        const pickupEl = document.createElement('span');
        pickupEl.className = 'pickup';
        pickupEl.id = `pickup-${x}-${y}`;
        pickupEl.textContent = '\u{1F511}';
        cell.classList.add('has-pickup');
        cell.appendChild(pickupEl);
      }

      // Bonus
      const bonus = level.bonuses.find(b => b.x === x && b.y === y);
      if (bonus) {
        const bonusEl = document.createElement('span');
        bonusEl.className = 'bonus';
        bonusEl.id = `bonus-${x}-${y}`;
        bonusEl.textContent = '\u{1F9F6}';
        cell.appendChild(bonusEl);
      }

      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
  gridElement = grid;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/grid.js
git commit -m "feat: grid renders pickup cells and locked goal"
```

---

### Task 4: CSS — pickup styles and animations

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add pickup cell and locked goal styles**

Add after the `.cell .bonus` line (line 444 area), before the `/* CAT */` section:

```css
/* Pickup (key) */
.cell .pickup {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
  animation: key-glow 2s ease-in-out infinite;
}
.cell.has-pickup {
  background: rgba(255,215,0,0.12);
}

/* Locked goal */
.cell.locked-goal {
  background: rgba(180,180,180,0.15);
}
.cell.locked-goal .goal {
  font-size: 1.6rem;
}
```

- [ ] **Step 2: Add keyframe animations for pickup mechanic**

Add after the existing `@keyframes bonus-collect` block:

```css
@keyframes key-glow {
  0%, 100% { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)) drop-shadow(0 0 6px rgba(255,215,0,0.0)); transform: scale(1); }
  50% { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)) drop-shadow(0 0 14px rgba(255,215,0,0.6)); transform: scale(1.1); }
}
@keyframes key-collect {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  40% { transform: scale(1.5) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.3) rotate(360deg); opacity: 0; }
}
@keyframes lock-wiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-12deg); }
  30% { transform: rotate(12deg); }
  45% { transform: rotate(-8deg); }
  60% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
}
@keyframes lock-break {
  0% { transform: scale(1); opacity: 1; }
  30% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes goal-appear {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 3: Add animation utility classes**

Add after `.anim-bonus-collect`:

```css
.anim-key-collect { animation: key-collect 0.6s ease-in-out forwards; }
.anim-lock-wiggle { animation: lock-wiggle 0.6s ease-out; }
.anim-lock-break { animation: lock-break 0.4s ease-in forwards; }
.anim-goal-appear { animation: goal-appear 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
```

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: pickup and locked goal CSS styles + animations"
```

---

### Task 5: Main.js — wire up pickup callbacks and animations

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add locked fail message array**

Add after `INCOMPLETE_MESSAGES` array (around line 114):

```js
const LOCKED_MESSAGES = [
  `Oups ! Il manque la cle ${PLAYER_NAME} ! \u{1F511}\u{1F512}`,
  `Minou a besoin de la cle d'abord ! \u{1F431}\u{1F511}`,
  `Le poisson est enferme, trouve la cle ${PLAYER_NAME} ! \u{1F41F}\u{1F512}`,
  `Cle d'abord, poisson ensuite ${PLAYER_NAME} ! \u{1F511}\u27A1\uFE0F\u{1F41F}`,
];
```

- [ ] **Step 2: Add lastFailWasLocked state variable**

Add after `let isRunning = false;` (line 18):

```js
let lastFailWasLocked = false;
```

- [ ] **Step 3: Add pickup callbacks to executeProgram call**

In the `btn-run` click handler, after `isRunning = true;` add:

```js
  lastFailWasLocked = false;
```

Then add these 3 callbacks to the callbacks object passed to `executeProgram`, after the `onBonus` callback:

```js
    onPickup: async (x, y) => {
      playPop();
      const pickupEl = document.getElementById(`pickup-${x}-${y}`);
      if (pickupEl) {
        pickupEl.classList.add('anim-key-collect');
        await new Promise(r => setTimeout(r, 600));
        pickupEl.remove();
      }
    },
    onAllPickupsCollected: async () => {
      const level = levels[currentLevelIndex];
      const goalIcon = document.getElementById('goal-icon');
      const goalCell = gridContainer.querySelector(`[data-x="${level.goal.x}"][data-y="${level.goal.y}"]`);
      if (goalIcon) {
        goalIcon.classList.add('anim-lock-break');
        await new Promise(r => setTimeout(r, 400));
        goalIcon.textContent = level.goal.type === 'fish' ? '\u{1F41F}' : '\u{1F9F6}';
        goalIcon.classList.remove('anim-lock-break');
        goalIcon.classList.add('anim-goal-appear');
      }
      if (goalCell) {
        goalCell.classList.remove('locked-goal');
      }
      await new Promise(r => setTimeout(r, 500));
    },
    onGoalLocked: async (x, y, direction) => {
      lastFailWasLocked = true;
      playBonk();
      const goalIcon = document.getElementById('goal-icon');
      if (goalIcon) {
        goalIcon.classList.add('anim-lock-wiggle');
        goalIcon.addEventListener('animationend', () => {
          goalIcon.classList.remove('anim-lock-wiggle');
        }, { once: true });
      }
      playBounceWall(direction);
      playState('fail');
      await new Promise(r => setTimeout(r, 600));
      playMeowSad();
    },
```

- [ ] **Step 4: Update showFeedback fail message selection**

In `showFeedback`, replace line:
```js
    messageEl.textContent = type === 'fail' ? randomFrom(FAIL_MESSAGES) : randomFrom(INCOMPLETE_MESSAGES);
```

With:
```js
    if (type === 'fail' && lastFailWasLocked) {
      messageEl.textContent = randomFrom(LOCKED_MESSAGES);
    } else {
      messageEl.textContent = type === 'fail' ? randomFrom(FAIL_MESSAGES) : randomFrom(INCOMPLETE_MESSAGES);
    }
```

- [ ] **Step 5: Commit**

```bash
git add js/main.js
git commit -m "feat: wire pickup callbacks, unlock animation, locked fail messages"
```

---

### Task 6: Manual testing on all 3 levels

- [ ] **Step 1: Start dev server and test level 11**

Start the dev server per CLAUDE.md instructions (port 8080).

Test level 11 "La cle magique":
- Verify: key emoji visible at (2,1) with golden glow animation
- Verify: lock emoji visible at goal (3,0) instead of fish
- Test: go directly to goal -> bump + lock wiggle + locked message
- Test: collect key first -> key spin animation -> lock breaks -> fish appears -> reach goal -> win
- Verify: star thresholds (6 cards = 3 stars, 7-8 = 2 stars, 9+ = 1 star)

- [ ] **Step 2: Test level 12**

Test level 12 "Le coffre au tresor":
- Verify: 2 keys visible at (0,2) and (4,2)
- Verify: walls block center passage
- Test: collect 1 key then go to goal -> still locked (bump)
- Test: collect both keys -> lock breaks -> reach goal -> win
- Verify: repeat card available in tray

- [ ] **Step 3: Test level 13**

Test level 13 "Saute et ramasse !":
- Verify: key at (1,2), wall row at y=1
- Test: jump over wall to reach key area
- Test: collect key -> unlock -> navigate to goal -> win
- Verify: jump + repeat cards available in tray

- [ ] **Step 4: Test backward compatibility**

Play levels 1-10 to verify no regressions:
- Levels without pickups should work exactly as before (no lock, no pickup logic)
- Level 8 bonuses should still work correctly

- [ ] **Step 5: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: polish from manual testing"
```
