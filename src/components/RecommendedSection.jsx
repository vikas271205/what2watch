import { useEffect, useState, useRef } from "react";
import MovieCard from "../components/MovieCard";
import { fetchOMDbData } from "../api/omdb";
import { calculateUncleScore } from "../utils/uncleScore";
import genreMap from "../utils/GenreMap";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Recommended() {
  const [recommended, setRecommended] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`
        );
        const data = await res.json();
        const shuffled = data.results.sort(() => 0.5 - Math.random());
        const filtered = [];

        for (const item of shuffled) {
          const title = item.title || item.name;
          const rating = item.vote_average;
          if (!title || !rating || !item.poster_path) continue;

          try {
            const omdb = await fetchOMDbData(title);
            const rtRating = omdb?.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value;
            const imdbRating = omdb?.imdbRating;
            const uncleScore = calculateUncleScore(rating, imdbRating, rtRating);

            if (uncleScore >= 7.5) {
              filtered.push({
                id: item.id,
                title,
                imageUrl: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
                rating,
                language: item.original_language,
                genres: item.genre_ids.map((id) => genreMap[id]).filter(Boolean),
                isTV: !!item.name,
              });
            }

            if (filtered.length >= 15) break;
          } catch (err) {
            console.warn("OMDb fetch failed for:", title, err);
          }
        }

        setRecommended(filtered);
      } catch (err) {
        console.error("TMDB fetch failed:", err);
      }
    };

    fetchData();
  }, []);

  // Infinite scroll effect
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
  }, [recommended]);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">🎯 Recommended For You</h2>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
      >
        {[...recommended, ...recommended].map((movie, index) => (
          <MovieCard
            key={`${movie.id}_${index}`}
            id={movie.id}
            title={movie.title}
            imageUrl={movie.imageUrl}
            publicRating={movie.rating}
            isTV={movie.isTV}
            genres={movie.genres}
            language={movie.language}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}

export default Recommended;
