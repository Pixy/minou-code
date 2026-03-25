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
