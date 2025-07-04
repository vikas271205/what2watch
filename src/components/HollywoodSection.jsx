import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";
import genreMap from "../utils/GenreMap";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function HollywoodSection() {
  const [movies, setMovies] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchHollywood = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc`
        );
        const data = await res.json();

        const shuffled = data.results
          .filter((movie) => movie.poster_path)
          .sort(() => 0.5 - Math.random())
          .slice(0, 15);

        const enriched = shuffled.map((movie) => ({
          ...movie,
          genre_names: movie.genre_ids.map((id) => genreMap[id]).filter(Boolean),
        }));

        setMovies(enriched);
      } catch (err) {
        console.error("Failed to fetch Hollywood movies:", err);
      }
    };

    fetchHollywood();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollSpeed = 1.0;
    let animationFrameId;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    const handleMouseEnter = () => cancelAnimationFrame(animationFrameId);
    const handleMouseLeave = () => scroll();

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    scroll();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [movies]);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">🎬 Hollywood Movies</h2>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
      >
        {[...movies, ...movies].map((movie, index) => (
          <MovieCard
            key={`${movie.id}_${index}`}
            id={movie.id}
            title={movie.title}
            imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            publicRating={movie.vote_average}
            genres={movie.genre_names}
            language={movie.original_language}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}

export default HollywoodSection;
