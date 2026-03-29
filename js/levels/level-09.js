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
