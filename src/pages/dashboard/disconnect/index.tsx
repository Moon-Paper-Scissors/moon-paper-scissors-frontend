import { withVerticalNav } from '@/components/VerticalNav';
import { useWallet } from '@terra-money/wallet-provider';
import { NextLayoutComponentType } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Disconnect: NextLayoutComponentType = () => {
  const router = useRouter();
  const { disconnect } = useWallet();

  useEffect(() => {
    disconnect();
    router.push(`/`);
  }, []);

  return (
    <div>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Disconnecting...
      </p>
    </div>
  );
};

Disconnect.getLayout = withVerticalNav;

export default Disconnect;
