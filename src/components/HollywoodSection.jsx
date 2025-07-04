import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function HollywoodSection() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchHollywood = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc`
        );
        const data = await res.json();
        setMovies(data.results.slice(0, 12));
      } catch (err) {
        console.error("Failed to fetch Hollywood movies:", err);
      }
    };

    fetchHollywood();
  }, []);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">🎬 Hollywood Movies</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            rating={movie.vote_average}
            genres={[]}
            size="small"
            language={movie.original_language}
          />
        ))}
      </div>
    </div>
  );
}

export default HollywoodSection;
