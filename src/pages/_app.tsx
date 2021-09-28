import Particles from '@/components/ParticleComponent';
import { StarModeContext, StarModeProvider } from '@/contexts/StarMode';
import '@/styles/tailwind.css';
import {
  NetworkInfo,
  StaticWalletProvider,
  WalletProvider,
} from '@terra-money/wallet-provider';
import { NextComponentType } from 'next';
import { ThemeProvider } from 'next-themes';
import { AppInitialProps, AppLayoutProps, AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { ReactNode, useContext, useState } from 'react';
import styled from 'styled-components';
import 'tailwindcss/tailwind.css';
import MoonPixelArt from '../../public/images/moon-pixel-art-no-stars.png';

const mainnet = {
  name: `mainnet`,
  chainID: `columbus-5`,
  lcd: `https://lcd.terra.dev`,
};

const testnet = {
  name: `testnet`,
  chainID: `bombay-12`,
  lcd: `https://bombay-lcd.terra.dev`,
};

const walletConnectChainIds: Record<number, NetworkInfo> = {
  0: testnet,
  // 1: mainnet,
};

const meta = {
  title: `Moon Paper Scissors, on Terra`,
  description: `May the best lunatic win :)`,
  url: ``,
  image: ``,
};

const Moon = () => {
  const { starMode, setStarMode } = useContext(StarModeContext);
  const [rotated, setRotated] = useState(false);

  return (
    <button
      type="button"
      style={{
        position: `fixed`,
        top: 0,
        right: 0,
        transform: `translate(40%, -40%)`,
        zIndex: 100,
      }}
      onClick={() => {
        console.log(starMode);
        if (setStarMode) {
          console.log(`STAR MODE`);
          setStarMode(true);
          setRotated(!rotated);
          setTimeout(() => {
            setStarMode(false);
          }, 3000);
        }
      }}
    >
      <div
        style={{
          // animation: starMode ? `${starMode} 2s linear infinite` : '',
          transform: rotated ? `rotate(360deg)` : `rotate(0deg)`,
          transition: `transform ${3}s`,
        }}
      >
        <Image src={MoonPixelArt} alt="Moon" width={200} height={200} />
      </div>
    </button>
  );
};

const NoScrollBar = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const App: NextComponentType<AppProps, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps,
}: AppLayoutProps) => {
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const main = (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="title" content={meta.title} />
        <meta name="description" content={meta.description} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={meta.url} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.url + meta.image} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={meta.url} />
        <meta property="twitter:title" content={meta.title} />
        <meta property="twitter:description" content={meta.description} />
        <meta property="twitter:image" content={meta.url + meta.image} />
      </Head>
      <StarModeProvider>
        <ThemeProvider enableColorScheme attribute="class">
          <div
            className="dark"
            style={{
              position: `absolute`,
              top: 0,
              left: 0,
              width: `100%`,
              height: `100%`,
            }}
          >
            <Particles />
            <Moon />

            <NoScrollBar
              style={{
                zIndex: 10,
                position: `absolute`,
                width: `100vw`,
                height: `100vh`,
                overflow: `scroll`,
              }}
            >
              {getLayout(<Component {...pageProps} />)}
            </NoScrollBar>

            {/* <div className="flex flex-1 items-center justify-center">
          </div>
          <div className="my-4">
            <p className="text-xl dark:text-white">
              Created by{` `}
              <a
                className="underline"
                href="https://twitter.com/colekillian_"
                target="_blank"
                rel="noreferrer"
              >
                Cole Killian
              </a>
            </p>
          </div> */}
          </div>
        </ThemeProvider>
      </StarModeProvider>
    </>
  );

  return typeof window !== `undefined` ? (
    <WalletProvider
      defaultNetwork={testnet}
      walletConnectChainIds={walletConnectChainIds}
    >
      {main}
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={testnet}>{main}</StaticWalletProvider>
  );
};

export default App;
