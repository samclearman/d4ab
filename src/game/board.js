import _ from 'lodash'

import { getOmino, TOTAL_OMINOS, transformed, getOminoPositions } from './ominos';

const WIDTH = 20;
const HEIGHT = 20;

const error = (b) => {
  return { ...b, error: true };
}

const inBounds = (cells, positions) => {
  if (!positions.length) {
    positions = [positions]
  }
  for (const {i, j} of positions) {
    if (i < 0 || i > WIDTH || j < 0 || j > HEIGHT) {
      return false
    }
  }
  return true
}

const vacant = (cells, positions) => {
  for (const {i, j} of positions) {
    if (i < 0 || i >= HEIGHT || j < 0 || j >= WIDTH) return false
    if (cells[(i * WIDTH) + j].val !== 0) {
      return false;
    }
  }
  return true;
};

const sharesEdgeWith = (cells, positions, player) => {
  for (const {i:ci, j:cj} of positions) {
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const i = ci + di;
      const j = cj + dj;
      if (cells[(i * WIDTH) + j] && cells[(i * WIDTH) + j].val === player) {
        return true;
      }
    }
  }
  return false;
};

const sharesVertexWith = (cells, positions, player) => {
  for (const {i:ci, j:cj} of positions) {
    // Kinda hacky way to handle initial moves
    if ([0, WIDTH - 1].includes(ci) && [0, HEIGHT-1].includes(cj)) {
      return true;
    }
    for (const [di, dj] of [[1,1],[-1,1],[1,-1],[-1,-1]]) {
      const i = ci + di;
      const j = cj + dj;
      if (cells[(i * WIDTH) + j] && cells[(i * WIDTH) + j].val === player) {
        return true;
      }
    }
  }
  return false;
}

export const validatePlace = (b, player, ominoIdx, transformation, x, y) => {
  const omino = getOmino(ominoIdx)
  if (player !== b.nextPlayer) {
    return false
  }
  const positions = getOminoPositions(omino, transformation, x, y)
  if (!inBounds(b.cells, positions)) {
    return false
  }
  if (!vacant(b.cells, positions)) {
    return false
  }
  if (sharesEdgeWith(b.cells, positions, player)) {
    return false
  }
   
    if (!sharesVertexWith(b.cells, positions, player)) {
      return false
    }
  return true
}

export const reducers = {
  initialize(b, cols, rows, players=4) {
    const cells = _.range(cols * rows).map(idx => ({
      i: Math.floor(idx / cols),
      j: idx % cols,
      val: 0,
    }))

    const settings = {
      players,
      rows,
      cols,
    }

    const initialOminoBag = _.reduce(_.range(1, TOTAL_OMINOS + 1), (r, k) => ({
        ...r,
        [k]: true,
      }), {})
    const ominosRemaining = {
      1: initialOminoBag,
      2: initialOminoBag,
      3: initialOminoBag,
      4: initialOminoBag,
    }

    const nextPlayer = 1;

    const alive = {
      1: true,
      2: true,
      3: true,
      4: true,
    }

    return {
      settings,
      cells,
      ominosRemaining,
      nextPlayer,
      alive,
    }
  },

  randomize(b, density=0.5) {
    const players = b.settings.players
    const gen = () => {
      if (Math.random() > density) {
        return Math.floor(Math.random() * (players)) + 1
      }
      return 0
    }
    const cells = _.map(b.cells, ({ i, j, val }) => ({
      i,
      j,
      val: gen(),
    }))
    return {
      ...b,
      cells,
    }
  },

  place(b, player, ominoIdx, transformation, x, y) {
    const omino = getOmino(ominoIdx)
    if (!validatePlace(b, player, ominoIdx, transformation, x, y)) {
      return error(b)
    }
    const { ominosRemaining } = b
    if (!(ominosRemaining[player][ominoIdx])) {
      return error(b)
    }
    const cells = _.cloneDeep(b.cells)
    const positions = getOminoPositions(omino, transformation, x, y)
    const nextPlayer = ((player + 1) % b.settings.players) || b.settings.players
    for (const {i, j} of positions) {
      const cell = cells[(i * WIDTH) + j]
      cell.val = player
    }
    return {
      ...b,
      nextPlayer,
      cells,
      ominosRemaining: {
        ...ominosRemaining,
        [player]: {
          ...ominosRemaining[player],
          [ominoIdx]: false,
        },
      },
    }
  },
}


export const RANDOM_BOARD = (
  // reducers.randomize(
    reducers.initialize({}, 20, 20)
  // )
)
