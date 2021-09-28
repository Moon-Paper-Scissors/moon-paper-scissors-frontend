import { ConnectedWallet } from '@terra-money/wallet-provider';
import React from 'react';

export const WalletContext = React.createContext<ConnectedWallet>(undefined!);
