export type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const toFileIndex = (file: BoardFile): BoardIndex => {
  switch (file) {
    case "a":
      return 0;
    case "b":
      return 1;
    case "c":
      return 2;
    case "d":
      return 3;
    case "e":
      return 4;
    case "f":
      return 5;
    case "g":
      return 6;
    case "h":
      return 7;
  }
};
export const fromFileIndex = (index: BoardIndex): BoardFile => {
  switch (index) {
    case 0:
      return "a";
    case 1:
      return "b";
    case 2:
      return "c";
    case 3:
      return "d";
    case 4:
      return "e";
    case 5:
      return "f";
    case 6:
      return "g";
    case 7:
      return "h";
  }
};

export const orthogonalMoves =
  (limit: number = 8) =>
  (state: BoardState, { location }: Piece) => {
    const file = location[0] as BoardFile;
    const fileIndex = toFileIndex(file);
    const rank = location[1] as BoardRank;
    const rankIndex = (Number(rank) - 1) as BoardIndex;

    const moves: BoardSquare[] = [];

    for (let i = 1; i <= limit && fileIndex + i < 8; ++i) {
      const square = `${fromFileIndex(
        (fileIndex + i) as BoardIndex
      )}${rank}` as BoardSquare;
      if (!state.ownPieceLocations.has(square)) {
        moves.push(square);
      }
      if (state.pieceLocations.has(square)) {
        break;
      }
    }
    for (let i = 1; i <= limit && fileIndex - i >= 0; ++i) {
      const square = `${fromFileIndex(
        (fileIndex + i) as BoardIndex
      )}${rank}` as BoardSquare;
      if (!state.ownPieceLocations.has(square)) {
        moves.push(square);
      }
      if (state.pieceLocations.has(square)) {
        break;
      }
    }

    for (let i = 1; i <= limit && rankIndex + i < 8; ++i) {
      const square = `${file}${rankIndex + i + 1}` as BoardSquare;
      if (!state.ownPieceLocations.has(square)) {
        moves.push(square);
      }
      if (state.pieceLocations.has(square)) {
        break;
      }
    }
    for (let i = 1; i <= limit && rankIndex - i >= 0; ++i) {
      const square = `${file}${rankIndex - i + 1}` as BoardSquare;
      if (!state.ownPieceLocations.has(square)) {
        moves.push(square);
      }
      if (state.pieceLocations.has(square)) {
        break;
      }
    }

    return moves;
  };

export const diagonalMoves =
  (limit: number = 8) =>
  (state: BoardState, { location }: Piece) => {
    const file = location[0] as BoardFile;
    const fileIndex = toFileIndex(file);
    const rank = location[1] as BoardRank;
    const rankIndex = (Number(rank) - 1) as BoardIndex;

    const moves: BoardSquare[] = [];

    [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ].forEach(([dx, dy]) => {
      for (
        let i = 1;
        i <= limit &&
        fileIndex + i * dx < 8 &&
        fileIndex + i * dx >= 0 &&
        rankIndex + i * dy < 8 &&
        rankIndex + i * dy >= 0;
        ++i
      ) {
        const square = `${fromFileIndex((fileIndex + i * dx) as BoardIndex)}${
          rankIndex + i * dy + 1
        }` as BoardSquare;
        if (!state.ownPieceLocations.has(square)) {
          moves.push(square);
        }
        if (state.pieceLocations.has(square)) {
          break;
        }
      }
    });

    return moves;
  };

export const starMoves =
  (limit: number = 8) =>
  (state: BoardState, piece: Piece) =>
    diagonalMoves(limit)(state, piece).concat(
      orthogonalMoves(limit)(state, piece)
    );

export const leaperMoves =
  (axis1: number, axis2: number) =>
  (_state: BoardState, { location }: Piece) => {
    const file = location[0] as BoardFile;
    const fileIndex = toFileIndex(file);
    const rank = location[1] as BoardRank;
    const rankIndex = (Number(rank) - 1) as BoardIndex;

    const moves: BoardSquare[] = [
      [fileIndex + axis1, rankIndex + axis2],
      [fileIndex - axis1, rankIndex + axis2],
      [fileIndex - axis1, rankIndex - axis2],
      [fileIndex + axis1, rankIndex - axis2],
      [fileIndex + axis2, rankIndex + axis1],
      [fileIndex - axis2, rankIndex + axis1],
      [fileIndex - axis2, rankIndex - axis1],
      [fileIndex + axis2, rankIndex - axis1],
    ]
      .filter(([f, r]) => r < 8 && r >= 0 && f < 8 && f >= 0)
      .map(
        ([f, r]) => `${fromFileIndex(f as BoardIndex)}${r + 1}` as BoardSquare
      );

    return moves;
  };
