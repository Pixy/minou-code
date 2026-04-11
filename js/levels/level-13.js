export default {
  name: "Saute et ramasse !",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }],
  bonuses: [],
  pickups: [{ x: 1, y: 2, type: "key" }],
  stars: { 3: 8, 2: 11, 1: Infinity },
  allowRepeat: true,
  allowJump: true,
};
