export default {
  name: "Pousse pour passer",
  grid: 4,
  cat: { x: 0, y: 3 },
  goal: { x: 3, y: 0, type: "fish" },
  walls: [
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 },
    { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
  ],
  bonuses: [],
  boxes: [{ x: 1, y: 2 }],
  stars: { 3: 6, 2: 8, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
