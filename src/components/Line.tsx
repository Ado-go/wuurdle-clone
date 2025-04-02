type TileColor = "white" | "green-300" | "yellow-300" | "gray-300";

export default function Line({
  word,
  tilesColor,
}: {
  word: string[];
  tilesColor: TileColor[];
}) {
  const colors = {
    white: "bg-white",
    "green-300": "bg-green-300",
    "yellow-300": "bg-yellow-300",
    "gray-300": "bg-gray-300",
  };

  return (
    <div className="flex gap-5">
      {word.map((letter, index) => {
        return (
          <div
            className={`w-20 h-20 border-2 rounded-lg flex items-center justify-center transition-colors duration-500 ease-in-out ${
              colors[tilesColor[index]]
            }`}
            key={index}
          >
            <p className="text-xl">{letter.toUpperCase()}</p>
          </div>
        );
      })}
    </div>
  );
}
