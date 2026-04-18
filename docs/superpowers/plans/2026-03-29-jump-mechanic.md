# Jump Mechanic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une carte "Saute" avec sélecteur de direction qui déplace le chat de 2 cases (en sautant par-dessus murs ou cases vides), et créer les niveaux 9 et 10.

**Architecture:** La carte `jump` suit le même pattern que `repeat` — un select dans la carte contrôle la direction. L'engine gère `{ type: 'jump', direction: 'up'|'down'|'left'|'right' }` séparément des steps directionnels classiques. Les niveaux déclarent `allowJump: true` pour activer la carte dans le bac.

**Tech Stack:** Vanilla JS ES modules, SortableJS, CSS custom properties.

---

## Files

- **Modify:** `js/cards.js` — ajouter type `jump`, card template avec select direction, parsing, filtre SortableJS
- **Modify:** `js/engine.js` — gérer le step `jump` dans `executeProgram`
- **Modify:** `style.css` — couleur de la carte jump + style `.jump-direction`
- **Create:** `js/levels/level-09.js`
- **Create:** `js/levels/level-10.js`
- **Modify:** `js/levels/index.js` — importer et enregistrer level-09 et level-10

---

## Task 1 : Ajouter le type `jump` dans cards.js

**Files:**
- Modify: `js/cards.js`

- [ ] **Step 1 : Ajouter `jump` dans CARD_TYPES**

Dans `js/cards.js`, ajouter l'entrée dans `CARD_TYPES` :

```js
const CARD_TYPES = {
  up:     { emoji: '⬆️', label: 'Avance' },
  down:   { emoji: '⬇️', label: 'Recule' },
  left:   { emoji: '⬅️', label: 'Gauche' },
  right:  { emoji: '➡️', label: 'Droite' },
  repeat: { emoji: '🔁', label: 'Répète' },
  jump:   { emoji: '🦘', label: 'Saute' },
};
```

- [ ] **Step 2 : Ajouter le template HTML de la carte jump dans `createCardElement`**

Dans le bloc `if (type === 'repeat') { ... } else { ... }`, ajouter un cas intermédiaire pour `jump` avant le `else` :

```js
if (type === 'repeat') {
  // ... code existant inchangé ...
} else if (type === 'jump') {
  card.innerHTML = `
    <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label}</span>
    <select class="jump-direction">
      <option value="up">⬆️</option>
      <option value="down">⬇️</option>
      <option value="left">⬅️</option>
      <option value="right">➡️</option>
    </select>
    <button class="delete-btn">❌</button>
  `;
} else {
  card.innerHTML = `
    <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label}</span>
    <button class="delete-btn">❌</button>
  `;
}
```

- [ ] **Step 3 : Ajouter `.jump-direction` au filtre SortableJS du programme**

Dans `initCards`, modifier l'option `filter` du `programSortable` :

```js
programSortable = new Sortable(programList, {
  group: { name: 'program', put: true },
  animation: 200,
  forceFallback: true,
  fallbackTolerance: 5,
  filter: '.repeat-count, .jump-direction',
  preventOnFilter: true,
  onAdd: onCardAdded,
  onSort: updateRunButton,
});
```

- [ ] **Step 4 : Ajouter le parsing de la carte jump dans `parseCards`**

Dans la fonction `parseCards`, ajouter le cas `jump` :

```js
function parseCards(container) {
  const instructions = [];
  for (const card of container.children) {
    if (!card.classList.contains('card')) continue;
    const type = card.dataset.type;

    if (type === 'repeat') {
      const count = parseInt(card.querySelector('.repeat-count').value, 10);
      const childZone = card.querySelector('[data-repeat-zone]');
      const children = parseCards(childZone);
      instructions.push({ type: 'repeat', count, children });
    } else if (type === 'jump') {
      const direction = card.querySelector('.jump-direction').value;
      instructions.push({ type: 'jump', direction });
    } else {
      instructions.push({ type });
    }
  }
  return instructions;
}
```

- [ ] **Step 5 : Activer la carte jump dans `initCards` selon le niveau**

Dans `initCards`, après la ligne `if (level.allowRepeat) availableTypes.push('repeat');` :

```js
if (level.allowJump) availableTypes.push('jump');
```

- [ ] **Step 6 : Vérifier visuellement dans le navigateur**

Ouvrir http://localhost:8080, aller sur un niveau, vérifier que la carte Saute n'apparaît pas (normal, aucun niveau n'a encore `allowJump: true`). Vérifier qu'il n'y a pas d'erreur console.

- [ ] **Step 7 : Commit**

```bash
git add js/cards.js
git commit -m "feat: add jump card with direction selector"
```

---

## Task 2 : Gérer le saut dans l'engine

**Files:**
- Modify: `js/engine.js`

- [ ] **Step 1 : Ajouter la logique du saut dans `executeProgram`**

Dans la boucle `for (const step of steps)`, remplacer le contenu actuel par une gestion des deux types de steps. Actuellement le code fait `const dir = DIRECTIONS[step.type]` — il faut gérer le cas `jump` séparément. Voici le contenu complet de `executeProgram` après modification :

```js
export async function executeProgram(program, level, callbacks) {
  const steps = flattenProgram(program);
  let catX = level.cat.x;
  let catY = level.cat.y;
  const collectedBonuses = [];

  for (const step of steps) {
    let nextX, nextY, moveDirection;

    if (step.type === 'jump') {
      const dir = DIRECTIONS[step.direction];
      const midX = catX + dir.dx;
      const midY = catY + dir.dy;
      nextX = catX + dir.dx * 2;
      nextY = catY + dir.dy * 2;
      moveDirection = step.direction;

      // La cellule intermédiaire doit être dans la grille (on ne saute pas depuis le bord)
      if (midX < 0 || midY < 0 || midX >= level.grid || midY >= level.grid) {
        await callbacks.onWall(catX, catY, step.direction);
        await callbacks.onFail();
        return;
      }
      // La cellule d'atterrissage doit être dans la grille et sans mur
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

    // Déplacement valide (saut ou pas)
    catX = nextX;
    catY = nextY;
    await callbacks.onStep(catX, catY, moveDirection);

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

  await callbacks.onIncomplete(catX, catY);
}
```

- [ ] **Step 2 : Commit**

```bash
git add js/engine.js
git commit -m "feat: handle jump step in engine (2-cell move, wall-skippable)"
```

---

## Task 3 : Styler la carte jump

**Files:**
- Modify: `style.css`

- [ ] **Step 1 : Ajouter la couleur de la carte jump**

Dans la section `/* CARDS */` de `style.css`, après `.card[data-type="repeat"]` :

```css
.card[data-type="jump"] {
  background: linear-gradient(135deg, #7EC8E3 0%, #5AAEC8 100%);
  box-shadow: 0 3px 0 0 #3A90B0, var(--shadow-sm);
}
```

- [ ] **Step 2 : Styler le select `.jump-direction`**

Ajouter juste après la règle `.repeat-count` (chercher `.repeat-count` dans le CSS). Si `.repeat-count` n'a pas de règle CSS dédiée, l'ajouter dans la section CARDS. Voici les deux règles ensemble :

```css
.repeat-count,
.jump-direction {
  background: rgba(255,255,255,0.25);
  border: none;
  border-radius: 6px;
  color: white;
  font-family: var(--font);
  font-weight: 800;
  font-size: 0.9rem;
  padding: 2px 4px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
```

- [ ] **Step 3 : Vérifier visuellement**

Si un niveau a `allowJump: true`, ouvrir le jeu et vérifier que la carte est bleue ciel avec le select direction visible et stylé.

- [ ] **Step 4 : Commit**

```bash
git add style.css
git commit -m "feat: style jump card (sky blue + direction select)"
```

---

## Task 4 : Créer le niveau 9

**Files:**
- Create: `js/levels/level-09.js`
- Modify: `js/levels/index.js`

**Design du niveau :**
- Grille 4×4 (y=0 en haut, y=3 en bas)
- Chat en (1, 3) — bas de la colonne 1
- Poisson en (1, 1) — haut de la colonne 1 (2 cases au-dessus)
- Mur en (1, 2) — bloque le chemin direct, force le saut
- Solution optimale : 1 carte `Saute ⬆️`
- Vérification : Saute ⬆️ depuis (1,3) → intermédiaire (1,2) = mur (OK) → atterrit (1,1) = poisson ✓

- [ ] **Step 1 : Créer `js/levels/level-09.js`**

```js
export default {
  name: "Le grand saut",
  grid: 4,
  cat: { x: 1, y: 3 },
  goal: { x: 1, y: 1, type: "fish" },
  walls: [{ x: 1, y: 2 }],
  bonuses: [],
  stars: { 3: 1, 2: 2, 1: Infinity },
  allowRepeat: false,
  allowJump: true,
};
```

- [ ] **Step 2 : Enregistrer dans `js/levels/index.js`**

```js
import level01 from './level-01.js';
import level02 from './level-02.js';
import level03 from './level-03.js';
import level04 from './level-04.js';
import level05 from './level-05.js';
import level06 from './level-06.js';
import level07 from './level-07.js';
import level08 from './level-08.js';
import level09 from './level-09.js';

const levels = [level01, level02, level03, level04, level05, level06, level07, level08, level09];

export default levels;
```

- [ ] **Step 3 : Tester le niveau 9 manuellement**

Ouvrir http://localhost:8080, sélectionner le niveau 9. Vérifier :
- La carte "🦘 Saute" est présente dans le bac
- Le mur est visible sur la cellule (1,2)
- Déposer une carte Saute ⬆️ dans le programme et lancer → le chat saute par-dessus le mur et atteint le poisson ✓
- Essayer Saute ⬇️ → fail (bord ou mur d'atterrissage) ✓
- Essayer Avance ⬆️ → fail (mur en (1,2)) ✓

- [ ] **Step 4 : Commit**

```bash
git add js/levels/level-09.js js/levels/index.js
git commit -m "feat: add level 9 - Le grand saut (jump intro)"
```

---

## Task 5 : Créer le niveau 10

**Files:**
- Create: `js/levels/level-10.js`
- Modify: `js/levels/index.js`

**Design du niveau :**
- Grille 4×4
- Chat en (0, 3) — bas-gauche
- Poisson en (3, 1) — droite, presque en haut
- Mur en (0, 2) — bloque le chemin direct vers le haut
- Solution optimale (3 étoiles) : `Saute ⬆️` + `Répète×3 { Droite }` = 3 cartes visuelles
- Solution naïve (2 étoiles) : `Saute ⬆️` + `Droite` + `Droite` + `Droite` = 4 cartes
- Vérification :
  - Saute ⬆️ depuis (0,3) → intermédiaire (0,2) = mur (OK) → atterrit (0,1) ✓
  - Droite ×3 : (0,1)→(1,1)→(2,1)→(3,1) = poisson ✓

- [ ] **Step 1 : Créer `js/levels/level-10.js`**

```js
export default {
  name: "Saute et avance",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 1, type: "fish" },
  walls: [{ x: 0, y: 2 }],
  bonuses: [],
  stars: { 3: 3, 2: 5, 1: Infinity },
  allowRepeat: true,
  allowJump: true,
};
```

- [ ] **Step 2 : Mettre à jour `js/levels/index.js`**

```js
import level01 from './level-01.js';
import level02 from './level-02.js';
import level03 from './level-03.js';
import level04 from './level-04.js';
import level05 from './level-05.js';
import level06 from './level-06.js';
import level07 from './level-07.js';
import level08 from './level-08.js';
import level09 from './level-09.js';
import level10 from './level-10.js';

const levels = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10];

export default levels;
```

- [ ] **Step 3 : Tester le niveau 10 manuellement**

Ouvrir http://localhost:8080, sélectionner le niveau 10. Vérifier :
- Les cartes "🦘 Saute" et "🔁 Répète" sont dans le bac
- Solution optimale : Saute ⬆️ + Répète×3{Droite} → victoire 3 étoiles ✓
- Solution naïve : Saute ⬆️ + Droite + Droite + Droite → victoire 2 étoiles ✓
- Avance ⬆️ à la place du saut → fail (mur) ✓

- [ ] **Step 4 : Commit final**

```bash
git add js/levels/level-10.js js/levels/index.js
git commit -m "feat: add level 10 - Saute et avance (jump + repeat combo)"
```
