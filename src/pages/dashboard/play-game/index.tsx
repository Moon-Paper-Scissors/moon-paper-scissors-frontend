import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg } from '@/types/execute_msg';
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

const contractAddress = ``;
const betAmount = `5000000`;
const nonce = `1`;
const rock_move_hash = sha256(`Rock${nonce}`).toString();
const paper_move_hash = sha256(`Paper${nonce}`).toString();
const scissors_move_hash = sha256(`Scissors${nonce}`).toString();

const PlayGame = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameState | null>(null);

  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    if (connectedWallet) {
      const terra = new LocalTerra();

      const newSocket = io(`http://localhost:8080`, {
        query: {
          accAddress: connectedWallet.walletAddress,
        },
      });

      // how to do users with the local terra and wallets?
      // just don't use the station for testing initially
      //     connectedWallet
      //       .post({
      //         fee: new StdFee(1000000, '200000uusd'),
      //         msgs: [
      //           new MsgSend(connectedWallet.walletAddress, toAddress, {
      //             uusd: 1000000,
      //           }),
      //         ],
      //       })
      //       .then((nextTxResult: TxResult) => {
      //         console.log(nextTxResult);
      //         setTxResult(nextTxResult);
      //       })
      //       .catch((error: unknown) => {
      //         if (error instanceof UserDenied) {
      //           setTxError('User Denied');
      //         } else if (error instanceof CreateTxFailed) {
      //           setTxError('Create Tx Failed: ' + error.message);
      //         } else if (error instanceof TxFailed) {
      //           setTxError('Tx Failed: ' + error.message);
      //         } else if (error instanceof Timeout) {
      //           setTxError('Timeout');
      //         } else if (error instanceof TxUnspecifiedError) {
      //           setTxError('Unspecified Error: ' + error.message);
      //         } else {
      //           setTxError(
      //             'Unknown Error: ' +
      //               (error instanceof Error ? error.message : String(error)),
      //           );
      //         }
      //       });

      //       // send user1 transaction
      //       const sendUser1Transaction = async (message: ExecuteMsg) => {
      //         await sendTransaction(terra, connectedWallet.terraAddress, [
      //           new MsgExecuteContract(
      //             user1.key.accAddress,
      //             contractAddress,
      //             message,
      //           ),
      //         ]);
      //       };

      //       // send user2 transaction
      //       const sendUser2Transaction = async (message: ExecuteMsg) => {
      //         await sendTransaction(terra, user2, [
      //           new MsgExecuteContract(
      //             user2.key.accAddress,
      //             contractAddress,
      //             message,
      //           ),
      //         ]);
      //       };

      newSocket.on(`game.begin`, async (_newGameData) => {
        const newGameData = _newGameData as GameState;
        setGameInfo(newGameData);

        // upsert game message
        const upsertGameWithMoveMessage: ExecuteMsg = {
          upsert_game_with_move: {
            player1: newGameData.player1,
            player2: newGameData.player2,
            hashed_move: rock_move_hash,
          },
        };

        // Send the transaction to start the game
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

  if (!gameInfo) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Finding an opponent...
      </p>
    );
  }

  return (
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
  );
};

export default () => withVerticalNav(<PlayGame />);
