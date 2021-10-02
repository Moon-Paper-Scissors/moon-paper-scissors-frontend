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
    if (status === WalletStatus.WALLET_CONNECTED) {
      router.push(`/dashboard/play-game`);
    }
  }, [status]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center space-y-8">
      <h1 className="text-5xl md:text-7xl text-center dark:text-white">
        Moon, Paper, Scissors, on Terra
      </h1>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Do you have what it takes to fight your way through the galaxy? Claim
        victory or die trying. May the best lunatic win :)
      </p>
      <div
        className="flex items-center justify-evenly"
        style={{ width: `700px` }}
      >
        {status === WalletStatus.WALLET_NOT_CONNECTED && (
          <>
            {(() => {
              const chromeConnectType = availableConnectTypes.find(
                (connectType) => connectType === `CHROME_EXTENSION`,
              );
              if (chromeConnectType) {
                return (
                  <button
                    type="button"
                    className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                    key={`connect-${chromeConnectType}`}
                    style={{ maxWidth: `300px` }}
                    onClick={() => connect(chromeConnectType)}
                  >
                    Connect{` `}
                    {chromeConnectType === `CHROME_EXTENSION`
                      ? `Terra Station Extension`
                      : `Terra Station Mobile`}
                  </button>
                );
              }
              return (
                <p className="p-4 border-4 border-current max-w-md text-3xl text-center dark:text-white">
                  Please Install the Terra Station Extension to Continue
                </p>
              );
            })()}
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
