// // local terra
// export const RPSContractAddress = `terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5`;

// bombay address
export const TestRPSContractAddress = `terra1f5u6ds3q95jwl2y5ellsczuwd2349g68u8af4l`;
// mainnet address
export const MainRPSContractAddress = `terra1f5u6ds3q95jwl2y5ellsczuwd2349g68u8af4l`;

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
