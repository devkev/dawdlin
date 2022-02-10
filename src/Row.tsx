import { Clue, clueClass, CluedLetter, clueWord, isLetterAllowed } from "./clue";

export enum RowState {
  LockedIn,
  Editing,
  Pending,
}

interface RowProps {
  rowState: RowState;
  wordLength: number;
  cluedLetters: CluedLetter[];
  annotation?: string;
  allowedLetters?: string[];
}

export function Row(props: RowProps) {
  const isLockedIn = props.rowState === RowState.LockedIn;
  const isEditing = props.rowState === RowState.Editing;
  const isPending = props.rowState === RowState.Pending;
  const letterDivs = props.cluedLetters
    .concat(Array(props.wordLength).fill({ clue: Clue.Absent, letter: "" }))
    .slice(0, props.wordLength)
    .map(({ clue, letter }, i) => {
      let letterClass = "Row-letter";
      if (isLockedIn && clue !== undefined) {
        letterClass += " " + clueClass(clue);
      }
      const isDisallowed =
        isEditing
        && props.allowedLetters !== undefined
        && ! isLetterAllowed(letter, props.allowedLetters[i]);
      if (isDisallowed) {
        letterClass += " letter-disallowed";
      }
      return (
        <td
          key={i}
          className={letterClass}
          aria-live={isEditing ? "assertive" : "off"}
          aria-label={
            isLockedIn
              ? letter.toUpperCase() +
                (clue === undefined ? "" : ": " + clueWord(clue))
              : ""
          }
        >
          {letter}
        </td>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";
  if (isPending) rowClass += " Row-pending";
  return (
    <tr className={rowClass}>
      {letterDivs}
      {props.annotation && (
        <td className="Row-annotation">{props.annotation}</td>
      )}
    </tr>
  );
}
