import pad from 'array-pad'
import _ from 'lodash'

export const unpadded = (omino) => {
  let R = 0
  let C = 0
  omino.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) {
        R = Math.max(R, i + 1)
        C = Math.max(C, j + 1)
      }
    })
  })
  return _.range(R).map(i => (
    _.range(C).map(j => (
      omino[i][j]
    ))
  ))
}

const padded = (omino) => {
  const N = Math.max(
    omino.length,
    omino.map(r => r.length).reduce((x, y) => Math.max(x, y))
  );
  const padded = [];
  for (let i = 0; i < N; i++) {
    const r = omino[i] || [];
    padded.push(pad(r, N, 0));
  }
  return padded;
};

export const ominos = () => {
  return(
    [
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
    ].map(padded)
  );
};

// The number of squares in the omino
const size = (omino) => {
  return omino.map(r => r.reduce((x, y) => x + y)).reduce((x, y) => x + y);
}

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
  for (let i = 0; i < transformation.rotations; i++) {
    omino = rotated(omino);
  }
  if (transformation.flips) {
    omino = flipped(omino);
  }
  return omino;
};
