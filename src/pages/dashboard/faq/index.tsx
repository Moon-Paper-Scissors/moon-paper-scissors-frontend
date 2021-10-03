import { withVerticalNav } from '@/components/VerticalNav';
import { NextLayoutComponentType } from 'next';

const FAQ: NextLayoutComponentType = () => (
  <div className="mt-20 max-w-4xl">
    <p className="text-6xl dark:text-white mb-20">FAQ</p>
    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">Overview</p>
      <p className="text-3xl dark:text-white">
        Welcome to "Moon, Paper Scissors"!
        <br />
        <br />
        Play your friends and strangers and see if you have what it takes to
        climb the leaderboard :)
        <br />
        <br />
        Please read through the entire FAQ (it just takes a couple minutes)
        because the rules of "Moon, Paper, Scissors" are a little bit different
        than those of traditional "Rock, Paper, Scissors".
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">How Do I Join A Game?</p>
      <p className="text-3xl dark:text-white">
        Click the "Play Game" button to visit the "Play Game" page. From there
        you will have the option to choose between a few bet amounts. In order
        to join a game, click one of the bet buttons. This will send your bet to
        the smart contract and indicate your intention to join a game. You will
        then be paired with the next player to bet the same amount as you.
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">
        How Does Prize Pool Distribution Work?
      </p>
      <p className="text-3xl dark:text-white">
        Whoever wins the game will get to claim the entire prize pool. This
        means that which each game you will either double your bet or lose it
        all! :)
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">How Do I Play?</p>
      <p className="text-3xl dark:text-white">
        The process for "Moon, Paper, Scissors" is a bit different from
        traditional rock paper scissors because instead of playing it in person
        you are playing your opponent remotely using the blockchain.
        <br />
        <br />
        Elaborating with an example: imagine you were to submit your move. It
        would become publically viewable on the blockchain, so you opponent
        would be able wait for you to move and then play the move they know will
        win. This wouldn't be fair, so to circumvent this problem, "Moon, Paper,
        Scissors" uses an approach known as "Commit, Reveal".
        <br />
        <br />
        Instead of submitting your move normally, you instead begin by
        "committing your move". This means sending your move to the blockchain,
        but only after encrypting it with a secret key that only you have access
        to. You wait for your opponent to do the same, at which point both of
        your moves are locked in! Now that your moves are locked in, you "reveal
        your move" by sending your decryption key to the blockchain. Once both
        you and your opponent have revealed your moves, the smart contract can
        compare them and decide the winner!
        <br />
        <br />
        As far as the actual implementation goes, a new private key is generated
        and stored in your browser every time you make a move, so you don't have
        to worry about keeping track of them yourself. It's important that your
        browser generates a new private key for every move because in order to
        reveal your move, you have to share your private key at which point it
        is no longer "private".
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">
        Can I Leave During A Game?
      </p>
      <p className="text-3xl dark:text-white">
        You can leave the waiting queue before you have been matched with an
        opponent and reclaim your bet, but once you are matched with an opponent
        you cannot leave. You have to play until either you or your opponent
        claims victory!
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">
        What Happens If My Opponent Becomes Idle During The Game?
      </p>
      <p className="text-3xl dark:text-white">
        If at any point a player doesn't make a move for over a minute, that
        players opponent has the option to "claim the game" and pronounce
        victory! This means you should never leave your computer while in the
        game waiting queue, because you might be paired with an opponent who
        will percieve you as idle and claim the game for themselves!
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">How Can I Donate?</p>
      <p className="text-3xl dark:text-white">
        You can donate by sending money to
        terra1vpqrv3gh3dujyveq4tzc6c00wqp056q5jupxe6 :)
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">Where Is The Code?!</p>
      <p className="text-3xl dark:text-white">
        The code will be published soon, but is still under going audits.
        {/* Frontend Code:
        <br />
        <br />
        Backend Code: */}
      </p>
    </div>

    <div className="mb-10">
      <p className="text-5xl dark:text-white mb-10">
        Has The Smart Contract Been Audited?
      </p>
      <p className="text-3xl dark:text-white">
        No the smart contract has not been audited yet, use at your own risk! ;)
      </p>
    </div>
  </div>
);

FAQ.getLayout = withVerticalNav;

export default FAQ;
