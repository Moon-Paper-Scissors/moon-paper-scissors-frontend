import { useEffect, useState } from 'react';

export const useCountDown = (delay: number, countdown: number) => {
  const [countDown, setCountDown] = useState<number | null>(null);

  // set timer so that button for claiming game is shown after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCountDown(countdown);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (countDown && countDown > 0) {
        setCountDown(countDown - 1);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countDown]);

  return countDown;
};
