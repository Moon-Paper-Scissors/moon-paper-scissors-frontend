import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { GetGameByPlayerResponse } from '@/types/get_game_by_player_response';
import { QueryMsg } from '@/types/query_msg';
import { formatAddressShort } from '@/utils/addressHelpers';
import { debugTransaction } from '@/utils/txnHelpers';
import {
  Coin,
  LCDClient,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import {
  ConnectedWallet,
  useConnectedWallet,
} from '@terra-money/wallet-provider';
import sha256 from 'crypto-js/sha256';
import { useEffect, useMemo, useState } from 'react';

const getGameStatus = (game: GameState, walletAddress: string) => {
  let newGameStatus;

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

type ScreenState = 'Init' | 'Finding Opponent' | 'In Game';

type GameStatus =
  | 'Your Move'
  | 'Waiting for opponent to move'
  | 'Your Turn to Reveal'
  | 'Waiting for opponent to reveal'
  | 'Unexpected behavior';

const contractAddress = `terra10pyejy66429refv3g35g2t7am0was7ya7kz2a4`;
// const betAmount = `5000000`;

const PlayGame = () => {
  const connectedWallet = useConnectedWallet();

  const [screenState, setScreenState] = useState<ScreenState>(`Init`);

  // how to know if you found an opponent

  // after finding an opponent
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStatus = useMemo(
    () =>
      gameState && connectedWallet
        ? getGameStatus(gameState, connectedWallet.walletAddress)
        : null,

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
  const getPlayerNumber = (game: GameState, wallet: ConnectedWallet) =>
    wallet.walletAddress === game.player1 ? `player1` : `player2`;

  const getOpponentNumber = (game: GameState, wallet: ConnectedWallet) =>
    wallet.walletAddress === game.player1 ? `player2` : `player1`;

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

      setGameMove(newGameMove);
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

  const updateGameState = async () => {
    if (connectedWallet) {
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
        setScreenState(`In Game`);
        setGameState(res.game);
      } else if (res.waiting_for_opponent) {
        // waiting for opponent
        setScreenState(`Finding Opponent`);
      } else {
        // player hasn't entered a game yet
        setScreenState(`Init`);
      }
    } else {
      console.log(`Wallet not connected!`);
    }
  };

  useEffect(() => {
    // continously fetch the game state
    const interval = setInterval(() => {
      updateGameState();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [connectedWallet]);

  const InitScreen = () => (
    // <div className="max-w-3xl mt-20">
    //   <p className="text-6xl dark:text-white">Play Game</p>
    <>
      <p className="text-3xl dark:text-white mt-20">
        Play with a stranger (best out of 5)
      </p>

      <div className="flex items-center justify-between mt-10">
        {[`100000`, `1000000`, `5000000`].map((betAmount) => (
          <button
            type="button"
            className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            key={`${betAmount}`}
            onClick={() => joinGame(betAmount)}
          >
            Bet Amount:
            <br />
            {`${parseInt(betAmount, 10) / 1000000} luna`}
          </button>
        ))}
      </div>
    </>
  );

  // if (screenState === `Finding Opponent` || !gameState) {
  const FindingOpponentScreen = () => {
    const [loadingText, setLoadingText] = useState(`Finding an opponent...`);

    useEffect(() => {
      const interval = setTimeout(() => {
        if (loadingText === `Finding an opponent...`) {
          setLoadingText(`Finding an opponent.`);
        } else if (loadingText === `Finding an opponent.`) {
          setLoadingText(`Finding an opponent..`);
        } else if (loadingText === `Finding an opponent..`) {
          setLoadingText(`Finding an opponent...`);
        }
      }, 500);

      return () => {
        clearTimeout(interval);
      };
    }, [loadingText]);

    return (
      <p className="text-2xl md:text-3xl dark:text-white">{loadingText}</p>
    );
  };

  const PlayingScreen = () => (
    <div>
      {gameState && connectedWallet && (
        <>
          <div>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Opponent:{` `}
              {formatAddressShort(
                gameState[getOpponentNumber(gameState, connectedWallet)],
              )}
            </p>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Bet Amount:{` `}
              {gameState &&
                gameState.bet_amount
                  .map(
                    (coin) =>
                      `${
                        parseInt(coin.amount, 10) / 1000000
                      } ${coin.denom.substr(1)}, `,
                  )
                  .join(``)
                  .slice(0, -2)}
            </p>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Hands Won:{` `}
              {
                gameState[
                  `${getPlayerNumber(gameState, connectedWallet)}_hands_won`
                ]
              }
            </p>

            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Ties: {gameState.hands_tied}
            </p>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Hands Lost:{` `}
              {
                gameState[
                  `${getOpponentNumber(gameState, connectedWallet)}_hands_won`
                ]
              }
            </p>

            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Game Status: {gameStatus}
            </p>
          </div>
          <div className="mt-10">
            {(() => {
              if (gameStatus === `Your Move`) {
                return (
                  <div>
                    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
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
                );
              }
              if (gameStatus === `Waiting for opponent to move`) {
                return (
                  <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
                    {gameStatus}
                  </p>
                );
              }
              if (gameStatus === `Your Turn to Reveal`) {
                return (
                  <div>
                    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
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
                );
              }
              if (gameStatus === `Waiting for opponent to reveal`) {
                return (
                  <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
                    {gameStatus}
                  </p>
                );
              }
              return (
                <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
                  {gameStatus}
                </p>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mt-20">
      <p className="text-6xl dark:text-white mb-10">
        {screenState === `In Game` ? `Playing Game` : `Play Game`}
      </p>
      {/* {screenState === 'Init' ? <InitScreen /> : <FindingOpponentScreen />} */}
      {(() => {
        if (screenState === `Init`) {
          return <InitScreen />;
        }
        if (screenState === `Finding Opponent` || !gameState) {
          return <FindingOpponentScreen />;
        }
        return <PlayingScreen />;
      })()}
    </div>
  );
};

const PlayGameWithNav = () => withVerticalNav(<PlayGame />);
export default PlayGameWithNav;
