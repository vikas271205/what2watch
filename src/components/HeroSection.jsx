import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="relative w-full h-[75vh] bg-gradient-to-r from-black via-zinc-900 to-black text-white flex items-center justify-center text-center px-4">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Discover What to Watch
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-6">
          Explore trending movies, must-watch TV shows, and hidden gems.
        </p>
        <Link
          to="/trending"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
        >
          Explore Now
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
