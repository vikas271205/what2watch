import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function TVSection() {
  const [tvShows, setTVShows] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const scrollRef = useRef();

  // Fetch TV genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        const map = {};
        data.genres.forEach((g) => {
          map[g.id] = g.name;
        });
        setGenreMap(map);
      } catch (err) {
        console.error("Failed to fetch TV genres:", err);
      }
    };

    fetchGenres();
  }, []);

  // Fetch trending TV shows
  useEffect(() => {
    const fetchTrendingTV = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();

        const shuffled = data.results
          .filter((tv) => tv.poster_path)
          .sort(() => 0.5 - Math.random())
          .slice(0, 15);

        const enriched = shuffled.map((tv) => ({
          ...tv,
          genre_names: tv.genre_ids.map((id) => genreMap[id]).filter(Boolean),
        }));

        setTVShows(enriched);
      } catch (err) {
        console.error("Failed to fetch trending TV shows:", err);
        setTVShows([]);
      }
    };

    if (Object.keys(genreMap).length > 0) {
      fetchTrendingTV();
    }
  }, [genreMap]);

  // Infinite Scroll Logic
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
  }, [tvShows]);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">🔥 Trending TV Shows This Week</h2>

      {tvShows.length === 0 ? (
        <p className="text-gray-400 text-sm">No TV shows found.</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        >
          {[...tvShows, ...tvShows].map((tv, index) => (
            <MovieCard
              key={`${tv.id}_${index}`}
              id={tv.id}
              title={tv.name}
              imageUrl={`https://image.tmdb.org/t/p/w300${tv.poster_path}`}
              publicRating={tv.vote_average}
              size="small"
              genres={tv.genre_names}
              isTV={true}
              language={tv.original_language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TVSection;
