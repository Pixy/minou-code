export default {
  name: "Tourbillon magique",
  grid: 5,
  cat: { x: 4, y: 4 },
  goal: { x: 0, y: 0, type: "fish" },
  walls: [],
  bonuses: [],
  teleporters: [{ a: { x: 4, y: 2 }, b: { x: 0, y: 2 } }],
  stars: { 3: 4, 2: 6, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
