export default {
  name: "Saute et avance",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 1, type: "fish" },
  walls: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
  bonuses: [],
  stars: { 3: 3, 2: 5, 1: Infinity },
  allowRepeat: true,
  allowJump: true,
};
