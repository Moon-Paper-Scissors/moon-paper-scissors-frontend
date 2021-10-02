import RPSApi from '@/api';
import { LoadingModal } from '@/components/LoadingModal';
import { FindingOpponentScreen } from '@/components/play-game/FindingOpponentScreen';
import { InitScreen } from '@/components/play-game/InitScreen';
import { PlayingScreen } from '@/components/play-game/PlayingScreen';
import { withVerticalNav } from '@/components/VerticalNav';
import {
  environment,
  LCDCClientConfig,
  RPSContractAddress,
  WebsocketAddress,
} from '@/constants';
import { WalletContext } from '@/contexts/Wallet';
import { GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { WebSocketClient } from '@/utils';
import { LCDClient } from '@terra-money/terra.js';
import WebSocket from 'isomorphic-ws';
import { NextLayoutComponentType } from 'next';
import { useContext, useEffect, useState } from 'react';

type ScreenState = 'Init' | 'Finding Opponent' | 'In Game';

interface PlayGame {
  player1_move: GameMove;
  player2_move: GameMove;
  game_over: boolean;
}

const PlayGame: NextLayoutComponentType = () => {
  // get the user's wallet
  const connectedWallet = useContext(WalletContext);
  const terra = new LCDClient(LCDCClientConfig);
  const rpsApi = new RPSApi(connectedWallet);

  // start at Init screen state
  const [screenState, setScreenState] = useState<ScreenState>(`Init`);

  // for after finding an opponent
  const [gameState, setGameState] = useState<GameState | null>(null);

  // display play game animation
  const [playGame, setPlayGame] = useState<PlayGame | null>(null);

  // show loading text
  const [loading, setLoading] = useState(false);

  const updateGameState = async () => {
    setLoading(false);

    // get this players game
    const res = await rpsApi.getThisGame();

    if (res.game) {
      // player in game
      setScreenState(`In Game`);
      setGameState(res.game);
    } else if (res.waiting_for_opponent) {
      // waiting for opponent
      setScreenState(`Finding Opponent`);
    } else {
      // player hasn't entered a game yet
      setScreenState(`Init`);
    }
  };

  const handleResponse = (res: any) => {
    if (res.action === `join_game`) {
      // join_game message
      if (res.opponent_found === `false`) {
        // waiting for opponent
        setScreenState(`Finding Opponent`);
      } else if (res.opponent_found === `true`) {
        // found opponent
        setScreenState(`In Game`);
        setGameState(JSON.parse(res.game_state));
      } else {
        console.error(`Invalid opponent_found value`);
      }
    } else if (res.action === `commit_move`) {
      setGameState(JSON.parse(res.game_state));
    } else if (res.action === `reveal_move`) {
      const tmpGameState = JSON.parse(res.game_state) as GameState;
      setGameState(tmpGameState);

      if (res.hand_won) {
        // a hand was won
        // run the relevant animation
        setPlayGame({
          player1_move: res.player1_game_move as GameMove,
          player2_move: res.player2_game_move as GameMove,
          game_over: false,
        });
      } else if (res.game_won) {
        // game was won
        // run the relevant animation
        setPlayGame({
          player1_move: res.player1_game_move as GameMove,
          player2_move: res.player2_game_move as GameMove,
          game_over: true,
        });
      }
    } else if (res.action === `leave_waiting_queue`) {
      // player left the waiting queue
      // set screen back to init
      setScreenState(`Init`);
    } else if (res.action === `forfeit_game`) {
      // the game was forfeit

      if (res.game_forfeit_by === connectedWallet?.walletAddress) {
        // if forfeit by you then send you to the init screen
        setScreenState(`Init`);
      } else {
        // if forfeit by opponent, then show that opponent forfeit
        alert(`Your opponent forfeited. You Win!`);
        setScreenState(`Init`);
      }
    } else if (res.action === `claim_game`) {
      if (res.game_claimed_by === connectedWallet?.walletAddress) {
        // you claimed the game successfully
        alert(
          `You claimed victory because your opponent took too long to move. You Win!`,
        );
        setScreenState(`Init`);
      } else {
        // someone other than yourself (your opponent) claimed the game
        alert(
          `Your opponent claimed victory because you took too long to move... Better luck next time.`,
        );
        setScreenState(`Init`);
      }
    }
  };

  useEffect(() => {
    updateGameState();

    if (environment === `bombay`) {
      const connectObserver = () => {
        const ws = new WebSocket(`wss://observer.terra.dev`);
        ws.onopen = function () {
          console.info(
            `Connected to websocket. Listening for new block events...`,
          );
          // subscribe to new_block events
          ws.send(
            JSON.stringify({ subscribe: `new_block`, chain_id: `bombay-12` }),
          );
        };
        ws.onmessage = function (message) {
          /* process messages here */
          const data = JSON.parse(message.data.toString());
          const rpsTransactions = data.data.txs.reduce(
            (acc: any[], txn: any) => {
              if (!txn.logs) return false;
              if (txn.logs.length === 0) return false;

              const rpsExecuteEvent = txn.logs[0].events.find(
                (tmpEvent: any) =>
                  tmpEvent.type === `execute_contract` &&
                  tmpEvent.attributes.some(
                    (attr: any) =>
                      attr.key === `contract_address` &&
                      attr.value === RPSContractAddress,
                  ),
              );

              if (rpsExecuteEvent) {
                if (
                  rpsExecuteEvent.attributes.some(
                    (attr: any) =>
                      attr.key === `sender` &&
                      attr.value === connectedWallet.walletAddress,
                  )
                ) {
                  setLoading(false);
                }

                const playerExecuteEvent = txn.logs[0].events.find(
                  (tmpEvent: any) =>
                    tmpEvent.type === `wasm` &&
                    tmpEvent.attributes.some(
                      (attr: any) =>
                        attr.key === `players` &&
                        (attr.value as string).includes(
                          connectedWallet.walletAddress,
                        ),
                    ),
                );
                if (playerExecuteEvent) {
                  acc.push(
                    playerExecuteEvent.attributes.reduce(
                      (accAttr: any, attr: any) => {
                        const newVal = { [attr.key]: attr.value };
                        return Object.assign(newVal, accAttr);
                      },
                      {},
                    ),
                  );
                }
              }
              return acc;
            },
            [],
          );
          for (let i = 0; i < rpsTransactions.length; i += 1) {
            handleResponse(rpsTransactions[i]);
          }
        };
        // ws.onclose = function (e) {
        //   console.info('websocket closed. reopening...');
        //   setTimeout(function () {
        //     connectObserver();
        //   }, 1000);
        // };
        return ws;
      };
      const ws = connectObserver();
      return () => {
        ws.close();
      };
    }
    const wsclient = new WebSocketClient(WebsocketAddress);
    // send tracker

    wsclient.on(`open`, () => {
      console.info(`Websocket connection opened.`);
    });
    wsclient.subscribe(
      `Tx`,
      {
        'execute_contract.contract_address': RPSContractAddress,
        'wasm.players': [`CONTAINS`, connectedWallet.walletAddress],
      },
      (data) => {
        const res = data.value.TxResult.result.events
          .find((event: any) => event.type === `wasm`)
          .attributes.reduce((acc: any, attr: any) => {
            acc[atob(attr.key)] = atob(attr.value);
            return acc;
          }, {});
        handleResponse(res);
      },
    );
    return () => {
      wsclient.destroy();
    };
  }, []);

  return (
    <div className="mt-20">
      <p className="text-6xl dark:text-white mb-10">
        {screenState === `In Game` ? `Playing Game` : `Play Game`}
      </p>
      {(() => {
        if (screenState === `Init`) {
          return <InitScreen rpsApi={rpsApi} setLoading={setLoading} />;
        }
        if (screenState === `Finding Opponent` || !gameState) {
          return (
            <FindingOpponentScreen rpsApi={rpsApi} setLoading={setLoading} />
          );
        }
        return (
          <PlayingScreen
            gameState={gameState}
            rpsApi={rpsApi}
            setScreenState={setScreenState}
            playGame={playGame}
            setPlayGame={setPlayGame}
            setLoading={setLoading}
          />
        );
      })()}
      {loading && <LoadingModal />}
    </div>
  );
};

PlayGame.getLayout = withVerticalNav;

export default PlayGame;
