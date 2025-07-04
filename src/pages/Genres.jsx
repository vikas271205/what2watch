import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Genres() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});

  // Fetch genre list and map
  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();

      setGenres(data.genres);
      if (data.genres.length > 0) setSelectedGenre(data.genres[0]);

      const map = {};
      data.genres.forEach((g) => {
        map[g.id] = g.name;
      });
      setGenreMap(map);
    };

    fetchGenres();
  }, []);

  // Fetch movies by selected genre
  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      if (!selectedGenre) return;

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre.id}&include_adult=false&language=en-US`
      );
      const data = await res.json();

      let filteredMovies = data.results.filter(
        (movie) => movie.adult === false && movie.poster_path
      );

      // Exclude Japanese for Romance
      if (selectedGenre.name.toLowerCase() === "romance") {
        filteredMovies = filteredMovies.filter(
          (movie) => movie.original_language !== "ja"
        );
      }

      setMovies(filteredMovies.slice(0, 18));
    };

    fetchMoviesByGenre();
  }, [selectedGenre]);

  return (
    <main className="bg-black text-white px-4 sm:px-6 md:px-10 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎭 Browse by Genre</h1>

      {/* Genre Selection Buttons */}
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

      {/* Movie List */}
      {selectedGenre && (
        <>
          <h2 className="text-xl font-semibold mb-4">🎬 {selectedGenre.name} Movies</h2>
          {movies.length === 0 ? (
            <p className="text-sm text-gray-400">No movies found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  publicRating={movie.vote_average}
                  genres={movie.genre_ids?.map((id) => genreMap[id] || "")}
                  size="large"
                  language={movie.original_language}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Genres;
