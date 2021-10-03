import RPSApi from '@/api';
import { UnmatchedPlayer } from '@/types/get_open_games_response';
import { formatAddressShort } from '@/utils';
import { useEffect, useState } from 'react';

export const InitScreen = ({
  rpsApi,
  setLoading,
}: {
  rpsApi: RPSApi;
  setLoading: any;
}) => {
  const [openGames, setOpenGames] = useState<UnmatchedPlayer[] | null>(null);

  const joinGame = async (betAmount: string) => {
    try {
      await rpsApi.joinGame(betAmount);
      setLoading(true);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(`Unknown error. Please file bug report.`);
      }
    }
  };

  useEffect(() => {
    rpsApi.fetchOpenGames().then((res) => setOpenGames(res.open_games));

    const interval = setInterval(() => {
      rpsApi.fetchOpenGames().then((res) => setOpenGames(res.open_games));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p className="text-3xl dark:text-white mt-20">
        Battle A Stranger (first to win 2 games)
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

      <p className="text-3xl dark:text-white mt-20">
        Join A Game (first to win 2 games)
      </p>

      <div className="">
        <div className="flex justify-around items-center h-20">
          <span className="dark:text-white text-3xl text-center flex-1">
            Opponent
          </span>
          <span className="dark:text-white text-3xl text-center flex-1">
            Bet Amount
          </span>
          <span className="dark:text-white text-3xl text-center flex-1">
            Join
          </span>
        </div>
        <hr style={{ borderTop: `4px solid white` }} />
        {openGames && openGames.length > 0 ? (
          openGames.map((openGame) => (
            <div
              key={openGame.address}
              className="flex justify-around items-center h-20"
            >
              <span className="dark:text-white text-3xl text-center flex-1">
                {formatAddressShort(openGame.address)}
              </span>
              <span className="dark:text-white text-3xl text-center flex-1">
                {openGame.bet_amount
                  .map(
                    (coin) =>
                      `${
                        parseInt(coin.amount, 10) / 1000000
                      } ${coin.denom.slice(1)}, `,
                  )
                  .join(``)
                  .slice(0, -2)}
                {` `}
              </span>
              <span className="dark:text-white text-3xl text-center flex-1">
                <button
                  type="button"
                  className="text-3xl py-1 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                  onClick={() => joinGame(openGame.bet_amount[0].amount)}
                >
                  Join Game
                </button>
              </span>
            </div>
          ))
        ) : (
          <div className="flex justify-around items-center h-20">
            <p className="dark:text-white text-3xl text-center flex-1">
              No Open Games
            </p>
          </div>
        )}
      </div>
    </>
  );
};
