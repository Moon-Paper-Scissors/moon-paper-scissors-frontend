import { useDotDotDot } from '@/hooks/useDotDotDot';

export const LoadingModal = () => {
  const dots = useDotDotDot();

  return (
    <div
      className="fixed inset-0 overflow-y-auto h-full w-full m-0"
      id="my-modal"
    >
      <div className="relative top-80 mx-auto p-5 border-4 w-72 shadow-lg bg-black">
        <h3 className="text-5xl leading-6 text-white">Loading{dots}</h3>
      </div>
    </div>
  );
};
