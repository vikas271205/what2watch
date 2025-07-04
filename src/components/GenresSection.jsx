// src/components/GenresSection.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function GenresSection() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
      const data = await res.json();
      setGenres(data.genres.slice(0, 6)); // Show only top 6 genres
    };

    fetchGenres();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🎭 Popular Genres</h2>
        <Link to="/genres" className="text-sm text-blue-400 hover:underline">
          See All →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            to={`/genres`} // you could enhance this to auto-select the genre later
            className="px-4 py-2 rounded bg-gray-800 text-sm hover:bg-blue-600 transition"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default GenresSection;
