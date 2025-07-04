// src/pages/TVShows.jsx
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function TVShows() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      setGenres(data.genres);
      if (data.genres.length > 0) {
        setSelectedGenre(data.genres[0]);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchTVShows = async () => {
      if (!selectedGenre) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre.id}&sort_by=popularity.desc&language=en-US`
        );
        const data = await res.json();
        setTVShows(data.results.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch TV shows:", err);
        setTVShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, [selectedGenre]);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-6">
      <h1 className="text-2xl font-bold mb-6">📺 Popular TV Shows by Genre</h1>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded ${
              selectedGenre?.id === genre.id ? "bg-blue-600" : "bg-gray-800"
            } hover:bg-blue-700 transition`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading TV shows...</p>
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
              publicRating={tv.vote_average}
              genres={[]} // TV genre names not directly available in this response
              isTV={true}
              language={tv.original_language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TVShows;
