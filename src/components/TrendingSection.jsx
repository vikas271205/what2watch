import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function TrendingSection() {
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const scrollRef = useRef();

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      const map = {};
      data.genres.forEach((g) => {
        map[g.id] = g.name;
      });
      setGenreMap(map);
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();

      const shuffled = data.results
        .filter((m) => m.poster_path)
        .sort(() => 0.5 - Math.random())
        .slice(0, 15);

      const moviesWithGenres = shuffled.map((movie) => ({
        id: movie.id,
        title: movie.title,
        imageUrl: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
        publicRating: movie.vote_average,
        language: movie.original_language,
        genres: movie.genre_ids.map((id) => genreMap[id]).filter(Boolean),
      }));

      setMovies(moviesWithGenres);
    };

    if (Object.keys(genreMap).length > 0) {
      fetchTrending();
    }
  }, [genreMap]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 1.0;
      }
      animationId = requestAnimationFrame(scroll);
    };

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => scroll();

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    scroll();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, [movies]);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">🔥 Trending Movies This Week</h2>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
      >
        {[...movies, ...movies].map((movie, index) => (
          <MovieCard
            key={`${movie.id}_${index}`}
            id={movie.id}
            title={movie.title}
            imageUrl={movie.imageUrl}
            publicRating={movie.publicRating}
            language={movie.language}
            genres={movie.genres}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}

export default TrendingSection;
