import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { fetchOMDbData } from "../api/omdb";
import { db } from "../firebase";
import { auth } from "../firebase";



const TMDB_API_KEY = "2130c722b019ea8fbd7f0e8aceac0704";
const API_KEY = "v9EUGO2MNvQWUcPLPxEFwpZwuPx6xPB2k8wfvdLQ";

const getWatchmodeStreamingSources = async (title, releaseYear) => {
  try {
    const searchUrl =
      `https://api.watchmode.com/v1/search/?` +
      `apiKey=v9EUGO2MNvQWUcPLPxEFwpZwuPx6xPB2k8wfvdLQ` +
      `&search_field=name` +
      `&search_value=${encodeURIComponent(title)}` +
      `&search_type=movie`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.error("Watchmode Search Failed:", await searchRes.text());
      return [];
    }

    const searchData = await searchRes.json();
    const results = searchData.title_results || [];

    const exact = results.find(
      (r) =>
        r.title &&
        r.title.toLowerCase() === title.toLowerCase() &&
        r.year?.toString() === releaseYear?.toString()
    ) || results[0];

    if (!exact) {
      console.warn("No matching Watchmode result found for:", title);
      return [];
    }

    const srcRes = await fetch(
      `https://api.watchmode.com/v1/title/${exact.id}/sources/?apiKey=v9EUGO2MNvQWUcPLPxEFwpZwuPx6xPB2k8wfvdLQ`
    );

    if (!srcRes.ok) {
      console.error("Watchmode Sources Failed:", await srcRes.text());
      return [];
    }

    const sources = await srcRes.json();

    const allowedPlatforms = [
      "Netflix", "Amazon", "Disney+", "JioCinema", "Zee5",
      "Hulu", "HBO Max", "Paramount+", "Peacock", "Hotstar", "SonyLIV",
      "Apple TV+", "Crave", "Stan", "Now TV", "BBC iPlayer"
    ];

    const filtered = sources
      .filter(
        (s) =>
          s.web_url &&
          allowedPlatforms.includes(s.name)
      )
      .reduce((unique, curr) => {
        if (!unique.find((item) => item.name === curr.name)) {
          unique.push(curr);
        }
        return unique;
      }, []);

    return filtered;
  } catch (err) {
    console.error("Watchmode Fetch Error:", err);
    return [];
  }
};


function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [cast, setCast] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState([]);
  const [omdbData, setOmdbData] = useState(null);
  const user = auth.currentUser;
  const [platforms, setPlatforms] = useState([]);


  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAll = async () => {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`);
      const movieData = await res.json();
      setMovie(movieData);
      const releaseYear = movieData.release_date?.slice(0, 4);
const streaming = await getWatchmodeStreamingSources(movieData.title, releaseYear);
console.log("✅ Streaming Platforms:", streaming);
setPlatforms(streaming);




      

      // Fetch OMDb data
      const omdb = await fetchOMDbData(movieData.title);
      setOmdbData(omdb);     


      const trailerRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}`);
      const trailerData = await trailerRes.json();
      const trailer = trailerData.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);

      const castRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`);
      const castData = await castRes.json();
      setCast(castData.cast.slice(0, 8));

      const similarRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_API_KEY}`);
      const similarData = await similarRes.json();
      setRelatedMovies(similarData.results.slice(0, 10));

      if (user) {
        const watchRef = doc(db, "watchlists", `${user.uid}_${id}`);
        const watchSnap = await getDoc(watchRef);
        setIsSaved(watchSnap.exists());

        const rateRef = doc(db, "ratings", `${user.uid}_${id}`);
        const rateSnap = await getDoc(rateRef);
        if (rateSnap.exists()) setUserRating(rateSnap.data().rating);
      }

      const q = query(collection(db, "comments"), where("movieId", "==", id));
      const snapshot = await getDocs(q);
      const commentData = snapshot.docs.map(doc => doc.data()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAllComments(commentData);
    };

    fetchAll();
  }, [id, user]);
  

  const toggleWatchlist = async () => {
    if (!user) return;
    const ref = doc(db, "watchlists", `${user.uid}_${id}`);
    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
    } else {
      await setDoc(ref, {
        userId: user.uid,
        movieId: id,
        title: movie.title,
        imageUrl: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
        rating: movie.vote_average?.toFixed(1),
        timestamp: serverTimestamp(),
      });
      setIsSaved(true);
    }
  };

  const handleRating = async (newRating) => {
    if (!user || !isSaved) return;
    const ref = doc(db, "ratings", `${user.uid}_${id}`);
    await setDoc(ref, {
      userId: user.uid,
      movieId: id,
      rating: newRating,
    });
    setUserRating(newRating);
  };

  const submitComment = async () => {
    if (!user || !comment.trim()) return;
    const commentId = `${user.uid}_${Date.now()}`;
    const commentRef = doc(db, "comments", commentId);
    await setDoc(commentRef, {
      movieId: id,
      userId: user.uid,
      userEmail: user.email,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    });

    setComment("");
    const q = query(collection(db, "comments"), where("movieId", "==", id));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllComments(data);
  };

  if (!movie) return <p className="p-6 text-white">Loading...</p>;


  return (
    <div className="relative min-h-screen text-white bg-black">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center brightness-50"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
      ></div>

      <div className="relative z-10 px-4 py-8 sm:px-6 md:px-10 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg w-full md:w-48 shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-300 mb-1">{movie.genres?.map((g) => g.name).join(", ")}</p>
            <p className="text-yellow-400 font-semibold mb-1">⭐ TMDB: {movie.vote_average?.toFixed(1)}</p>

            {omdbData && (
              <div className="text-sm text-gray-300 mt-1 space-y-1">
                {omdbData.imdbRating && <p>🎬 IMDb: {omdbData.imdbRating}/10</p>}
                {omdbData.Ratings?.find(r => r.Source === "Rotten Tomatoes") && (
                  <p>🍅 Rotten Tomatoes: {omdbData.Ratings.find(r => r.Source === "Rotten Tomatoes").Value}</p>
                )}
                {omdbData.Ratings?.find(r => r.Source === "Metacritic") && (
                  <p>🎯 Metacritic: {omdbData.Ratings.find(r => r.Source === "Metacritic").Value}</p>
                )}
              </div>
            )}
{platforms.length > 0 && (
  <div className="mt-6">
    <p className="font-semibold text-white text-base mb-2">📺 Available On:</p>
    <div className="flex flex-wrap gap-2">
      {platforms.map((p, i) => (
        <a
          key={i}
          href={p.web_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-700 text-white px-3 py-1.5 text-sm rounded-full hover:bg-blue-600 transition-all duration-200 shadow-sm"
        >
          {p.name}
        </a>
      ))}
    </div>
  </div>
)}







            <p className="text-sm text-gray-200 mt-4 mb-6">{movie.overview}</p>

            <button
              onClick={toggleWatchlist}
              className={`px-4 py-2 rounded font-medium ${isSaved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isSaved ? "✔ In Watchlist" : "➕ Add to Watchlist"}
            </button>

            {isSaved && (
              <div className="mt-4 flex gap-1 items-center flex-wrap">
                <p className="mr-2 text-sm">Your Rating:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-2xl ${userRating >= star ? "text-yellow-400" : "text-gray-400"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        

        {trailerUrl && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2">🎬 Watch Trailer</h2>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={trailerUrl}
                title="Movie Trailer"
                allowFullScreen
                className="rounded-lg w-full"
              ></iframe>
            </div>
          </div>
        )}

        {cast.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">👥 Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
  {cast.map((actor) => (
    <a key={actor.id} href={`/person/${actor.id}`} className="min-w-[100px] text-center shrink-0">
      <img
        src={
          actor.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : "https://via.placeholder.com/185x278?text=No+Image"
        }
        alt={actor.name}
        className="rounded-md w-full mb-2"
      />
      <p className="text-sm font-medium">{actor.name}</p>
      <p className="text-xs text-gray-400">{actor.character}</p>
    </a>
  ))}
</div>

          </div>
        )}

        {relatedMovies.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">📌 Related Movies</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {relatedMovies.map((movie) => (
                <div key={movie.id} className="min-w-[120px] shrink-0 text-center">
                  <a href={`/movie/${movie.id}`}>
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "https://via.placeholder.com/300x450?text=No+Image"}
                      alt={movie.title}
                      className="rounded-md w-full mb-2"
                    />
                    <p className="text-sm font-medium line-clamp-2 h-10">{movie.title}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">💬 Comments</h2>

          {user ? (
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded resize-none"
                rows={3}
                placeholder="Write your thoughts..."
              ></textarea>
              <button
                onClick={submitComment}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Login to comment.</p>
          )}

          <div className="space-y-3">
            {allComments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            ) : (
              allComments.map((c, i) => (
                <div key={i} className="bg-gray-800 rounded p-3 text-sm text-gray-200">
                  <p className="font-medium text-blue-400">{c.userEmail}</p>
                  <p className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</p>
                  <p>{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
