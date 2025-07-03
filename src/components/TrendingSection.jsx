import { useEffect, useRef, useState } from "react";
import MovieCard from "../components/MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function TrendingSection() {
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();
      const map = {};
      (data.genres || []).forEach((g) => {
        map[g.id] = g.name;
      });
      setGenreMap(map);
    };

    const fetchTrending = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    };

    fetchGenres();
    fetchTrending();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || movies.length === 0) return;

    const scroll = () => {
      container.scrollLeft += 0.5;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
      scrollIntervalRef.current = requestAnimationFrame(scroll);
    };

    scrollIntervalRef.current = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(scrollIntervalRef.current);
  }, [movies]);

  const pauseScroll = () => cancelAnimationFrame(scrollIntervalRef.current);

  const resumeScroll = () => {
    scrollIntervalRef.current = requestAnimationFrame(function scroll() {
      const container = scrollRef.current;
      if (!container) return;
      container.scrollLeft += 0.5;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
      scrollIntervalRef.current = requestAnimationFrame(scroll);
    });
  };

  const scrollMovies = [...movies, ...movies]; // duplicate for infinite scroll loop

  return (
    <section className="px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-white">🔥 Trending Now</h2>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-hidden w-full no-scrollbar"
        onMouseEnter={pauseScroll}
        onMouseLeave={resumeScroll}
      >
        {scrollMovies.map((movie, index) => (
          <MovieCard
            key={`${movie.id}_${index}`}
            id={movie.id}
            title={movie.title}
            imageUrl={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "/fallback.png"
            }
            rating={movie.vote_average?.toFixed(1) || "N/A"}
            genres={
              movie.genre_ids
                ?.map((id) => genreMap[id])
                .filter((name) => Boolean(name)) || []
            }
            size="large"
          />
        ))}
      </div>
    </section>
  );
}

export default TrendingSection;
