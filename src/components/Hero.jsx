import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Hero() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        const topMovie =
          data.results?.[Math.floor(Math.random() * data.results.length)];
        setHeroMovie(topMovie);
      } catch (err) {
        console.error("Hero movie fetch failed:", err);
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!heroMovie) return null;

  return (
    <div
      className="relative h-[70vh] flex items-center justify-center text-center px-4 sm:px-10"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      <div className="relative z-10 text-white max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
          {heroMovie.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-300 mb-6 line-clamp-3 animate-slide-up">
          {heroMovie.overview}
        </p>

        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search movies or shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-4 py-2 w-full max-w-md rounded-l bg-white text-black"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r text-white font-semibold"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
