import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ContextProps = {
  socket: any;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketContext = React.createContext<Partial<ContextProps>>({});

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3000`);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
