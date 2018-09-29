import _ from 'lodash'
const reducers = {
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

    return {
      settings,
      cells,
    }
  },

  randomize(b, density=0.5) {
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
}

export const RANDOM_BOARD = (
  reducers.randomize(
    reducers.initialize({}, 20, 20)
  )
)
