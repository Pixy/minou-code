export default {
  name: "Tourbillon et bloc",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 1, y: 0, type: "fish" },
  walls: [
    { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  ],
  bonuses: [],
  boxes: [{ x: 0, y: 1 }],
  teleporters: [{ a: { x: 0, y: 2 }, b: { x: 4, y: 4 } }],
  stars: { 3: 5, 2: 7, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
