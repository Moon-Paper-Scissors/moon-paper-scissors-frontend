import { withVerticalNav } from '@/components/VerticalNav';

const Profile = () => (
  <div>
    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
      Profile
    </p>
  </div>
);

export default () => withVerticalNav(<Profile />);
