import { useState, useEffect, useMemo } from "react";
import "./App.css";

import Line from "./components/Line";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const WORD_API = "https://random-word-api.herokuapp.com/word?length=5";
const WORD_EXIST_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const fetchValidWord = async (): Promise<string> => {
  while (true) {
    const wordRes = await fetch(WORD_API);
    const wordData = await wordRes.json();
    const word = wordData[0];

    const existRes = await fetch(WORD_EXIST_API + word);
    const existData = await existRes.json();

    if (Array.isArray(existData)) {
      console.log(word);
      return word;
    }
  }
};

function App() {
  const queryClient = useQueryClient();
  const [guesses, setGuesses] = useState(Array(6).fill(Array(5).fill("")));

  const [tilesColors, setTilesColors] = useState(
    Array(6).fill(Array(5).fill("white"))
  );

  const [guessIndex, setGuessIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [allowType, setAllowType] = useState(true);
  const { data: WORD, isLoading: isLoadingWord } = useQuery({
    queryFn: fetchValidWord,
    queryKey: ["word"],
    refetchOnWindowFocus: false,
  });

  const WORD_TO_CHECK = guesses[guessIndex].join("");

  console.log("correct word is: " + WORD);

  const letterAccurence = useMemo(() => {
    const result: { [key: string]: number } = {};
    if (!isLoadingWord) {
      for (const char of WORD) {
        result[char] = (result[char] || 0) + 1;
      }
    }
    return result;
  }, [WORD, isLoadingWord]);

  useEffect(() => {
    const colorTiles = () => {
      const newColorTiles = [...tilesColors];
      const newColorTile = [...newColorTiles[guessIndex]];

      const guessLetterFreguency: { [key: string]: number } = {};
      for (let i = 0; i < newColorTile.length; i++) {
        if (WORD[i] === guesses[guessIndex][i]) {
          guessLetterFreguency[WORD[i]] =
            (guessLetterFreguency[WORD[i]] || 0) + 1;
          newColorTile[i] = "green-300";
        }
      }

      for (let i = 0; i < newColorTile.length; i++) {
        if (newColorTile[i] === "green-300") continue;
        if (WORD.includes(guesses[guessIndex][i])) {
          if (
            letterAccurence[guesses[guessIndex][i]] >
            (guessLetterFreguency[guesses[guessIndex][i]] || 0)
          ) {
            guessLetterFreguency[guesses[guessIndex][i]] =
              (guessLetterFreguency[guesses[guessIndex][i]] || 0) + 1;
            newColorTile[i] = "yellow-300";
          } else {
            newColorTile[i] = "gray-300";
          }
        } else {
          newColorTile[i] = "gray-300";
        }
      }
      newColorTiles[guessIndex] = newColorTile;
      setTilesColors(newColorTiles);
    };

    const checkGuess = () => {
      colorTiles();
      if (guesses[guessIndex].join("") === WORD) {
        setAllowType(false);
        alert("You win");
      } else if (guessIndex === 5) {
        alert("You lost, word was: " + WORD);
      }
    };

    const typeWord = (e: KeyboardEvent) => {
      if (e.repeat || guessIndex > 5 || !allowType) return;
      if (e.key === "Backspace") {
        if (letterIndex === 0) return;
        const newGuesses = [...guesses];
        const newActualGuess = [...newGuesses[guessIndex]];
        newActualGuess[letterIndex - 1] = "";
        newGuesses[guessIndex] = newActualGuess;
        setGuesses(newGuesses);
        setLetterIndex((prev) => prev - 1);
      } else if (letterIndex < 5) {
        if (!/^[a-zA-Z]$/.test(e.key)) return;
        const newGuesses = [...guesses];
        const newActualGuess = [...newGuesses[guessIndex]];
        newActualGuess[letterIndex] = e.key.toLowerCase();
        newGuesses[guessIndex] = newActualGuess;
        setGuesses(newGuesses);
        setLetterIndex((prev) => prev + 1);
      } else if (e.key === "Enter") {
        queryClient
          .fetchQuery({
            queryKey: ["exist", WORD_TO_CHECK],
            queryFn: async () => {
              const res = await fetch(WORD_EXIST_API + WORD_TO_CHECK);
              return res.json();
            },
          })
          .then((data) => {
            if (Array.isArray(data)) {
              checkGuess();
              setGuessIndex((prev) => prev + 1);
              setLetterIndex(0);
            } else {
              alert("That word does not exist or at least I do not know it");
            }
          });
      }
    };

    document.addEventListener("keydown", typeWord);
    return () => document.removeEventListener("keydown", typeWord);
  }, [
    WORD,
    WORD_TO_CHECK,
    allowType,
    guessIndex,
    guesses,
    letterAccurence,
    letterIndex,
    queryClient,
    tilesColors,
  ]);

  if (isLoadingWord) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex flex-col items-center mt-5 p-10 gap-5">
        <h1 className="text-5xl font-sans">WUURDLE</h1>
        {guesses.map((guess, index) => (
          <Line key={index} word={guess} tilesColor={tilesColors[index]} />
        ))}
        {<div></div>}
      </div>
    </>
  );
}

export default App;
