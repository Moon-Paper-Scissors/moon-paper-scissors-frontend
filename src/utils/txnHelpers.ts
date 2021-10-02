// import {
//   Coin,
//   isTxError,
//   LCDClient,
//   LocalTerra,
//   Msg,
//   MsgInstantiateContract,
//   MsgStoreCode,
//   StdFee,
//   Wallet,
// } from '@terra-money/terra.js';
// import BN from 'bn.js';
import { TxResult } from '@terra-dev/wallet-types';
import { isTxError } from '@terra-money/terra.js';
import chalk from 'chalk';
// import * as fs from 'fs';

/**
 * @notice Encode a JSON object to base64 binary
 */
export function toEncodedBinary(obj: any) {
  return Buffer.from(JSON.stringify(obj)).toString(`base64`);
}

export function debugTransaction(result: TxResult) {
  const verbose = true;
  // Print the log info
  if (verbose) {
    console.info(chalk.magenta(`\nTxHash:`), result.result.txhash);
    try {
      console.info(
        chalk.magenta(`Raw log:`),
        JSON.stringify(JSON.parse(result.result.raw_log), null, 2),
      );
    } catch {
      console.info(
        chalk.magenta(`Failed to parse log! Raw log:`),
        result.result.raw_log,
      );
    }
  }

  if (isTxError(result.result)) {
    throw new Error(
      `${chalk.red(`Transaction failed!`)}\n${chalk.yellow(`code`)}: ${
        result.result.code
      }` +
        `\n${chalk.yellow(`codespace`)}: ${result.result.codespace}` +
        `\n${chalk.yellow(`raw_log`)}: ${result.result.raw_log}`,
    );
  }
}
