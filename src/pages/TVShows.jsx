// src/pages/TVShows.jsx
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";

function TVShows() {
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=2130c722b019ea8fbd7f0e8aceac0704&sort_by=popularity.desc`
        );
        const data = await res.json();
        setTVShows(data.results.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch TV shows:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-6">
      <h1 className="text-2xl font-bold mb-6">📺 Popular TV Shows</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : tvShows.length === 0 ? (
        <p className="text-gray-500">No TV shows found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tvShows.map((tv) => (
            <MovieCard
              key={tv.id}
              id={tv.id}
              title={tv.name}
              imageUrl={`https://image.tmdb.org/t/p/w300${tv.poster_path}`}
              rating={tv.vote_average}
              genres={[]}
              isTV={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TVShows;
