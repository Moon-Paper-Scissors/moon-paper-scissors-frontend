import { useEffect, useState } from 'react';

export const useDotDotDot = () => {
  const [dots, setDots] = useState(`...`);

  useEffect(() => {
    const interval = setTimeout(() => {
      setDots(`.`.repeat((dots.length % 3) + 1));
    }, 500);

    return () => {
      clearTimeout(interval);
    };
  });
  return dots;
};
