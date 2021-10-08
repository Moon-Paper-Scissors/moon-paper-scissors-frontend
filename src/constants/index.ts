// // local terra
// export const RPSContractAddress = `terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5`;

// bombay address
export const TestRPSContractAddress = `terra1p458kpzze8pu3fg6v9p70klmkmyuq3xpkzgaw2`;

// mainnet address
// v1 leaderboard broken
// export const MainRPSContractAddress = `terra1yhnn0zxydfs8rls2eydfrqmaweh2emt4gsmx3u`;
// v2 leaderboard still broken
// export const MainRPSContractAddress = `terra19hfed92vghhacrlnrxcx6fzwmrqcd4hp4kgr7t`;

// v3 leaderboard fixed
export const MainRPSContractAddress = `terra12aykqwd6sx09s37qpppq93pnqsyrcynnptq29s`;

export const getContractAddress = (networkName: string) =>
  networkName === `mainnet` ? MainRPSContractAddress : TestRPSContractAddress;

// // localterra
// export const LCDCClientConfig = {
//   URL: `http://localhost:1317`,
//   chainID: `localterra`,
// };

// bombay
export const TestLCDCClientConfig = {
  URL: `https://bombay-lcd.terra.dev`,
  chainID: `bombay-12`,
};

// mainnet
export const MainLCDCClientConfig = {
  URL: `https://lcd.terra.dev`,
  chainID: `columbus-5`,
};

export const getLCDCClientConfig = (networkName: string) =>
  networkName === `mainnet` ? MainLCDCClientConfig : TestLCDCClientConfig;

// local terra
export const WebsocketAddress = `ws://localhost:26657/websocket`;

// options for environment:
// - live
// - local
export const environment = `live`;

export const mobileMaxWidth = `800px`;

export const defaultNetwork = {
  name: `mainnet`,
  chainID: `columbus-5`,
  lcd: `https://lcd.terra.dev`,
  walletconnectID: 1,
};
export const walletConnectChainIds = {
  '0': {
    name: `testnet`,
    chainID: `bombay-12`,
    lcd: `https://bombay-lcd.terra.dev`,
    walletconnectID: 0,
  },
  '1': {
    name: `mainnet`,
    chainID: `columbus-5`,
    lcd: `https://lcd.terra.dev`,
    walletconnectID: 1,
  },
};
