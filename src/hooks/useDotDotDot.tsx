import { useEffect, useState } from 'react';

export const useDotDotDot = () => {
  const [dots, setDots] = useState(`...`);

  useEffect(() => {
    const interval = setTimeout(() => {
      if (dots === `...`) {
        setDots(`.`);
      } else if (dots === `.`) {
        setDots(`..`);
      } else if (dots === `..`) {
        setDots(`...`);
      }
    }, 500);

    return () => {
      clearTimeout(interval);
    };
  });
  return dots;
};
