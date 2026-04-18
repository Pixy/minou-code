# Minou Code — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un jeu web de programmation visuelle où un chat (Minou) se déplace sur une grille via des cartes drag & drop, destiné à Loulou (6 ans) sur iPad mini.

**Architecture:** Application web vanilla (HTML/CSS/JS ES Modules) avec 3 libs CDN (Lottie, SortableJS, canvas-confetti). Un orchestrateur central (`main.js`) coordonne des modules indépendants : grille, cartes, moteur d'exécution, animations, audio. Les niveaux sont des fichiers JS isolés.

**Tech Stack:** HTML5, CSS3 (Grid, animations, transitions), JavaScript ES Modules, lottie-web (CDN), SortableJS (CDN), canvas-confetti (CDN)

**Spec:** `docs/superpowers/specs/2026-03-25-minou-code-design.md`

---

## Structure des fichiers

| Fichier | Responsabilité |
|---------|---------------|
| `index.html` | Structure HTML, imports CDN, layout principal |
| `style.css` | Styles globaux, CSS Grid, animations keyframes, responsive |
| `js/main.js` | Point d'entrée, orchestration, navigation écrans, feedback, constante `PLAYER_NAME` |
| `js/grid.js` | Rendu grille, placement éléments (chat, gamelle, murs, bonus), déplacement animé du chat |
| `js/cards.js` | Drag & drop SortableJS, tray infini, zone programme, extraction du tableau d'instructions |
| `js/engine.js` | Exécution pas à pas du programme, dépliage Répète, détection victoire/échec/fin |
| `js/animations.js` | Contrôle Lottie (4 états), animations CSS complémentaires, confettis |
| `js/audio.js` | Web Audio API (pop, bip, fanfare, bonk), sons base64 (miaous) |
| `js/levels/index.js` | Import et export de tous les niveaux |
| `js/levels/level-01.js` à `level-08.js` | Données de chaque niveau |
| `assets/lottie/cat-*.json` | Fichiers Lottie (idle, walk, win, fail) |

---

## Task 1 : Scaffolding projet + Git

**Files:**
- Create: `index.html`, `style.css`, `js/main.js`

- [ ] **Step 1: Initialiser le repo git**

```bash
cd /Users/pierre.alexis/pixy/louise
git init
```

- [ ] **Step 2: Créer `index.html` avec structure de base**

HTML minimal avec imports CDN (lottie-web, SortableJS, canvas-confetti), les deux écrans (sélection + jeu) en `<section>`, et import de `js/main.js` en module.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Minou Code 🐱</title>
  <link rel="stylesheet" href="style.css">
  <!-- Libs CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
</head>
<body>
  <!-- Écran sélection niveaux -->
  <section id="screen-select" class="screen active">
    <h1>🐱 Minou Code</h1>
    <p id="welcome-message"></p>
    <div id="level-grid"></div>
  </section>

  <!-- Écran jeu -->
  <section id="screen-game" class="screen">
    <header id="game-header">
      <span id="level-title"></span>
    </header>
    <div id="game-area">
      <div id="grid-container"></div>
      <div id="right-panel">
        <div id="program-zone">
          <h2>📋 Mon programme</h2>
          <div id="program-list"></div>
        </div>
        <div id="card-tray">
          <h2>🎴 Mes cartes</h2>
          <div id="tray-cards"></div>
        </div>
      </div>
    </div>
    <footer id="action-bar">
      <button id="btn-run" disabled>🚀 C'est parti !</button>
      <button id="btn-reset">🔄 Recommencer</button>
      <button id="btn-clear">❌ Vider</button>
      <button id="btn-back">🏠</button>
    </footer>
  </section>

  <!-- Overlay feedback -->
  <div id="feedback-overlay" class="hidden">
    <div id="feedback-message"></div>
    <div id="feedback-stars"></div>
    <button id="btn-next" class="hidden">Niveau suivant ! 🚀</button>
    <button id="btn-retry" class="hidden">Réessayer 💪</button>
  </div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Créer `style.css` avec le layout de base**

Reset CSS, variables couleurs pastel, layout 2 colonnes (grille gauche + panel droit), barre d'action en bas fixe, styles écrans (`.screen` / `.screen.active`), responsive en `vmin`.

```css
/* Variables */
:root {
  --bg: #FFF8F0;
  --primary: #FF6B9D;
  --secondary: #C490E4;
  --success: #7ED957;
  --warning: #FFD93D;
  --card-up: #7ED957;
  --card-down: #FF6B6B;
  --card-left: #4ECDC4;
  --card-right: #FFB347;
  --card-repeat: #C490E4;
  --radius: 16px;
  --font: 'Segoe UI', 'SF Pro', system-ui, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  font-family: var(--font);
  font-size: 18px;
  background: var(--bg);
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

/* Écrans */
.screen { display: none; width: 100%; height: 100%; }
.screen.active { display: flex; flex-direction: column; align-items: center; justify-content: center; }

/* Écran sélection */
#screen-select h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
#screen-select p { font-size: 1.3rem; margin-bottom: 1.5rem; }
#level-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 500px;
}
.level-btn {
  width: 90px; height: 90px;
  border-radius: var(--radius);
  border: 3px solid var(--primary);
  background: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.level-btn:active { transform: scale(0.95); }
.level-btn.locked {
  opacity: 0.4;
  pointer-events: none;
  border-color: #ccc;
}
.level-btn .stars { font-size: 0.8rem; margin-top: 4px; }

/* Écran jeu — layout 2 colonnes */
#screen-game.active {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  height: 100%;
}
#game-header {
  text-align: center;
  padding: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}
#game-area {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  overflow: hidden;
  min-height: 0;
}
#grid-container {
  flex: 0 0 auto;
  aspect-ratio: 1;
  height: 100%;
  max-height: 100%;
}
#right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
#program-zone {
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: var(--radius);
  padding: 10px;
  border: 2px dashed var(--primary);
}
#program-zone h2, #card-tray h2 { font-size: 1rem; margin-bottom: 8px; }
#card-tray {
  flex: 0 0 auto;
  background: white;
  border-radius: var(--radius);
  padding: 10px;
}
#tray-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Action bar */
#action-bar {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  justify-content: center;
}
#action-bar button {
  min-height: 60px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius);
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}
#action-bar button:active { transform: scale(0.95); }
#btn-run {
  background: var(--success);
  color: white;
  flex: 2;
}
#btn-run:disabled { opacity: 0.4; cursor: default; }
#btn-reset { background: var(--warning); flex: 1; }
#btn-clear { background: #FF6B6B; color: white; flex: 0; padding: 12px 16px; }
#btn-back { background: #ddd; flex: 0; padding: 12px 16px; }

/* Cartes */
.card {
  min-height: 60px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: grab;
  border: 2px solid rgba(0,0,0,0.1);
  background: white;
  position: relative;
}
.card[data-type="up"] { background: var(--card-up); color: white; }
.card[data-type="down"] { background: var(--card-down); color: white; }
.card[data-type="left"] { background: var(--card-left); color: white; }
.card[data-type="right"] { background: var(--card-right); color: white; }
.card[data-type="repeat"] { background: var(--card-repeat); color: white; }
.card .delete-btn {
  position: absolute;
  right: 6px; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.2);
  border: none; border-radius: 50%;
  width: 28px; height: 28px;
  font-size: 14px; cursor: pointer;
  display: none;
  align-items: center; justify-content: center;
}
#program-list .card .delete-btn { display: flex; }

/* Repeat card children zone */
.repeat-children {
  min-height: 50px;
  margin: 8px 0 4px 20px;
  padding: 8px;
  border: 2px dashed rgba(255,255,255,0.5);
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
}

/* Grille */
.grid {
  display: grid;
  width: 100%; height: 100%;
  gap: 2px;
  background: #E8D5C4;
  border-radius: var(--radius);
  padding: 4px;
}
.cell {
  background: #FFFDF7;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.cell.wall {
  background: #C4A882;
  border: 2px inset #A08060;
}
.cell .goal { font-size: 2rem; }
.cell .bonus { font-size: 1.5rem; }

/* Chat container */
#cat-container {
  position: absolute;
  width: 80%; height: 80%;
  z-index: 10;
  transition: transform 0.4s ease-in-out;
}

/* Feedback overlay */
#feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  gap: 16px;
}
#feedback-overlay.hidden { display: none; }
#feedback-message {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  background: white;
  padding: 24px 40px;
  border-radius: 24px;
  max-width: 80%;
}
#feedback-stars { font-size: 2.5rem; }
#feedback-overlay button {
  min-height: 60px;
  padding: 16px 32px;
  border: none;
  border-radius: var(--radius);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}
#btn-next { background: var(--success); color: white; }
#btn-retry { background: var(--warning); }

/* Animations */
@keyframes bounce-wall {
  0% { translate: 0 0; }
  30% { translate: var(--bounce-x) var(--bounce-y); }
  60% { translate: calc(var(--bounce-x) * -0.3) calc(var(--bounce-y) * -0.3); }
  100% { translate: 0 0; }
}
@keyframes shake {
  0%, 100% { translate: 0; }
  20% { translate: -8px 0; }
  40% { translate: 8px 0; }
  60% { translate: -6px 0; }
  80% { translate: 4px 0; }
}
@keyframes hop {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}
@keyframes celebrate-spin {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
@keyframes card-snap {
  0% { scale: 1.15; }
  100% { scale: 1; }
}
@keyframes star-pop {
  0% { scale: 0; }
  70% { scale: 1.3; }
  100% { scale: 1; }
}
@keyframes bonus-collect {
  0% { scale: 1; opacity: 1; }
  50% { scale: 1.5; opacity: 0.5; }
  100% { scale: 0; opacity: 0; }
}

.anim-bounce-wall { animation: bounce-wall 0.5s ease-out; }
.anim-shake { animation: shake 0.5s ease-out; }
.anim-hop { animation: hop 0.3s ease-out; }
.anim-celebrate-spin { animation: celebrate-spin 0.8s ease-in-out; }
.anim-card-snap { animation: card-snap 0.2s ease-out; }
.anim-star-pop { animation: star-pop 0.4s ease-out backwards; }
.anim-bonus-collect { animation: bonus-collect 0.4s ease-out forwards; }

/* Responsive */
@media (max-height: 500px) {
  #game-header { padding: 4px; font-size: 1rem; }
  #action-bar { padding: 6px 8px; }
  #action-bar button { min-height: 48px; padding: 8px 16px; }
}
```

- [ ] **Step 4: Créer `js/main.js` minimal**

Structure de base avec la constante `PLAYER_NAME`, les imports futurs commentés, et l'affichage de l'écran de sélection au chargement.

```js
// Configuration
const PLAYER_NAME = 'Loulou';

// Écrans
const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Init
function init() {
  document.getElementById('welcome-message').textContent =
    `Coucou ${PLAYER_NAME} ! 🐱 Prête à aider Minou ?`;
  showScreen(screenSelect);
}

document.addEventListener('DOMContentLoaded', init);

export { PLAYER_NAME, showScreen };
```

- [ ] **Step 5: Vérifier en ouvrant dans le navigateur**

```bash
cd /Users/pierre.alexis/pixy/louise && python3 -m http.server 8080 &
```

Ouvrir `http://localhost:8080` — on doit voir l'écran d'accueil "Coucou Loulou !" sur fond pastel.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css js/main.js
git commit -m "feat: scaffolding projet Minou Code avec layout de base"
```

---

## Task 2 : Données des niveaux

**Files:**
- Create: `js/levels/level-01.js` à `js/levels/level-08.js`, `js/levels/index.js`

- [ ] **Step 1: Créer les 8 fichiers de niveaux**

Chaque fichier exporte un objet avec : `name`, `grid`, `cat`, `goal`, `walls`, `bonuses`, `stars`, `allowRepeat`.

Coordonnées : `x` = colonne (gauche→droite), `y` = ligne (haut→bas). Donc `{x:0, y:0}` = coin haut-gauche.

`level-01.js` — Ligne droite vers le haut (3 pas) :
```js
export default {
  name: "Premier pas",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 0, y: 0, type: "fish" },
  walls: [],
  bonuses: [],
  stars: { 3: 3, 2: 4, 1: Infinity },
  allowRepeat: false,
};
```

`level-02.js` — Un virage (droite puis haut) :
```js
export default {
  name: "Le virage",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 0, type: "fish" },
  walls: [],
  bonuses: [],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: false,
};
```

`level-03.js` — Zigzag (deux virages, murs qui bloquent le chemin direct) :
```js
export default {
  name: "Les zigzags",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 2, y: 0, type: "fish" },
  walls: [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
  bonuses: [],
  stars: { 3: 7, 2: 9, 1: Infinity },
  allowRepeat: false,
};
// Murs bloquent le chemin direct vers le haut et la colonne 2 en bas
// Solution optimale : →→ ↑↑ →→ ↑ = 7 pas (zigzag forcé par les murs)
// Grille :
// [ ][  ][🐟][ ]
// [🧱][ ][ ][ ]
// [🧱][ ][🧱][ ]
// [🐱][ ][🧱][ ]
```

`level-04.js` — Premier mur :
```js
export default {
  name: "Attention au mur !",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 0, type: "fish" },
  walls: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
  bonuses: [],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: false,
};
```

`level-05.js` — Grille 5×5 avec murs :
```js
export default {
  name: "Le grand terrain",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
  bonuses: [],
  stars: { 3: 8, 2: 10, 1: Infinity },
  allowRepeat: false,
};
```

`level-06.js` — Labyrinthe :
```js
export default {
  name: "Le labyrinthe",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 4, type: "fish" },
  walls: [
    { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
    { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
  ],
  bonuses: [],
  stars: { 3: 10, 2: 14, 1: Infinity },
  allowRepeat: false,
};
```

`level-07.js` — Répète nécessaire (pattern répétitif droite-haut) :
```js
export default {
  name: "Encore et encore",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "yarn" },
  walls: [],
  bonuses: [],
  stars: { 3: 4, 2: 6, 1: Infinity },
  allowRepeat: true,
};
```

`level-08.js` — Répète + bonus :
```js
export default {
  name: "La grande aventure",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
  bonuses: [{ x: 1, y: 3, type: "yarn" }, { x: 3, y: 1, type: "yarn" }],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: true,
};
```

- [ ] **Step 2: Créer `js/levels/index.js`**

```js
import level01 from './level-01.js';
import level02 from './level-02.js';
import level03 from './level-03.js';
import level04 from './level-04.js';
import level05 from './level-05.js';
import level06 from './level-06.js';
import level07 from './level-07.js';
import level08 from './level-08.js';

const levels = [level01, level02, level03, level04, level05, level06, level07, level08];

export default levels;
```

- [ ] **Step 3: Commit**

```bash
git add js/levels/
git commit -m "feat: ajout des 8 niveaux avec progression"
```

---

## Task 3 : Rendu de la grille + écran de sélection

**Files:**
- Create: `js/grid.js`
- Modify: `js/main.js`

- [ ] **Step 1: Créer `js/grid.js`**

Module qui expose : `renderGrid(level, container)` pour dessiner la grille CSS Grid avec les cases, murs, gamelle et bonus. Expose aussi `getCellElement(x, y)` pour récupérer une case.

```js
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
```

- [ ] **Step 2: Mettre à jour `js/main.js` — écran de sélection + lancement de niveau**

Ajouter les imports, la génération des boutons de niveaux (avec gestion du verrouillage/étoiles via localStorage), et le lancement d'un niveau qui affiche la grille.

```js
import levels from './levels/index.js';
import { renderGrid } from './grid.js';

const PLAYER_NAME = 'Loulou';

const screenSelect = document.getElementById('screen-select');
const screenGame = document.getElementById('screen-game');
const gridContainer = document.getElementById('grid-container');
const levelTitle = document.getElementById('level-title');
const levelGrid = document.getElementById('level-grid');

let currentLevelIndex = 0;

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Sauvegarde localStorage
function getSave() {
  const raw = localStorage.getItem('minou-code-save');
  return raw ? JSON.parse(raw) : { unlocked: 1, stars: {} };
}

function saveSave(save) {
  localStorage.setItem('minou-code-save', JSON.stringify(save));
}

// Écran sélection
function renderLevelSelect() {
  const save = getSave();
  levelGrid.innerHTML = '';

  levels.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const num = i + 1;

    if (num > save.unlocked) {
      btn.classList.add('locked');
      btn.innerHTML = `🔒`;
    } else {
      const starCount = save.stars[num] || 0;
      const starsStr = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);
      btn.innerHTML = `<span>${num}</span><span class="stars">${starCount > 0 ? starsStr : ''}</span>`;
      btn.addEventListener('click', () => startLevel(i));
    }

    levelGrid.appendChild(btn);
  });
}

// Lancer un niveau
function startLevel(index) {
  currentLevelIndex = index;
  const level = levels[index];
  levelTitle.textContent = `🐱 Niveau ${index + 1} : "${level.name}"`;

  renderGrid(level, gridContainer);
  showScreen(screenGame);
}

// Bouton retour
document.getElementById('btn-back').addEventListener('click', () => {
  renderLevelSelect();
  showScreen(screenSelect);
});

// Init
function init() {
  document.getElementById('welcome-message').textContent =
    `Coucou ${PLAYER_NAME} ! 🐱 Prête à aider Minou ?`;
  renderLevelSelect();
  showScreen(screenSelect);
}

document.addEventListener('DOMContentLoaded', init);

export { PLAYER_NAME, showScreen, currentLevelIndex, getSave, saveSave };
```

- [ ] **Step 3: Vérifier dans le navigateur**

Ouvrir `http://localhost:8080`. L'écran de sélection doit afficher 8 boutons (seul le 1 est débloqué). Cliquer sur le niveau 1 doit afficher la grille 4×4 avec la gamelle 🐟 en haut à gauche.

- [ ] **Step 4: Commit**

```bash
git add js/grid.js js/main.js
git commit -m "feat: rendu grille CSS Grid et écran de sélection des niveaux"
```

---

## Task 4 : Système de cartes et drag & drop

**Files:**
- Create: `js/cards.js`
- Modify: `js/main.js`

- [ ] **Step 1: Créer `js/cards.js`**

Module qui expose : `initCards(level)` pour initialiser le tray et la zone programme avec SortableJS, et `getProgram()` pour extraire le tableau d'instructions structuré. Gère : tray infini (clone au drag), réordonnement dans programme, suppression par bouton ❌, carte Répète avec sous-zone droppable, blocage du Répète imbriqué.

```js
let programSortable = null;
let traySortable = null;

const CARD_TYPES = {
  up:     { emoji: '⬆️', label: 'Avance' },
  down:   { emoji: '⬇️', label: 'Recule' },
  left:   { emoji: '⬅️', label: 'Gauche' },
  right:  { emoji: '➡️', label: 'Droite' },
  repeat: { emoji: '🔁', label: 'Répète' },
};

function createCardElement(type) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.type = type;

  if (type === 'repeat') {
    card.innerHTML = `
      <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label} ×</span>
      <select class="repeat-count">
        ${[1,2,3,4,5].map(n => `<option value="${n}"${n===2?' selected':''}>${n}</option>`).join('')}
      </select>
      <button class="delete-btn">❌</button>
      <div class="repeat-children" data-repeat-zone></div>
    `;
    // Init sortable on children zone after DOM insertion
    requestAnimationFrame(() => {
      const childZone = card.querySelector('[data-repeat-zone]');
      if (childZone) {
        new Sortable(childZone, {
          group: { name: 'program', put: (to, from, el) => el.dataset.type !== 'repeat' },
          animation: 200,
          onAdd: onCardAdded,
        });
      }
    });
  } else {
    card.innerHTML = `
      <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label}</span>
      <button class="delete-btn">❌</button>
    `;
  }

  // Delete button
  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    card.remove();
    updateRunButton();
  });

  return card;
}

function reinitCardListeners(card) {
  // Re-attacher le delete button (perdu lors du clone SortableJS)
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.replaceWith(deleteBtn.cloneNode(true)); // Reset listeners
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      card.remove();
      updateRunButton();
    });
  }

  // Si carte Repeat, réinitialiser le Sortable sur la zone enfant
  if (card.dataset.type === 'repeat') {
    const childZone = card.querySelector('[data-repeat-zone]');
    if (childZone) {
      new Sortable(childZone, {
        group: { name: 'program', put: (to, from, el) => el.dataset.type !== 'repeat' },
        animation: 200,
        onAdd: onCardAdded,
      });
    }
  }
}

function onCardAdded(evt) {
  const el = evt.item;
  reinitCardListeners(el);
  el.classList.add('anim-card-snap');
  el.addEventListener('animationend', () => el.classList.remove('anim-card-snap'), { once: true });
  // Dispatch event pour le son pop
  document.dispatchEvent(new CustomEvent('card-dropped'));
  updateRunButton();
}

function updateRunButton() {
  const programList = document.getElementById('program-list');
  const btnRun = document.getElementById('btn-run');
  btnRun.disabled = programList.children.length === 0;
}

export function initCards(level) {
  const trayContainer = document.getElementById('tray-cards');
  const programList = document.getElementById('program-list');

  trayContainer.innerHTML = '';
  programList.innerHTML = '';

  // Cartes disponibles
  const availableTypes = ['up', 'down', 'left', 'right'];
  if (level.allowRepeat) availableTypes.push('repeat');

  availableTypes.forEach(type => {
    trayContainer.appendChild(createCardElement(type));
  });

  // Sortable tray — clone
  if (traySortable) traySortable.destroy();
  traySortable = new Sortable(trayContainer, {
    group: { name: 'program', pull: 'clone', put: false },
    sort: false,
    animation: 200,
  });

  // Sortable programme
  if (programSortable) programSortable.destroy();
  programSortable = new Sortable(programList, {
    group: { name: 'program', put: true },
    animation: 200,
    filter: '.repeat-count', // Empêche le drag quand on clique sur le sélecteur
    preventOnFilter: true,    // Empêche le drag sur le select, permet l'interaction native
    onAdd: onCardAdded,
    onSort: updateRunButton,
  });

  updateRunButton();
}

export function getProgram() {
  const programList = document.getElementById('program-list');
  return parseCards(programList);
}

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
    } else {
      instructions.push({ type });
    }
  }
  return instructions;
}

export function clearProgram() {
  document.getElementById('program-list').innerHTML = '';
  updateRunButton();
}

export function countVisualCards() {
  const programList = document.getElementById('program-list');
  return countCards(programList);
}

function countCards(container) {
  let count = 0;
  for (const card of container.children) {
    if (!card.classList.contains('card')) continue;
    count++;
    if (card.dataset.type === 'repeat') {
      const childZone = card.querySelector('[data-repeat-zone]');
      count += countCards(childZone);
    }
  }
  return count;
}
```

- [ ] **Step 2: Intégrer dans `js/main.js`**

Ajouter l'import de `cards.js`, appeler `initCards(level)` dans `startLevel()`, brancher les boutons Recommencer et Vider.

Ajouter en haut :
```js
import { initCards, clearProgram } from './cards.js';
```

Dans `startLevel()`, après `renderGrid(...)` :
```js
initCards(level);
```

Ajouter les event listeners :
```js
document.getElementById('btn-reset').addEventListener('click', () => {
  const level = levels[currentLevelIndex];
  renderGrid(level, gridContainer);
  // Réinit le chat mais garde le programme
});

document.getElementById('btn-clear').addEventListener('click', () => {
  clearProgram();
});
```

- [ ] **Step 3: Vérifier le drag & drop dans le navigateur**

Ouvrir niveau 1 : les 4 cartes directionnelles sont dans le tray. Vérifier qu'on peut :
- Drag une carte du tray vers "Mon programme" (l'originale reste)
- Réordonner les cartes dans le programme
- Supprimer une carte avec ❌
- Le bouton "C'est parti !" se grise/dégrise correctement

Ouvrir niveau 7 : la carte 🔁 Répète doit apparaître dans le tray. Vérifier qu'on peut y glisser des cartes directionnelles mais PAS un autre Répète.

- [ ] **Step 4: Commit**

```bash
git add js/cards.js js/main.js
git commit -m "feat: cartes d'instructions avec drag & drop SortableJS"
```

---

## Task 5 : Moteur d'exécution

**Files:**
- Create: `js/engine.js`
- Modify: `js/main.js`

- [ ] **Step 1: Créer `js/engine.js`**

Module qui expose `executeProgram(program, level, callbacks)`. Exécute pas à pas avec des `await` et un délai de 500ms entre chaque pas. Callbacks : `onStep(x, y, direction)`, `onWall(x, y, direction)`, `onBonus(x, y)`, `onWin(bonusCollected)`, `onFail()`, `onIncomplete(x, y)`.

```js
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
```

- [ ] **Step 2: Brancher le moteur dans `js/main.js`**

Ajouter les imports, brancher le bouton "C'est parti !" pour récupérer le programme via `getProgram()`, puis exécuter avec `executeProgram()`. Les callbacks appellent `grid.js` pour déplacer visuellement le chat (pour l'instant juste un emoji 🐱 dans la case) et affichent les messages de feedback.

Ajouter l'import :
```js
import { executeProgram } from './engine.js';
import { getProgram, countVisualCards } from './cards.js';
import { getCellElement } from './grid.js';
```

Variables d'état :
```js
let isRunning = false;
let catPosition = { x: 0, y: 0 };
```

Placer le chat au démarrage du niveau (dans `startLevel`) :
```js
catPosition = { ...level.cat };
placeCat(catPosition.x, catPosition.y);
```

Fonctions de placement du chat (emoji temporaire, Lottie viendra après) :
```js
function placeCat(x, y) {
  // Retirer l'ancien chat
  const old = document.querySelector('.cat-emoji');
  if (old) old.remove();

  const cell = getCellElement(x, y);
  if (cell) {
    const cat = document.createElement('span');
    cat.className = 'cat-emoji';
    cat.textContent = '🐱';
    cat.style.fontSize = '2rem';
    cell.appendChild(cat);
  }
}
```

Handler du bouton Run (remet toujours le chat au départ avant d'exécuter) :
```js
document.getElementById('btn-run').addEventListener('click', async () => {
  if (isRunning) return;
  isRunning = true;
  document.getElementById('btn-run').disabled = true;

  const level = levels[currentLevelIndex];
  const program = getProgram();

  // Reset position
  catPosition = { ...level.cat };
  renderGrid(level, gridContainer);
  placeCat(catPosition.x, catPosition.y);

  await executeProgram(program, level, {
    onStep: async (x, y, direction) => {
      placeCat(x, y);
      catPosition = { x, y };
    },
    onWall: async (x, y, direction) => {
      // Shake le chat
      const catEl = document.querySelector('.cat-emoji');
      if (catEl) {
        catEl.classList.add('anim-shake');
      }
    },
    onBonus: async (x, y) => {
      const bonusEl = document.getElementById(`bonus-${x}-${y}`);
      if (bonusEl) {
        bonusEl.classList.add('anim-bonus-collect');
      }
    },
    onWin: async (bonusCount) => {
      showFeedback('win', bonusCount);
    },
    onFail: async () => {
      showFeedback('fail');
    },
    onIncomplete: async (x, y) => {
      showFeedback('incomplete');
    },
  });

  isRunning = false;
  document.getElementById('btn-run').disabled = false;
});
```

Feedback basique (sera enrichi après) :
```js
const WIN_MESSAGES = [
  `OUIIIII ! Bravo ${PLAYER_NAME} ! 🐱🎉`,
  `${PLAYER_NAME} la championne ! 🏆✨`,
  `Minou te fait un gros câlin ${PLAYER_NAME} ! 🐱❤️`,
  `Le poisson n'avait aucune chance ${PLAYER_NAME} ! 🐟💨`,
  `Génie absolu détecté : ${PLAYER_NAME} ! 🧠✨`,
  `Minou te dit MIAOU DU TONNERRE ${PLAYER_NAME} ! ⚡🐱`,
  `T'es trop forte ${PLAYER_NAME} ! 💪🌟`,
  `${PLAYER_NAME} + Minou = équipe de choc ! 🐱🚀`,
  `Minou est trop content grâce à toi ${PLAYER_NAME} ! 😻`,
  `Woooow ${PLAYER_NAME}, c'était parfait ! 🎯✨`,
];

const FAIL_MESSAGES = [
  `T'inquiète ${PLAYER_NAME}, tu vas y arriver ! 💪`,
  `Minou croit en toi ${PLAYER_NAME} ! 🐱🌟`,
  `Aïe aïe aïe ! Le mur a gagné cette fois 😹`,
  `Oups ! Le poisson rigole là 🐟😂`,
  `Ce mur est vraiment mal élevé ! 😤`,
  `Essaie encore ${PLAYER_NAME}, Minou ne lâche pas ! 🐱❤️`,
  `Presque ${PLAYER_NAME} ! Encore un petit effort ! 🌈`,
  `Minou s'est cogné mais il va bien ! 😹💫`,
  `Le chemin est par là... ou pas 🤔😸`,
  `Allez ${PLAYER_NAME}, on recommence ! 🔄✨`,
];

const INCOMPLETE_MESSAGES = [
  `Hmm... Minou n'est pas encore arrivé ! Il manque des pas ${PLAYER_NAME} 🐱🤔`,
  `Minou attend... il lui faut plus de cartes ${PLAYER_NAME} ! 📋`,
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showFeedback(type, bonusCount = 0) {
  const overlay = document.getElementById('feedback-overlay');
  const messageEl = document.getElementById('feedback-message');
  const starsEl = document.getElementById('feedback-stars');
  const btnNext = document.getElementById('btn-next');
  const btnRetry = document.getElementById('btn-retry');

  overlay.classList.remove('hidden');
  starsEl.textContent = '';
  btnNext.classList.add('hidden');
  btnRetry.classList.add('hidden');

  if (type === 'win') {
    messageEl.textContent = randomFrom(WIN_MESSAGES);

    // Calcul étoiles
    const level = levels[currentLevelIndex];
    const cardCount = countVisualCards();
    let starCount = 1;
    if (cardCount <= level.stars[2]) starCount = 2;
    if (cardCount <= level.stars[3]) starCount = 3;

    // Bonus étoile
    const totalBonuses = level.bonuses.length;
    if (totalBonuses > 0 && bonusCount >= totalBonuses && starCount < 3) {
      starCount++;
    }

    starsEl.textContent = '⭐'.repeat(starCount);

    // Sauvegarder
    const save = getSave();
    const num = currentLevelIndex + 1;
    save.stars[num] = Math.max(save.stars[num] || 0, starCount);
    if (num >= save.unlocked) save.unlocked = num + 1;
    saveSave(save);

    // Fanfare uniquement pour 3 étoiles
    if (starCount === 3) playFanfare();

    btnNext.classList.remove('hidden');
    btnNext.onclick = () => {
      if (currentLevelIndex + 1 < levels.length) {
        // Message de transition affiché dans l'overlay (qui reste visible)
        const TRANSITION_MESSAGES = [
          `Allez ${PLAYER_NAME}, on continue ! 🚀`,
          `Niveau suivant ${PLAYER_NAME}, c'est parti ! 🐱💨`,
        ];
        messageEl.textContent = randomFrom(TRANSITION_MESSAGES);
        starsEl.textContent = '';
        btnNext.classList.add('hidden');
        btnRetry.classList.add('hidden');
        // Attendre 800ms puis cacher l'overlay et lancer le niveau
        setTimeout(() => {
          overlay.classList.add('hidden');
          startLevel(currentLevelIndex + 1);
        }, 800);
      } else {
        overlay.classList.add('hidden');
        renderLevelSelect();
        showScreen(screenSelect);
      }
    };
  } else {
    messageEl.textContent = type === 'fail' ? randomFrom(FAIL_MESSAGES) : randomFrom(INCOMPLETE_MESSAGES);
    btnRetry.classList.remove('hidden');
    btnRetry.onclick = () => {
      overlay.classList.add('hidden');
    };
  }
}
```

- [ ] **Step 3: Vérifier l'exécution dans le navigateur**

Ouvrir niveau 1 : placer 3 cartes ⬆️ → cliquer "C'est parti !" → le chat (🐱 emoji) doit monter case par case → message de victoire → étoiles → bouton niveau suivant.

Tester aussi : mur (niveau 4), programme incomplet, programme vide (bouton grisé).

- [ ] **Step 4: Commit**

```bash
git add js/engine.js js/main.js
git commit -m "feat: moteur d'exécution pas à pas avec feedback de victoire/échec"
```

---

## Task 6 : Animations Lottie du chat

**Files:**
- Create: `js/animations.js`, `assets/lottie/` (fichiers JSON)
- Modify: `js/main.js`

- [ ] **Step 1: Sourcer les animations Lottie**

Chercher sur LottieFiles (https://lottiefiles.com) des animations de chat gratuites. On a besoin de 4 fichiers :
- `cat-idle.json` — chat au repos (queue qui bouge, cligne des yeux)
- `cat-walk.json` — chat qui marche
- `cat-win.json` — chat qui danse / saute de joie
- `cat-fail.json` — chat surpris / triste

Télécharger les JSON et les placer dans `assets/lottie/`. Si un état n'est pas trouvable, on utilisera l'idle avec une animation CSS en complément.

Note : vérifier que les licences sont libres d'utilisation (la plupart sur LottieFiles le sont).

- [ ] **Step 2: Créer `js/animations.js`**

Module qui gère le player Lottie : `initCatAnimation(container)`, `playState(state)` (idle/walk/win/fail), `moveCatTo(x, y, direction, gridElement)` pour animer le déplacement, et les animations CSS complémentaires.

```js
let lottiePlayer = null;
let catContainer = null;
let currentState = 'idle';

const STATES = {
  idle: { path: 'assets/lottie/cat-idle.json', loop: true },
  walk: { path: 'assets/lottie/cat-walk.json', loop: true },
  win:  { path: 'assets/lottie/cat-win.json', loop: false },
  fail: { path: 'assets/lottie/cat-fail.json', loop: false },
};

export function initCatAnimation(gridContainerEl) {
  // Créer le conteneur du chat
  catContainer = document.createElement('div');
  catContainer.id = 'cat-container';
  gridContainerEl.querySelector('.grid').appendChild(catContainer);

  playState('idle');
  return catContainer;
}

export function playState(state) {
  if (currentState === state && lottiePlayer) return;
  currentState = state;

  if (lottiePlayer) {
    lottiePlayer.destroy();
  }

  const config = STATES[state];
  lottiePlayer = lottie.loadAnimation({
    container: catContainer,
    renderer: 'svg',
    loop: config.loop,
    autoplay: true,
    path: config.path,
  });

  if (!config.loop) {
    lottiePlayer.addEventListener('complete', () => {
      playState('idle');
    });
  }
}

export function positionCatOnCell(x, y, gridElement) {
  // requestAnimationFrame garantit que le layout est calculé après showScreen()
  requestAnimationFrame(() => {
    const cell = gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell || !catContainer) return;

    const gridRect = gridElement.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();

    const offsetX = cellRect.left - gridRect.left + (cellRect.width * 0.1);
    const offsetY = cellRect.top - gridRect.top + (cellRect.height * 0.1);

    catContainer.style.width = `${cellRect.width * 0.8}px`;
    catContainer.style.height = `${cellRect.height * 0.8}px`;
    catContainer.style.position = 'absolute';
    catContainer.style.left = `${offsetX}px`;
    catContainer.style.top = `${offsetY}px`;
    catContainer.style.transition = 'none';
  });
}

export async function moveCatTo(x, y, direction, gridElement) {
  const cell = gridElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell || !catContainer) return;

  // Flip horizontal si on va à gauche
  catContainer.style.transform = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

  const gridRect = gridElement.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  const offsetX = cellRect.left - gridRect.left + (cellRect.width * 0.1);
  const offsetY = cellRect.top - gridRect.top + (cellRect.height * 0.1);

  catContainer.style.transition = 'left 0.4s ease-in-out, top 0.4s ease-in-out';
  catContainer.style.left = `${offsetX}px`;
  catContainer.style.top = `${offsetY}px`;

  // Hop animation
  catContainer.classList.add('anim-hop');
  await new Promise(resolve => setTimeout(resolve, 400));
  catContainer.classList.remove('anim-hop');
}

export function playBounceWall(direction) {
  const bounceMap = {
    up:    { x: '0px', y: '-15px' },
    down:  { x: '0px', y: '15px' },
    left:  { x: '-15px', y: '0px' },
    right: { x: '15px', y: '0px' },
  };
  const bounce = bounceMap[direction];
  catContainer.style.setProperty('--bounce-x', bounce.x);
  catContainer.style.setProperty('--bounce-y', bounce.y);
  catContainer.classList.add('anim-bounce-wall');
  catContainer.addEventListener('animationend', () => {
    catContainer.classList.remove('anim-bounce-wall');
  }, { once: true });
}

export function playCelebrate() {
  catContainer.classList.add('anim-celebrate-spin');
  catContainer.addEventListener('animationend', () => {
    catContainer.classList.remove('anim-celebrate-spin');
  }, { once: true });
}

export function fireConfetti(threeStars = false) {
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
```

- [ ] **Step 3: Intégrer Lottie dans `js/main.js`**

Remplacer le système emoji par le système Lottie. Modifier `startLevel()` pour appeler `initCatAnimation()` + `positionCatOnCell()`. Modifier les callbacks d'exécution pour utiliser `moveCatTo()`, `playState()`, `playBounceWall()`, `playCelebrate()`, `fireConfetti()`.

Retirer les fonctions `placeCat()` et le `.cat-emoji`.

**Modifier le handler du bouton Run** pour re-init Lottie avant chaque exécution :
```js
// Dans le handler btn-run, remplacer le reset emoji par :
renderGrid(level, gridContainer);
initCatAnimation(gridContainer);
positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
catPosition = { ...level.cat };
```

**Modifier `startLevel()`** de la même manière :
```js
renderGrid(level, gridContainer);
initCards(level);
showScreen(screenGame);
initCatAnimation(gridContainer);
positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
catPosition = { ...level.cat };
```

Remplacer les callbacks par :

```js
onStep: async (x, y, direction) => {
  playState('walk');
  await moveCatTo(x, y, direction, gridContainer.querySelector('.grid'));
  catPosition = { x, y };
},
onWall: async (x, y, direction) => {
  playBounceWall(direction);
  playState('fail');
  await new Promise(r => setTimeout(r, 600));
},
onBonus: async (x, y) => {
  const bonusEl = document.getElementById(`bonus-${x}-${y}`);
  if (bonusEl) bonusEl.classList.add('anim-bonus-collect');
},
onWin: async (bonusCount) => {
  playState('win');
  playCelebrate();
  const starCount = calculateStars(bonusCount);
  fireConfetti(starCount === 3);
  await new Promise(r => setTimeout(r, 800));
  showFeedback('win', bonusCount);
},
onFail: async () => {
  await new Promise(r => setTimeout(r, 800));
  showFeedback('fail');
},
onIncomplete: async (x, y) => {
  playState('idle');
  showFeedback('incomplete');
},
```

- [ ] **Step 4: Vérifier les animations dans le navigateur**

Ouvrir niveau 1 : le chat Lottie doit être visible dans sa case, en idle. Exécuter le programme : l'animation walk doit jouer pendant le déplacement, flip horizontal quand il va à gauche, danse de victoire + confettis en cas de succès.

- [ ] **Step 5: Commit**

```bash
git add js/animations.js assets/lottie/ js/main.js
git commit -m "feat: animations Lottie du chat avec confettis et rebond mur"
```

---

## Task 7 : Audio

**Files:**
- Create: `js/audio.js`
- Modify: `js/main.js`

- [ ] **Step 1: Créer `js/audio.js`**

Module Web Audio API avec sons synthétiques + miaous base64. Expose : `initAudio()` (à appeler après premier clic), `playPop()`, `playStep()`, `playFanfare()`, `playBonk()`, `playMeowHappy()`, `playMeowSad()`.

```js
let audioCtx = null;
let initialized = false;

export function initAudio() {
  if (initialized) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  initialized = true;
}

function ensureContext() {
  if (!audioCtx) initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playPop() {
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

export function playStep() {
  playTone(440, 0.1, 'sine', 0.15);
}

export function playBonk() {
  playTone(100, 0.3, 'sawtooth', 0.4);
}

export function playFanfare() {
  ensureContext();
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.3), i * 200);
  });
}

// Miaou synthétique (fallback si pas de base64)
export function playMeowHappy() {
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

export function playMeowSad() {
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
}
```

- [ ] **Step 2: Intégrer l'audio dans `js/main.js`**

Ajouter les imports et appeler les sons aux bons moments :
- `initAudio()` au premier clic sur un bouton de niveau
- `playStep()` dans `onStep`
- `playBonk()` + `playMeowSad()` dans `onWall`
- `playPop()` via le Custom Event `card-dropped` émis par `cards.js`
- `playMeowHappy()` dans `onWin`
- `playFanfare()` dans `onWin` **uniquement si 3 étoiles**

```js
import { initAudio, playStep, playBonk, playMeowHappy, playMeowSad, playFanfare, playPop } from './audio.js';
```

Dans `startLevel()` :
```js
initAudio(); // Safe to call multiple times
```

Écouter le Custom Event pour le son pop au drop de carte :
```js
document.addEventListener('card-dropped', () => playPop());
```

Dans les callbacks :
```js
onStep: async (x, y, direction) => {
  playStep();
  // ... reste du code
},
onWall: async (x, y, direction) => {
  playBonk();
  // ... animations
  playMeowSad();
},
onWin: async (bonusCount) => {
  playMeowHappy();
  // playFanfare() sera appelé dans showFeedback si 3 étoiles
  // ... animations + feedback
},
```

- [ ] **Step 3: Vérifier les sons dans le navigateur**

Tester sur ordinateur et sur iPad (via réseau local). Vérifier que les sons se déclenchent bien à chaque action.

- [ ] **Step 4: Commit**

```bash
git add js/audio.js js/main.js
git commit -m "feat: effets sonores Web Audio API (pop, bip, bonk, miaous)"
```

---

## Task 8 : Polish, étoiles animées, responsive final

**Files:**
- Modify: `style.css`, `js/main.js`, `js/animations.js`

- [ ] **Step 1: Étoiles animées dans le feedback de victoire**

Dans `showFeedback('win')`, afficher les étoiles une par une avec un délai et l'animation `star-pop`. Dans `js/main.js` :

```js
// Dans showFeedback, après calcul des étoiles :
starsEl.innerHTML = '';
for (let i = 0; i < starCount; i++) {
  const star = document.createElement('span');
  star.textContent = '⭐';
  star.className = 'anim-star-pop';
  star.style.animationDelay = `${i * 0.3}s`;
  starsEl.appendChild(star);
}
```

- [ ] **Step 2: Tester sur iPad mini via réseau local**

Trouver l'IP locale :
```bash
ipconfig getifaddr en0
```

Sur iPad, ouvrir `http://<IP>:8080`. Vérifier :
- Drag & drop tactile fluide
- Taille des boutons et cartes (≥60px)
- Grille bien proportionnée
- Animations Lottie
- Sons

- [ ] **Step 3: Ajustements responsive si nécessaire**

Ajuster les tailles, gaps, et paddings dans `style.css` pour l'iPad mini si des problèmes sont identifiés.

- [ ] **Step 4: Commit**

```bash
git add style.css js/main.js js/animations.js
git commit -m "feat: étoiles animées, polish responsive iPad mini"
```

---

## Task 9 : Bouton recommencer et reset propre

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Implémenter le reset propre**

Le bouton "Recommencer" remet le chat à sa position de départ et re-rend la grille (pour remettre les bonus) mais conserve le programme. Arrête aussi l'exécution en cours si applicable.

Ajouter un flag `abortExecution` dans `engine.js` ou simplement re-rendre la grille et repositionner le chat :

```js
document.getElementById('btn-reset').addEventListener('click', () => {
  if (isRunning) return; // On ne reset pas pendant l'exécution
  const level = levels[currentLevelIndex];
  renderGrid(level, gridContainer);
  initCatAnimation(gridContainer);
  positionCatOnCell(level.cat.x, level.cat.y, gridContainer.querySelector('.grid'));
  catPosition = { ...level.cat };
});
```

- [ ] **Step 2: Tester le flow complet**

- Niveau 1 : succès → étoiles → niveau suivant
- Niveau 4 : mur → message encourageant → réessayer → modifier programme → succès
- Recommencer : chat revient au départ, programme conservé
- Vider : programme vidé, bouton "C'est parti" grisé

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: bouton recommencer avec reset propre du chat"
```

---

## Récapitulatif des tâches

| # | Tâche | Fichiers | Dépendance |
|---|-------|----------|------------|
| 1 | Scaffolding | `index.html`, `style.css`, `js/main.js` | — |
| 2 | Niveaux | `js/levels/*.js` | — |
| 3 | Grille + sélection | `js/grid.js`, `js/main.js` | 1, 2 |
| 4 | Cartes & drag & drop | `js/cards.js`, `js/main.js` | 1, 3 |
| 5 | Moteur d'exécution | `js/engine.js`, `js/main.js` | 3, 4 |
| 6 | Animations Lottie | `js/animations.js`, `assets/lottie/`, `js/main.js` | 3, 5 |
| 7 | Audio | `js/audio.js`, `js/main.js` | 5 |
| 8 | Polish & responsive | `style.css`, `js/main.js` | 6, 7 |
| 9 | Reset & flow final | `js/main.js` | 5, 6 |

**Tâches parallélisables :** 1+2 (indépendantes, pas de fichier commun)

**⚠️ Tasks 6 et 7 modifient toutes les deux `js/main.js`** — elles doivent être exécutées séquentiellement (6 puis 7) pour éviter les conflits de merge. En revanche, `js/audio.js` et `js/animations.js` sont des modules indépendants qui peuvent être écrits en parallèle avant l'intégration dans `main.js`.

**Limitation connue :** Le bouton "Recommencer" est désactivé pendant l'exécution (`isRunning`). Un enfant ne peut pas interrompre un programme en cours — il doit attendre la fin. C'est acceptable vu la durée courte des programmes (~2-4 secondes max). Si besoin, un mécanisme d'abort pourra être ajouté en v2.
