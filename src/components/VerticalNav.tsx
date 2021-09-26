import { LCDCClientConfig } from '@/constants';
import { formatAddressShort } from '@/utils/addressHelpers';
import { LCDClient } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';

const NavItem = ({ link, text }: { link: string; text: string }) => {
  const router = useRouter();

  return (
    <div>
      <Link href={link}>
        <a
          className="text-3xl"
          style={{
            color: router.pathname === link ? `#F4876E` : `white`,
          }}
        >
          {text}
        </a>
      </Link>
    </div>
  );
};

const VerticalNav: FC<React.ReactNode> = ({ children }) => {
  const [balance, setBalance] = useState(``);
  const connectedWallet = useConnectedWallet();

  const terra = new LCDClient(LCDCClientConfig);

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
    // const interval = setInterval(() => {
    //   updateBalance();
    // }, 5000);

    // return () => clearInterval(interval);
  }, [connectedWallet]);

  return (
    // <div className="flex" style={{ width: `100vw` }}>
    <>
      <div
        style={{
          height: `100vh`,
          width: `300px`,
          borderRight: `solid white 2px`,
          position: `fixed`,
        }}
        className="p-8 flex flex-col justify-center justify-between"
      >
        <div>
          <div>
            <p className="text-4xl dark:text-white">Moon, Paper, Scissors</p>
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
                    {balance}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-10">
            <NavItem link="/dashboard/play-game" text="Play Game" />
            <NavItem link="/dashboard/leaderboard" text="Leaderboard" />
            <NavItem link="/dashboard/faq" text="FAQ" />
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
      <div
        style={{
          padding: `50px`,
          // width: `100%`,
          marginLeft: `300px`,
          zIndex: 20,
          // height: '100vh',
        }}
      >
        {children}
      </div>
      {/* </div> */}
    </>
  );
};

export default VerticalNav;

export const withVerticalNav = (child: JSX.Element) => (
  <VerticalNav>{child}</VerticalNav>
);
