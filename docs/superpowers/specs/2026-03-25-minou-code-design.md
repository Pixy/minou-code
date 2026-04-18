# Minou Code — Spec de design

Jeu web de programmation visuelle pour enfant de 6 ans. Un chat (Minou) doit atteindre sa gamelle en exécutant une séquence d'instructions construites par drag & drop.

**Public cible :** Loulou, 6 ans, francophone, apprend à lire. iPad mini 6e génération (8.3", 1133×744pt en paysage) via réseau local.

---

## Stack technique

- HTML / CSS / JS avec ES Modules (`type="module"`)
- Zéro build, zéro framework
- Libs en CDN :
  - **lottie-web** — animations du chat
  - **SortableJS** — drag & drop tactile
  - **canvas-confetti** — effets de victoire
- Serveur local : `python -m http.server` ou équivalent
- 100% français dans l'UI

---

## Structure du projet

```
louise/
├── index.html              # Structure HTML + imports CDN
├── style.css               # Styles globaux, animations CSS, responsive
├── js/
│   ├── main.js             # Point d'entrée, init, navigation niveaux, orchestration
│   ├── grid.js             # Rendu grille CSS Grid, placement éléments, déplacement chat
│   ├── cards.js            # Drag & drop cartes (SortableJS), zone "Mon programme"
│   ├── engine.js           # Exécution séquentielle du programme, carte Répète
│   ├── animations.js       # Contrôle Lottie + animations CSS complémentaires
│   ├── audio.js            # Web Audio API (sons interaction) + base64 (miaous)
│   └── levels/
│       ├── index.js        # Agrège et exporte tous les niveaux
│       ├── level-01.js
│       ├── level-02.js
│       ├── level-03.js
│       ├── level-04.js
│       ├── level-05.js
│       ├── level-06.js
│       ├── level-07.js
│       └── level-08.js
└── assets/
    └── lottie/
        ├── cat-idle.json   # Chat au repos
        ├── cat-walk.json   # Chat qui marche
        ├── cat-win.json    # Danse de victoire
        └── cat-fail.json   # Réaction échec
```

---

## Flux de données

1. `main.js` charge le niveau depuis `levels/`, initialise `grid.js`, `cards.js`, `animations.js`, `audio.js`
2. L'enfant construit un programme en draggant des cartes dans "Mon programme"
3. `cards.js` produit un tableau d'instructions structuré (voir section "Format des instructions")
4. Au clic sur "C'est parti !", `main.js` passe le tableau à `engine.js`
5. `engine.js` exécute pas à pas, demande à `grid.js` de déplacer le chat et à `animations.js` de jouer les animations
6. En fin d'exécution, `engine.js` émet le résultat (succès/échec/programme terminé sans arriver)
7. `main.js` déclenche le feedback approprié (confettis, message, son)

---

## Format des niveaux

```js
export default {
  name: "Premier pas",
  grid: 4,                              // Taille N×N (entier)
  cat: { x: 0, y: 3 },                 // Position départ
  goal: { x: 0, y: 0, type: "fish" },  // "fish" 🐟 ou "yarn" 🧶
  walls: [],                            // [{x, y}]
  bonuses: [],                          // [{x, y, type: "yarn"}] — collectés automatiquement au passage
  stars: { 3: 3, 2: 5, 1: Infinity },  // 3⭐ si ≤3 cartes visuelles, 2⭐ si ≤5, sinon 1⭐
  allowRepeat: false,                   // Carte Répète disponible ?
}
```

### Progression des 8 niveaux

| Niveau | Grille | Spécificité | Répète ? |
|--------|--------|------------|----------|
| 1 | 4×4 | Ligne droite, 3 pas | Non |
| 2 | 4×4 | Un virage simple | Non |
| 3 | 4×4 | Deux virages | Non |
| 4 | 4×4 | Murs simples, chemin à contourner | Non |
| 5 | 5×5 | Grille plus grande, murs | Non |
| 6 | 5×5 | Chemin plus complexe avec murs | Non |
| 7 | 5×5 | Pattern répétitif, Répète nécessaire | Oui |
| 8 | 5×5 | Répète + bonus 🧶 à collecter | Oui |

---

## Layout de l'écran (mode jeu)

Optimisé pour iPad mini 6e gen en paysage (1133×744pt). La grille prend toute la hauteur à gauche pour maximiser la taille du chat et des cases.

```
┌──────────────────────────────────────────────┐
│  🐱 Minou Code — Niveau 3 : "Les zigzags"   │
├──────────────┬───────────────────────────────┤
│              │  📋 Mon programme              │
│              │  ┌─────────────────────┐      │
│   GRILLE     │  │ ➡️ Droite            │      │
│   (carrée,   │  │ ⬆️ Avance            │      │
│    pleine    │  │ 🔁 Répète ×3         │      │
│    hauteur)  │  │   └─ ➡️ Droite       │      │
│              │  └─────────────────────┘      │
│              ├───────────────────────────────┤
│              │  🎴 Mes cartes                 │
│              │  ┌────┐ ┌────┐ ┌────┐         │
│              │  │ ⬆️ │ │ ⬇️ │ │ ⬅️ │         │
│              │  ┌────┐ ┌────┐                │
│              │  │ ➡️ │ │ 🔁 │                │
│              │  └────┘ └────┘                │
├──────────────┴───────────────────────────────┤
│   [🚀 C'est parti !]  [🔄 Recommencer] [❌]  │
└──────────────────────────────────────────────┘
```

**Principe :**
- **Colonne gauche (~50%)** : grille carrée, pleine hauteur, dimensionnée en `vmin`
- **Colonne droite (~50%)** : programme (scrollable si beaucoup de cartes) au-dessus, tray en dessous. Le flux naturel est bas → haut (piocher → programme)
- **Barre fixe en bas** : boutons d'action pleine largeur, toujours accessibles aux petits doigts
- Sur écrans plus grands (MacBook), le layout s'étire proportionnellement

---

## Cartes d'instructions

| Carte | Visuel | Instruction | Couleur |
|-------|--------|-------------|---------|
| Haut | ⬆️ "Avance" | `up` | Distincte par direction |
| Bas | ⬇️ "Recule" | `down` | Distincte par direction |
| Gauche | ⬅️ "Gauche" | `left` | Distincte par direction |
| Droite | ➡️ "Droite" | `right` | Distincte par direction |
| Répète | 🔁 + sélecteur 1-5 | `{type: "repeat", count: N, children: [...]}` | Couleur spéciale |

### Format des instructions

`cards.js` produit un tableau d'objets structurés :

```js
// Exemple : droite, avance, puis répète 3× droite
[
  { type: "right" },
  { type: "up" },
  { type: "repeat", count: 3, children: [{ type: "right" }] }
]
```

Les cartes directionnelles sont `{ type: "up" | "down" | "left" | "right" }`.
La carte Répète est `{ type: "repeat", count: 1-5, children: [...] }` où `children` est un tableau de cartes directionnelles.

**Pas d'imbrication :** on ne peut PAS mettre un Répète dans un Répète (trop complexe pour 6 ans). SortableJS bloquera le drop d'une carte Répète dans la sous-zone d'un autre Répète.

### Comportement drag & drop (SortableJS)

- Le **tray** est une source infinie : drag crée une copie dans "Mon programme", l'originale reste
- Dans "Mon programme", les cartes sont **réordonnables** par drag
- **Supprimer une carte** : drag en dehors de "Mon programme" ou bouton ❌ sur chaque carte
- **Carte Répète** : conteneur avec sélecteur de nombre (1-5) et sous-zone droppable (SortableJS groupes imbriqués)
- Taille minimum : **60px de haut** par carte
- Feedback tactile : léger scale bounce au drop

---

## Animations

### Lottie (4 états du chat)

| État | Fichier | Quand | Boucle |
|------|---------|-------|--------|
| Idle | `cat-idle.json` | En attente, entre les niveaux | Oui |
| Walk | `cat-walk.json` | Pendant l'exécution, à chaque pas | Oui (pendant déplacement) |
| Win | `cat-win.json` | Victoire — danse ridicule | 1 fois puis idle |
| Fail | `cat-fail.json` | Échec — tête surprise | 1 fois puis idle |

**Sourcing :** Animations gratuites LottieFiles. Si un état manque, on complète avec CSS sur le Lottie idle.

**Intégration :** Le player Lottie est un `<div>` positionné dans la case du chat, occupe ~80% de la case. Le conteneur est animé via CSS transition `transform` lors des déplacements.

### Animations CSS complémentaires

| Animation | Déclencheur | Effet |
|-----------|------------|-------|
| `bounce-wall` | Chat tape un mur | Translate vers le mur → rebond élastique arrière |
| `shake` | Échec | Tremblement rapide gauche-droite |
| `hop` | Chaque pas | Petit saut vertical pendant le déplacement |
| `celebrate-spin` | Victoire | Rotation 360° |
| `card-snap` | Drop d'une carte | Scale 1.1 → 1.0 rapide |
| `star-pop` | Affichage étoiles | Scale 0 → 1.2 → 1.0 avec délai entre chaque |

### Confettis (canvas-confetti)

- Victoire : explosion plein écran, particules colorées, ~3s
- 3 étoiles : double explosion + particules dorées

---

## Audio

### Sons base64 (vrais sons)

| Son | Quand |
|-----|-------|
| Miaou joyeux | Victoire |
| Miaou triste/surpris | Échec |

### Sons synthétiques (Web Audio API)

| Son | Quand | Technique |
|-----|-------|-----------|
| Pop | Drop d'une carte | Oscillateur court, fréquence descendante |
| Bip doux | Chaque pas du chat | Sinus court ~100ms |
| Fanfare mini | 3 étoiles | Séquence de 3 notes montantes |
| Bonk | Chat tape un mur | Bruit court, fréquence basse |

**Contrainte navigateur :** Premier son déclenché uniquement après interaction utilisateur. Pas de musique de fond.

---

## Feedback & Messages personnalisés

Le nom "Loulou" est stocké dans une constante en haut de `main.js` pour pouvoir être changé facilement.

### Écran d'accueil

_"Coucou Loulou ! 🐱 Prête à aider Minou ?"_

### Victoire (pool aléatoire, ~10 messages)

- _"OUIIIII ! Bravo Loulou ! 🐱🎉"_
- _"Loulou la championne ! 🏆✨"_
- _"Minou te fait un gros câlin Loulou ! 🐱❤️"_
- _"Le poisson n'avait aucune chance Loulou ! 🐟💨"_
- _"Génie absolu détecté : Loulou ! 🧠✨"_
- _"Minou te dit MIAOU DU TONNERRE Loulou ! ⚡🐱"_
- _"T'es trop forte Loulou ! 💪🌟"_
- _"Loulou + Minou = équipe de choc ! 🐱🚀"_
- _"Minou est trop content grâce à toi Loulou ! 😻"_
- _"Woooow Loulou, c'était parfait ! 🎯✨"_

### Échec (pool aléatoire, ~10 messages, toujours encourageants)

- _"T'inquiète Loulou, tu vas y arriver ! 💪"_
- _"Minou croit en toi Loulou ! 🐱🌟"_
- _"Aïe aïe aïe ! Le mur a gagné cette fois 😹"_
- _"Oups ! Le poisson rigole là 🐟😂"_
- _"Ce mur est vraiment mal élevé ! 😤"_
- _"Essaie encore Loulou, Minou ne lâche pas ! 🐱❤️"_
- _"Presque Loulou ! Encore un petit effort ! 🌈"_
- _"Minou s'est cogné mais il va bien ! 😹💫"_
- _"Le chemin est par là... ou pas 🤔😸"_
- _"Allez Loulou, on recommence ! 🔄✨"_

### Programme terminé sans arriver

- _"Hmm... Minou n'est pas encore arrivé ! Il manque des pas Loulou 🐱🤔"_
- _"Minou attend... il lui faut plus de cartes Loulou ! 📋"_

### Transitions de niveau

- _"Allez Loulou, on continue ! 🚀"_
- _"Niveau suivant Loulou, c'est parti ! 🐱💨"_

---

## Grille

- Rendue en **CSS Grid**
- Chaque case : `div` avec `data-x` / `data-y`
- Murs : style visuel distinct (briques/haies)
- Chat, gamelle, bonus : positionnés dans leur case
- Dimensions en **`vmin`** pour s'adapter iPad/MacBook
- Centrée sur l'écran

### Déplacement du chat

1. `engine.js` exécute une instruction → calcule case cible
2. Case cible = mur ou hors grille → **arrêt immédiat**, animation fail, le programme ne continue PAS
3. Sinon → `grid.js` anime le chat (transition CSS `transform`) + animation walk
4. Si la case contient un bonus 🧶 → collecte automatique (animation pop + son, compteur visible)
5. Délai entre chaque pas : **~500ms**
6. Case cible === goal → **victoire** 🎉
7. Programme terminé mais chat pas sur le goal → message "il manque des pas"

### Direction visuelle du chat

Le chat est orienté vers la droite par défaut. Quand il se déplace à gauche, on applique `scaleX(-1)` sur le conteneur Lottie pour le retourner horizontalement.

### Bonus 🧶

- Collecte **automatique** quand le chat passe sur la case
- Animation : le bonus disparaît avec un effet pop + son
- Les bonus sont **optionnels** : on peut gagner le niveau sans les collecter
- Collecter tous les bonus d'un niveau donne un bonus d'une étoile supplémentaire (max 3)

### Étoiles ⭐

Le score est basé sur le **nombre de cartes visuelles** dans "Mon programme" (pas le nombre de pas exécutés). Un Répète ×3 avec 1 sous-carte compte pour 2 cartes visuelles (le Répète + la sous-carte), pas 3 pas. Cela encourage l'utilisation du Répète.

### Cas limites

- **Programme vide + "C'est parti !"** : le bouton est désactivé (grisé) tant qu'aucune carte n'est dans "Mon programme"
- **Bouton "Recommencer"** : remet le chat au départ mais **conserve le programme**. L'enfant peut corriger sans tout refaire. Un bouton ❌ "Vider" à côté permet de vider entièrement le programme si besoin.

---

## Progression & Sauvegarde

### Écran de sélection des niveaux

```
┌──────────────────────────────────────────────┐
│        🐱 Coucou Loulou !                    │
│        Prête à aider Minou ?                 │
│                                              │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│   │  1  │  │  2  │  │  3  │  │  4  │       │
│   │ ⭐⭐⭐│  │ ⭐⭐ │  │     │  │ 🔒  │       │
│   └─────┘  └─────┘  └─────┘  └─────┘       │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│   │  5  │  │  6  │  │  7  │  │  8  │       │
│   │ 🔒  │  │ 🔒  │  │ 🔒  │  │ 🔒  │       │
│   └─────┘  └─────┘  └─────┘  └─────┘       │
└──────────────────────────────────────────────┘
```

- Grille 2×4 de gros boutons ronds/arrondis
- Niveaux débloqués : numéro visible + étoiles obtenues en dessous
- Niveaux verrouillés : icône 🔒, grisé, non cliquable
- Transition vers le jeu : animation slide ou fade
- Niveaux débloqués **séquentiellement** (réussir N pour débloquer N+1)
- **Sauvegarde `localStorage`** : niveaux débloqués + meilleur score étoiles par niveau

### Sons base64

Les fichiers miaou seront sourcés depuis des banques de sons libres de droits (freesound.org ou similaire), convertis en base64 et embarqués dans `audio.js`. Si on ne trouve pas de sons adaptés, on génère des miaous synthétiques avec Web Audio API en fallback (oscillateur avec pitch bend rapide).

---

## Style visuel

- Kawaii / friendly, coins arrondis partout
- Couleurs pastel vives, haut contraste
- Police minimum **18px**, gros boutons minimum **60px**
- Responsive : optimisé pour iPad mini 6e gen en paysage (cible principale), fonctionne aussi sur MacBook
- Pas d'anglais visible nulle part
