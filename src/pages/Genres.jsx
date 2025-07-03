function Genres() {
  return (
    <div className="text-white bg-black min-h-screen px-4 sm:px-6 md:px-10 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
        🔥 Browse by Genre
      </h1>

      <p className="text-gray-400 text-sm mb-6">
        Explore movies by genre. Action, Comedy, Horror, Sci-Fi, Romance, and more!
      </p>

      {/* You can insert <GenresSection /> or API-rendered cards here */}
      <div className="text-gray-500 italic">
        (Coming soon: Genre-based movie discovery!)
      </div>
    </div>
  );
}

export default Genres;
