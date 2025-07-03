import { useState } from "react";
import MovieCard from "./MovieCard";

const genres = [
  "Action", "Comedy", "Drama", "Thriller", "Horror", "Sci-Fi",
  "Romance", "Adventure", "Fantasy", "Animation", "Mystery", "Crime"
];

const genreMovies = {
  Action: [
    {
      title: "Mad Max: Fury Road",
      imageUrl: "https://image.tmdb.org/t/p/w200/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
      rating: "8.1",
    },
    {
      title: "John Wick",
      imageUrl: "https://image.tmdb.org/t/p/w200/5vHssUeVe25bMrof1HyaPyWgaP.jpg",
      rating: "7.9",
    },
    {
      title: "Gladiator",
      imageUrl: "https://image.tmdb.org/t/p/w200/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
      rating: "8.5",
    },
  ],
  Comedy: [
    {
      title: "The Hangover",
      imageUrl: "https://image.tmdb.org/t/p/w200/kfX8Ctin3fSZbdnjh6CXSNzuo0o.jpg",
      rating: "7.7",
    },
    {
      title: "Superbad",
      imageUrl: "https://image.tmdb.org/t/p/w200/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
      rating: "7.2",
    },
    {
      title: "Step Brothers",
      imageUrl: "https://image.tmdb.org/t/p/w200/8xF8nDIsRzMYYtF1ZsWLQ1T79z9.jpg",
      rating: "6.9",
    },
  ],
  // Add other genres here...
};

function GenresSection() {
  const [selectedGenre, setSelectedGenre] = useState("Action");

  return (
    <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6">🎭 Explore by Genre</h2>

      {/* Genre Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              selectedGenre === genre
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-gray-800 text-white hover:bg-indigo-500 hover:text-white border-gray-700"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Movies Display */}
      <div className="flex gap-5 mt-6 overflow-x-auto pb-3 no-scrollbar">
        {genreMovies[selectedGenre]?.map((movie, idx) => (
          <MovieCard
            key={idx}
            title={movie.title}
            imageUrl={movie.imageUrl || "https://via.placeholder.com/200x300?text=No+Image"}
            rating={movie.rating}
          />
        ))}
      </div>
    </section>
  );
}

export default GenresSection;
