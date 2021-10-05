import RPSApi from '@/api';
import { GameMove } from '@/types/execute_msg';
import { GameState } from '@/types/game_state';
import { getOpponentNumber, getPlayerNumber, getWinner } from '@/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PaperPixelArt from '../../../public/images/paper.png';
import RockPixelArt from '../../../public/images/rock.png';
import ScissorsPixelArt from '../../../public/images/scissors.png';

interface PlayGame {
  player1_move: GameMove;
  player2_move: GameMove;
  game_over: boolean;
}

export const GameScreen = ({
  gameState,
  rpsApi,
  setScreenState,
  playGame,
  setPlayGame,
  setGameOverMessage,
}: {
  gameState: GameState;
  rpsApi: RPSApi;
  setScreenState: any;
  playGame: PlayGame;
  setPlayGame: any;
  setGameOverMessage: any;
}) => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const resultTimeout = setTimeout(() => {
      setShowResult(true);
    }, 1500);

    const returnTimeout = setTimeout(() => {
      if (playGame?.game_over) {
        setGameOverMessage(getMessage());
        setPlayGame(null);
      } else {
        setPlayGame(null);
      }
    }, 5000);

    return () => {
      clearTimeout(resultTimeout);
      clearTimeout(returnTimeout);
    };
  }, []);

  const upAndDown = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-80px); }
    0% { transform: translateY(0px); }
    `;

  const UpAndDownSpan = styled.span`
     {
      animation: ${upAndDown} 0.5s linear 3;
    }
  `;

  const LeftMove = ({ gameMove: displayGameMove }: { gameMove: GameMove }) => (
    <span
      style={{
        display: `inline-block`,
        transform: `rotate(90deg) scaleX(-1) scale(0.7)`,
      }}
    >
      <Image
        src={(() => {
          if (displayGameMove === `Rock`) {
            return RockPixelArt;
          }
          if (displayGameMove === `Paper`) {
            return PaperPixelArt;
          }
          return ScissorsPixelArt;
        })()}
        alt={displayGameMove}
      />
    </span>
  );

  const RightMove = ({ gameMove: displayGameMove }: { gameMove: GameMove }) => (
    <span
      style={{
        display: `inline-block`,
        transform: `rotate(-90deg) scale(0.7)`,
      }}
    >
      <Image
        src={(() => {
          if (displayGameMove === `Rock`) {
            return RockPixelArt;
          }
          if (displayGameMove === `Paper`) {
            return PaperPixelArt;
          }
          return ScissorsPixelArt;
        })()}
        alt={displayGameMove}
      />
    </span>
  );

  const getMessage = () => {
    if (playGame && gameState) {
      const winner = getWinner(playGame.player1_move, playGame.player2_move);
      if (
        getPlayerNumber(gameState, rpsApi.connectedWallet.walletAddress) ===
        winner
      ) {
        return `You Won!`;
      }
      if (
        getOpponentNumber(gameState, rpsApi.connectedWallet.walletAddress) ===
        winner
      ) {
        return `You Lost...`;
      }
      return `Tie`;
    }
    return `No Game`;
  };

  if (playGame === null) {
    return <p>Error</p>;
  }

  return (
    <>
      {!showResult ? (
        <>
          <p
            className="text-6xl text-center dark:text-white"
            style={{ visibility: `hidden` }}
          >
            {`${getMessage()}`}
          </p>
          <div
            style={{
              display: `flex`,
              justifyContent: `space-between`,
              position: `relative`,
              bottom: `80px`,
            }}
          >
            <UpAndDownSpan>
              <LeftMove gameMove={`Rock` as GameMove} />
            </UpAndDownSpan>
            <UpAndDownSpan>
              <RightMove gameMove={`Rock` as GameMove} />
            </UpAndDownSpan>
          </div>
        </>
      ) : (
        <>
          <p className="text-6xl text-center dark:text-white">
            {`${getMessage()}`}
          </p>
          <div
            style={{
              display: `flex`,
              justifyContent: `space-between`,
              position: `relative`,
              bottom: `80px`,
            }}
          >
            <LeftMove gameMove={playGame.player1_move} />
            <RightMove gameMove={playGame.player2_move} />
          </div>
        </>
      )}
    </>
  );
};
