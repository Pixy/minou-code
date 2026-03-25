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
