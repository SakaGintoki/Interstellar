// src/hooks/sceneCheckpoints.js

export const SCENE_SEQUENCE = [
  "atom",
  "dna",
  "cell",
  "earth",
  "solar",
  "galaxy",
  "universe",
];

// Camera checkpoints: position & lookAt target & zoom limits
export const SCENE_CHECKPOINTS = {
  atom: {
    position: [0, 0, 6],
    target: [0, 0, 0],
    minDistance: 2,
    maxDistance: 1000,
  },
  dna: {
    position: [0, 3, 12],
    target: [0, 0, 0],
    minDistance: 4,
    maxDistance: 1800,
  },
  cell: {
    position: [0, 4, 18],
    target: [0, 0, 0],
    minDistance: 6,
    maxDistance: 2800,
  },
  earth: {
    position: [0, 2, 14],
    target: [0, 0, 0],
    minDistance: 6,
    maxDistance: 3000,
  },
  solar: {
    position: [0, 40, 80],
    target: [0, 0, 0],
    minDistance: 3,
    maxDistance: 1500,
  },
  galaxy: {
    position: [0, 25, 120],
    target: [0, 0, 0],
    minDistance: 6,
    maxDistance: 2500,
  },
  universe: {
    position: [0, 0, 40],
    target: [0, 0, 0],
    minDistance: 2,
    maxDistance: 1000,
  },
};
