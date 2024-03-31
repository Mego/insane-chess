import {
  BoardIndex,
  diagonalMoves,
  fromFileIndex,
  leaperMoves,
  orthogonalMoves,
  starMoves,
  toFileIndex,
} from "./chessUtils";

// orthodox piece definitions

export const KingDefinition: PieceDefinition = {
  icon: "",
  symbol: "K",
  movementRules: starMoves(1),
};

export const QueenDefinition: PieceDefinition = {
  icon: "",
  symbol: "Q",
  movementRules: starMoves(),
};

export const BishopDefinition: PieceDefinition = {
  icon: "",
  symbol: "B",
  movementRules: diagonalMoves(),
};

export const RookDefinition: PieceDefinition = {
  icon: "",
  symbol: "R",
  movementRules: orthogonalMoves(),
};

export const KnightDefinition: PieceDefinition = {
  icon: "",
  symbol: "N",
  movementRules: leaperMoves(1, 2),
};

export const PawnDefinition: PieceDefinition = {
  icon: "",
  symbol: "",
  movementRules: (state, piece) => {
    const { location, player } = piece;
    const forwardDirection = player === Player.WHITE ? 1 : -1;
    const isFirstMove =
      state.history.find((move) => move.to === location) === undefined;

    const rankIndex = Number(location[1]) - 1;

    const moves: BoardSquare[] = [];

    if (rankIndex + forwardDirection < 8 && rankIndex + forwardDirection >= 0) {
      const square = `${location[0]}${
        rankIndex + forwardDirection + 1
      }` as BoardSquare;
      if (!state.pieceLocations.has(square)) {
        moves.push(square);

        if (
          isFirstMove &&
          rankIndex + forwardDirection * 2 < 8 &&
          rankIndex + forwardDirection * 2 >= 0
        ) {
          const doubleMoveSquare = `${location[0]}${
            rankIndex + forwardDirection * 2 + 1
          }` as BoardSquare;
          if (!state.pieceLocations.has(doubleMoveSquare)) {
            moves.push(doubleMoveSquare);
          }
        }
      }
    }

    return moves;
  },
  captureRules: (state, piece) => {
    const { location, player } = piece;
    const forwardDirection = player === Player.WHITE ? 1 : -1;

    const rankIndex = (Number(location[1]) - 1) as BoardIndex;
    const fileIndex = toFileIndex(location[0] as BoardFile);

    const moves: BoardSquare[] = [];

    if (
      fileIndex - 1 >= 0 &&
      rankIndex + forwardDirection >= 0 &&
      rankIndex + forwardDirection < 8
    ) {
      const square: BoardSquare = `${fromFileIndex(
        (fileIndex - 1) as BoardIndex
      )}${rankIndex + forwardDirection + 1}` as BoardSquare;
      if (state.opponentPieceLocations.has(square)) {
        moves.push(square);
      }
    }
    if (
      fileIndex + 1 < 8 &&
      rankIndex + forwardDirection >= 0 &&
      rankIndex + forwardDirection < 8
    ) {
      const square: BoardSquare = `${fromFileIndex(
        (fileIndex + 1) as BoardIndex
      )}${rankIndex + forwardDirection + 1}` as BoardSquare;
      if (state.opponentPieceLocations.has(square)) {
        moves.push(square);
      }
    }

    // en passant
    const prevMove = state.history[0];
    const prevMovedPiece = state.pieces[prevMove.pieceId];
    if (
      prevMovedPiece.definition === this && // prev move was a pawn move
      Math.abs(Number(prevMove.to[1]) - Number(prevMove.from[1])) === 2 && // initial two-space pawn move
      prevMove.to[1] === piece.location[1] && // moved to the same rank as this piece
      Math.abs(
        toFileIndex(prevMove.to[0] as BoardFile) -
          toFileIndex(piece.location[1] as BoardFile)
      ) === 1 // is on an adjacent file
    ) {
      moves.push(
        `${prevMove.to[0]}${
          Number(location[1]) + forwardDirection
        }` as BoardSquare
      );
    }

    return moves;
  },

  onMove: (state, piece, move) => {
    const newState = state;
    let stateUpdated = false;
    if (move.from[0] !== move.to[0]) {
      // capturing move, check for en passant
      const enPassantTargetSquare =
        `${move.to[0]}${move.from[1]}` as BoardSquare;
      if (
        !state.opponentPieceLocations.has(move.to) &&
        state.opponentPieceLocations.has(enPassantTargetSquare)
      ) {
        const enPassantTarget = state.opponentPieceLocations.get(
          enPassantTargetSquare
        )!;
        // capture the target pawn
        newState.capturedPieceIds.push(enPassantTarget.id);
        delete newState.pieces[enPassantTarget.id];
        // move the pawn
        piece.location = move.to;
        // add the move to history, with capture and en passant flags
        newState.history.push({
          ...move,
          extra: { ...move.extra, enPassant: true, capture: true },
        });
        // now it's the opponent's turn
        newState.turnPlayer =
          state.turnPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
        stateUpdated = true;
      }
    }
    if (
      (state.turnPlayer === Player.WHITE && move.to[1] === "8") ||
      (state.turnPlayer === Player.BLACK && move.to[1] === "1")
    ) {
      // move the pawn
      piece.location = move.to;
      // prompt for promotion
      piece.definition = state.game.getPromotionChoice(piece, newState, [
        KnightDefinition,
        RookDefinition,
        BishopDefinition,
        QueenDefinition,
      ]);
      // add the move to history, with promotion flag
      newState.history.push({
        ...move,
        extra: { ...move.extra, promotion: piece.definition.symbol },
      });
      // now it's the opponent's turn
      newState.turnPlayer =
        state.turnPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
      stateUpdated = true;
    }

    return stateUpdated ? newState : null;
  },
};
