import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { calculateUncleScore } from "../utils/uncleScore";
import { fetchOMDbData } from "../api/omdb";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Recommended() {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        const filtered = [];

        for (const item of data.results) {
          const title = item.title || item.name;
          const rating = item.vote_average;

          if (!title || !rating) continue;

          try {
            const omdb = await fetchOMDbData(title);
            const imdbRating = omdb?.imdbRating;
            const rtRating = omdb?.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value;

            const score = calculateUncleScore(rating, imdbRating, rtRating);
            if (score >= 7.5) {
              filtered.push({
                id: item.id,
                title,
                imageUrl: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
                rating,
                isTV: !!item.name,
              });
            }
          } catch (err) {
            console.warn(`Failed OMDb for: ${title}`);
          }
        }

        setRecommended(filtered);
      } catch (err) {
        console.error("Failed to fetch recommended content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-6">
      <h1 className="text-2xl font-bold mb-6">🎯 Uncle's Recommended Picks</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : recommended.length === 0 ? (
        <p className="text-gray-500">No high-rated content found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recommended.map((item) => (
            <MovieCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              rating={item.rating}
              isTV={item.isTV}
              genres={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommended;
