import _ from 'lodash'

import { ominos, transformed } from './ominos';

const WIDTH = 10;

export const reducers = {
  initialize(b, width, height) {
    const cells = _.range(width * height).map(idx => ({
      i: Math.floor(idx / width),
      j: idx % width,
      val: 0,
    }))

    const settings = {
      colors: 4,
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
    for (let i = 0; i < omino.length; i++) {
      for (let j = 0; j < omino.length; j++) {
        if (t[i][j]) {
          cells[((x + i) * WIDTH) + y + j].val = player;
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
    reducers.initialize({}, WIDTH, 10)
  )
)
