import { useWallet } from '@terra-money/wallet-provider';
import Image from 'next/image';
import CloseButton from '../../public/images/close.svg';

const ConnectWallet = ({
  setConnectingWallet,
}: {
  setConnectingWallet: any;
}) => {
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

  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full m-0">
      <div
        style={{
          position: `fixed`,
          top: `50%`,
          left: `50%`,
          transform: `translateX(-50%) translateY(-50%)`,
          width: `350px`,
        }}
        className="p-10 border-4 shadow-lg bg-black flex flex-col items-center justify-center"
      >
        <div
          style={{
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            width: `100%`,
          }}
        >
          <h3 className="text-4xl leading-6 text-white">Connect Wallet</h3>

          <button
            type="button"
            onClick={() => {
              setConnectingWallet(false);
            }}
          >
            <Image
              src={CloseButton}
              alt="Hamburger menu icon"
              height="27px"
              width="27px"
            />
          </button>
        </div>
        {availableConnectTypes
          .filter(
            (connectType) => [`CHROME_EXTENSION`].includes(connectType),
            // , `WALLETCONNECT`
          )
          .map((connectType) => (
            <button
              type="button"
              className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400 mt-10"
              key={`connect-${connectType}`}
              style={{ maxWidth: `300px` }}
              onClick={() => connect(connectType)}
            >
              Connect{` `}
              {connectType === `CHROME_EXTENSION`
                ? `Terra Station Extension`
                : `Terra Station Mobile`}
            </button>
          ))}
      </div>
    </div>
  );
};

export default ConnectWallet;

/* {status === WalletStatus.WALLET_CONNECTED && (
          <button
            type="button"
            className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        )} */

//     <div className="flex flex-col min-h-screen items-center justify-center space-y-8">
//       <div
//         className="flex items-center justify-evenly"
//         style={{ width: `700px` }}
//       >
//         {status === WalletStatus.WALLET_NOT_CONNECTED && (
//           <>
//             {(() => {
//               const chromeConnectType = availableConnectTypes.find(
//                 (connectType) => connectType === `CHROME_EXTENSION`,
//               );
//               if (chromeConnectType) {
//                 return (
//                   <button
//                     type="button"
//                     className="text-3xl p-4 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
//                     key={`connect-${chromeConnectType}`}
//                     style={{ maxWidth: `300px` }}
//                     onClick={() => connect(chromeConnectType)}
//                   >
//                     Connect{` `}
//                     {chromeConnectType === `CHROME_EXTENSION`
//                       ? `Terra Station Extension`
//                       : `Terra Station Mobile`}
//                   </button>
//                 );
//               }
//               return (
//                 <p className="p-4 border-4 border-current max-w-md text-3xl text-center dark:text-white">
//                   Please Install the Terra Station Extension to Continue
//                 </p>
//               );
//             })()}
//           </>
//         )}
//       </div>
//     </div>
