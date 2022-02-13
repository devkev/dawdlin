# dawdlin

It's [Wordle](https://www.powerlanguage.co.uk/wordle/) but you _**try to take as many guesses as possible**_.

Play it [**here**](https://dawdl.in/).  Click the ❓ button inside the game to learn by example.

dawdlin is built on the excellent [hello wordl](https://github.com/lynn/hello-wordl) clone of Wordle.

## Where are the words coming from?

dawdlin uses the [same word lists as hello wordl](https://github.com/lynn/hello-wordl#where-are-the-words-coming-from), although the daily target words are different.

Target words are generated from a manual curation of the top 25,000 or so entries of [Peter Norvig's English word frequency list](http://norvig.com/mayzner.html), to get rid of obscure words, plurals, conjugated verbs, inappropriate language, and British spellings (sorry). If you get dealt a strange target word, please open an issue on this here GitHub repository.

The dictionary for checking guesses is based on the _Official Tournament and Club Word List_ used in North American Scrabble tournaments.
