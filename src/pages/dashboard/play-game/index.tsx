import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
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
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameInfo {
  player1: string;
  player2: string;
}

type ScreenState =
  | 'Finding Opponent'
  | 'Send Move'
  | 'Opponent Move'
  | 'Reveal Move'
  | 'Opponent Reveal';

const contractAddress = `terra1dp972qfjp362m7slfjsvzg6w72ky5reuskhuxv`;
const betAmount = `5000000`;

const PlayGame = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [screenState, setScreenState] =
    useState<ScreenState>(`Finding Opponent`);
  const [gameMove, setGameMove] = useState<GameMove | null>(null);
  const [nonce, setNonce] = useState(``);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStatus, setGameStatus] = useState(`Your Move`);

  // possible screens
  // make a move
  // sending move
  // waiting for opponent to move
  // reveal your move
  // revealing move
  // waiting for opponent to reveal move

  // could add some more granularity via socket io

  const connectedWallet = useConnectedWallet();

  const upsertGameWithMove = async (newGameMove: GameMove) => {
    if (gameInfo && connectedWallet) {
      const newNonce = (Math.random() + 1).toString(36).substring(7);
      const moveHash = sha256(`${newGameMove}${newNonce}`).toString();

      // upsert game message
      const upsertGameWithMoveMessage: ExecuteMsg = {
        upsert_game_with_move: {
          player1: gameInfo.player1,
          player2: gameInfo.player2,
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
            upsertGameWithMoveMessage,
            { uluna: betAmount },
          ),
        ],
      });

      console.log(`TRANSACTION RESULT`);
      debugTransaction(result);

      setNonce(newNonce);

      setInterval(() => {
        updateGameState();
      }, 1000);
    }
  };

  const commitMove = async (newGameMove: GameMove) => {
    if (gameInfo && connectedWallet) {
      const newNonce = (Math.random() + 1).toString(36).substring(7);
      const moveHash = sha256(`${newGameMove}${newNonce}`).toString();

      // upsert game message
      const commitMoveMessage: ExecuteMsg = {
        commit_move: {
          player1: gameInfo.player1,
          player2: gameInfo.player2,
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

  // decide whether or not to upsert a game depending on if the nonce is set
  const playMove = async (newGameMove: GameMove) => {
    setGameMove(newGameMove);
    if (nonce === ``) {
      console.log(`UPSERTING GAME WITH MOVE`);
      await upsertGameWithMove(newGameMove);
    } else {
      console.log(`COMMITTING MOVE`);
      await commitMove(newGameMove);
    }
  };

  const revealMove = async () => {
    if (gameInfo && connectedWallet && gameMove) {
      // upsert game message
      const revealMoveMessage: ExecuteMsg = {
        reveal_move: {
          player1: gameInfo.player1,
          player2: gameInfo.player2,
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

  const updateGameState = async () => {
    if (gameInfo) {
      // console.log('INIT LOCAL TERRA');
      // get terra
      const terra = new LCDClient({
        URL: `http://localhost:1317`,
        chainID: `localterra`,
      });

      // QUERY GAME STATUS
      const query_msg: QueryMsg = {
        get_game: {
          player1: gameInfo.player1,
          player2: gameInfo.player2,
        },
      };
      // QUERY GAME STATUS
      // console.log('QUERYING GAME STATE');
      const res = (
        (await terra.wasm.contractQuery(contractAddress, query_msg)) as {
          game: GameState;
        }
      ).game;
      console.info(res);

      let newGameStatus;
      // possible game status
      // Your Move

      // for now assume you are player 1
      if (res.player1 === connectedWallet?.walletAddress) {
        if (!res.player1_move) {
          // player 1 hasn't moved yet, so move
          newGameStatus = `Your Move`;
        } else if (!res.player2_move) {
          // player 2 hasn't moved yet, so wait
          newGameStatus = `Waiting for opponent to move`;
        } else if (Object.keys(res.player1_move)[0] === `HashedMove`) {
          // player 1 hasn't revealed yet, so reveal
          newGameStatus = `Your Turn to Reveal`;
        } else if (Object.keys(res.player2_move)[0] === `HashedMove`) {
          // player 2 hasn't revealed yet, so wait
          newGameStatus = `Waiting for opponent to reveal`;
        } else {
          newGameStatus = `Unexpected behavior`;
        }
      } else if (res.player2 === connectedWallet?.walletAddress) {
        if (!res.player2_move) {
          // player 1 hasn't moved yet, so move
          newGameStatus = `Your Move`;
        } else if (!res.player1_move) {
          // player 2 hasn't moved yet, so wait
          newGameStatus = `Waiting for opponent to move`;
        } else if (Object.keys(res.player2_move)[0] === `HashedMove`) {
          // player 1 hasn't revealed yet, so reveal
          newGameStatus = `Your Turn to Reveal`;
        } else if (Object.keys(res.player1_move)[0] === `HashedMove`) {
          // player 2 hasn't revealed yet, so wait
          newGameStatus = `Waiting for opponent to reveal`;
        } else {
          newGameStatus = `Unexpected behavior`;
        }
      } else {
        newGameStatus = `Unexpected behavior`;
      }

      setGameStatus(newGameStatus);
      setGameState(res);
    }
  };

  useEffect(() => {
    if (connectedWallet) {
      console.log(`Connecting to socket`);
      const newSocket = io(`http://localhost:8080`, {
        query: {
          accAddress: connectedWallet.walletAddress,
        },
      });
      console.log(`Socket connected`);

      newSocket.on(`game.begin`, async (_newGameData) => {
        const newGameData = _newGameData as GameInfo;
        setGameInfo(newGameData);
        setScreenState(`Send Move`);
      });

      newSocket.on(`opponent.left`, () => {
        setGameInfo(null);
        setScreenState(`Finding Opponent`);
      });

      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
    return () => {
      console.log(`No socket to close`);
    };
  }, [connectedWallet]);

  // first socket is connecting

  if (!socket) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Connecting to socket...
      </p>
    );
  }

  if (!gameInfo || screenState === `Finding Opponent`) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Finding an opponent...
      </p>
    );
  }

  const SendMoveScreen = () => (
    <div>
      <div>
        <p>Your Move</p>
        {[`Rock`, `Paper`, `Scissors`].map((move) => (
          <button
            type="button"
            className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            key={`${move}`}
            onClick={() => playMove(move as GameMove)}
          >
            {move}
          </button>
        ))}
      </div>
      <div>
        <p>Reveal</p>

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

  const OpponentMoveScreen = () => <p>Waiting for opponent to move</p>;

  const RevealMoveScreen = () => <p>Time to reveal your move</p>;

  const OpponentRevealScreen = () => <p>Waiting for opponent to reveal move</p>;

  return (
    <div>
      <div>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Playing Game
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 1: {gameInfo.player1}
        </p>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Player 2: {gameInfo.player2}
        </p>
      </div>
      <>
        <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
          Bet Amount: {`${betAmount} uluna`}
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
        {(() => {
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
        })()}
      </div>
    </div>
  );
};

const PlayGameWithNav = () => withVerticalNav(<PlayGame />);
export default PlayGameWithNav;
