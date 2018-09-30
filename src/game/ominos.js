import pad from 'array-pad';

export const ominos = function () {
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
    ]
  );
};

// The number of squares in the omino
const size = function (omino) {
  return omino.map(r => r.reduce((x, y) => x + y)).reduce((x, y) => x + y);
}

const padded = function (omino, N = null) {
  if (N === null) {
    N = Math.max(
      omino.length,
      omino.map(r => r.length).reduce((x, y) => Math.max(x, y))
    );
  }
  const padded = [];
  for (let i = 0; i < N; i++) {
    const r = omino[i] || [];
    padded.push(pad(r, N, 0));
  }
  return padded;
};

const rotated = function(paddedOmino) {
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

const flipped = function(paddedOmino) {
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
export const transformed = function (omino, transformation) {
  omino = padded(omino);
  for (let i = 0; i < transformation.rotations; i++) {
    omino = rotated(omino);
  }
  if (transformation.flips) {
    omino = flipped(omino);
  }
  return omino;
};
