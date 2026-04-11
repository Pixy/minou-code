# Design — Mécanique Pick up + Niveaux 11-13

## Contexte

Louise (6 ans) a terminé les 10 premiers niveaux et maîtrise le jump. On introduit une nouvelle mécanique **pick up** (ramassage obligatoire) avec 3 niveaux progressifs.

## Mécanique "Pick up"

### Concept

Le niveau contient des objets obligatoires (clé 🔑). Le but est verrouillé (🔒) tant que tous les objets ne sont pas ramassés. Quand le chat passe sur un objet, il le collecte. Une fois tous collectés, le but se déverrouille visuellement (🔒 → 🐟/🧶).

### Données (level definition)

Nouveau champ `pickups` dans la définition d'un niveau :

```js
pickups: [{ x: 2, y: 1, type: 'key' }]
```

- `type: 'key'` pour l'instant (extensible plus tard)
- Sémantiquement différent de `bonuses` : les pickups sont **obligatoires**, les bonuses sont optionnels

### Engine

- Au passage sur un pickup → marquer comme collecté, appeler `onPickup` callback
- Quand tous les pickups sont collectés → mettre à jour le but visuellement (callback `onAllPickupsCollected`)
- À l'arrivée sur le but :
  - Tous pickups collectés → `onWin` (victoire)
  - Pickups manquants → **bump** (comme un mur) + callback `onGoalLocked`
- Le but verrouillé agit comme un **mur** si les pickups ne sont pas tous ramassés

### Aucune nouvelle carte

La mécanique pickup ne nécessite aucune nouvelle carte. On utilise les mêmes mouvements (up/down/left/right/jump/repeat). C'est le niveau qui ajoute la contrainte, pas le joueur.

### Visuel & Animations

#### Case pickup (clé 🔑)
- Emoji 🔑 affiché sur la case
- Animation idle : glow doré pulsant (`@keyframes key-glow`) pour attirer l'attention
- Collection : la clé fait un **spin + zoom** puis s'envole vers le cadenas du but
  - Implémentation : animation CSS `key-collect` (scale up + translate vers le but + fade out)

#### Case but verrouillé (🔒)
- Affiche 🔒 au lieu de l'emoji du but (🐟/🧶)
- Quand tous les pickups sont collectés :
  - Le cadenas **tremble** (`@keyframes lock-shake`)
  - Puis se casse/explose avec particules ✨ (`@keyframes lock-break`)
  - L'emoji du but apparaît avec un **bounce** (`@keyframes goal-appear`)

#### Arrivée au but sans les clés
- Le cadenas **secoue** (wiggle animation)
- Le chat fait un bump doux (réutilise l'animation bump existante)
- Pas de son d'échec dur — juste le bonk existant

#### Lien visuel clé → cadenas
- Léger scintillement / particules entre la clé et le but (optionnel, si ça alourdit pas trop)

## Niveaux

### Niveau 11 — "La clé magique" 🔑

Tutoriel de la mécanique pick up. Ultra simple, aucun piège sauf aller direct au but.

```
  0   1   2   3
0 .   .   .   🔒
1 .   .   🔑  .
2 .   .   .   .
3 🐱  .   .   .
```

| Propriété | Valeur |
|-----------|--------|
| Grille | 4×4 |
| Chat | (0, 3) |
| But | (3, 0) type fish |
| Pickups | 1 clé en (2, 1) |
| Murs | Aucun |
| Bonuses | Aucun |
| Mécaniques | Mouvement de base uniquement |
| ⭐⭐⭐ | ≤ 6 cartes |
| ⭐⭐ | ≤ 8 cartes |

Chemin optimal : ➡️➡️⬆️⬆️⬆️➡️ (6 cartes).

### Niveau 12 — "Le coffre au trésor" 🗝️

2 clés, grille 5×5, murs forçant un détour par les côtés. Repeat disponible pour optimiser.

```
  0   1   2   3   4
0 .   .   .   .   🔒
1 .   🧱  🧱  .   .
2 🔑  .   .   .   🔑
3 .   🧱  🧱  .   .
4 🐱  .   .   .   .
```

| Propriété | Valeur |
|-----------|--------|
| Grille | 5×5 |
| Chat | (0, 4) |
| But | (4, 0) type fish |
| Pickups | 2 clés en (0, 2) et (4, 2) |
| Murs | (1,1), (2,1), (1,3), (2,3) |
| Bonuses | Aucun |
| Mécaniques | Mouvement + repeat |
| ⭐⭐⭐ | ≤ 10 cartes |
| ⭐⭐ | ≤ 13 cartes |

### Niveau 13 — "Saute et ramasse !" 🦘🔑

1 clé derrière un mur horizontal, il faut sauter pour y accéder. Combine jump + pick up.

```
  0   1   2   3   4
0 .   .   .   .   🔒
1 .   🧱  🧱  🧱  .
2 .   🔑  .   .   .
3 .   .   .   🧱  .
4 🐱  .   .   .   .
```

| Propriété | Valeur |
|-----------|--------|
| Grille | 5×5 |
| Chat | (0, 4) |
| But | (4, 0) type fish |
| Pickups | 1 clé en (1, 2) |
| Murs | (1,1), (2,1), (3,1), (3,3) |
| Bonuses | Aucun |
| Mécaniques | Mouvement + jump + repeat |
| ⭐⭐⭐ | ≤ 8 cartes |
| ⭐⭐ | ≤ 11 cartes |

## Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| `js/levels/level11.js` | Nouveau — définition niveau 11 |
| `js/levels/level12.js` | Nouveau — définition niveau 12 |
| `js/levels/level13.js` | Nouveau — définition niveau 13 |
| `js/levels/index.js` | Import des 3 nouveaux niveaux |
| `js/engine.js` | Logique pickup : collection, vérification au but, callbacks |
| `js/grid.js` | Rendu des cases pickup (🔑) et but verrouillé (🔒) |
| `js/main.js` | Gestion des callbacks pickup, animations, state des pickups collectés |
| `js/animations.js` | Nouvelles animations : key-collect, lock-shake, lock-break, goal-appear, key-glow |
| `style.css` | Classes `.cell.pickup`, `.cell.locked-goal`, keyframes animations |

## Hors scope

- Nouveaux types de pickup (seul `key` pour l'instant)
- Mécanique Turn (sera un futur design séparé)
- Refonte "Prairie Magique" (design parallèle, pas de dépendance)
- Sons (on réutilise les sons existants : bonk, collect)
