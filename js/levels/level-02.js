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
