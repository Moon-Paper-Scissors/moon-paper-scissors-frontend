import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import {
  Coin,
  LocalTerra,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import sha256 from 'crypto-js/sha256';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameState {
  player1: string;
  player2: string;
}

type ScreenState =
  | 'Finding Opponent'
  | 'Send Move'
  | 'Opponent Move'
  | 'Reveal Move'
  | 'Opponent Reveal';

const contractAddress = `terra17ak0ku2uvfs04w4u867xhgvfg4ta6mgqfffm2u`;
const betAmount = `5000000`;

const PlayGame = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameState | null>(null);
  const [screenState, setScreenState] =
    useState<ScreenState>(`Finding Opponent`);
  const [gameMove, setGameMove] = useState<GameMove | null>(null);
  const [nonce, setNonce] = useState(``);

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

      console.log(result);

      setNonce(newNonce);
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

      console.log(result);

      setNonce(newNonce);
    }
  };

  // decide whether or not to upsert a game depending on if the nonce is set
  const playMove = async (newGameMove: GameMove) => {
    setGameMove(newGameMove);
    if (nonce === ``) {
      await upsertGameWithMove(newGameMove);
    } else {
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

  useEffect(() => {
    if (connectedWallet) {
      const terra = new LocalTerra();

      console.log(`Connecting to socket`);
      const newSocket = io(`http://localhost:8080`, {
        query: {
          accAddress: connectedWallet.walletAddress,
        },
      });
      console.log(`Socket connected`);

      newSocket.on(`game.begin`, async (_newGameData) => {
        const newGameData = _newGameData as GameState;
        setGameInfo(newGameData);
        setScreenState(`Send Move`);
      });

      newSocket.on(`oponent.left`, () => {
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
