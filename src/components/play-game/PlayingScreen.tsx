import RPSApi from '@/api';
import { useDotDotDot } from '@/hooks/useDotDotDot';
import useLocalStorage from '@/hooks/useLocalStorage';
import { GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import {
  formatAddressShort,
  getGameStatus,
  getOpponentNumber,
  getPlayerNumber,
} from '@/utils';
import { useEffect, useMemo, useState } from 'react';
import { GameScreen } from './GameScreen';

interface PlayGame {
  player1_move: GameMove;
  player2_move: GameMove;
  game_over: boolean;
}

export const PlayingScreen = ({
  gameState,
  rpsApi,
  setScreenState,
  playGame,
  setPlayGame,
  setLoading,
}: {
  gameState: GameState;
  rpsApi: RPSApi;
  setScreenState: any;
  playGame: PlayGame | null;
  setPlayGame: any;
  setLoading: any;
}) => {
  // when playing
  const [gameMove, setGameMove] = useLocalStorage<GameMove | null>(
    `gameMove`,
    null,
  );
  const [nonce, setNonce] = useLocalStorage(`nonce`, ``);

  const claimGame = async () => {
    try {
      await rpsApi.claimGame(gameState);
      setLoading(true);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(`Unknown error. Please file bug report.`);
      }
    }
  };

  const commitMove = async (newGameMove: GameMove) => {
    const newNonce = (Math.random() + 1).toString(36).substring(7);

    try {
      await rpsApi.commitMove(gameState, newGameMove, newNonce);
      setLoading(true);
      setGameMove(newGameMove);
      setNonce(newNonce);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(`Unknown error. Please file bug report.`);
      }
    }
  };

  const revealMove = async () => {
    if (!gameMove || nonce === ``) {
      alert(`Can't reveal move :( Did you change browsers?`);
      return;
    }

    try {
      await rpsApi.revealMove(gameState, gameMove, nonce);

      setLoading(true);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(`Unknown error. Please file bug report.`);
      }
    }
  };

  const gameStatus = useMemo(
    () => getGameStatus(gameState, rpsApi.connectedWallet.walletAddress),
    [gameState],
  );

  const WaitingForOpponentToMove = () => {
    const dots = useDotDotDot();
    const [countDown, setCountDown] = useState<number | null>(null);

    // set timer so that button for claiming game is shown after 10 seconds
    useEffect(() => {
      const timeout = setTimeout(() => {
        setCountDown(40);
      }, 20000);
      return () => {
        clearTimeout(timeout);
      };
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
        setCountDown(40);
      }, 20000);

      return () => clearTimeout(timeout);
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
  return (
    <div>
      {playGame === null ? (
        <>
          <div>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Opponent:{` `}
              {formatAddressShort(
                gameState[
                  getOpponentNumber(
                    gameState,
                    rpsApi.connectedWallet.walletAddress,
                  )
                ],
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
                      } ${coin.denom.slice(1)}, `,
                  )
                  .join(``)
                  .slice(0, -2)}
            </p>
            <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl dark:text-white">
              Hands Won:{` `}
              {
                gameState[
                  `${getPlayerNumber(
                    gameState,
                    rpsApi.connectedWallet.walletAddress,
                  )}_hands_won`
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
                  `${getOpponentNumber(
                    gameState,
                    rpsApi.connectedWallet.walletAddress,
                  )}_hands_won`
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
        <GameScreen
          gameState={gameState}
          rpsApi={rpsApi}
          setScreenState={setScreenState}
          playGame={playGame}
          setPlayGame={setPlayGame}
        />
      )}
    </div>
  );
};
