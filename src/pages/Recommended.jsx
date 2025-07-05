import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { fetchOMDbData } from "../api/omdb";
import { calculateUncleScore } from "../utils/uncleScore";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Recommended() {
  const [recommended, setRecommended] = useState([]);
  const [genreList, setGenreList] = useState({});

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      const genreMap = {};
      data.genres.forEach((g) => (genreMap[g.id] = g.name));
      setGenreList(genreMap);
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`
      );
      const data = await res.json();
      const filtered = [];

      for (const item of data.results) {
        const title = item.title || item.name;
        const rating = item.vote_average;
        if (!title || !rating) continue;

        try {
          const omdb = await fetchOMDbData(title);
          const rtRating = omdb?.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value;
          const imdbRating = omdb?.imdbRating;
          const uncleScore = calculateUncleScore(rating, imdbRating, rtRating);

          const genres = item.genre_ids?.map((id) => genreList[id]).filter(Boolean);
          const lang = item.original_language;

          if (uncleScore >= 7.5) {
            filtered.push({
              id: item.id,
              title,
              imageUrl: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
              rating,
              language: lang,
              genres,
              isTV: !!item.name,
            });
          }
        } catch (e) {
          console.error("OMDb fetch failed for:", title, e);
        }
      }

      setRecommended(filtered);
    };

    if (Object.keys(genreList).length > 0) {
      fetchData();
    }
  }, [genreList]);

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10 max-w-6xl mx-auto bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center sm:text-left">🎯 Recommended</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recommended.map((item) => (
          <MovieCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            publicRating={item.rating}
            isTV={item.isTV}
            genres={item.genres}
            language={item.language}
          />
        ))}
      </div>
    </div>
  );
}

export default Recommended;
