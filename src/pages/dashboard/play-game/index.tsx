import { withVerticalNav } from '@/components/VerticalNav';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameState {
  player1: string;
  player2: string;
}

const PlayGame = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameState | null>(null);

  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    if (connectedWallet) {
      const newSocket = io(`http://localhost:8080`, {
        query: {
          accAddress: connectedWallet.walletAddress,
        },
      });

      newSocket.on(`game.begin`, (data) => {
        setGameInfo(data);
      });

      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
    return () => {
      console.log(`No socket to close`);
    };
  }, [connectedWallet]);

  // first socket is connecting

  if (!socket) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Connecting to socket...
      </p>
    );
  }

  if (!gameInfo) {
    return (
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Finding an opponent...
      </p>
    );
  }

  return (
    <div>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Playing Game
      </p>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Player 1: {gameInfo.player1}
      </p>
      <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
        Opponent: {gameInfo.player2}
      </p>
    </div>
  );
};

export default withVerticalNav(<PlayGame />);
