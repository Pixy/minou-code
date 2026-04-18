export default {
  name: "Le mur infranchissable",
  grid: 5,
  cat: { x: 0, y: 4 },
  goal: { x: 4, y: 0, type: "fish" },
  walls: [
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  ],
  bonuses: [],
  teleporters: [{ a: { x: 1, y: 2 }, b: { x: 1, y: 0 } }],
  stars: { 3: 5, 2: 7, 1: Infinity },
  allowRepeat: true,
  allowJump: false,
};
