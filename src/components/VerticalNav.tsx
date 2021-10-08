import { getLCDCClientConfig, mobileMaxWidth } from '@/constants';
import { WalletContext } from '@/contexts/Wallet';
import { formatAddressShort } from '@/utils/addressHelpers';
import { LCDClient } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { useMedia } from 'use-media';
import CloseButton from '../../public/images/close.svg';
import ExternalLinkIcon from '../../public/images/external-link.png';
import HamburgerMenu from '../../public/images/hamburger.svg';
import ConnectWallet from './ConnectWallet';

const VerticalNav: FC<React.ReactNode> = ({ children }) => {
  const [balance, setBalance] = useState(``);
  const connectedWallet = useConnectedWallet();
  const router = useRouter();
  const isMobile = useMedia({ maxWidth: mobileMaxWidth });
  const [showMobileNav, setShowMobileNav] = useState(false);

  const [connectingWallet, setConnectingWallet] = useState(false);
  // const WalletContext = React.createContext<ConnectedWallet>(undefined!);

  const NavItem = ({ link, text }: { link: string; text: string }) => (
    <div>
      <button
        onClick={() => {
          setShowMobileNav(false);
          router.push(link);
        }}
        type="button"
      >
        <a
          className="text-3xl"
          style={{
            color: router.pathname === link ? `#F4876E` : `white`,
          }}
        >
          {text}
        </a>
      </button>
    </div>
  );

  const terra = new LCDClient(
    getLCDCClientConfig(connectedWallet?.network.name ?? `columbus-5`),
  );

  const updateBalance = () => {
    if (connectedWallet) {
      (async () => {
        const tmpBalance = (
          await terra.bank.balance(connectedWallet.walletAddress)
        )
          .get(`uluna`)
          ?.amount.toString();
        if (tmpBalance) {
          setBalance(`${+tmpBalance / 1_000_000} luna`);
        } else {
          setBalance(`${0} luna`);
        }
      })();
    }
  };

  useEffect(() => {
    // improve code to not use setInterval
    updateBalance();
    const interval = setInterval(() => {
      updateBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [connectedWallet]);

  const NavBar = () => (
    <div
      style={{
        height: `100vh`,
        width: `300px`,
        borderRight: `solid white 2px`,
        position: `fixed`,
        backgroundColor: isMobile ? `black` : `transparent`,
      }}
      className="p-8 flex flex-col justify-center justify-between"
    >
      <div>
        <div
          style={{
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
          }}
        >
          <p className="text-4xl dark:text-white">Moon, Paper, Scissors</p>
          {isMobile && (
            <button
              type="button"
              onClick={() => {
                setShowMobileNav(false);
              }}
            >
              <Image
                src={CloseButton}
                alt="Hamburger menu icon"
                height="47px"
                width="47px"
              />
            </button>
          )}
        </div>
        <div className="flex items-center text-3xl p-4 border-4 border-current text-black dark:text-white mt-10">
          {connectedWallet && (
            <>
              <img
                style={{ height: `40px`, marginRight: `15px` }}
                src={`https://avatars.dicebear.com/api/identicon/${connectedWallet.walletAddress}.svg`}
              />

              <div>
                <p className="max-w-xs md:max-w-prose text-2xl md:text-2xl dark:text-white">
                  {formatAddressShort(connectedWallet.walletAddress)}
                </p>
                <p className="max-w-xs md:max-w-prose text-xl dark:text-white">
                  {`${balance}`}
                </p>

                {/* <p className="max-w-xs md:max-w-prose text-xl dark:text-white">
                    {`${connectedWallet.network.chainID}`}
                  </p> */}
              </div>
            </>
          )}
        </div>

        <div className="mt-10">
          <NavItem link="/dashboard/play-game" text="Play Game" />
          <NavItem link="/dashboard/leaderboard" text="Leaderboard" />
          <NavItem link="/dashboard/live-games" text="Live Games" />
          <NavItem link="/dashboard/faq" text="FAQ" />

          <div>
            <a
              href="https://forms.gle/EGMcGr3p6FQ3s4ng6"
              target="_blank"
              className="text-3xl"
              style={{
                color: `white`,
                display: `flex`,
                alignItems: `center`,
              }}
              rel="noreferrer"
            >
              Feedback Form
              <div style={{ marginLeft: `10px` }}>
                <Image
                  src={ExternalLinkIcon}
                  alt="External Link"
                  height="16px"
                  width="16px"
                />
              </div>
            </a>
          </div>

          <div>
            <a
              href="https://discord.gg/uvHWtTkX"
              target="_blank"
              className="text-3xl"
              style={{
                color: `white`,
                display: `flex`,
                alignItems: `center`,
              }}
              rel="noreferrer"
            >
              Discord
              <div style={{ marginLeft: `10px` }}>
                <Image
                  src={ExternalLinkIcon}
                  alt="External Link"
                  height="16px"
                  width="16px"
                />
              </div>
            </a>
          </div>

          <div>
            <a
              href="https://twitter.com/Terra_MPS"
              target="_blank"
              className="text-3xl"
              style={{
                color: `white`,
                display: `flex`,
                alignItems: `center`,
              }}
              rel="noreferrer"
            >
              Twitter
              <div style={{ marginLeft: `10px` }}>
                <Image
                  src={ExternalLinkIcon}
                  alt="External Link"
                  height="16px"
                  width="16px"
                />
              </div>
            </a>
          </div>
          {/* <NavItem link="/dashboard/profile" text="Your Profile" /> */}
          <NavItem link="/dashboard/disconnect" text="Disconnect" />
        </div>
      </div>
      <div className="my-4">
        <p className="text-xl dark:text-white">
          Created by{` `}
          <a
            className="underline"
            href="https://twitter.com/ruborcalor"
            target="_blank"
            rel="noreferrer"
          >
            Cole Killian
          </a>
        </p>
      </div>
    </div>
  );

  const HorBar = () => (
    <div style={{ padding: `40px` }}>
      <div
        style={{
          display: `flex`,
          justifyContent: `space-between`,
          alignItems: `center`,
        }}
      >
        <p className="text-4xl dark:text-white">Moon, Paper, Scissors</p>
        <button
          type="button"
          onClick={() => {
            setShowMobileNav(true);
          }}
        >
          <Image
            src={HamburgerMenu}
            alt="Hamburger menu icon"
            height="27px"
            width="27px"
          />
        </button>
      </div>
    </div>
  );

  const MaintenanceMessage = () => (
    <p className="text-3xl dark:text-white max-w-prose">
      Undergoing maintenance related to websocket events. Please check back in a
      few hours. For now feel free to hop in the discord server :)
    </p>
  );

  return (
    // <div className="flex" style={{ width: `100vw` }}>
    <>
      {isMobile ? (
        <>
          {showMobileNav && <NavBar />}
          <HorBar />
        </>
      ) : (
        <NavBar />
      )}
      <div
        style={{
          padding: isMobile ? `40px 40px` : `40px 50px`,
          // width: `100%`,
          zIndex: 20,
          marginLeft: isMobile ? `0px` : `300px`,
          // height: '100vh',
        }}
      >
        {connectedWallet ? (
          // <MaintenanceMessage />

          <WalletContext.Provider value={connectedWallet}>
            {children}
          </WalletContext.Provider>
        ) : (
          <>
            <p className="text-3xl dark:text-white">Wallet not connected.</p>

            <div className="mt-10">
              {/* <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
            Abort
          </p> */}

              <button
                type="button"
                className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                style={{ maxWidth: `300px` }}
                onClick={() => {
                  setConnectingWallet(true);
                }}
              >
                Connect Wallet
              </button>

              <button
                type="button"
                className="ml-8 text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
                onClick={() => router.push(`/`)}
              >
                Return Home
              </button>
            </div>
          </>
        )}
      </div>
      {connectingWallet && (
        <ConnectWallet setConnectingWallet={setConnectingWallet} />
      )}
    </>
  );
};

export default VerticalNav;

export const withVerticalNav = (child: JSX.Element) => (
  <VerticalNav>{child}</VerticalNav>
);
