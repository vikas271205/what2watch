import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

function TVSection() {
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTV = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/tv/week?api_key=2130c722b019ea8fbd7f0e8aceac0704`
        );
        const data = await res.json();
        setTVShows(data.results.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch trending TV shows:", err);
        setTVShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTV();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🔥 Trending TV Shows</h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading TV shows...</p>
      ) : tvShows.length === 0 ? (
        <p className="text-gray-400 text-sm">No TV shows found.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {tvShows.map((tv) => (
            <MovieCard
              key={tv.id}
              id={tv.id}
              title={tv.name}
              imageUrl={`https://image.tmdb.org/t/p/w300${tv.poster_path}`}
              rating={tv.vote_average}
              size="small"
              genres={[]}
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
