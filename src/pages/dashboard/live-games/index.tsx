import { NoScrollBar } from '@/components/NoScrollBar';
import { withVerticalNav } from '@/components/VerticalNav';
import { getContractAddress, getLCDCClientConfig } from '@/constants';
import { WalletContext } from '@/contexts/Wallet';
import { GameState } from '@/types/game_state';
import { GetGamesResponse } from '@/types/get_games_response';
import { QueryMsg } from '@/types/query_msg';
import { formatAddressShort } from '@/utils/addressHelpers';
import { LCDClient } from '@terra-money/terra.js';
import { NextLayoutComponentType } from 'next';
import { useContext, useEffect, useState } from 'react';

const LiveGames: NextLayoutComponentType = () => {
  const connectedWallet = useContext(WalletContext);
  const [liveGames, setLiveGames] = useState<GameState[]>([]);

  const terra = new LCDClient(
    getLCDCClientConfig(connectedWallet.network.name),
  );

  const updateLiveGames = async () => {
    if (connectedWallet) {
      // get the liveGames
      const query_msg: QueryMsg = {
        get_games: {},
      };

      const res = (await terra.wasm.contractQuery(
        getContractAddress(connectedWallet.network.name),
        query_msg,
      )) as GetGamesResponse;

      console.info(res);

      setLiveGames(res.games);
    } else {
      console.info(`Wallet not connected!`);
    }
  };

  useEffect(() => {
    updateLiveGames();

    const interval = setInterval(() => {
      updateLiveGames();
    }, 5000);

    return () => clearInterval(interval);
  }, [connectedWallet]);
  return (
    <NoScrollBar style={{ overflow: `scroll` }}>
      <div style={{ minWidth: `700px` }}>
        <p className="text-6xl dark:text-white mb-20">Live Games</p>
        <div className="flex justify-around items-center h-20">
          <span className="dark:text-white text-3xl text-center flex-1">
            Player 1
          </span>
          <span className="dark:text-white text-3xl text-center flex-1">
            Player 2
          </span>
          <span className="dark:text-white text-3xl text-center flex-1">
            Player 1 Wins
          </span>

          <span className="dark:text-white text-3xl text-center flex-1">
            Player 2 Wins
          </span>

          <span className="dark:text-white text-3xl text-center flex-1">
            Bet Amount
          </span>
        </div>
        <hr style={{ borderTop: `4px solid white` }} />

        {liveGames && liveGames.length > 0 ? (
          liveGames.map((gameState) => (
            <div
              key={gameState.player1}
              className="flex justify-around items-center h-20"
            >
              <span className="dark:text-white text-3xl text-center flex-1">
                {formatAddressShort(gameState.player1)}
              </span>

              <span className="dark:text-white text-3xl text-center flex-1">
                {formatAddressShort(gameState.player2)}
              </span>
              <span className="dark:text-white text-3xl text-center flex-1">
                {gameState.player1_hands_won}
              </span>
              <span className="dark:text-white text-3xl text-center flex-1">
                {gameState.player2_hands_won}
              </span>
              <span className="dark:text-white text-3xl text-center flex-1">
                {gameState.bet_amount
                  .map(
                    (coin) =>
                      `${
                        parseInt(coin.amount, 10) / 1000000
                      } ${coin.denom.slice(1)}, `,
                  )
                  .join(``)
                  .slice(0, -2)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex justify-around items-center h-20">
            <p className="dark:text-white text-3xl text-center flex-1">
              No Live Games
            </p>
          </div>
        )}
      </div>
    </NoScrollBar>
  );
};

LiveGames.getLayout = withVerticalNav;

export default LiveGames;
