type BoardRank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
type BoardFile = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

type BoardSquare = `${BoardFile}${BoardRank}`; // sticking with 2d for now, for the sake of simplicity

const enum Player {
  WHITE,
  BLACK,
}

type PieceDefinition = {
  icon: string;
  symbol: string;
  movementRules: (state: BoardState, piece: Piece) => BoardSquare[];

  // used for pieces that capture differently from their regular moves (e.g. pawns); if not specified, all moves can capture
  captureRules?: (state: BoardState, piece: Piece) => BoardSquare[];
  // used for pieces that can have special effects when they move (e.g. pawn promotion, en passant); return value becomes new state if not null (otherwise normal state update)
  onMove?: (state: BoardState, piece: Piece, move: Move) => BoardState | null;
};

type Move = {
  pieceId: string;
  from: BoardSquare;
  to: BoardSquare;
  extra?: Record<string, unknown>;
};

type Piece = {
  id: string;
  definition: PieceDefinition;
  location: BoardSquare;
  player: Player;
};

type BoardState = {
  pieces: Record<string, Piece>;

  pieceLocations: ReadonlyMap<BoardSquare, Piece>;
  ownPieceLocations: ReadonlyMap<BoardSquare, Piece>;
  opponentPieceLocations: ReadonlyMap<BoardSquare, Piece>;
  history: Move[]; // this is in most-recent-first order
  capturedPieceIds: string[];

  extra?: Record<string, unknown>;
  turnPlayer: Player;

  game: Game;
};

interface Game {
  getPromotionChoice: (
    piece: Piece,
    state: BoardState,
    choices: PieceDefinition[]
  ) => PieceDefinition;
}
