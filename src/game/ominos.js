import _ from 'lodash'

const OMINO_SIZE = 5

export const unpadded = (omino) => {
  let maxR = 0
  let minR = OMINO_SIZE
  let maxC = 0
  let minC = OMINO_SIZE
  omino.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) {
        maxR = Math.max(maxR, i + 1)
        maxC = Math.max(maxC, j + 1)
        minR = Math.min(minR, i)
        minC = Math.min(minC, j)
      }
    })
  })
  return _.range(minR, maxR).map(i => (
    _.range(minC, maxC).map(j => (
      omino[i][j]
    ))
  ))
}

const padded = (omino) => {
  omino = unpadded(omino)
  const height = omino.length
  const width = omino.map(r => r.length).reduce((x, y) => Math.max(x, y))
  const N = OMINO_SIZE;

  const padTop = Math.floor((N - height) / 2.0);
  const padBottom = Math.ceil((N - height) / 2.0);
  const padLeft = Math.floor((N - width) / 2.0);
  const padRight = Math.ceil((N - width) / 2.0);

  const padded = [];
  for (let i = 0; i < padTop; i++) {
    padded.push(Array(N).fill(0));
  }

  for (let i = 0; i < height; i++) {
    const r = omino[i];
    const paddedRow = _.concat(Array(padLeft).fill(0), r, Array(padRight).fill(0));
    padded.push(paddedRow);
  }

  for (let i = 0; i < padBottom; i++) {
    padded.push(Array(N).fill(0));
  }
  return padded;
};

const ominos = [
  [[1]],

  [[1, 1]],

  [[1, 1, 1]],

  [[1, 1],
   [1]],

  [[1, 1, 1, 1]],

  [[1, 1, 1],
   [1]],

  [[1, 1, 1],
   [0, 1]],

  [[1, 1, 0],
   [0, 1, 1]],

  [[1, 1],
   [1, 1]],

  [[1, 1, 1, 1, 1]],

  [[1, 1, 1, 1],
   [1]],

  [[1, 1, 1, 1],
   [0, 1]],

  [[1, 1, 1, 0],
   [0, 0, 1, 1]],

  [[1, 1, 1],
   [1, 1]],

  [[1, 1, 1],
   [1, 0, 1]],

  [[1, 1, 1],
   [1, 0, 0],
   [1, 0, 0]],

  [[1, 1, 1],
   [0, 1, 0],
   [0, 1, 0]],

  [[1, 1, 0],
   [0, 1, 1],
   [0, 0, 1]],

  [[1, 1, 0],
   [0, 1, 1],
   [0, 1, 0]],

  [[0, 1, 0],
   [1, 1, 1],
   [0, 1, 0]],

  [[1, 1, 0],
   [0, 1, 0],
   [0, 1, 1]],

].map(padded)


export const getOmino = ominoIdx => ominos[ominoIdx - 1]
export const TOTAL_OMINOS = ominos.length
const rotated = (paddedOmino) => {
  const N = paddedOmino.length;
  const rotated = [];
  for (let i = 0; i < N; i++) {
    rotated.push([]);
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      rotated[i][j] = paddedOmino[N - j - 1][i];
    }
  }
  return rotated;
};

const flipped = (paddedOmino) => {
  const N = paddedOmino.length;
  const flipped = paddedOmino.map(r => {
    const rr = [];
    for (let i = 0; i < N; i++) {
      rr.push(r[N - i - 1]);
    }
    return rr;
  });
  return flipped;
};

// A transformation is an object of the form { rotations: i, flips: j }
// where i <= 3, j <= 1
export const transformed = (omino, transformation) => {
  omino = padded(omino)
  for (let i = 0; i < transformation.rotations; i++) {
    omino = rotated(omino);
  }
  if (transformation.flips) {
    omino = flipped(omino);
  }
  return omino;
};
