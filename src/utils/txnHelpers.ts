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
    console.log(chalk.magenta(`\nTxHash:`), result.result.txhash);
    try {
      console.log(
        chalk.magenta(`Raw log:`),
        JSON.stringify(JSON.parse(result.result.raw_log), null, 2),
      );
    } catch {
      console.log(
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

// how to do users with the local terra and wallets?
// just don't use the station for testing initially
//     connectedWallet
//       .post({
//         fee: new StdFee(1000000, '200000uusd'),
//         msgs: [
//           new MsgSend(connectedWallet.walletAddress, toAddress, {
//             uusd: 1000000,
//           }),
//         ],
//       })
//       .then((nextTxResult: TxResult) => {
//         console.log(nextTxResult);
//         setTxResult(nextTxResult);
//       })
//       .catch((error: unknown) => {
//         if (error instanceof UserDenied) {
//           setTxError('User Denied');
//         } else if (error instanceof CreateTxFailed) {
//           setTxError('Create Tx Failed: ' + error.message);
//         } else if (error instanceof TxFailed) {
//           setTxError('Tx Failed: ' + error.message);
//         } else if (error instanceof Timeout) {
//           setTxError('Timeout');
//         } else if (error instanceof TxUnspecifiedError) {
//           setTxError('Unspecified Error: ' + error.message);
//         } else {
//           setTxError(
//             'Unknown Error: ' +
//               (error instanceof Error ? error.message : String(error)),
//           );
//         }
//       });

//       // send user1 transaction
//       const sendUser1Transaction = async (message: ExecuteMsg) => {
//         await sendTransaction(terra, connectedWallet.terraAddress, [
//           new MsgExecuteContract(
//             user1.key.accAddress,
//             contractAddress,
//             message,
//           ),
//         ]);
//       };

//       // send user2 transaction
//       const sendUser2Transaction = async (message: ExecuteMsg) => {
//         await sendTransaction(terra, user2, [
//           new MsgExecuteContract(
//             user2.key.accAddress,
//             contractAddress,
//             message,
//           ),
//         ]);
//       };

// /**
//  * @notice Send a transaction. Return result if successful, throw error if failed.
//  */
// export async function sendTransaction(
//   terra: LocalTerra | LCDClient,
//   sender: Wallet,
//   msgs: Msg[],
//   verbose = false,
// ) {
//   const tx = await sender.createAndSignTx({
//     msgs,
//     fee: new StdFee(30000000, [new Coin('uusd', 4500000)]),
//   });

//   const result = await terra.tx.broadcast(tx);

//   // Print the log info
//   if (verbose) {
//     console.log(chalk.magenta('\nTxHash:'), result.txhash);
//     try {
//       console.log(
//         chalk.magenta('Raw log:'),
//         JSON.stringify(JSON.parse(result.raw_log), null, 2),
//       );
//     } catch {
//       console.log(
//         chalk.magenta('Failed to parse log! Raw log:'),
//         result.raw_log,
//       );
//     }
//   }

//   if (isTxError(result)) {
//     throw new Error(
//       chalk.red('Transaction failed!') +
//         `\n${chalk.yellow('code')}: ${result.code}` +
//         `\n${chalk.yellow('codespace')}: ${result.codespace}` +
//         `\n${chalk.yellow('raw_log')}: ${result.raw_log}`,
//     );
//   }

//   return result;
// }

// /**
//  * @notice Upload contract code to LocalTerra. Return code ID.
//  */
// export async function storeCode(
//   terra: LocalTerra | LCDClient,
//   deployer: Wallet,
//   filepath: string,
// ) {
//   const code = fs.readFileSync(filepath).toString('base64');
//   const result = await sendTransaction(terra, deployer, [
//     new MsgStoreCode(deployer.key.accAddress, code),
//   ]);
//   return parseInt(result.logs[0].eventsByType.store_code.code_id[0]);
// }

// /**
//  * @notice Instantiate a contract from an existing code ID. Return contract address.
//  */
// export async function instantiateContract(
//   terra: LocalTerra | LCDClient,
//   deployer: Wallet,
//   admin: Wallet, // leave this emtpy then contract is not migratable
//   codeId: number,
//   instantiateMsg: object,
// ) {
//   const result = await sendTransaction(terra, deployer, [
//     new MsgInstantiateContract(
//       deployer.key.accAddress,
//       admin.key.accAddress,
//       codeId,
//       instantiateMsg,
//     ),
//   ]);
//   return result;
// }

// /**
//  * @notice Return the native token balance of the specified account
//  */
// export async function queryNativeTokenBalance(
//   terra: LocalTerra | LCDClient,
//   account: string,
//   denom: string = 'uusd',
// ) {
//   const balance = (await terra.bank.balance(account))
//     .get(denom)
//     ?.amount.toString();
//   if (balance) {
//     return balance;
//   } else {
//     return '0';
//   }
// }

// /**
//  * @notice Return CW20 token balance of the specified account
//  */
// export async function queryTokenBalance(
//   terra: LocalTerra | LCDClient,
//   account: string,
//   contract: string,
// ) {
//   const balanceResponse = await terra.wasm.contractQuery<{ balance: string }>(
//     contract,
//     {
//       balance: { address: account },
//     },
//   );
//   return balanceResponse.balance;
// }

// /**
//  * @notice Given a total amount of UST, find the deviverable amount, after tax, if we
//  * transfer this amount.
//  * @param amount The total amount
//  * @dev Assumes a tax rate of 0.001 and cap of 1000000 uusd.
//  * @dev Assumes transferring UST. Transferring LUNA does not incur tax.
//  */
// export function deductTax(amount: number) {
//   const DECIMAL_FRACTION = new BN('1000000000000000000');
//   const tax = Math.min(
//     amount -
//       new BN(amount)
//         .mul(DECIMAL_FRACTION)
//         .div(DECIMAL_FRACTION.div(new BN(1000)).add(DECIMAL_FRACTION))
//         .toNumber(),
//     1000000,
//   );
//   return amount - tax;
// }

// /**
//  * @notice Given a intended deliverable amount, find the total amount, including tax,
//  * necessary for deliver this amount. Opposite operation of `deductTax`.
//  * @param amount The intended deliverable amount
//  * @dev Assumes a tax rate of 0.001 and cap of 1000000 uusd.
//  * @dev Assumes transferring UST. Transferring LUNA does not incur tax.
//  */
// export function addTax(amount: number) {
//   const tax = Math.min(new BN(amount).div(new BN(1000)).toNumber(), 1000000);
//   return amount + tax;
// }
