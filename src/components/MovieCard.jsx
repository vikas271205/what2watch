import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

function MovieCard({
  id,
  title,
  imageUrl,
  rating,
  showRemoveButton = false,
  onRemove,
  genres = [],
  size = "small",
}) {
  const [isSaved, setIsSaved] = useState(false);
  const db = getFirestore();
  const user = auth.currentUser;

  const width = size === "large" ? "min-w-[160px] sm:min-w-[192px]" : "min-w-[120px] sm:min-w-[144px]";

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user || showRemoveButton) return;
      const ref = doc(db, "watchlists", `${user.uid}_${id}`);
      const docSnap = await getDoc(ref);
      setIsSaved(docSnap.exists());
    };

    checkWatchlist();
  }, [id, showRemoveButton]);

  const handleSave = async () => {
    if (!user) return;

    const ref = doc(db, "watchlists", `${user.uid}_${id}`);
    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
    } else {
      await setDoc(ref, {
        userId: user.uid,
        movieId: id,
        title,
        imageUrl,
        rating,
        timestamp: serverTimestamp(),
      });
      setIsSaved(true);
    }
  };

  return (
    <div className={`${width} shrink-0 hover:scale-105 transition-transform duration-200`}>
      <Link to={`/movie/${id}`}>
        <img
          src={imageUrl || "https://via.placeholder.com/300x450?text=No+Image"}
          alt={title}
          className="rounded-md w-full object-cover"
        />
      </Link>
      <div className="mt-2">
        <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
        <p className="text-xs text-yellow-400">⭐ {rating || "N/A"}</p>

        {genres.length > 0 && (
          <p className="text-xs text-gray-400 truncate">
            {genres.slice(0, 2).join(", ")}
          </p>
        )}

        {!showRemoveButton ? (
          <button
            className={`mt-1 text-xs ${
              isSaved ? "text-green-500" : "text-blue-400"
            } hover:underline`}
            onClick={handleSave}
          >
            {isSaved ? "✔ Saved" : "➕ Add"}
          </button>
        ) : (
          <button
            className="mt-1 text-xs text-red-500 hover:underline"
            onClick={onRemove}
          >
            ✖ Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
