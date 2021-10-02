import React, { useState } from 'react';

type ContextProps = {
  starMode: boolean;
  setStarMode: React.Dispatch<React.SetStateAction<boolean>>;
};

interface StarModeProviderProps {
  children: React.ReactNode;
}

export const StarModeContext = React.createContext<ContextProps>({
  starMode: false,
  setStarMode: () => {
    console.error(`Setting star mode without initial params`);
  },
});

export const StarModeProvider = ({ children }: StarModeProviderProps) => {
  const [starMode, setStarMode] = useState(false);

  return (
    <StarModeContext.Provider
      value={{
        starMode,
        setStarMode,
      }}
    >
      {children}
    </StarModeContext.Provider>
  );
};
