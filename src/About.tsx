import { Clue } from "./clue";
import { Row, RowState } from "./Row";

export function About() {
  return (
    <div className="App-about">
      <p>
        <i>dawdlin</i> is a{" "}
        <a href="https://www.powerlanguage.co.uk/wordle/">
          <i>Wordle</i>
        </a> variant where the aim is to
        <br />
        <strong><i>take as many guesses as possible</i></strong>.
      </p>
      <p>
        You're still told which letters are correct, and which are in the wrong
        place.  However:
        <ul>
          <li>Incorrect letters <i>can't be reused in the same place</i>.</li>
          <li>Correct letters <i>must</i> be reused where they belong.</li>
        </ul>
      </p>
      <hr />
      <p>
        Here's an example:
      </p>
      <table className="Game-rows"><tbody>
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Absent, letter: "w" },
            { clue: Clue.Absent, letter: "o" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Elsewhere, letter: "d" },
          ]}
          annotation={"(4030)"}
        />
        <Row
          rowState={RowState.Editing}
          wordLength={4}
          cluedLetters={[]}
          annotation={"(246)"}
          allowedLetters={[
            "abcdefghijklmnopqrstuvwxyz",
            "abcdefghijklmnopqrstuvwxyz",
            "abcdefghijklmnopqrstuvwxyz",
            "abcdefghijklmnopqrstuvwxyz",
          ]}
        />
      </tbody></table>
      <p>
        <b>W</b> and <b>O</b> aren't in the target word at all.
      </p>
      <p>
        <b className={"green-bg"}>R</b> is correct! The third letter is{" "}
        <b className={"green-bg"}>R</b>
        .<br />
        <strong>(There may still be a second R in the word.)</strong>
      </p>
      <p>
        <b className={"yellow-bg"}>D</b> occurs <em>elsewhere</em> in the target
        word.
        <br />
        <strong>(Perhaps more than once. 🤔)</strong>
      </p>
      <p>
        Finally, the game tells us that initially there were 4030 possible guesses
        we could make, but after guessing "WORD" there are now only 246 possible
        guesses remaining.
      </p>
      <hr />
      <p>
        Let's try typing another word:
      </p>
      <table className="Game-rows"><tbody>
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Absent, letter: "w" },
            { clue: Clue.Absent, letter: "o" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Elsewhere, letter: "d" },
          ]}
          annotation={"(4030)"}
        />
        <Row
          rowState={RowState.Editing}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Absent, letter: "w" },
            { clue: Clue.Absent, letter: "a" },
            { clue: Clue.Absent, letter: "l" },
            { clue: Clue.Absent, letter: "k" },
          ]}
          annotation={"(246)"}
          allowedLetters={[
            "abcdefghijklmnopqrstuvxyz",
            "abcdefghijklmnpqrstuvwxyz",
            "r",
            "abcefghijklmnopqrstuvwxyz",
          ]}
        />
      </tbody></table>
      <p>
        Oh no!  We can't guess this word, because we already tried
        guessing <b>W</b> as the first letter, and the third letter
        has to be <b>R</b>.
      </p>
      <hr />
      <p>
        Okay, let's choose a guess which is allowed:
      </p>
      <table className="Game-rows"><tbody>
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Absent, letter: "w" },
            { clue: Clue.Absent, letter: "o" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Elsewhere, letter: "d" },
          ]}
          annotation={"(4030)"}
        />
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Correct, letter: "d" },
            { clue: Clue.Correct, letter: "a" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Absent, letter: "k" },
          ]}
          annotation={"(246)"}
        />
        <Row
          rowState={RowState.Editing}
          wordLength={4}
          cluedLetters={[]}
          annotation={"(4)"}
          allowedLetters={[
            "d",
            "a",
            "r",
            "abcefghijlmnopqrstuvwxyz",
          ]}
        />
      </tbody></table>
      <p>
        Uh oh - now there are only 4 possibilities left!
      </p>
      <table className="Game-rows"><tbody>
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Correct, letter: "d" },
            { clue: Clue.Correct, letter: "a" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Absent, letter: "n" },
          ]}
          annotation={"(4)"}
        />
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Correct, letter: "d" },
            { clue: Clue.Correct, letter: "a" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Absent, letter: "e" },
          ]}
          annotation={"(3)"}
        />
        <Row
          rowState={RowState.LockedIn}
          wordLength={4}
          cluedLetters={[
            { clue: Clue.Correct, letter: "d" },
            { clue: Clue.Correct, letter: "a" },
            { clue: Clue.Correct, letter: "r" },
            { clue: Clue.Correct, letter: "t" },
          ]}
          annotation={"(2)"}
        />
      </tbody></table>
      <p>
        At least we got a few of them!
      </p>
      <p>
        Our final score for this example game was 5.
      </p>
      <hr />
      <p>
        Report issues{" "}
        <a href="https://github.com/devkev/dawdlin/issues">here</a>, or email{" "}
        <a href="mailto:info@dawdl.in">info@dawdl.in</a>.
      </p>
      <p>
        This game is built on the excellent <a href="https://hellowordl.net/">hello
        wordl</a>, a free and open-source Wordle clone by <a href="https://github.com/lynn">lynn</a>.
        Like hello wordl, dawdlin will be free and ad-free forever.
      </p>
    </div>
  );
}
