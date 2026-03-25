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
