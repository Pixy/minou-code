export default {
  name: "Dégage la route !",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 2, y: 1, type: "fish" },
  walls: [
    { x: 0, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 2 },
  ],
  bonuses: [],
  boxes: [{ x: 1, y: 1 }],
  stars: { 3: 4, 2: 6, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
