import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';

const NavItem = ({ link, text }: { link: string; text: string }) => {
  const router = useRouter();

  return (
    <div>
      <Link href={link}>
        <a
          className="text-2xl"
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

const VerticalNav: FC<React.ReactNode> = ({ children }) => (
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
        <p className="text-3xl dark:text-white">Moon, Paper, Scissors</p>
      </div>
      <div className="mt-20">
        {/* <NavItem link="/dashboard/leaderboard" text="Leaderboard" /> */}
        <NavItem link="/dashboard/play-game" text="Play Game" />
        {/* <NavItem link="/dashboard/profile" text="Your Profile" /> */}
      </div>
    </div>
    <div style={{ padding: `50px`, width: `100%` }}>{children}</div>
  </div>
);

export const withVerticalNav = (child: React.ReactNode) => (
  <VerticalNav>{child}</VerticalNav>
);
