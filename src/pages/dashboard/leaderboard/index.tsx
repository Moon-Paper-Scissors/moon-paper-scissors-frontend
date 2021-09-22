import { withVerticalNav } from '@/components/VerticalNav';

const Leaderboard = () => (
  <div>
    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
      Leaderboard
    </p>
  </div>
);

export default () => withVerticalNav(Leaderboard);
