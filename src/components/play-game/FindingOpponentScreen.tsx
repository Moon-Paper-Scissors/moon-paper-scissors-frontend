import RPSApi from '@/api';
import { useDotDotDot } from '@/hooks/useDotDotDot';

export const FindingOpponentScreen = ({
  rpsApi,
  setLoading,
}: {
  rpsApi: RPSApi;
  setLoading: any;
}) => {
  const dots = useDotDotDot();

  const leaveWaitingQueue = async () => {
    try {
      await rpsApi.leaveWaitingQueue();
      setLoading(true);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(`Unknown error. Please file bug report.`);
      }
    }
  };

  return (
    <>
      <p className="text-2xl md:text-3xl dark:text-white">{`Finding an opponent${dots}`}</p>

      <div className="mt-10">
        {/* <p className="max-w-xs md:max-w-prose text-2xl md:text-3xl  dark:text-white">
            Abort
          </p> */}

        <button
          type="button"
          className="text-3xl py-8 px-12 border-4 border-current text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
          onClick={() => leaveWaitingQueue()}
        >
          Abort Mission
        </button>
      </div>
    </>
  );
};
