import { useEffect, useRef, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue, checkForViolations, areAllLettersAllowed } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import {
  describeSeed,
  dictionarySet,
  Difficulty,
  pick,
  resetRng,
  seed,
  seedOffset,
  speak,
  urlParam,
} from "./util";
import { decode, encode } from "./base64";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  difficulty: Difficulty;
  colorBlind: boolean;
  keyboardLayout: string;
}

const targets = targetList.slice(0, targetList.indexOf("murky") + 1); // Words no rarer than this one
const minLength = 4;
const maxLength = 11;
const targetsByLength = new Array(maxLength + 1).fill(undefined).map(
  (_, i) => targets.filter((word) => word.length === i));

// FIXME: a bit slow? could be more efficient. low priority.
const dictionaryByLength = new Array(maxLength + 1).fill(undefined).map(
  (_, i) => dictionary.filter((word) => word.length === i));

function countRemainingWords(
  wordLength: number,
  allowedLetters: string[],
  difficulty: Difficulty,
  guesses: string[],
  target: string
): number {
  return dictionaryByLength[wordLength]
    .filter((word) =>
      (
        areAllLettersAllowed(word, allowedLetters).length === 0
        && checkForViolations(difficulty, guesses, target, word).length === 0
      )
    )
    .length;
}

function fullyAllowed(length: number) {
  return new Array(length).fill("abcdefghijklmnopqrstuvwxyz");
}

function randomTarget(wordLength: number): string {
  let candidate: string;
  do {
    candidate = pick(targetsByLength[wordLength]);
  } while (/\*/.test(candidate));
  return candidate;
}

function getChallengeUrl(target: string): string {
  return (
    window.location.origin +
    window.location.pathname +
    "?c=" +
    encode(target)
  );
}

let initChallenge = "";
let challengeError = false;
try {
  initChallenge = decode(urlParam("c") ?? "").toLowerCase();
} catch (e) {
  console.warn(e);
  challengeError = true;
}
if (initChallenge && !dictionarySet.has(initChallenge)) {
  initChallenge = "";
  challengeError = true;
}

function parseUrlLength(): number {
  const lengthParam = urlParam("l");
  if (!lengthParam) return 5;
  const length = Number(lengthParam);
  return length >= minLength && length <= maxLength ? length : 5;
}

function parseUrlGameNumber(): number {
  const gameParam = urlParam("g");
  if (!gameParam) return 1;
  const gameNumber = Number(gameParam);
  return gameNumber >= 1 && gameNumber <= 1000 ? gameNumber : 1;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [challenge, setChallenge] = useState<string>(initChallenge);
  const [wordLength, setWordLength] = useState(
    challenge ? challenge.length : parseUrlLength()
  );
  const [gameNumber, setGameNumber] = useState(parseUrlGameNumber());
  const [target, setTarget] = useState(() => {
    resetRng();
    // Skip RNG ahead to the parsed initial game number:
    for (let i = 1; i < gameNumber; i++) randomTarget(wordLength);
    return challenge || randomTarget(wordLength);
  });
  const [hint, setHint] = useState<string>(
    challengeError
      ? `Invalid challenge string, playing random game.`
      : `Make your first guess!`
  );
  const [hint2, setHint2] = useState<string[]>([`(Click "?" for how to play.)`]);
  const currentSeedParams = () =>
    `?s=${seed-seedOffset}&l=${wordLength}&g=${gameNumber}`;
  useEffect(() => {
    if (seed-seedOffset) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + currentSeedParams()
      );
    }
  }, [wordLength, gameNumber]);
  const [allowedLetters, setAllowedLetters] = useState<string[]>(
    fullyAllowed(wordLength));
  const [remainingWords, setRemainingWords] = useState<number[]>(
    [countRemainingWords(wordLength, fullyAllowed(wordLength), props.difficulty, [], "")]);
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = (newTarget?: string) => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setChallenge("");
    const newWordLength =
      wordLength >= minLength && wordLength <= maxLength ? wordLength : 5;
    setWordLength(newWordLength);
    setTarget(newTarget ?? randomTarget(newWordLength));
    setGuesses([]);
    setCurrentGuess("");
    setAllowedLetters(fullyAllowed(newWordLength));
    setRemainingWords(
      [countRemainingWords(newWordLength, fullyAllowed(newWordLength), props.difficulty, [], "")]);
    setHint("");
    setHint2([]);
    setGameState(GameState.Playing);
    newTarget ?? setGameNumber((x) => x + 1);
  };

  const describeGame = () =>
    (seed-seedOffset)
      ? `${describeSeed(seed-seedOffset, "short")} (game ${gameNumber})`
      : challenge
        ? "challenge game"
        : "random game";

  const shareUrl = () => (seed-seedOffset)
      ? window.location.origin + window.location.pathname + currentSeedParams()
      : getChallengeUrl(target);

  async function share(text: string, copiedHint: string) {
    if (
      /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({ text: text });
        return;
      } catch (e) {
        console.warn("navigator.share failed:", e);
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setHint(copiedHint);
      return;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
    setHint(shareUrl());
  }

  const gameOver = (state: GameState, scoreMsg: string, end: string) => {
    setHint(`${scoreMsg} for ${target.toUpperCase()}${end}`);
    setHint2([`Backspace to play this word again.`,`Enter for a new word.`]);
    setGameState(state);
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      } else if (key === "Backspace") {
        startNextGame(target);
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
      setHint2([]);
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
      setHint2([]);
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        setHint2([]);
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        setHint2([]);
        return;
      }
      const feedback = [
        ...checkForViolations(props.difficulty, guesses, target, currentGuess),
        ...areAllLettersAllowed(currentGuess, allowedLetters),
      ];
      if (feedback.length > 0) {
        setHint("Word not allowed");
        setHint2(feedback);
        return;
      }

      // For each non-green letter, remove it from the allowedLetters.
      // For each green letter, set its allowedLetters to just that letter.
      setAllowedLetters((allowedLetters) => {
        clue(currentGuess, target).forEach(
          (c, i) =>
            allowedLetters[i] =
              c.clue === Clue.Correct
                ? c.letter
                : allowedLetters[i].replace(c.letter, '')
        );

        return allowedLetters;
      });
      setRemainingWords((remainingWords) =>
        remainingWords.concat([
          countRemainingWords(
            wordLength,
            allowedLetters,
            props.difficulty,
            [...guesses, currentGuess],
            target
          )
        ])
      );

      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");

      if (currentGuess === target) {
        gameOver(GameState.Won,
          `You scored ${guesses.length + 1}`, '!');
      } else if (guesses.length + 1 === props.maxGuesses) {
        gameOver(GameState.Won,
          `Congrats! Your score is OVER ${props.maxGuesses}`, '!!!');
      } else {
        setHint("");
        setHint2([]);
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const isCurrentGuess = i === guesses.length;
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          allowedLetters={
            isCurrentGuess
              ? allowedLetters
              : new Array(wordLength).fill("")
          }
          annotation={`(${remainingWords[i]})`}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length && gameState === GameState.Playing
                ? RowState.Editing
                : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div className="Game-options">
        <label htmlFor="wordLength">Letters:</label>
        <input
          type="range"
          min={minLength}
          max={maxLength}
          id="wordLength"
          disabled={
            gameState === GameState.Playing &&
            (guesses.length > 0 || currentGuess !== "" || challenge !== "")
          }
          value={wordLength}
          onChange={(e) => {
            const length = Number(e.target.value);
            resetRng();
            setGameNumber(1);
            setGameState(GameState.Playing);
            setGuesses([]);
            setCurrentGuess("");
            setTarget(randomTarget(length));
            setWordLength(length);
            setAllowedLetters(fullyAllowed(length));
            setRemainingWords(
              [countRemainingWords(length, fullyAllowed(length), props.difficulty, [], "")]);
            setHint(`${length} letters`);
            setHint2([]);
          }}
        ></input>
        <button
          style={{ flex: "0 0 auto" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            gameOver(GameState.Lost,
              `Your score would have been at least ${guesses.length}`, '.');
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Give up
        </button>
      </div>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
        {hint2.map((h, i) =>
          <span key={i} style={{display: "block"}}>{h}</span>)}
      </p>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
      <div className="Game-seed-info">
        {challenge
          ? "playing a challenge game"
          : (seed-seedOffset)
            ? `${describeSeed(seed-seedOffset)} — length ${wordLength}, game ${gameNumber}`
            : "playing a random game"}
      </div>
      <p>
        <button
          onClick={() => {
            share(shareUrl(), "Link copied to clipboard!");
          }}
        >
          Share a link to this game
        </button>{" "}
        {gameState !== GameState.Playing && (
          <button
            onClick={() => {
              const emoji = props.colorBlind
                ? ["⬛", "🟦", "🟧"]
                : ["⬛", "🟨", "🟩"];
              share(
                `dawdlin: ${describeGame()}\n` +
                `Score: ${guesses.length}\n` +
                guesses
                  .map((guess, i) =>
                    [
                      ...clue(guess, target).map((c) => emoji[c.clue ?? 0]),
                      ` (${remainingWords[i]})`
                    ].join("")
                  )
                  .join("\n") +
                  '\n' + shareUrl(),
                "Result copied to clipboard!"
              );
            }}
          >
            Share emoji results
          </button>
        )}
      </p>
    </div>
  );
}

export default Game;
