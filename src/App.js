import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Watchlist from "./pages/Watchlist";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import Profile from "./pages/Profile";
import TVDetail from "./pages/TVDetail";
import TVShows from "./pages/TVShows";
import Recommended from "./pages/Recommended";

function App() {
  return (
    <>
      {/* Navbar here if any */}
      <Navbar/>
      <Routes>
        <Route path="/recommended" element={<Recommended/>}/>
        <Route path="/tvshows" element={<TVShows />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />  
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/watchlist" element={<Watchlist/>}/>
        <Route path="/profile" element={<Profile />} />

      </Routes>
      {/* Footer here if any */}
    </>
  );
}

export default App;
