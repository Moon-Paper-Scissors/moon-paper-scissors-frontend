import '@/styles/tailwind.css';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import 'tailwindcss/tailwind.css';

const meta = {
  title: `Moon Paper Scissors, on Terra`,
  description: `May the best lunatic win :)`,
  url: ``,
  image: ``,
};

const App: FC<AppProps> = ({ Component, pageProps }) => (
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
    <ThemeProvider enableSystem enableColorScheme attribute="class">
      <div className="flex flex-col items-center min-h-screen dark:bg-black">
        <div className="flex flex-1 items-center justify-center mt-4">
          <Component {...pageProps} />
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
        </div>
      </div>
    </ThemeProvider>
  </>
);

export default App;
