import { withVerticalNav } from '@/components/VerticalNav';
import { NextLayoutComponentType } from 'next';

const Profile: NextLayoutComponentType = () => (
  <div>
    <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl text-center dark:text-white">
      Profile
    </p>
  </div>
);

Profile.getLayout = withVerticalNav;
export default Profile;
