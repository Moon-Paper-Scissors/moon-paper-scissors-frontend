import { useWallet, WalletStatus } from '@terra-money/wallet-provider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Intro = () => {
  const router = useRouter();

  const {
    status,
    network,
    wallets,
    availableConnectTypes,
    availableInstallTypes,
    connect,
    install,
    disconnect,
  } = useWallet();

  useEffect(() => {
    if (WalletStatus.WALLET_CONNECTED) {
      router.push(`/dashboard/leaderboard`);
    }
  }, [WalletStatus]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-5xl md:text-7xl text-center dark:text-white">
        Moon Paper Scissors, on Terra
      </h1>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        May the best lunatic win :)
      </p>
      <div className="flex flex-row items-center justify-center">
        {status === WalletStatus.WALLET_NOT_CONNECTED && (
          <>
            {availableInstallTypes.map((connectType) => (
              <button
                type="button"
                className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                key={`install-${connectType}`}
                onClick={() => install(connectType)}
              >
                Install {connectType}
              </button>
            ))}
            {availableConnectTypes.map((connectType) => (
              <button
                type="button"
                className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                key={`connect-${connectType}`}
                onClick={() => connect(connectType)}
              >
                Connect {connectType}
              </button>
            ))}
          </>
        )}
        {/* {status === WalletStatus.WALLET_CONNECTED && (
          <button
            type="button"
            className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        )} */}
      </div>
    </div>
  );
};

export default Intro;
