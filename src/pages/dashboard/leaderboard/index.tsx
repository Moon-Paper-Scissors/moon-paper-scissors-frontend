import { withVerticalNav } from '@/components/VerticalNav';
import { getContractAddress, getLCDCClientConfig } from '@/constants';
import { WalletContext } from '@/contexts/Wallet';
import { GetLeaderboardResponse } from '@/types/get_leaderboard_response';
import { QueryMsg } from '@/types/query_msg';
import { UserProfile } from '@/types/user_profile';
import { formatAddressShort } from '@/utils/addressHelpers';
import { LCDClient } from '@terra-money/terra.js';
import { NextLayoutComponentType } from 'next';
import { useContext, useEffect, useState } from 'react';

const Leaderboard: NextLayoutComponentType = () => {
  const connectedWallet = useContext(WalletContext);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  const terra = new LCDClient(
    getLCDCClientConfig(connectedWallet.network.name),
  );

  const updateLeaderboard = async () => {
    if (connectedWallet) {
      // get the leaderboard
      const query_msg: QueryMsg = {
        get_leaderboard: {},
      };

      const res = (await terra.wasm.contractQuery(
        getContractAddress(connectedWallet.network.name),
        query_msg,
      )) as GetLeaderboardResponse;

      console.info(res);

      setLeaderboard(res.leaderboard);
    } else {
      console.info(`Wallet not connected!`);
    }
  };

  useEffect(() => {
    updateLeaderboard();
  }, [connectedWallet]);
  return (
    <div>
      <p className="text-6xl dark:text-white mb-20">Leaderboard</p>
      <div className="flex justify-around items-center h-20">
        <span className="dark:text-white text-3xl text-center flex-1">
          Player
        </span>
        <span className="dark:text-white text-3xl text-center flex-1">
          Games Won
        </span>
        <span className="dark:text-white text-3xl text-center flex-1">
          Winnings (luna)
        </span>
      </div>
      <hr style={{ borderTop: `4px solid white` }} />
      {leaderboard
        .sort((a, b) => (a.winnings < b.winnings ? 1 : -1))
        .map((userProfile) => (
          <div
            key={userProfile.address}
            className="flex justify-around items-center h-20"
          >
            <span className="dark:text-white text-3xl text-center flex-1">
              {formatAddressShort(userProfile.address)}
            </span>
            <span className="dark:text-white text-3xl text-center flex-1">{`${userProfile.num_games_won} / ${userProfile.num_games_played}`}</span>
            <span className="dark:text-white text-3xl text-center flex-1">
              {userProfile.winnings / 1000000}
            </span>
          </div>
        ))}
    </div>
  );
};

Leaderboard.getLayout = withVerticalNav;

export default Leaderboard;
