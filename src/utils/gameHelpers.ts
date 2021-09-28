import { GameMove, GameState } from '@/types/game_state';

type GameStatus =
  | 'Your Move'
  | 'Waiting for opponent to move'
  | 'Your Turn to Reveal'
  | 'Waiting for opponent to reveal'
  | 'Unexpected behavior';

// possible screens
// make a move
// sending move
// waiting for opponent to move
// reveal your move
// revealing move
// waiting for opponent to reveal move

export const getGameStatus = (game: GameState, walletAddress: string) => {
  let newGameStatus: GameStatus;

  // for now assume you are player 1
  if (game.player1 === walletAddress) {
    if (!game.player1_move) {
      // player 1 hasn't moved yet, so move
      newGameStatus = `Your Move`;
    } else if (!game.player2_move) {
      // player 2 hasn't moved yet, so wait
      newGameStatus = `Waiting for opponent to move`;
    } else if (Object.keys(game.player1_move)[0] === `HashedMove`) {
      // player 1 hasn't revealed yet, so reveal
      newGameStatus = `Your Turn to Reveal`;
    } else if (Object.keys(game.player2_move)[0] === `HashedMove`) {
      // player 2 hasn't revealed yet, so wait
      newGameStatus = `Waiting for opponent to reveal`;
    } else {
      newGameStatus = `Unexpected behavior`;
    }
  } else if (game.player2 === walletAddress) {
    if (!game.player2_move) {
      // player 1 hasn't moved yet, so move
      newGameStatus = `Your Move`;
    } else if (!game.player1_move) {
      // player 2 hasn't moved yet, so wait
      newGameStatus = `Waiting for opponent to move`;
    } else if (Object.keys(game.player2_move)[0] === `HashedMove`) {
      // player 1 hasn't revealed yet, so reveal
      newGameStatus = `Your Turn to Reveal`;
    } else if (Object.keys(game.player1_move)[0] === `HashedMove`) {
      // player 2 hasn't revealed yet, so wait
      newGameStatus = `Waiting for opponent to reveal`;
    } else {
      newGameStatus = `Unexpected behavior`;
    }
  } else {
    newGameStatus = `Unexpected behavior`;
  }

  return newGameStatus;
};

// could add some more granularity via socket io
export const getPlayerNumber = (game: GameState, walletAddress: string) =>
  walletAddress === game.player1 ? `player1` : `player2`;

export const getOpponentNumber = (game: GameState, walletAddress: string) =>
  walletAddress === game.player1 ? `player2` : `player1`;

export const getWinner = (player1_move: GameMove, player2_move: GameMove) => {
  switch (`${player1_move},${player2_move}`) {
    case `Rock,Paper`:
    case `Paper,Scissors`:
    case `Scissors,Rock`:
      return `player2`;
    case `Paper,Rock`:
    case `Scissors,Paper`:
    case `Rock,Scissors`:
      return `player1`;
    default:
      return `tie`;
  }
};
