export default {
  name: "La clé magique",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 0, type: "fish" },
  walls: [],
  bonuses: [],
  pickups: [{ x: 2, y: 1, type: "key" }],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: false,
  allowJump: false,
};
