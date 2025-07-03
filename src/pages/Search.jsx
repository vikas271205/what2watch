import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import MovieCard from "../components/MovieCard";

const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";

function Search() {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const q = query(
        collection(db, "searches"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const terms = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          term: (doc.data().term || "").trim(),
        }))
        .filter((item) => item.term);

      const uniqueTerms = Array.from(
        new Map(terms.map((item) => [item.term, item])).values()
      );
      setHistory(uniqueTerms);
    };

    fetchHistory();
  }, [user]);

  useEffect(() => {
    const fetchRandomMovies = async () => {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${randomPage}&include_adult=false`
      );
      const data = await res.json();
      const filtered = data.results.filter((m) => m.adult === false);
      setResults(filtered);
    };

    if (queryText.trim() === "") {
      fetchRandomMovies();
    }
  }, [queryText]);

  const searchTMDB = async (term) => {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${term}&include_adult=false`
    );
    const data = await res.json();
    const filtered = (data.results || []).filter((m) => m.adult === false);
    setResults(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = queryText.trim().toLowerCase();
    if (!term) return;

    await searchTMDB(term);

    if (user) {
      const alreadyExists = history.find((item) => item.term === term);
      if (!alreadyExists) {
        const id = `${user.uid}_${term}_${Date.now()}`;
        await setDoc(doc(db, "searches", id), {
          userId: user.uid,
          term,
          timestamp: serverTimestamp(),
        });

        setHistory((prev) => [{ id, term }, ...prev]);
      }
    }
  };

  const handleRemoveTerm = async (termToRemove) => {
    const q = query(
      collection(db, "searches"),
      where("userId", "==", user.uid),
      where("term", "==", termToRemove)
    );
    const snapshot = await getDocs(q);
    const deletes = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "searches", docSnap.id))
    );
    await Promise.all(deletes);
    setHistory((prev) => prev.filter((item) => item.term !== termToRemove));

    if (queryText.toLowerCase() === termToRemove) {
      setQueryText("");
    }
  };

  const handleClearAll = async () => {
    const q = query(
      collection(db, "searches"),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    const deletes = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "searches", docSnap.id))
    );
    await Promise.all(deletes);
    setHistory([]);
    setResults([]);
    setQueryText("");
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10 max-w-6xl mx-auto text-white">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center sm:text-left">
        🔍 Search Movies
      </h2>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row items-center gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Search for a movie..."
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
        >
          Search
        </button>
      </form>

      {history.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h3 className="text-xl font-semibold text-gray-300">
              Recent Searches
            </h3>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-400 hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {history.map(({ term }, index) =>
              term ? (
                <div
                  key={index}
                  className="flex items-center bg-gray-700 text-white text-sm px-4 py-2 rounded-full"
                >
                  <button
                    onClick={() => {
                      setQueryText(term);
                      searchTMDB(term);
                    }}
                    className="hover:underline mr-2"
                  >
                    {term}
                  </button>
                  <button
                    onClick={() => handleRemoveTerm(term)}
                    className="text-red-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 text-gray-200">
        {queryText.trim()
          ? `Results for "${queryText}"`
          : "🎲 Discover Random Popular Movies"}
      </h3>

      <div className="flex flex-wrap gap-4">
        {results.length === 0 ? (
          <p className="text-gray-400">No movies found.</p>
        ) : (
          results.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              rating={movie.vote_average?.toFixed(1)}
              genres={movie.genre_ids?.map((id) => id.toString())}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Search;
