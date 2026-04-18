export default {
  name: "Tourbillon et double poussée",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 0 },
  ],
  bonuses: [],
  boxes: [{ x: 2, y: 1 }],
  teleporters: [{ a: { x: 1, y: 1 }, b: { x: 1, y: 4 } }],
  stars: { 3: 5, 2: 7, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
