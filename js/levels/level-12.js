export default {
  name: "Le coffre au trésor",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }],
  bonuses: [],
  pickups: [{ x: 0, y: 2, type: "key" }, { x: 4, y: 2, type: "key" }],
  stars: { 3: 10, 2: 13, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
