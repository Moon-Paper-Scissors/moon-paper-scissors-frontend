import { withVerticalNav } from '@/components/VerticalNav';
import { ExecuteMsg, GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { GetGameByPlayerResponse } from '@/types/get_game_by_player_response';
import { QueryMsg } from '@/types/query_msg';
import { formatAddressShort } from '@/utils/addressHelpers';
import { debugTransaction } from '@/utils/txnHelpers';
import { WebSocketClient } from '@/utils/webSocketClient';
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
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PaperPixelArt from '../../../../public/images/paper.png';
import RockPixelArt from '../../../../public/images/rock.png';
import ScissorsPixelArt from '../../../../public/images/scissors.png';

const contractAddress = `terra1tndcaqxkpc5ce9qee5ggqf430mr2z3pefe5wj6`;

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

interface PlayGame {
  player1_move: GameMove;
  player2_move: GameMove;
  game_over: boolean;
  // hand_won: string;
}

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
  const [playGame, setPlayGame] = useState<PlayGame | null>(null);
  // const [playGame, setPlayGame] = useState<PlayGame | null>({
  //   player1_move: 'Rock' as GameMove,
  //   player2_move: 'Paper' as GameMove,
  //   // hand_won: 'player1',
  // });

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

  const handleResponse = (res: any) => {
    if (res.action === `join_game`) {
      // join_game message
      if (res.opponent_found === `false`) {
        // waiting for opponent
        setScreenState(`Finding Opponent`);
      } else if (res.opponent_found === `true`) {
        // found opponent
        setScreenState(`In Game`);
        setGameState(JSON.parse(res.game_state));
      } else {
        console.error(`Invalid opponent_found value`);
      }
    } else if (res.action === `commit_move`) {
      setGameState(JSON.parse(res.game_state));
    } else if (res.action === `reveal_move`) {
      const tmpGameState = JSON.parse(res.game_state) as GameState;
      setGameState(tmpGameState);

      if (res.hand_won) {
        // a hand was won
        // run the relevant animation
        setPlayGame({
          player1_move: res.player1_game_move as GameMove,
          player2_move: res.player2_game_move as GameMove,
          game_over: false,
        });
      } else if (res.game_won) {
        setPlayGame({
          player1_move: res.player1_game_move as GameMove,
          player2_move: res.player2_game_move as GameMove,
          game_over: true,
        });

        // game was won
        // run the relevant animation
      }
    }
  };

  useEffect(() => {
    // initial game state update for when you refresh the page
    console.log(playGame);
    updateGameState();

    const wsclient = new WebSocketClient(`ws://localhost:26657/websocket`);

    if (connectedWallet) {
      console.log(`Setting up subscription!`);
      // send tracker

      wsclient.on(`open`, () => {
        console.log(`CONNECTION OPENED!`);
      });
      wsclient.subscribe(
        `Tx`,
        {
          'execute_contract.contract_address': contractAddress,
          'wasm.players': [`CONTAINS`, connectedWallet.walletAddress],
        },
        (data) => {
          const res = data.value.TxResult.result.events
            .find((event: any) => event.type === `wasm`)
            .attributes.reduce((acc: any, attr: any) => {
              acc[atob(attr.key)] = atob(attr.value);
              return acc;
            }, {});
          console.log(`Event received!`);
          console.log(res);
          handleResponse(res);
        },
      );
    }

    return () => {
      wsclient.destroy();
      // clearInterval(interval);
    };
  }, [connectedWallet]);

  const InitScreen = () => (
    // <div className="max-w-3xl mt-20">
    //   <p className="text-6xl dark:text-white">Play Game</p>
    <>
      <p className="text-3xl dark:text-white mt-20">
        Play with a stranger (best out of 3)
      </p>

      <div className="max-w-3xl flex items-center justify-between mt-10">
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

  const GameScreen = () => {
    const [showResult, setShowResult] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
      const resultTimeout = setTimeout(() => {
        setShowResult(true);
      }, 1500);

      const returnTimeout = setTimeout(() => {
        if (playGame?.game_over) {
          setGameOver(true);
        } else {
          setPlayGame(null);
        }
      }, 3000);

      return () => {
        clearTimeout(resultTimeout);
        clearTimeout(returnTimeout);
      };
    }, []);

    const upAndDown = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-80px); }
    0% { transform: translateY(0px); }
    `;

    const UpAndDownSpan = styled.span`
       {
        animation: ${upAndDown} 0.5s linear 3;
      }
    `;

    const LeftMove = ({
      gameMove: displayGameMove,
    }: {
      gameMove: GameMove;
    }) => (
      <span
        style={{
          display: `inline-block`,
          transform: `rotate(90deg) scaleX(-1) scale(0.7)`,
        }}
      >
        <Image
          src={(() => {
            if (displayGameMove === `Rock`) {
              return RockPixelArt;
            }
            if (displayGameMove === `Paper`) {
              return PaperPixelArt;
            }
            return ScissorsPixelArt;
          })()}
          alt={displayGameMove}
        />
      </span>
    );

    const RightMove = ({
      gameMove: displayGameMove,
    }: {
      gameMove: GameMove;
    }) => (
      <span
        style={{
          display: `inline-block`,
          transform: `rotate(-90deg) scale(0.7)`,
        }}
      >
        <Image
          src={(() => {
            if (displayGameMove === `Rock`) {
              return RockPixelArt;
            }
            if (displayGameMove === `Paper`) {
              return PaperPixelArt;
            }
            return ScissorsPixelArt;
          })()}
          alt={displayGameMove}
        />
      </span>
    );

    const getWinner = (player1_move: GameMove, player2_move: GameMove) => {
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

    const getMessage = () => {
      if (playGame && gameState && connectedWallet) {
        const winner = getWinner(playGame.player1_move, playGame.player2_move);
        if (getPlayerNumber(gameState, connectedWallet) === winner) {
          return `You Won!`;
        }
        if (getOpponentNumber(gameState, connectedWallet) === winner) {
          return `You Lost...`;
        }
        return `Tie`;
      }
      return `No Game`;
    };

    if (playGame === null) {
      return <p>Error</p>;
    }

    if (gameOver) {
      return (
        <>
          <p className="text-6xl text-center dark:text-white mb-10">
            {`${getMessage()}`}
          </p>

          <button
            type="button"
            className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            onClick={() => setScreenState(`Init`)}
          >
            Play Again
          </button>
        </>
      );
    }

    return (
      <>
        {!showResult ? (
          <>
            <p
              className="text-6xl text-center dark:text-white mb-10"
              style={{ visibility: `hidden` }}
            >
              {`${getMessage()}`}
            </p>
            <div style={{ display: `flex`, justifyContent: `space-between` }}>
              <UpAndDownSpan>
                <LeftMove gameMove={`Rock` as GameMove} />
              </UpAndDownSpan>
              <UpAndDownSpan>
                <RightMove gameMove={`Rock` as GameMove} />
              </UpAndDownSpan>
            </div>
          </>
        ) : (
          <>
            <p className="text-6xl text-center dark:text-white mb-10">
              {`${getMessage()}`}
            </p>
            <div style={{ display: `flex`, justifyContent: `space-between` }}>
              <LeftMove gameMove={playGame.player1_move} />
              <RightMove gameMove={playGame.player2_move} />
            </div>
          </>
        )}
      </>
    );
  };

  const PlayingScreen = () => (
    <div>
      {gameState && connectedWallet && playGame === null ? (
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

                    <div className="max-w-2xl flex items-center justify-between mt-10">
                      {[`Rock`, `Paper`, `Scissors`].map((move) => (
                        <button
                          type="button"
                          className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                          key={`${move}`}
                          onClick={() => commitMove(move as GameMove)}
                        >
                          {move}
                        </button>
                      ))}
                    </div>
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
                      className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
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
      ) : (
        <GameScreen />
      )}
    </div>
  );

  return (
    <div className="mt-20">
      <p className="text-6xl dark:text-white mb-10">
        {screenState === `In Game` ? `Playing Game` : `Play Game`}
      </p>
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
