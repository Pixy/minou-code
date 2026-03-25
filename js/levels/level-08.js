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
