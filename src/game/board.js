import _ from 'lodash'
const reducers = {
  initialize(b, width, height) {
    const cells = _.range(width * height).map(idx => ({
      i: Math.floor(idx / width),
      j: idx % width,
      val: 0,
    }))

    const settings = {
      colors: 4,
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
    reducers.initialize({}, 10, 10)
  )
)
