import { formatAddressShort } from '@/utils/addressHelpers';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';

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
  const connectedWallet = useConnectedWallet();

  return (
    <div className="flex" style={{ width: `100vw` }}>
      <div
        style={{
          height: `100vh`,
          width: `400px`,
          borderRight: `solid white 2px`,
        }}
        className="p-8 justify-center"
      >
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

              <p className="max-w-xs md:max-w-prose text-2xl md:text-2xl text-center dark:text-white">
                {formatAddressShort(connectedWallet.walletAddress)}
              </p>
            </>
          )}
        </div>
        <div className="mt-10">
          <NavItem link="/dashboard/play-game" text="Play Game" />
          <NavItem link="/dashboard/leaderboard" text="Leaderboard" />
          <NavItem link="/dashboard/profile" text="Your Profile" />
          <NavItem link="/dashboard/disconnect" text="Disconnect" />
        </div>
      </div>
      <div style={{ padding: `50px`, width: `100%` }}>{children}</div>
    </div>
  );
};

export default VerticalNav;

export const withVerticalNav = (child: JSX.Element) => (
  <VerticalNav>{child}</VerticalNav>
);
