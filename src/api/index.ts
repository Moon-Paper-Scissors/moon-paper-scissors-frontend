import { LCDCClientConfig, RPSContractAddress } from '@/constants';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { GetGameByPlayerResponse } from '@/types/get_game_by_player_response';
import { GetOpenGamesResponse } from '@/types/get_open_games_response';
import { QueryMsg } from '@/types/query_msg';
import { debugTransaction } from '@/utils';
import { LCDClient, MsgExecuteContract } from '@terra-money/terra.js';
import { ConnectedWallet } from '@terra-money/wallet-provider';
import sha256 from 'crypto-js/sha256';

export default class RPSApi {
  connectedWallet: ConnectedWallet;

  terra: LCDClient;

  constructor(connectedWallet: ConnectedWallet) {
    this.connectedWallet = connectedWallet;
    this.terra = new LCDClient(LCDCClientConfig);
  }

  // get requests

  fetchOpenGames = async () => {
    // QUERY GAME STATUS
    const query_msg: QueryMsg = {
      get_open_games: {},
    };
    const res = (await this.terra.wasm.contractQuery(
      RPSContractAddress,
      query_msg,
    )) as GetOpenGamesResponse;
    return res;
  };

  getThisGame = async () => {
    // QUERY GAME STATUS
    const query_msg: QueryMsg = {
      get_game_by_player: {
        player: this.connectedWallet.walletAddress,
      },
    };
    const res = (await this.terra.wasm.contractQuery(
      RPSContractAddress,
      query_msg,
    )) as GetGameByPlayerResponse;
    return res;
  };

  // post requests

  joinGame = async (betAmount: string) => {
    // try to join a game
    const joinGameMessage: ExecuteMsg = {
      join_game: {},
    };

    // sent the transaction to request to join a game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          joinGameMessage,
          { uluna: betAmount },
        ),
      ],
    });

    debugTransaction(result);
    return result;
  };

  leaveWaitingQueue = async () => {
    // try to join a game
    const leaveWaitingQueueMessage: ExecuteMsg = {
      leave_waiting_queue: {},
    };

    // sent the transaction to request to join a game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          leaveWaitingQueueMessage,
        ),
      ],
    });
    debugTransaction(result);
    return result;
  };

  claimGame = async (gameState: GameState) => {
    // try to join a game
    const claimGameMessage: ExecuteMsg = {
      claim_game: { player1: gameState.player1, player2: gameState.player2 },
    };

    // sent the transaction to try to claim the game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          claimGameMessage,
        ),
      ],
    });
    debugTransaction(result);
    return result;
  };

  forfeit = async () => {
    // try to join a game
    const forfeitMessage: ExecuteMsg = {
      forfeit_game: {},
    };

    // sent the transaction to request to join a game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          forfeitMessage,
        ),
      ],
    });

    debugTransaction(result);
    return result;
  };

  commitMove = async (
    gameState: GameState,
    gameMove: GameMove,
    nonce: string,
  ) => {
    const moveHash = sha256(`${gameMove}${nonce}`).toString();

    // upsert game message
    const commitMoveMessage: ExecuteMsg = {
      commit_move: {
        player1: gameState.player1,
        player2: gameState.player2,
        hashed_move: moveHash,
      },
    };

    // Send the transaction to upsert the game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          commitMoveMessage,
        ),
      ],
    });

    debugTransaction(result);
    return result;
  };

  revealMove = async (
    gameState: GameState,
    gameMove: GameMove,
    nonce: string,
  ) => {
    // upsert game message
    const revealMoveMessage: ExecuteMsg = {
      reveal_move: {
        player1: gameState.player1,
        player2: gameState.player2,
        game_move: gameMove,
        nonce,
      },
    };

    // Send the transaction to upsert the game
    const result = await this.connectedWallet.post({
      msgs: [
        new MsgExecuteContract(
          this.connectedWallet.walletAddress,
          RPSContractAddress,
          revealMoveMessage,
        ),
      ],
    });

    debugTransaction(result);
    return result;
  };
}

// const handleNewGameState = (newGameState: GameState) => {
//   if (JSON.stringify(newGameState) !== JSON.stringify(gameState)) {
//     setGameState(newGameState);

//     // check if the hand is over and we need to play the animation
//     if (newGameState.player1_move && newGameState.player2_move) {
//       // the hand has just ended or the game is just beginning
//       // shit how do you know who played what? you know what you played...
//       if (
//         newGameState.player1_hands_won !== 0 &&
//         newGameState.player2_hands_won !== 0 &&
//         newGameState.hands_tied !== 0
//       ) {
//         // the game has not just started, so a hand has just ended

//         // need to figure out what to set play game to

//         // approach for checking claim game / win game would be checking both players profiles after the game is over and seeing who won
//         // then if the game was ended and there were still more moves to make
//         // so many if statements...

//         // now i kinda want to go back to websockets after i deleted my progres...
//         // websockets might be slower, but they should just work with the code i already wrote

//         setPlayGame({
//           player1_move: 'Rock',
//           player2_move: 'Rock',
//           game_over: true,
//         });
//       }
//     }
//     // the game state changed!
//     // options:
//     // - player entered queue (easy)
//     // - player was matched (easy)
//     // - player made a move (easy)
//     // - opponent made a move (easy)
//     // - player revealed (easy)
//     // - opponent revealed (easy)
//     // - hand over (medium)
//     // - leave waiting queue (medium)

//     // - game claimed (hard)
//     // - game forfeit (hard)
//     // query the player state and see who won the game
//     // alternative would be to not delete games and let them still be queryable after forfeit

//     // - game
//     // no! this is not the right approach. I'm only doing this because I want to show something to Kairos. websockets is the proper way to do things
//   }
// };
