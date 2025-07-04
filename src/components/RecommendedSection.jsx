// src/components/RecommendedSection.jsx
import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { fetchOMDbData } from "../api/omdb";
import { calculateUncleScore } from "../utils/uncleScore";

function RecommendedSection() {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=2130c722b019ea8fbd7f0e8aceac0704&language=en-US&page=1`
        );
        const data = await res.json();
        const results = data.results.slice(0, 15);

        const withScores = await Promise.all(
          results.map(async (movie) => {
            try {
              const omdb = await fetchOMDbData(movie.title);
              const rtRating = omdb?.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value;
              const imdbRating = omdb?.imdbRating;
              const score = calculateUncleScore(movie.vote_average, imdbRating, rtRating);
              return { ...movie, uncleScore: score };
            } catch {
              return { ...movie, uncleScore: null };
            }
          })
        );

        const highScoreMovies = withScores.filter((m) => m.uncleScore >= 7);
        setRecommended(highScoreMovies.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch recommended movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🎯 Recommended for You</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading recommendations...</p>
      ) : recommended.length === 0 ? (
        <p className="text-gray-400 text-sm">No high-scoring movies found.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recommended.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              rating={movie.vote_average}
              size="small"
              genres={[]}
              isTV={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedSection;