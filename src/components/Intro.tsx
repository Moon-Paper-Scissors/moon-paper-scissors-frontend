import { FC } from 'react';

const Intro: FC = () => (
  <div className="flex flex-col items-center justify-center space-y-8">
    <h1 className="text-5xl md:text-7xl text-center dark:text-white">
      Moon Paper Scissors, on Terra
    </h1>
    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
      May the best lunatic win :)
    </p>
  </div>
);

export default Intro;
