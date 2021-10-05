import { NoScrollBar } from '@/components/NoScrollBar';
import Particles from '@/components/ParticleComponent';
import { defaultNetwork, walletConnectChainIds } from '@/constants';
import { StarModeContext, StarModeProvider } from '@/contexts/StarMode';
import '@/styles/tailwind.css';
import {
  StaticWalletProvider,
  WalletProvider,
} from '@terra-money/wallet-provider';
import { ThemeProvider } from 'next-themes';
import { AppLayoutProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { ReactNode, useContext, useState } from 'react';
import 'tailwindcss/tailwind.css';
import MoonPixelArt from '../../public/images/moon-pixel-art-no-stars.png';

const meta = {
  title: `Moon Paper Scissors, on Terra`,
  description: `May the best lunatic win :)`,
  url: `https://moonpaperscissors.com`,
  image: `/images/moon-pixel-art.png`,
};

const Moon = () => {
  const { starMode, setStarMode } = useContext(StarModeContext);
  const [rotated, setRotated] = useState(false);

  return (
    <button
      type="button"
      className="invisible md:visible"
      style={{
        position: `fixed`,
        top: 0,
        right: 0,
        transform: `translate(40%, -40%)`,
        zIndex: 100,
      }}
      onClick={() => {
        if (setStarMode) {
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
          transform: rotated ? `rotate(720deg)` : `rotate(0deg)`,
          transition: `transform ${3}s`,
        }}
      >
        <Image src={MoonPixelArt} alt="Moon" width={200} height={200} />
      </div>
    </button>
  );
};

const App = ({ Component, pageProps }: AppLayoutProps) => {
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
          </div>
        </ThemeProvider>
      </StarModeProvider>
    </>
  );

  return typeof window !== `undefined` ? (
    <WalletProvider
      defaultNetwork={defaultNetwork}
      walletConnectChainIds={walletConnectChainIds}
      connectorOpts={{ bridge: `https://walletconnect.terra.dev/` }}
    >
      {main}
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={defaultNetwork}>
      {main}
    </StaticWalletProvider>
  );
};

// export async function getStaticProps() {
//   const chainOptions = await getChainOptions();
//   return {
//     props: { ...chainOptions },
//   };
// }
// App.getInitialProps = async () => {
//   const chainOptions = await getChainOptions();
//   return {
//     ...chainOptions,
//   };
// };

export default App;
