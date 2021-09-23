import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { GetGameByPlayerResponse } from '@/types/get_game_by_player_response';
import { QueryMsg } from '@/types/query_msg';
import { debugTransaction } from '@/utils/txnHelpers';
import {
  Coin,
  LCDClient,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import sha256 from 'crypto-js/sha256';
import { useEffect, useMemo, useState } from 'react';

interface GameInfo {
  player1: string;
  player2: string;
}

type ScreenState = 'Init' | 'Finding Opponent' | 'In Game';

const contractAddress = `terra1dp972qfjp362m7slfjsvzg6w72ky5reuskhuxv`;
// const betAmount = `5000000`;

const PlayGame = () => {
  const connectedWallet = useConnectedWallet();

  const [screenState, setScreenState] = useState<ScreenState>(`Init`);

  // how to know if you found an opponent

  // after finding an opponent
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStatus = useMemo(
    () => (gameState ? getGameStatus(gameState) : null),
    [gameState],
  );
  // when playing
  const [gameMove, setGameMove] = useState<GameMove | null>(null);
  const [nonce, setNonce] = useState(``);

  const terra = new LCDClient({
    URL: `http://localhost:1317`,
    chainID: `localterra`,
  });

  // possible screens
  // make a move
  // sending move
  // waiting for opponent to move
  // reveal your move
  // revealing move
  // waiting for opponent to reveal move

  // could add some more granularity via socket io

  const joinGame = async (betAmount: string) => {
    if (connectedWallet) {
      // try to join a game
      const joinGameMessage: ExecuteMsg = {
        join_game: {},
      };

      // sent the transaction to request to join a game
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            contractAddress,
            joinGameMessage,
            { uluna: betAmount },
          ),
        ],
      });

      console.log(`JOIN GAME TRANSACTION RESULT`);
      debugTransaction(result);
    }
  };

  const commitMove = async (newGameMove: GameMove) => {
    if (gameState && connectedWallet) {
      const newNonce = (Math.random() + 1).toString(36).substring(7);
      const moveHash = sha256(`${newGameMove}${newNonce}`).toString();

      // upsert game message
      const commitMoveMessage: ExecuteMsg = {
        commit_move: {
          player1: gameState.player1,
          player2: gameState.player2,
          hashed_move: moveHash,
        },
      };

      // Send the transaction to upsert the game
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            contractAddress,
            commitMoveMessage,
          ),
        ],
      });

      console.log(`COMMIT TRANSACTION RESULT`);
      debugTransaction(result);

      setNonce(newNonce);
    }
  };

  const revealMove = async () => {
    if (gameState && connectedWallet && gameMove) {
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
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            contractAddress,
            revealMoveMessage,
          ),
        ],
      });

      console.log(result);
    }
  };

  const getGameStatus = (game: GameState) => {
    let newGameStatus;

    // for now assume you are player 1
    if (game.player1 === connectedWallet?.walletAddress) {
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
    } else if (game.player2 === connectedWallet?.walletAddress) {
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

  const updateGameState = async () => {
    if (gameState && connectedWallet) {
      // console.log('INIT LOCAL TERRA');
      // get terra

      // QUERY GAME STATUS
      const query_msg: QueryMsg = {
        get_game_by_player: {
          player: connectedWallet.walletAddress,
        },
      };
      // QUERY GAME STATUS
      // console.log('QUERYING GAME STATE');
      const res = (await terra.wasm.contractQuery(
        contractAddress,
        query_msg,
      )) as GetGameByPlayerResponse;
      console.info(res);

      if (res.game) {
        // player in game
        setGameState(res.game);
      } else if (res.waiting_for_opponent) {
        // waiting for opponent
        setScreenState(`Finding Opponent`);
      } else {
        // player hasn't entered a game yet
        setScreenState(`Init`);
      }
    }
  };

  useEffect(() => {
    // continously fetch the game state
    setInterval(() => {
      updateGameState();
    }, 1000);
  }, []);

  if (screenState === `Init`) {
    return (
      <div>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Start a game...
        </p>

        {[`100000`, `1000000`, `5000000`].map((betAmount) => (
          <button
            type="button"
            className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            key={`${betAmount}`}
            onClick={() => joinGame(betAmount)}
          >
            {`${betAmount} uluna`}
          </button>
        ))}
      </div>
    );
  }

  if (screenState === `Finding Opponent` || !gameState) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Finding an opponent...
      </p>
    );
  }

  const SendMoveScreen = () => (
    <div>
      <div>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Your Move
        </p>
        {[`Rock`, `Paper`, `Scissors`].map((move) => (
          <button
            type="button"
            className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            key={`${move}`}
            onClick={() => commitMove(move as GameMove)}
          >
            {move}
          </button>
        ))}
      </div>
      <div>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Reveal
        </p>

        <button
          type="button"
          className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
          onClick={() => revealMove()}
        >
          Reveal Move
        </button>
      </div>
    </div>
  );

  // const OpponentMoveScreen = () => <p>Waiting for opponent to move</p>;

  // const RevealMoveScreen = () => <p>Time to reveal your move</p>;

  // const OpponentRevealScreen = () => <p>Waiting for opponent to reveal move</p>;

  return (
    <div>
      <div>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Playing Game
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 1: {gameState.player1}
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 2: {gameState.player2}
        </p>
      </div>
      <>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Bet Amount: {`${gameState.bet_amount} uluna`}
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 1 Wins: {gameState ? gameState.player1_hands_won : `0`}
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 2 Wins: {gameState ? gameState.player2_hands_won : `0`}
        </p>

        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Ties: {gameState ? gameState.hands_tied : `0`}
        </p>

        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Game Status: {gameStatus}
        </p>
      </>

      <div>
        <SendMoveScreen />
        {/* {(() => {
          switch (screenState) {
            case `Send Move`:
              return <SendMoveScreen />;
            case `Opponent Move`:
              return <OpponentMoveScreen />;
            case `Reveal Move`:
              return <RevealMoveScreen />;
            case `Opponent Reveal`:
              return <OpponentRevealScreen />;
            default:
              return <div />;
          }
        })()} */}
      </div>
    </div>
  );
};

const PlayGameWithNav = () => withVerticalNav(<PlayGame />);
export default PlayGameWithNav;
