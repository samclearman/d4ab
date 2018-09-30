import _ from 'lodash'

import { ominos, transformed } from './ominos';

const WIDTH = 20;

export const reducers = {
  initialize(b, cols, rows, colors=4) {
    const cells = _.range(cols * rows).map(idx => ({
      i: Math.floor(idx / cols),
      j: idx % cols,
      val: 0,
    }))

    const settings = {
      colors,
      rows,
      cols,
    }

    const ominosRemaining = {
      0: ominos(),
      1: ominos(),
      2: ominos(),
      3: ominos(),
    }

    const nextPlayer = 0;

    const alive = {
      0: true,
      1: true,
      2: true,
      3: true,
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
    const t = transformed(omino, transformation);
    const cells = _.cloneDeep(b.cells);
    for (let i = 0; i < t.length; i++) {
      for (let j = 0; j < t[i].length; j++) {
        if (t[i][j]) {
          const cell = cells[((x + i) * WIDTH) + y + j];
          cell.val = player;
        }
      }
    }
    return {
      ...b,
      cells,
    }
  },
}


export const RANDOM_BOARD = (
  reducers.randomize(
    reducers.initialize({}, WIDTH, 20)
  )
)
