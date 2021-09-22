import '@/styles/tailwind.css';
import {
  NetworkInfo,
  StaticWalletProvider,
  WalletProvider,
} from '@terra-money/wallet-provider';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import 'tailwindcss/tailwind.css';

const mainnet = {
  name: `mainnet`,
  chainID: `columbus-4`,
  lcd: `https://lcd.terra.dev`,
};

const testnet = {
  name: `testnet`,
  chainID: `tequila-0004`,
  lcd: `https://tequila-lcd.terra.dev`,
};

const walletConnectChainIds: Record<number, NetworkInfo> = {
  0: testnet,
  1: mainnet,
};

const meta = {
  title: `Moon Paper Scissors, on Terra`,
  description: `May the best lunatic win :)`,
  url: ``,
  image: ``,
};

const App: FC<AppProps> = ({ Component, pageProps }) => {
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
      <ThemeProvider enableColorScheme attribute="class">
        <div className="flex flex-col items-center min-h-screen dark:bg-black">
          <Component {...pageProps} />
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
    </>
  );

  return typeof window !== `undefined` ? (
    <WalletProvider
      defaultNetwork={mainnet}
      walletConnectChainIds={walletConnectChainIds}
    >
      {main}
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={mainnet}>{main}</StaticWalletProvider>
  );
};

export default App;
