import _ from 'lodash'

import { ominos, transformed } from './ominos';

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
    if (cells[(i * WIDTH) + j].val !== 0) {
      return false;
    }
  }
  return true;
};

const sharesEdgeWith = (cells, positions, player) => {
  return false;
}

const sharesVertexWith = (cells, positions, player) => {
  return true;
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

    const ominosRemaining = {
      1: ominos(),
      2: ominos(),
      3: ominos(),
      4: ominos(),
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

  randomize(b, density=1) {
    const colors = b.settings.colors
    const gen = () => {
      if (Math.random() > density) {
        return Math.floor(Math.random() * (colors)) + 1
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

  place(b, player, omino, transformation, x, y) {
    if (player !== b.nextPlayer) {
      return error(b);
    }
    const t = transformed(omino, transformation)
    const positions = []
    for (let i = 0; i < t.length; i++) {
      for (let j = 0; j < t[i].length; j++) {
        if (t[i][j]) {
          positions.push({i: x + i, j: y + j})
        }
      }
    }
    if (!inBounds(b.cells, positions)) {
      return error(b);
    }
    if (!vacant(b.cells, positions)) {
      return error(b);
    }
    if (sharesEdgeWith(b.cells, positions, player)) {
      return error(b);
    }
    if (!sharesVertexWith(b.cells, positions, player)) {
      return error(b);
    }
    const cells = _.cloneDeep(b.cells)
    const nextPlayer = ((player + 1) % b.settings.players) || b.settings.players
    for (const {i, j} of positions) {
      const cell = cells[(i * WIDTH) + j]
      cell.val = player
    }
    return {
      ...b,
      nextPlayer,
      cells,
    }
  },
}


export const RANDOM_BOARD = (
  reducers.randomize(
    reducers.initialize({}, 20, 20)
  )
)
