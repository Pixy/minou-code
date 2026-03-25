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
