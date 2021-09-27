import { withVerticalNav } from '@/components/VerticalNav';
import {
  environment,
  LCDCClientConfig,
  RPSContractAddress,
  WebsocketAddress,
} from '@/constants';
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
import WebSocket from 'isomorphic-ws';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PaperPixelArt from '../../../../public/images/paper.png';
import RockPixelArt from '../../../../public/images/rock.png';
import ScissorsPixelArt from '../../../../public/images/scissors.png';

const useDotDotDot = () => {
  const [dots, setDots] = useState(`...`);

  useEffect(() => {
    const interval = setTimeout(() => {
      if (dots === `...`) {
        setDots(`.`);
      } else if (dots === `.`) {
        setDots(`..`);
      } else if (dots === `..`) {
        setDots(`...`);
      }
    }, 500);

    return () => {
      clearTimeout(interval);
    };
  });
  return dots;
};

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
    [gameState, connectedWallet],
  );
  // when playing
  const [gameMove, setGameMove] = useState<GameMove | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [playGame, setPlayGame] = useState<PlayGame | null>(null);
  // const [playGame, setPlayGame] = useState<PlayGame | null>({
  //   player1_move: `Rock` as GameMove,
  //   player2_move: `Paper` as GameMove,
  //   game_over: false,
  // });

  const terra = new LCDClient(LCDCClientConfig);

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
            RPSContractAddress,
            joinGameMessage,
            { uluna: betAmount },
          ),
        ],
      });

      console.log(`JOIN GAME TRANSACTION RESULT`);
      debugTransaction(result);
    }
  };

  const leaveWaitingQueue = async () => {
    if (connectedWallet) {
      // try to join a game
      const leaveWaitingQueueMessage: ExecuteMsg = {
        leave_waiting_queue: {},
      };

      // sent the transaction to request to join a game
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            RPSContractAddress,
            leaveWaitingQueueMessage,
          ),
        ],
      });
    }
  };

  const claimGame = async () => {
    if (connectedWallet && gameState) {
      // try to join a game
      const claimGameMessage: ExecuteMsg = {
        claim_game: { player1: gameState.player1, player2: gameState.player2 },
      };

      // sent the transaction to try to claim the game
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            RPSContractAddress,
            claimGameMessage,
          ),
        ],
      });
    }
  };

  const forfeit = async () => {
    if (connectedWallet) {
      // try to join a game
      const forfeitMessage: ExecuteMsg = {
        forfeit_game: {},
      };

      // sent the transaction to request to join a game
      const result = await connectedWallet.post({
        fee: new StdFee(30000000, [new Coin(`uusd`, 4500000)]),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            RPSContractAddress,
            forfeitMessage,
          ),
        ],
      });
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
            RPSContractAddress,
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
    if (gameState && connectedWallet) {
      if (!gameMove || !nonce) {
        alert(`Can't reveal move :( Did you refresh the page?`);
        return;
      }

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
            RPSContractAddress,
            revealMoveMessage,
          ),
        ],
      });

      console.log(result);
    }
  };

  const updateGameState = async () => {
    if (connectedWallet) {
      // QUERY GAME STATUS
      const query_msg: QueryMsg = {
        get_game_by_player: {
          player: connectedWallet.walletAddress,
        },
      };
      const res = (await terra.wasm.contractQuery(
        RPSContractAddress,
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
        // game was won
        // run the relevant animation
        setPlayGame({
          player1_move: res.player1_game_move as GameMove,
          player2_move: res.player2_game_move as GameMove,
          game_over: true,
        });
      }
    } else if (res.action === `leave_waiting_queue`) {
      // player left the waiting queue
      // set screen back to init
      setScreenState(`Init`);
    } else if (res.action === `forfeit_game`) {
      // the game was forfeit

      if (res.game_forfeit_by === connectedWallet?.walletAddress) {
        // if forfeit by you then send you to the init screen
        setScreenState(`Init`);
      } else {
        // if forfeit by opponent, then show that opponent forfeit
        alert(`Your opponent forfeited. You Win!`);
        setScreenState(`Init`);
      }
    } else if (res.action === `claim_game`) {
      if (res.game_claimed_by === connectedWallet?.walletAddress) {
        // you claimed the game successfully
        alert(
          `You claimed victory because your opponent took too long to move. You Win!`,
        );
        setScreenState(`Init`);
      } else {
        // someone other than yourself (your opponent) claimed the game
        alert(
          `Your opponent claimed victory because you took too long to move... Better luck next time.`,
        );
        setScreenState(`Init`);
      }
    }
  };

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

  useEffect(() => {
    // initial game state update for when you refresh the page
    console.log(connectedWallet);
    console.log(playGame);
    updateGameState();

    if (connectedWallet) {
      if (environment === `bombay`) {
        const connectObserver = () => {
          const ws = new WebSocket(`wss://observer.terra.dev`);
          ws.onopen = function () {
            console.log(`connected to websocket. subscribing...`);
            // subscribe to new_block events
            ws.send(
              JSON.stringify({ subscribe: `new_block`, chain_id: `bombay-11` }),
            );
          };
          ws.onmessage = function (message) {
            console.log(`NEW MESSage`);
            /* process messages here */
            const data = JSON.parse(message.data.toString());
            const rpsTransactions = data.data.txs.reduce(
              (acc: any[], txn: any) => {
                if (!txn.logs) return false;
                if (txn.logs.length === 0) return false;

                const rpsExecuteEvent = txn.logs[0].events.find(
                  (tmpEvent: any) =>
                    tmpEvent.type === `execute_contract` &&
                    tmpEvent.attributes.some(
                      (attr: any) =>
                        attr.key === `contract_address` &&
                        attr.value === RPSContractAddress,
                    ),
                );

                if (rpsExecuteEvent) {
                  // console.log(txn);

                  const playerExecuteEvent = txn.logs[0].events.find(
                    (tmpEvent: any) =>
                      tmpEvent.type === `wasm` &&
                      tmpEvent.attributes.some(
                        (attr: any) =>
                          attr.key === `players` &&
                          (attr.value as string).includes(
                            connectedWallet.walletAddress,
                          ),
                      ),
                  );
                  if (playerExecuteEvent) {
                    acc.push(
                      playerExecuteEvent.attributes.reduce(
                        (accAttr: any, attr: any) => {
                          const newVal = { [attr.key]: attr.value };
                          return Object.assign(newVal, accAttr);
                        },
                        {},
                      ),
                    );
                  }
                }
                return acc;
              },
              [],
            );
            console.log(rpsTransactions);
            for (let i = 0; i < rpsTransactions.length; i += 1) {
              handleResponse(rpsTransactions[i]);
            }
          };
          // ws.onclose = function (e) {
          //   console.log('websocket closed. reopening...');
          //   setTimeout(function () {
          //     connectObserver();
          //   }, 1000);
          // };
          return ws;
        };
        const ws = connectObserver();
        return () => {
          ws.close();
        };
      }
      const wsclient = new WebSocketClient(WebsocketAddress);
      console.log(`Setting up subscription!`);
      // send tracker

      wsclient.on(`open`, () => {
        console.log(`CONNECTION OPENED!`);
      });
      wsclient.subscribe(
        `Tx`,
        {
          'execute_contract.contract_address': RPSContractAddress,
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
      return () => {
        wsclient.destroy();
        // clearInterval(interval);
      };
    }
    return () => {
      console.log(`Unmounting without wallet`);
    };
  }, [connectedWallet]);

  const InitScreen = () => (
    // <div className="max-w-3xl mt-20">
    //   <p className="text-6xl dark:text-white">Play Game</p>
    <>
      <p className="text-3xl dark:text-white mt-20">
        Battle A Stranger (best out of 3)
      </p>

      <div className="max-w-4xl flex items-center justify-between mt-10">
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

  const FindingOpponentScreen = () => {
    const dots = useDotDotDot();

    return (
      <>
        <p className="text-2xl md:text-3xl dark:text-white">{`Finding an opponent${dots}`}</p>

        <div className="mt-10">
          {/* <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
            Abort
          </p> */}

          <button
            type="button"
            className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            onClick={() => leaveWaitingQueue()}
          >
            Abort Mission
          </button>
        </div>
      </>
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
          <p className="text-6xl text-center dark:text-white">
            {`${getMessage()}`}
          </p>

          <button
            type="button"
            className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400 mt-10"
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
              className="text-6xl text-center dark:text-white"
              style={{ visibility: `hidden` }}
            >
              {`${getMessage()}`}
            </p>
            <div
              style={{
                display: `flex`,
                justifyContent: `space-between`,
                position: `relative`,
                bottom: `80px`,
              }}
            >
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
            <p className="text-6xl text-center dark:text-white">
              {`${getMessage()}`}
            </p>
            <div
              style={{
                display: `flex`,
                justifyContent: `space-between`,
                position: `relative`,
                bottom: `80px`,
              }}
            >
              <LeftMove gameMove={playGame.player1_move} />
              <RightMove gameMove={playGame.player2_move} />
            </div>
          </>
        )}
      </>
    );
  };

  const WaitingForOpponentToMove = () => {
    const dots = useDotDotDot();
    const [countDown, setCountDown] = useState<number | null>(null);

    // set timer so that button for claiming game is shown after 10 seconds
    useEffect(() => {
      const timeout = setTimeout(() => {
        setCountDown(50);
      }, 10000);
    }, []);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (countDown && countDown > 0) {
          setCountDown(countDown - 1);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }, [countDown]);

    return (
      <>
        <p className="text-2xl md:text-3xl dark:text-white">{`Waiting for opponent to move${dots}`}</p>

        {countDown != null && (
          <div>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white mt-10">
              {`You can claim the game if your opponent doesn't move in the next ${countDown} seconds`}
            </p>

            {countDown === 0 && (
              <button
                type="button"
                className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                onClick={() => claimGame()}
              >
                Claim Game
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  const WaitingForOpponentToReveal = () => {
    const dots = useDotDotDot();
    const [countDown, setCountDown] = useState<number | null>(null);

    // set timer so that button for claiming game is shown after 10 seconds
    useEffect(() => {
      const timeout = setTimeout(() => {
        setCountDown(50);
      }, 10000);
    }, []);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (countDown && countDown > 0) {
          setCountDown(countDown - 1);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }, [countDown]);

    return (
      <>
        <p className="text-2xl md:text-3xl dark:text-white">{`Waiting for opponent to reveal${dots}`}</p>

        {countDown != null && (
          <div>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white mt-10">
              {`You can claim the game if your opponent doesn't reveal in the next ${countDown} seconds`}
            </p>

            {countDown === 0 && (
              <button
                type="button"
                className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                onClick={() => claimGame()}
              >
                Claim Game
              </button>
            )}
          </div>
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
                  .map((coin) => `${parseInt(coin.amount, 10)} ${coin.denom}, `)
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
                      {[
                        [`Moon`, `Rock`],
                        [`Paper`, `Paper`],
                        [`Scissors`, `Scissors`],
                      ].map(([name, move]) => (
                        <button
                          type="button"
                          className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                          key={`${move}`}
                          onClick={() => commitMove(move as GameMove)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              if (gameStatus === `Waiting for opponent to move`) {
                return <WaitingForOpponentToMove />;
              }
              if (gameStatus === `Your Turn to Reveal`) {
                return (
                  <div className="max-w-lg flex items-center justify-between mt-10">
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

                    {/* <div>
                      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
                        Forfeit
                      </p>

                      <button
                        type="button"
                        className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                        onClick={() => forfeit()}
                      >
                        Forfeit
                      </button>
                    </div> */}
                  </div>
                );
              }
              if (gameStatus === `Waiting for opponent to reveal`) {
                return <WaitingForOpponentToReveal />;
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
