import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X } from "lucide-react"; // Make sure lucide-react is installed

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/"))
      .catch((error) => console.error("Logout Error:", error));
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          What2Watch
        </Link>

        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/search" className="hover:underline">Search</Link>
          <Link to="/genres" className="hover:underline">Genres</Link>
          <Link to="/watchlist" className="hover:underline">Watchlist</Link>

          {!user ? (
            <>
              <Link to="/login" className="px-3 py-1 rounded bg-white text-black font-semibold">Login</Link>
              <Link to="/signup" className="px-3 py-1 rounded border border-white font-semibold">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="text-sm opacity-75">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-700 px-4 pb-4 flex flex-col gap-4">
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/search" onClick={toggleMenu}>Search</Link>
          <Link to="/genres" onClick={toggleMenu}>Genres</Link>
          <Link to="/watchlist" onClick={toggleMenu}>Watchlist</Link>

          {!user ? (
            <>
              <Link to="/login" onClick={toggleMenu} className="bg-white text-black px-3 py-1 rounded">Login</Link>
              <Link to="/signup" onClick={toggleMenu} className="border border-white px-3 py-1 rounded">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="text-sm opacity-75">{user.email}</span>
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
